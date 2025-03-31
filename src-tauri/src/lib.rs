#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri_plugin_updater::UpdaterExt;

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
async fn check_update(app: tauri::AppHandle) -> Result<Option<String>, String> {
    match app.updater() {
        Ok(updater) => {
            match updater.check().await {
                Ok(update) => {
                    if let Some(update) = update {
                        Ok(Some(update.version.to_string()))
                    } else {
                        Ok(None)
                    }
                }
                Err(e) => Err(e.to_string())
            }
        }
        Err(e) => Err(e.to_string())
    }
}

#[tauri::command]
async fn download_and_install_update(app: tauri::AppHandle) -> Result<(), String> {
    match app.updater() {
        Ok(updater) => {
            match updater.check().await {
                Ok(update) => {
                    if let Some(update) = update {
                        // Download and install the update
                        update.download_and_install(|_, _| {}, || {}).await
                            .map_err(|e| e.to_string())?;
                        Ok(())
                    } else {
                        Err("No update available".into())
                    }
                }
                Err(e) => Err(e.to_string())
            }
        }
        Err(e) => Err(e.to_string())
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let mut builder = tauri::Builder::default();
    
    #[cfg(not(debug_assertions))]
    {
        builder = builder.plugin(tauri_plugin_prevent_default::init());
    }
    
    builder
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .setup(|app| {
            #[cfg(desktop)]
            app.handle()
                .plugin(tauri_plugin_autostart::init(
                    tauri_plugin_autostart::MacosLauncher::LaunchAgent,
                    None,
                ))
                .expect("Failed to initialize autostart plugin");
            Ok(())
        })
        .plugin(tauri_plugin_store::Builder::new().build())
        .invoke_handler(tauri::generate_handler![
            greet,
            check_update,
            download_and_install_update
        ])
        .on_window_event(|window, event| {
            if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                api.prevent_close();
                let _ = window.hide();
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}