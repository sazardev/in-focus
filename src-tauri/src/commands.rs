use std::path::PathBuf;

use tauri::{AppHandle, Manager};

use crate::models::SaveState;
use crate::save_states;

fn app_dir(app: &AppHandle) -> PathBuf {
    app.path().app_data_dir().expect("no app data dir")
}

#[tauri::command]
pub fn save_state(app: AppHandle, state: SaveState) -> Result<(), String> {
    save_states::save(&app_dir(&app), &state)
}

#[tauri::command]
pub fn load_state(app: AppHandle) -> Result<Option<SaveState>, String> {
    save_states::load(&app_dir(&app))
}
