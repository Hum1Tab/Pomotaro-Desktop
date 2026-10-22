# Changelog

All notable changes to Pomotaro are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.1.0] - 2026-10-23

A quality release focused on correctness, startup time and accessibility.

### Added

- **Window-title timer.** The remaining time and the current session type now appear in
  the native title bar, so the countdown is readable from the taskbar while the window is
  in the background. This was documented for v1 but was never implemented after the Tauri
  rewrite.
- **Arrow-key session switching.** `←` / `→` now cycle through Pomodoro, short break and
  long break, matching the shortcut list in the app.
- **Unit tests.** Vitest now covers session aggregation, timer-state normalisation,
  settings validation, and translation coverage (every key referenced from the UI must
  exist in both languages). `npm test` runs them; CI enforces them.
- **`npm run verify`** — one command for type check, tests and the production build.

### Fixed

- **Language switching was local to one component.** `useLanguage` created independent
  state in every component, so changing the language in Settings only re-rendered that
  card. A shared `LanguageProvider` now drives the whole app, persists the choice and
  keeps `<html lang>` in sync.
- **Missing translation keys** (`timer.reset`, `timer.sessionType`, `stats.uncategorized`)
  leaked raw key names into tooltips and labels.
- **Discord and update sections were Japanese-only** even with the English UI selected.
- **`alert()` dialogs** for import success/failure are now non-blocking toasts.
- **Timer restore after sleep** is unchanged in behaviour but no longer writes to
  `localStorage` on every visible second.

### Changed

- **Smaller first load.** Settings, statistics, calendar, stopwatch and tools screens are
  lazy-loaded and vendor code is split into cacheable chunks. The initial JavaScript
  payload drops from ~1.1 MB to ~575 KB (323 KB → ~185 KB gzipped); the chart bundle
  (422 KB) only loads when the stats tab is opened.
- **Less background work.** Timer snapshots are persisted at most every five seconds
  (and immediately on pause/session change); Discord Rich Presence updates on state change
  and every 30 seconds instead of once per second.
- **Stable timers and listeners.** The session-complete callback and keyboard-shortcut
  listener are registered once instead of on every render.
- The last opened tab is remembered across launches.
- Removed the unused `ManusDialog` component and the leftover Manus dev-server hosts.

### Security

- A **Content Security Policy** is now enforced in production builds instead of `null`.
  Scripts are restricted to the app bundle; external fonts and user-provided media
  backgrounds are explicitly allow-listed.

### Accessibility

- Visible `:focus-visible` outline on all interactive elements.
- `aria-label` on icon-only buttons (focus mode, focus noise, theme, settings, back).
- `prefers-reduced-motion` is respected, disabling decorative animations.
- `<html lang>` follows the selected language.

## [2.0.0] - 2025-09-30

### Changed

- Migrated the desktop shell from Electron to **Tauri v2** (Rust backend, native tray,
  Discord Rich Presence, auto-launch, signed auto-updates, NSIS installer).
- Existing session history is imported from the old Electron data directory on first launch.

### Added

- Session backup to a JSON file in the app data directory, restored automatically when the
  webview storage is cleared.

[2.1.0]: https://github.com/Hum1Tab/Pomotaro-Desktop/compare/v2.0.0...v2.1.0
[2.0.0]: https://github.com/Hum1Tab/Pomotaro-Desktop/releases/tag/v2.0.0
