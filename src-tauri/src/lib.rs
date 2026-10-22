mod backup;
mod bridge;
mod commands;
mod discord;
mod power;
mod update;

use std::sync::atomic::{AtomicBool, Ordering};

use tauri::menu::{Menu, MenuItem};
use tauri::tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent};
use tauri::{AppHandle, Emitter, Manager, RunEvent, WindowEvent};
use tauri_plugin_window_state::{AppHandleExt, StateFlags};

#[derive(Default)]
pub struct QuitState {
    quitting: AtomicBool,
}

#[derive(Default)]
pub struct WindowStateMonitor {
    maximized: AtomicBool,
}

pub fn window_state_flags() -> StateFlags {
    StateFlags::POSITION | StateFlags::SIZE | StateFlags::MAXIMIZED
}

fn show_main(app: &AppHandle) {
    if let Some(window) = app.get_webview_window("main") {
        let _ = window.show();
        let _ = window.unminimize();
        let _ = window.set_focus();
    }
}

fn quit_app(app: &AppHandle) {
    app.state::<QuitState>()
        .quitting
        .store(true, Ordering::SeqCst);
    let _ = app.save_window_state(window_state_flags());
    app.exit(0);
}

fn install_tray(app: &AppHandle) -> tauri::Result<()> {
    let open_item = MenuItem::with_id(app, "open", "Open Pomotaro", true, None::<&str>)?;
    let quit_item = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
    let menu = Menu::with_items(app, &[&open_item, &quit_item])?;

    let mut builder = TrayIconBuilder::new()
        .menu(&menu)
        .show_menu_on_left_click(false)
        .tooltip("Pomotaro")
        .on_menu_event(|app, event| match event.id.as_ref() {
            "open" => show_main(app),
            "quit" => quit_app(app),
            _ => {}
        })
        .on_tray_icon_event(|tray, event| {
            if let TrayIconEvent::Click {
                button: MouseButton::Left,
                button_state: MouseButtonState::Up,
                ..
            } = event
            {
                show_main(tray.app_handle());
            }
        });

    if let Some(icon) = app.default_window_icon() {
        builder = builder.icon(icon.clone());
    }

    builder.build(app)?;
    Ok(())
}

fn attach_window_events(app: &AppHandle) {
    let Some(window) = app.get_webview_window("main") else {
        return;
    };

    let handle = app.clone();
    let event_window = window.clone();

    window.on_window_event(move |event| match event {
        WindowEvent::CloseRequested { api, .. } => {
            if !handle.state::<QuitState>().quitting.load(Ordering::SeqCst) {
                api.prevent_close();
                let _ = event_window.hide();
                let _ = handle.save_window_state(window_state_flags());
            }
        }
        WindowEvent::Resized(_) => {
            let maximized = event_window.is_maximized().unwrap_or(false);
            let previous = handle
                .state::<WindowStateMonitor>()
                .maximized
                .swap(maximized, Ordering::SeqCst);
            if previous != maximized {
                let state = if maximized { "maximized" } else { "unmaximized" };
                let _ = event_window.emit("window-state-changed", state);
            }
        }
        _ => {}
    });
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
            show_main(app);
        }))
        .plugin(
            tauri_plugin_log::Builder::new()
                .level(log::LevelFilter::Info)
                .build(),
        )
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_autostart::init(
            tauri_plugin_autostart::MacosLauncher::LaunchAgent,
            None,
        ))
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(
            tauri_plugin_window_state::Builder::default()
                .with_state_flags(window_state_flags())
                .build(),
        )
        .manage(QuitState::default())
        .manage(WindowStateMonitor::default())
        .manage(discord::DiscordState::default())
        .manage(bridge::BridgeState::default())
        .manage(power::PowerState::new())
        .manage(update::UpdateState::default())
        .invoke_handler(tauri::generate_handler![
            commands::update_activity,
            commands::clear_activity,
            commands::set_progress_bar,
            commands::set_always_on_top,
            commands::set_window_size,
            commands::toggle_fullscreen,
            commands::unmaximize_window,
            commands::is_maximized,
            commands::set_window_title,
            commands::restart_app,
            commands::open_external,
            commands::set_auto_launch,
            commands::get_auto_launch,
            commands::set_power_save_blocker,
            commands::check_for_updates,
            commands::save_session_backup,
            commands::load_session_backup,
            commands::get_backup_path,
            commands::send_notification,
            commands::set_bridge_enabled,
            commands::get_bridge_info,
            commands::bridge_respond,
        ])
        .setup(|app| {
            discord::spawn(app.handle().clone());
            install_tray(app.handle())?;
            attach_window_events(app.handle());
            Ok(())
        })
        .build(tauri::generate_context!())
        .expect("error while building tauri application")
        .run(|app, event| {
            if let RunEvent::Exit = event {
                bridge::disable(app);
                discord::shutdown(app);
                let _ = app.save_window_state(window_state_flags());
            }
        });
}
