use std::path::{Path, PathBuf};

use serde::Serialize;
use tauri::{AppHandle, Manager};

const BACKUP_FILE_NAME: &str = "pomotaro-sessions-backup.json";
const MAX_BACKUP_BYTES: usize = 10 * 1024 * 1024;

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SessionBackupResult {
    pub success: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub path: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub data: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub error: Option<String>,
}

impl SessionBackupResult {
    fn failure(error: impl Into<String>) -> Self {
        Self {
            success: false,
            path: None,
            data: None,
            error: Some(error.into()),
        }
    }
}

pub fn save(app: &AppHandle, sessions_json: &str) -> SessionBackupResult {
    if sessions_json.len() > MAX_BACKUP_BYTES {
        return SessionBackupResult::failure(
            "Backup data must be valid JSON smaller than 10 MB",
        );
    }
    if serde_json::from_str::<serde_json::Value>(sessions_json).is_err() {
        return SessionBackupResult::failure("Backup data must be valid JSON");
    }

    let path = match current_path(app) {
        Ok(path) => path,
        Err(error) => return SessionBackupResult::failure(error),
    };

    let Some(directory) = path.parent() else {
        return SessionBackupResult::failure("Invalid backup path");
    };

    let temporary_path = path.with_extension("json.tmp");
    let write_result = (|| -> std::io::Result<()> {
        std::fs::create_dir_all(directory)?;
        std::fs::write(&temporary_path, sessions_json.as_bytes())?;
        replace_file(&temporary_path, &path)
    })();

    if let Err(error) = write_result {
        let _ = std::fs::remove_file(&temporary_path);
        log::error!("Failed to save session backup: {error}");
        return SessionBackupResult::failure(error.to_string());
    }

    SessionBackupResult {
        success: true,
        path: Some(path.to_string_lossy().into_owned()),
        data: None,
        error: None,
    }
}

pub fn load(app: &AppHandle) -> SessionBackupResult {
    let current = match current_path(app) {
        Ok(path) => path,
        Err(error) => return SessionBackupResult::failure(error),
    };

    let legacy = legacy_path(app).ok();
    let source = if current.exists() {
        Some(current)
    } else {
        legacy.filter(|path| path.exists()).map(|path| {
            log::info!("Importing session backup from the old Electron data directory");
            path
        })
    };

    let Some(path) = source else {
        return SessionBackupResult::failure("Backup file not found");
    };

    match std::fs::read_to_string(&path) {
        Ok(data) => {
            if serde_json::from_str::<serde_json::Value>(&data).is_err() {
                return SessionBackupResult::failure("Backup file contains invalid JSON");
            }
            SessionBackupResult {
                success: true,
                path: current_path(app)
                    .ok()
                    .map(|p| p.to_string_lossy().into_owned()),
                data: Some(data),
                error: None,
            }
        }
        Err(error) => {
            if error.kind() == std::io::ErrorKind::NotFound {
                SessionBackupResult::failure("Backup file not found")
            } else {
                log::error!("Failed to load session backup: {error}");
                SessionBackupResult::failure(error.to_string())
            }
        }
    }
}

pub fn path_string(app: &AppHandle) -> Result<String, String> {
    current_path(app).map(|path| path.to_string_lossy().into_owned())
}

fn current_path(app: &AppHandle) -> Result<PathBuf, String> {
    let directory = app
        .path()
        .app_data_dir()
        .map_err(|error| error.to_string())?;
    Ok(directory.join("session-backups").join(BACKUP_FILE_NAME))
}

/// Electron stored its data under `%APPDATA%\Pomotaro` on Windows. Tauri uses
/// the bundle identifier (`%APPDATA%\com.pomotaro.app`), so look in the old
/// location when no new backup exists yet.
fn legacy_path(app: &AppHandle) -> Result<PathBuf, String> {
    let directory = app.path().data_dir().map_err(|error| error.to_string())?;
    Ok(directory
        .join("Pomotaro")
        .join("session-backups")
        .join(BACKUP_FILE_NAME))
}

#[cfg(windows)]
fn replace_file(from: &Path, to: &Path) -> std::io::Result<()> {
    // Windows `rename` refuses to replace an existing file.
    if to.exists() {
        std::fs::remove_file(to)?;
    }
    std::fs::rename(from, to)
}

#[cfg(not(windows))]
fn replace_file(from: &Path, to: &Path) -> std::io::Result<()> {
    std::fs::rename(from, to)
}
