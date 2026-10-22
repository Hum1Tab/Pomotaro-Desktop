use tauri::window::{ProgressBarState, ProgressBarStatus};
use tauri::{AppHandle, LogicalSize, Manager, WebviewWindow};
use tauri_plugin_autostart::ManagerExt as AutostartManagerExt;
use tauri_plugin_notification::NotificationExt;
use tauri_plugin_opener::OpenerExt;
use tauri_plugin_window_state::AppHandleExt;

use crate::backup::{self, SessionBackupResult};
use crate::discord::{self, DiscordActivity};
use crate::power;
use crate::update;
use crate::window_state_flags;

fn main_window(app: &AppHandle) -> Result<WebviewWindow, String> {
    app.get_webview_window("main")
        .ok_or_else(|| "Main window not found".to_string())
}

#[tauri::command]
pub fn update_activity(app: AppHandle, activity: DiscordActivity) {
    app.state::<discord::DiscordState>().update(activity);
}

#[tauri::command]
pub fn clear_activity(app: AppHandle) {
    app.state::<discord::DiscordState>().clear();
}

#[tauri::command]
pub fn set_progress_bar(app: AppHandle, progress: f64) -> Result<(), String> {
    if !progress.is_finite() {
        return Ok(());
    }

    let window = main_window(&app)?;
    let state = if progress < 0.0 {
        ProgressBarState {
            status: Some(ProgressBarStatus::None),
            progress: None,
        }
    } else {
        let value = (progress.clamp(0.0, 1.0) * 100.0).round() as u64;
        ProgressBarState {
            status: Some(ProgressBarStatus::Normal),
            progress: Some(value),
        }
    };

    window.set_progress_bar(state).map_err(|error| error.to_string())
}

#[tauri::command]
pub fn set_always_on_top(app: AppHandle, flag: bool) -> Result<(), String> {
    main_window(&app)?
        .set_always_on_top(flag)
        .map_err(|error| error.to_string())
}

#[tauri::command]
pub fn set_window_size(app: AppHandle, width: u32, height: u32) -> Result<(), String> {
    if !(300..=3840).contains(&width) || !(400..=2160).contains(&height) {
        return Ok(());
    }

    let window = main_window(&app)?;
    if window.is_maximized().unwrap_or(false) {
        let _ = window.unmaximize();
    }
    window
        .set_size(LogicalSize::new(width as f64, height as f64))
        .map_err(|error| error.to_string())?;
    window.center().map_err(|error| error.to_string())?;
    let _ = app.save_window_state(window_state_flags());
    Ok(())
}

#[tauri::command]
pub fn toggle_fullscreen(app: AppHandle, flag: bool) -> Result<(), String> {
    main_window(&app)?
        .set_fullscreen(flag)
        .map_err(|error| error.to_string())
}

#[tauri::command]
pub fn unmaximize_window(app: AppHandle) -> Result<(), String> {
    let window = main_window(&app)?;
    if window.is_maximized().unwrap_or(false) {
        window.unmaximize().map_err(|error| error.to_string())?;
    }
    Ok(())
}

#[tauri::command]
pub fn is_maximized(app: AppHandle) -> Result<bool, String> {
    main_window(&app)?
        .is_maximized()
        .map_err(|error| error.to_string())
}

/// Mirrors the remaining session time into the native title bar.
/// The renderer is untrusted, so the string is trimmed, length capped and
/// rejected when it contains control characters.
#[tauri::command]
pub fn set_window_title(app: AppHandle, title: String) -> Result<(), String> {
    let title = title.trim();
    if title.is_empty() || title.chars().count() > 120 || title.chars().any(|c| c.is_control()) {
        return Err("Invalid window title".into());
    }

    main_window(&app)?
        .set_title(title)
        .map_err(|error| error.to_string())
}

#[tauri::command]
pub fn restart_app(app: AppHandle) {
    update::install(&app);
}

#[tauri::command]
pub fn open_external(app: AppHandle, url: String) -> Result<(), String> {
    let parsed = url::Url::parse(&url).map_err(|_| "Invalid external URL".to_string())?;
    if parsed.scheme() != "http" && parsed.scheme() != "https" {
        return Err("Blocked non-HTTP external URL".into());
    }

    app.opener()
        .open_url(parsed.to_string(), None::<&str>)
        .map_err(|error| error.to_string())
}

#[tauri::command]
pub fn set_auto_launch(app: AppHandle, enabled: bool) -> Result<(), String> {
    let manager = app.autolaunch();
    let result = if enabled {
        manager.enable()
    } else {
        manager.disable()
    };
    result.map_err(|error| error.to_string())
}

#[tauri::command]
pub fn get_auto_launch(app: AppHandle) -> Result<bool, String> {
    app.autolaunch()
        .is_enabled()
        .map_err(|error| error.to_string())
}

#[tauri::command]
pub fn set_power_save_blocker(app: AppHandle, enabled: bool) {
    app.state::<power::PowerState>().set(enabled);
}

#[tauri::command]
pub async fn check_for_updates(app: AppHandle) -> Result<Option<String>, String> {
    update::check(app).await
}

#[tauri::command]
pub fn save_session_backup(app: AppHandle, sessions_json: String) -> SessionBackupResult {
    backup::save(&app, &sessions_json)
}

#[tauri::command]
pub fn load_session_backup(app: AppHandle) -> SessionBackupResult {
    backup::load(&app)
}

#[tauri::command]
pub fn get_backup_path(app: AppHandle) -> Result<String, String> {
    backup::path_string(&app)
}

#[tauri::command]
pub fn send_notification(app: AppHandle, title: String, body: String) -> Result<(), String> {
    app.notification()
        .builder()
        .title(title)
        .body(body)
        .show()
        .map_err(|error| error.to_string())
}
