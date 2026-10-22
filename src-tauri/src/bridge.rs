//! Opt-in local bridge that lets an AI agent drive the timer.
//!
//! The bridge is deliberately small and conservative:
//! - it binds to `127.0.0.1` on a random port, never to a public interface;
//! - every request needs a bearer token that is generated per app run and
//!   written next to the app config (`bridge.json`);
//! - requests carrying an `Origin` header are rejected, so a web page cannot
//!   drive the app even if it knows the port;
//! - timer state stays owned by the renderer. The bridge only forwards an
//!   action over the Tauri event bus and waits for the renderer's answer.

use std::collections::HashMap;
use std::io::{Read, Write};
use std::net::{Ipv4Addr, TcpListener, TcpStream};
use std::path::{Path, PathBuf};
use std::sync::atomic::{AtomicBool, AtomicU16, AtomicU64, Ordering};
use std::sync::{mpsc, Arc, Mutex};
use std::thread;
use std::time::Duration;

use rand::RngCore;
use serde::Serialize;
use serde_json::{json, Value};
use tauri::{AppHandle, Emitter, Manager};

const BRIDGE_FILE: &str = "bridge.json";
const MAX_HEADER_BYTES: usize = 16 * 1024;
const MAX_BODY_BYTES: usize = 8 * 1024;
const RENDERER_TIMEOUT: Duration = Duration::from_secs(3);
const IO_TIMEOUT: Duration = Duration::from_secs(10);

/// Everything an agent needs to reach the bridge. `file` is the path the JSON
/// descriptor was written to, which is the recommended discovery mechanism.
#[derive(Clone, Debug, Serialize)]
pub struct BridgeInfo {
    pub url: String,
    pub port: u16,
    pub token: String,
    pub file: String,
}

#[derive(Default)]
pub struct BridgeState {
    enabled: AtomicBool,
    port: AtomicU16,
    token: Mutex<String>,
    shutdown: Mutex<Option<Arc<AtomicBool>>>,
    pending: Mutex<HashMap<u64, mpsc::Sender<Value>>>,
    next_id: AtomicU64,
}

struct HttpRequest {
    method: String,
    path: String,
    headers: HashMap<String, String>,
    body: String,
}

pub fn enable(app: &AppHandle) -> Result<BridgeInfo, String> {
    if let Some(info) = info(app) {
        return Ok(info);
    }

    let listener = TcpListener::bind((Ipv4Addr::LOCALHOST, 0))
        .map_err(|error| format!("Could not start the local bridge: {error}"))?;
    listener
        .set_nonblocking(true)
        .map_err(|error| error.to_string())?;

    let port = listener
        .local_addr()
        .map_err(|error| error.to_string())?
        .port();
    let token = random_token();

    let file = bridge_file_path(app)?;
    let info = BridgeInfo {
        url: format!("http://127.0.0.1:{port}"),
        port,
        token: token.clone(),
        file: file.to_string_lossy().to_string(),
    };

    {
        let state = app.state::<BridgeState>();
        *state.token.lock().map_err(|_| "Bridge lock poisoned")? = token;
        state.port.store(port, Ordering::SeqCst);
        state.enabled.store(true, Ordering::SeqCst);

        // Each enable gets its own stop flag, so a rapid off/on cannot leave an
        // older accept loop listening on a stale port.
        let shutdown = Arc::new(AtomicBool::new(false));
        *state.shutdown.lock().map_err(|_| "Bridge lock poisoned")? = Some(shutdown);
    }

    write_bridge_file(&file, &info)?;

    let handle = app.clone();
    let shutdown = app
        .state::<BridgeState>()
        .shutdown
        .lock()
        .map_err(|_| "Bridge lock poisoned")?
        .clone()
        .ok_or("Bridge shutdown flag is missing")?;
    thread::spawn(move || accept_loop(handle, listener, shutdown));

    log::info!("Pomotaro bridge listening on http://127.0.0.1:{port}");
    Ok(info)
}

pub fn disable(app: &AppHandle) {
    let state = app.state::<BridgeState>();
    state.enabled.store(false, Ordering::SeqCst);

    // Stop the accept loop that belongs to this generation.
    let shutdown = state.shutdown.lock().ok().and_then(|mut slot| slot.take());
    if let Some(flag) = shutdown {
        flag.store(true, Ordering::SeqCst);
    }

    let _ = state.token.lock().map(|mut token| token.clear());

    if let Ok(path) = bridge_file_path(app) {
        let _ = std::fs::remove_file(path);
    }
}

pub fn info(app: &AppHandle) -> Option<BridgeInfo> {
    let state = app.state::<BridgeState>();
    if !state.enabled.load(Ordering::SeqCst) {
        return None;
    }

    let port = state.port.load(Ordering::SeqCst);
    let token = state.token.lock().ok()?.clone();
    if port == 0 || token.is_empty() {
        return None;
    }

    Some(BridgeInfo {
        url: format!("http://127.0.0.1:{port}"),
        port,
        token,
        file: bridge_file_path(app).ok()?.to_string_lossy().to_string(),
    })
}

pub fn respond_to_renderer(app: &AppHandle, id: u64, response: Value) {
    let state = app.state::<BridgeState>();
    let pending_sender = {
        let Ok(mut pending) = state.pending.lock() else {
            return;
        };
        pending.remove(&id)
    };

    if let Some(sender) = pending_sender {
        let _ = sender.send(response);
    }
}

fn accept_loop(app: AppHandle, listener: TcpListener, shutdown: Arc<AtomicBool>) {
    while !shutdown.load(Ordering::SeqCst) {
        match listener.accept() {
            Ok((stream, _address)) => {
                // The bridge is low-volume and local; one request at a time keeps
                // the state simple and avoids unbounded thread creation.
                if let Err(error) = handle_connection(&app, stream) {
                    log::debug!("Bridge request failed: {error}");
                }
            }
            Err(error) if error.kind() == std::io::ErrorKind::WouldBlock => {
                thread::sleep(Duration::from_millis(100));
            }
            Err(error) => {
                log::warn!("Pomotaro bridge stopped: {error}");
                break;
            }
        }
    }
}

fn handle_connection(app: &AppHandle, mut stream: TcpStream) -> Result<(), String> {
    stream.set_read_timeout(Some(IO_TIMEOUT)).ok();
    stream.set_write_timeout(Some(IO_TIMEOUT)).ok();

    let request = match read_request(&mut stream) {
        Ok(request) => request,
        Err(error) => {
            return respond(&mut stream, 400, error_body(&error));
        }
    };

    let state = app.state::<BridgeState>();
    let port = state.port.load(Ordering::SeqCst);
    let token = state.token.lock().map(|value| value.clone()).unwrap_or_default();

    if request.headers.contains_key("origin") {
        return respond(
            &mut stream,
            403,
            error_body("Browser origins are not allowed to call the bridge"),
        );
    }

    if !host_is_local(request.headers.get("host").map(String::as_str), port) {
        return respond(&mut stream, 403, error_body("Invalid Host header"));
    }

    if !authorized(
        request.headers.get("authorization").map(String::as_str),
        &token,
    ) {
        return respond(
            &mut stream,
            401,
            error_body("Missing or invalid bearer token"),
        );
    }

    let route = request.path.split('?').next().unwrap_or("/");
    let (status, body) = match (request.method.as_str(), route) {
        ("GET", "/health") => (
            200,
            json!({"ok": true, "data": {"app": "pomotaro", "bridge": "ready"}}),
        ),
        ("GET", "/status") => renderer_call(app, "status", Value::Null),
        ("GET", "/stats") => {
            let range = query_param(&request.path, "range").unwrap_or_else(|| "day".to_string());
            renderer_call(app, "stats", json!({ "range": range }))
        }
        ("POST", "/start") => with_body(app, &request.body, "start"),
        ("POST", "/pause") => with_body(app, &request.body, "pause"),
        ("POST", "/reset") => with_body(app, &request.body, "reset"),
        ("POST", "/switch") => with_body(app, &request.body, "switch"),
        _ => (404, error_body("Unknown endpoint")),
    };

    respond(&mut stream, status, body)
}

fn with_body(app: &AppHandle, body: &str, action: &str) -> (u16, Value) {
    match parse_body(body) {
        Ok(payload) => renderer_call(app, action, payload),
        Err(error) => (400, error_body(&error)),
    }
}

fn renderer_call(app: &AppHandle, action: &str, payload: Value) -> (u16, Value) {
    let state = app.state::<BridgeState>();
    let id = state.next_id.fetch_add(1, Ordering::SeqCst);
    let (sender, receiver) = mpsc::channel();

    {
        let Ok(mut pending) = state.pending.lock() else {
            return (500, error_body("Bridge is unavailable"));
        };
        pending.insert(id, sender);
    }

    if let Err(error) = app.emit_to(
        "main",
        "bridge-request",
        json!({ "id": id, "action": action, "payload": payload }),
    ) {
        let _ = state.pending.lock().map(|mut pending| pending.remove(&id));
        return (
            500,
            error_body(&format!("Could not reach the app: {error}")),
        );
    }

    match receiver.recv_timeout(RENDERER_TIMEOUT) {
        Ok(response) => (200, response),
        Err(_) => {
            let _ = state.pending.lock().map(|mut pending| pending.remove(&id));
            (
                504,
                error_body("The app did not answer in time; is the window open?"),
            )
        }
    }
}

fn read_request(stream: &mut TcpStream) -> Result<HttpRequest, String> {
    let mut raw: Vec<u8> = Vec::new();
    let mut buffer = [0u8; 1024];

    let header_end = loop {
        if let Some(end) = find_header_end(&raw) {
            break end;
        }
        if raw.len() > MAX_HEADER_BYTES {
            return Err("Request headers are too large".into());
        }

        let read = stream.read(&mut buffer).map_err(|error| error.to_string())?;
        if read == 0 {
            return Err("Connection closed before the request was complete".into());
        }
        raw.extend_from_slice(&buffer[..read]);
    };

    let head = String::from_utf8_lossy(&raw[..header_end]).into_owned();
    let mut lines = head.lines();
    let request_line = lines.next().ok_or("Empty request")?;
    let mut parts = request_line.split_whitespace();
    let method = parts.next().unwrap_or_default().to_ascii_uppercase();
    let path = parts.next().unwrap_or("/").to_string();

    let mut headers = HashMap::new();
    for line in lines {
        if let Some((name, value)) = line.split_once(':') {
            headers.insert(name.trim().to_ascii_lowercase(), value.trim().to_string());
        }
    }

    let content_length = headers
        .get("content-length")
        .and_then(|value| value.parse::<usize>().ok())
        .unwrap_or(0);
    if content_length > MAX_BODY_BYTES {
        return Err("Request body is too large".into());
    }

    let mut body_bytes = raw[header_end..].to_vec();
    while body_bytes.len() < content_length {
        let read = stream.read(&mut buffer).map_err(|error| error.to_string())?;
        if read == 0 {
            break;
        }
        body_bytes.extend_from_slice(&buffer[..read]);
    }
    body_bytes.truncate(content_length);

    Ok(HttpRequest {
        method,
        path,
        headers,
        body: String::from_utf8_lossy(&body_bytes).into_owned(),
    })
}

fn find_header_end(buffer: &[u8]) -> Option<usize> {
    buffer
        .windows(4)
        .position(|window| window == b"\r\n\r\n")
        .map(|index| index + 4)
        .or_else(|| {
            buffer
                .windows(2)
                .position(|window| window == b"\n\n")
                .map(|index| index + 2)
        })
}

fn respond(stream: &mut TcpStream, status: u16, body: Value) -> Result<(), String> {
    let reason = match status {
        200 => "OK",
        400 => "Bad Request",
        401 => "Unauthorized",
        403 => "Forbidden",
        404 => "Not Found",
        504 => "Gateway Timeout",
        _ => "Error",
    };
    let payload = body.to_string();
    let head = format!(
        "HTTP/1.1 {status} {reason}\r\n\
         Content-Type: application/json; charset=utf-8\r\n\
         Content-Length: {}\r\n\
         Cache-Control: no-store\r\n\
         Connection: close\r\n\r\n",
        payload.len()
    );

    stream
        .write_all(head.as_bytes())
        .and_then(|_| stream.write_all(payload.as_bytes()))
        .and_then(|_| stream.flush())
        .map_err(|error| error.to_string())
}

fn error_body(message: &str) -> Value {
    json!({ "ok": false, "error": message })
}

fn parse_body(body: &str) -> Result<Value, String> {
    if body.trim().is_empty() {
        return Ok(json!({}));
    }
    serde_json::from_str(body).map_err(|_| "Request body must be valid JSON".to_string())
}

fn random_token() -> String {
    let mut bytes = [0u8; 32];
    rand::thread_rng().fill_bytes(&mut bytes);
    let mut token = String::with_capacity(bytes.len() * 2);
    for byte in bytes {
        use std::fmt::Write as _;
        let _ = write!(token, "{byte:02x}");
    }
    token
}

fn bridge_file_path(app: &AppHandle) -> Result<PathBuf, String> {
    let directory = app
        .path()
        .app_config_dir()
        .map_err(|error| error.to_string())?;
    std::fs::create_dir_all(&directory).map_err(|error| error.to_string())?;
    Ok(directory.join(BRIDGE_FILE))
}

fn write_bridge_file(path: &Path, info: &BridgeInfo) -> Result<(), String> {
    let payload = json!({
        "app": "pomotaro",
        "version": env!("CARGO_PKG_VERSION"),
        "url": info.url,
        "port": info.port,
        "token": info.token,
    });

    std::fs::write(
        path,
        serde_json::to_vec_pretty(&payload).map_err(|error| error.to_string())?,
    )
    .map_err(|error| format!("Could not write {}: {error}", path.display()))
}

fn query_param(path: &str, key: &str) -> Option<String> {
    let query = path.split_once('?')?.1;
    query.split('&').find_map(|pair| {
        let (name, value) = pair.split_once('=')?;
        if name == key {
            Some(percent_decode(value))
        } else {
            None
        }
    })
}

fn percent_decode(input: &str) -> String {
    let bytes = input.as_bytes();
    let mut output = Vec::with_capacity(bytes.len());
    let mut index = 0;

    while index < bytes.len() {
        match bytes[index] {
            b'%' if index + 2 < bytes.len() => {
                match (hex_value(bytes[index + 1]), hex_value(bytes[index + 2])) {
                    (Some(high), Some(low)) => {
                        output.push(high * 16 + low);
                        index += 3;
                    }
                    _ => {
                        output.push(bytes[index]);
                        index += 1;
                    }
                }
            }
            b'+' => {
                output.push(b' ');
                index += 1;
            }
            byte => {
                output.push(byte);
                index += 1;
            }
        }
    }

    String::from_utf8_lossy(&output).into_owned()
}

fn hex_value(byte: u8) -> Option<u8> {
    match byte {
        b'0'..=b'9' => Some(byte - b'0'),
        b'a'..=b'f' => Some(byte - b'a' + 10),
        b'A'..=b'F' => Some(byte - b'A' + 10),
        _ => None,
    }
}

fn host_is_local(host: Option<&str>, port: u16) -> bool {
    let Some(host) = host else {
        return false;
    };
    let host = host.trim().to_ascii_lowercase();
    host == format!("127.0.0.1:{port}") || host == format!("localhost:{port}")
}

fn authorized(header: Option<&str>, token: &str) -> bool {
    if token.is_empty() {
        return false;
    }
    let Some(value) = header else {
        return false;
    };
    let Some((scheme, credentials)) = value.split_once(' ') else {
        return false;
    };
    scheme.eq_ignore_ascii_case("bearer") && constant_time_eq(credentials.trim(), token)
}

/// Compare without leaking the matching prefix length through timing.
fn constant_time_eq(left: &str, right: &str) -> bool {
    let left = left.as_bytes();
    let right = right.as_bytes();
    if left.len() != right.len() {
        return false;
    }

    let mut difference = 0u8;
    for (a, b) in left.iter().zip(right.iter()) {
        difference |= a ^ b;
    }
    difference == 0
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn bearer_tokens_are_required_and_compared_exactly() {
        assert!(authorized(Some("Bearer abc123"), "abc123"));
        assert!(authorized(Some("bearer abc123"), "abc123"));
        assert!(!authorized(Some("Bearer abc124"), "abc123"));
        assert!(!authorized(Some("Basic abc123"), "abc123"));
        assert!(!authorized(Some("Bearer abc123"), ""));
        assert!(!authorized(None, "abc123"));
    }

    #[test]
    fn only_local_hosts_are_accepted() {
        assert!(host_is_local(Some("127.0.0.1:8080"), 8080));
        assert!(host_is_local(Some("LOCALHOST:8080"), 8080));
        assert!(!host_is_local(Some("127.0.0.1:9999"), 8080));
        assert!(!host_is_local(Some("example.com:8080"), 8080));
        assert!(!host_is_local(None, 8080));
    }

    #[test]
    fn query_parameters_are_decoded() {
        assert_eq!(
            query_param("/stats?range=week", "range").as_deref(),
            Some("week")
        );
        assert_eq!(
            query_param("/stats?range=month&x=1", "range").as_deref(),
            Some("month")
        );
        assert_eq!(query_param("/stats", "range"), None);
    }

    #[test]
    fn percent_decoding_handles_plus_and_escapes() {
        assert_eq!(percent_decode("short+break"), "short break");
        assert_eq!(percent_decode("a%20b"), "a b");
        assert_eq!(percent_decode("%zz"), "%zz");
    }

    #[test]
    fn header_terminator_is_found() {
        assert_eq!(find_header_end(b"GET / HTTP/1.1\r\n\r\nbody"), Some(18));
        assert_eq!(find_header_end(b"no terminator"), None);
    }

    #[test]
    fn empty_body_is_an_empty_object() {
        assert_eq!(parse_body("").unwrap(), json!({}));
        assert_eq!(parse_body("  ").unwrap(), json!({}));
        assert!(parse_body("{oops}").is_err());
    }

    #[test]
    fn tokens_are_64_hex_characters() {
        let token = random_token();
        assert_eq!(token.len(), 64);
        assert!(token.chars().all(|character| character.is_ascii_hexdigit()));
        assert_ne!(token, random_token());
    }
}
