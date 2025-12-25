// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use serde::{Deserialize, Serialize};
use std::collections::HashMap;

// Struktura danych przychodząca z Reacta
#[derive(Debug, Serialize, Deserialize)]
struct SpinResult {
    value: u32,
    color: String, // "RED", "BLACK", "GREEN"
}

#[tauri::command]
fn predict_next_move(history: Vec<SpinResult>) -> String {
    if history.len() < 3 {
        return "Not enough data. Spin more to calibrate the local algorithm.".to_string();
    }

    // --- 1. Analiza Kolorów ---
    // Dodajemy _ przed zmienną, żeby Rust nie krzyczał, że jest nieużywana
    let _total = history.len() as f32;
    let mut red_count = 0;
    let mut _black_count = 0; // Tu też zmiana na _black_count

    // Liczymy ostatnie 15 spinów dla trendu
    let recent_slice = if history.len() > 15 { &history[0..15] } else { &history[..] };

    for spin in recent_slice {
        match spin.color.as_str() {
            "RED" => red_count += 1,
            "BLACK" => _black_count += 1,
            _ => {},
        }
    }

    // --- 2. Analiza "Gorących Liczb" ---
    let mut counts = HashMap::new();
    for spin in &history {
        *counts.entry(spin.value).or_insert(0) += 1;
    }

    let hot_number = counts.iter().max_by_key(|&(_, count)| count);

    // --- 3. Generowanie Predykcji ---
    let red_ratio = red_count as f32 / recent_slice.len() as f32;

    if red_ratio > 0.65 {
        return format!("Detected RED streak ({:.0}%). Statistical pressure suggests betting BLACK.", red_ratio * 100.0);
    } else if red_ratio < 0.35 {
        return format!("Detected BLACK streak ({:.0}%). Statistical pressure suggests betting RED.", (1.0 - red_ratio) * 100.0);
    }

    if let Some(last) = history.first() {
        if last.color == "GREEN" {
            return "Green event detected. Volatility high. Recommend skipping or minimal bet.".to_string();
        }
        if recent_slice.len() >= 3 {
            if recent_slice[0].color == recent_slice[1].color && recent_slice[1].color == recent_slice[2].color {
                 return format!("Streak of 3 {}s. Trend following protocol: Bet {}.", recent_slice[0].color, recent_slice[0].color);
            }
        }
    }

    // Zmieniamy (num, count) na (num, _count) żeby ukryć ostrzeżenie
    if let Some((num, _count)) = hot_number {
        return format!("Market flat. Hot number is {}. Consider sector bets around it.", num);
    }

    "Pattern analysis inconclusive. Maintain current strategy.".to_string()
}

fn main() {
    tauri::Builder::default()
        // USUNĄŁEM LINIĘ: .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![predict_next_move])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
