use std::sync::Mutex;
use std::time::Duration;

use discord_rich_presence::activity::{Activity, Assets, Button, Timestamps};
use discord_rich_presence::{DiscordIpc, DiscordIpcClient};
use serde::Deserialize;
use tauri::{AppHandle, Manager};

const CLIENT_ID: &str = "1454874975994515723";
const PROJECT_URL: &str = "https://github.com/Hum1Tab/Pomotaro-Desktop";
const RECONNECT_INTERVAL: Duration = Duration::from_secs(30);

#[derive(Clone, Debug, Default, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DiscordActivity {
    pub details: Option<String>,
    pub state: Option<String>,
    pub start_timestamp: Option<f64>,
    pub end_timestamp: Option<f64>,
    pub large_image_key: Option<String>,
    pub large_image_text: Option<String>,
    pub small_image_key: Option<String>,
    pub small_image_text: Option<String>,
}

pub struct DiscordState {
    client: Mutex<Option<DiscordIpcClient>>,
    activity: Mutex<Option<Activity<'static>>>,
}

impl Default for DiscordState {
    fn default() -> Self {
        Self {
            client: Mutex::new(None),
            activity: Mutex::new(None),
        }
    }
}

impl DiscordState {
    pub fn update(&self, payload: DiscordActivity) {
        let activity = build_activity(payload);
        *self.activity.lock().unwrap() = Some(activity.clone());
        self.apply(activity);
    }

    pub fn clear(&self) {
        *self.activity.lock().unwrap() = None;
        let mut guard = self.client.lock().unwrap();
        if let Some(client) = guard.as_mut() {
            if let Err(error) = client.clear_activity() {
                log::warn!("Discord RPC clear_activity failed: {error}");
                *guard = None;
            }
        }
    }

    fn apply(&self, activity: Activity<'static>) {
        let mut guard = self.client.lock().unwrap();
        let Some(client) = guard.as_mut() else {
            return;
        };
        if let Err(error) = client.set_activity(activity) {
            log::warn!("Discord RPC set_activity failed: {error}");
            *guard = None;
        }
    }
}

pub fn spawn(app: AppHandle) {
    std::thread::spawn(move || loop {
        try_connect(&app);
        std::thread::sleep(RECONNECT_INTERVAL);
    });
}

pub fn shutdown(app: &AppHandle) {
    let state = app.state::<DiscordState>();
    let mut guard = state.client.lock().unwrap();
    if let Some(mut client) = guard.take() {
        let _ = client.close();
    }
}

fn try_connect(app: &AppHandle) {
    let state = app.state::<DiscordState>();
    if state.client.lock().unwrap().is_some() {
        return;
    }

    let mut client = DiscordIpcClient::new(CLIENT_ID);

    if let Err(error) = client.connect() {
        log::info!("Discord RPC connection failed (Discord might be closed): {error}");
        return;
    }

    let activity = state
        .activity
        .lock()
        .unwrap()
        .clone()
        .unwrap_or_else(default_activity);

    match client.set_activity(activity) {
        Ok(()) => {
            log::info!("Discord RPC connected");
            *state.client.lock().unwrap() = Some(client);
        }
        Err(error) => log::warn!("Discord RPC initial activity failed: {error}"),
    }
}

fn default_activity() -> Activity<'static> {
    build_activity(DiscordActivity {
        details: Some("Focusing".into()),
        state: Some("Using Pomotaro".into()),
        start_timestamp: Some(now_seconds() as f64),
        large_image_key: Some("pomotaro_logo".into()),
        large_image_text: Some("Pomotaro".into()),
        ..Default::default()
    })
}

fn build_activity(payload: DiscordActivity) -> Activity<'static> {
    let mut activity = Activity::new();

    if let Some(details) = payload.details {
        activity = activity.details(details);
    }
    if let Some(state) = payload.state {
        activity = activity.state(state);
    }

    let mut has_timestamps = false;
    let mut timestamps = Timestamps::new();
    if let Some(start) = payload.start_timestamp {
        timestamps = timestamps.start(to_unix_seconds(start));
        has_timestamps = true;
    }
    if let Some(end) = payload.end_timestamp {
        timestamps = timestamps.end(to_unix_seconds(end));
        has_timestamps = true;
    }
    if has_timestamps {
        activity = activity.timestamps(timestamps);
    }

    let mut has_assets = false;
    let mut assets = Assets::new();
    if let Some(key) = payload.large_image_key {
        assets = assets.large_image(key);
        has_assets = true;
    }
    if let Some(text) = payload.large_image_text {
        assets = assets.large_text(text);
        has_assets = true;
    }
    if let Some(key) = payload.small_image_key {
        assets = assets.small_image(key);
        has_assets = true;
    }
    if let Some(text) = payload.small_image_text {
        assets = assets.small_text(text);
        has_assets = true;
    }
    if has_assets {
        activity = activity.assets(assets);
    }

    activity.buttons(vec![Button::new("Get App", PROJECT_URL)])
}

fn now_seconds() -> i64 {
    std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map(|duration| duration.as_secs() as i64)
        .unwrap_or(0)
}

/// Discord expects seconds since the Unix epoch, while the renderer sends
/// JavaScript millisecond timestamps.
fn to_unix_seconds(value: f64) -> i64 {
    let value = value as i64;
    if value > 10_000_000_000 {
        value / 1000
    } else {
        value
    }
}
