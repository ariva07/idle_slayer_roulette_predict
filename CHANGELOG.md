# Changelog

Wszystkie znaczące zmiany w tym projekcie będą dokumentowane w tym pliku.

Format jest oparty na [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
a ten projekt przestrzega [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.1] - 2025-12-28

Wersja skupiona na pełnym dostosowaniu algorytmów do mechaniki gry *Idle Slayer* oraz poprawie User Experience poprzez zapisywanie danych.

### Dodane
- **Persystencja danych:** Historia spinów jest teraz automatycznie zapisywana i wczytywana przy uruchomieniu aplikacji (plik `history.json`).
- **Zarządzanie historią:**
  - Możliwość edycji wartości spinu w tabeli historii (np. w przypadku pomyłki przy wprowadzaniu).
  - Możliwość usuwania pojedynczych wpisów z historii.
- **Obsługa klawiatury:** Klawisz `Enter` w polu "Val" automatycznie zatwierdza wpis i synchronizuje dane.
- **Nowe sygnały AI:**
  - Wykrywanie wzorca "Zig-Zag" (przeplatanka kolorów).
  - Specyficzne porady dla "Hot Numbers" w zakresie 0-14.
- Cel budowania `nsis` w konfiguracji Windows.

### Zmienione
- **Logika Gry (Core Mechanics):**
  - Zmieniono zakres liczb z 0-36 na **0-14** (zgodnie z mechaniką *Idle Slayer*).
  - Nowa definicja kolorów:
    - **0**: Green
    - **1-7**: Red
    - **8-14**: Black
- **Interfejs Użytkownika:**
  - Usunięto przyciski wyboru koloru (kolor jest teraz determinowany automatycznie na podstawie liczby).
  - Zaktualizowano stopkę z prawidłowymi prawdopodobieństwami dla nowego zakresu (Red/Black ~46.6%, Green ~6.6%).
  - Uproszczono panel wprowadzania danych ("SYNC").
- **Backend:**
  - Przeniesiono główną logikę aplikacji do `src-tauri/src/lib.rs`.
  - Zaktualizowano zależności Rust (`tauri` v2.2.0).
  - Oczyszczono `Cargo.toml` z nieużywanych bibliotek (m.in. `tauri-plugin-log`).

### Naprawione
- Poprawiono błędy komunikacji z backendem w funkcji `getAiPrediction` (obsługa błędów invoke).
- Zoptymalizowano skrypty budowania w `package.json`.

### Usunięte
- Stary algorytm predykcji oparty na Ruletce Europejskiej.
- Zbędne logowanie debugowe w konsoli produkcyjnej.
