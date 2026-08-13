use std::fs;
use std::path::{Path, PathBuf};

use crate::models::SaveState;

fn save_path(app_dir: &Path) -> PathBuf {
    app_dir.join("save-state.json")
}

pub fn save(app_dir: &Path, state: &SaveState) -> Result<(), String> {
    let serialized = serde_json::to_string_pretty(state).map_err(|e| e.to_string())?;
    fs::create_dir_all(app_dir).map_err(|e| e.to_string())?;
    fs::write(save_path(app_dir), serialized).map_err(|e| e.to_string())
}

pub fn load(app_dir: &Path) -> Result<Option<SaveState>, String> {
    let path = save_path(app_dir);
    if !path.exists() {
        return Ok(None);
    }
    let raw = fs::read_to_string(&path).map_err(|e| e.to_string())?;
    let state = serde_json::from_str(&raw).map_err(|e| e.to_string())?;
    Ok(Some(state))
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::tempdir;

    #[test]
    fn save_and_load_roundtrip() {
        let dir = tempdir().unwrap();
        let app_dir = dir.path();
        let state = SaveState {
            affinity: 42,
            ..Default::default()
        };

        save(app_dir, &state).unwrap();
        let loaded = load(app_dir).unwrap();

        assert_eq!(loaded.unwrap().affinity, 42);
    }

    #[test]
    fn load_missing_file_returns_none() {
        let dir = tempdir().unwrap();
        assert!(load(dir.path()).unwrap().is_none());
    }
}
