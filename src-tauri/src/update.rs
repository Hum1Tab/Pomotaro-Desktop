use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Mutex;

use serde::Serialize;
use tauri::{AppHandle, Emitter, Manager};
use tauri_plugin_updater::{Update, UpdaterExt};

#[derive(Clone, Debug, Serialize)]
pub struct UpdateMessage {
    pub key: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub message: Option<String>,
}

pub struct PendingUpdate {
    update: Update,
    bytes: Vec<u8>,
}

#[derive(Default)]
pub struct UpdateState {
    pending: Mutex<Option<PendingUpdate>>,
    checking: AtomicBool,
}

pub async fn check(app: AppHandle) -> Result<Option<String>, String> {
    // Match the Electron behaviour: only packaged builds check for updates.
    if cfg!(debug_assertions) {
        return Ok(None);
    }

    let state = app.state::<UpdateState>();
    if state.checking.swap(true, Ordering::SeqCst) {
        return Ok(None);
    }

    let result = check_inner(&app).await;
    state.checking.store(false, Ordering::SeqCst);

    if let Err(error) = &result {
        log::error!("Auto update error: {error}");
        let _ = app.emit(
            "update-error",
            UpdateMessage {
                key: "update.error".into(),
                message: Some(error.clone()),
            },
        );
    }

    result
}

async fn check_inner(app: &AppHandle) -> Result<Option<String>, String> {
    let updater = app.updater().map_err(|error| error.to_string())?;
    let Some(update) = updater.check().await.map_err(|error| error.to_string())? else {
        return Ok(None);
    };

    let version = update.version.clone();
    let _ = app.emit(
        "update-status",
        UpdateMessage {
            key: "update.available".into(),
            message: None,
        },
    );

    let bytes = update
        .download(|_chunk_length, _content_length| {}, || {})
        .await
        .map_err(|error| error.to_string())?;

    {
        let state = app.state::<UpdateState>();
        *state.pending.lock().unwrap() = Some(PendingUpdate {
            update: update.clone(),
            bytes,
        });
    }

    let _ = app.emit(
        "update-status",
        UpdateMessage {
            key: "update.downloaded".into(),
            message: None,
        },
    );
    let _ = app.emit("update-downloaded", ());

    Ok(Some(version))
}

pub fn install(app: &AppHandle) {
    let pending = app
        .state::<UpdateState>()
        .pending
        .lock()
        .unwrap()
        .take();

    if let Some(pending) = pending {
        if let Err(error) = pending.update.install(pending.bytes) {
            log::error!("Failed to install update: {error}");
        }
    }

    // On Windows a successful install exits the process from inside
    // `install`. On other platforms (and when there is nothing pending) this
    // relaunches the app.
    app.restart();
}
