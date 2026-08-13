use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct SaveState {
    pub profile: Option<PlayerProfile>,
    pub affinity: i32,
    pub romance: i32,
    pub trust: i32,
    pub script_variables: std::collections::HashMap<String, serde_json::Value>,
    pub choice_history: Vec<i32>,
    pub messages: Vec<StoredMessage>,
    pub current_node: String,
    pub chapter_title: Option<String>,
    pub gallery_photos: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PlayerProfile {
    pub name: String,
    pub pronouns: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct StoredMessage {
    pub id: String,
    pub author: String,
    pub kind: String,
    pub text: String,
    pub sent_at: u64,
}
