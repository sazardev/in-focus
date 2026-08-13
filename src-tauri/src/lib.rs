mod commands;
mod models;
mod save_states;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            commands::save_state,
            commands::load_state
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
