use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::fs;
use std::path::PathBuf;
use tauri::{AppHandle, Manager};

#[derive(Debug, Serialize, Deserialize, Clone)]
struct SpinResult {
    id: String,
    timestamp: u64,
    value: u32,
    color: String,
}

// Helper do pobierania ścieżki pliku danych
fn get_data_path(app: &AppHandle) -> PathBuf {
    let path = app.path().app_data_dir().expect("failed to get app data dir");
    if !path.exists() {
        let _ = fs::create_dir_all(&path);
    }
    path.join("history.json")
}

#[tauri::command]
fn save_history(app: AppHandle, history: Vec<SpinResult>) -> Result<(), String> {
    let path = get_data_path(&app);
    let json = serde_json::to_string(&history).map_err(|e| e.to_string())?;
    fs::write(path, json).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
fn load_history(app: AppHandle) -> Result<Vec<SpinResult>, String> {
    let path = get_data_path(&app);
    if !path.exists() {
        return Ok(Vec::new());
    }
    let data = fs::read_to_string(path).map_err(|e| e.to_string())?;
    let history: Vec<SpinResult> = serde_json::from_str(&data).map_err(|e| e.to_string())?;
    Ok(history)
}

#[tauri::command]
fn predict_next_move(history: Vec<SpinResult>) -> String {
    if history.len() < 3 {
        return "Not enough data.".to_string();
    }

    // --- 1. Analiza Trendu (Ostatnie 10 spinów) ---
    let window_size = if history.len() > 10 { 10 } else { history.len() };
    let recent_slice = &history[0..window_size];

    let mut red_count = 0;
    let mut _black_count = 0;

    for spin in recent_slice {
        match spin.color.as_str() {
            "RED" => red_count += 1,
            "BLACK" => _black_count += 1,
            _ => {},
        }
    }

    let red_ratio = red_count as f32 / recent_slice.len() as f32;

    // --- 2. LOGIKA SYGNAŁÓW (Proste instrukcje) ---

    // Ostatni był Green - ryzyko
    if let Some(last) = history.first() {
        if last.color == "GREEN" {
            return "Green! Skip or Bet Small.".to_string();
        }

        // Zig-Zag (R-B-R-B)
        if recent_slice.len() >= 4 {
            if recent_slice[0].color != recent_slice[1].color
               && recent_slice[1].color != recent_slice[2].color
               && recent_slice[2].color != recent_slice[3].color {
                // Przełamanie zig-zaga = graj na ten sam co ostatnio
                return format!("Zig-Zag pattern. Bet on {}.", last.color);
            }
        }
    }

    // Silny trend Czerwony (>60%)
    if red_ratio >= 0.60 {
        return format!("Red Streak ({:.0}%). Bet on RED.", red_ratio * 100.0);
    }
    // Silny trend Czarny (czyli czerwonych < 40%)
    else if red_ratio <= 0.40 {
        return format!("Black Streak ({:.0}%). Bet on BLACK.", (1.0 - red_ratio) * 100.0);
    }

    // --- 3. Gorące Liczby (Hot Numbers) ---
    let mut counts = HashMap::new();
    for spin in &history {
        *counts.entry(spin.value).or_insert(0) += 1;
    }

    let hot_number = counts.iter().max_by_key(|&(_, count)| count);

    if let Some((num, count)) = hot_number {
        if *count > 1 {
            // Ustalamy kolor gorącej liczby wg zasad Idle Slayer
            let color_suggestion = if *num == 0 { "GREEN" }
                                   else if *num <= 7 { "RED" }
                                   else { "BLACK" };

            return format!("Number {} is hot. Bet on {}.", num, color_suggestion);
        }
    }

    // Brak sygnału - graj to co ostatnio
    if let Some(last) = history.first() {
        return format!("No signal. Bet on {}.", last.color);
    }

    "Wait...".to_string()
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            predict_next_move,
            save_history,
            load_history
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
