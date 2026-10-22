# Pomotaro 🍑

![Pomotaro](./client/public/screenshots/readme-header.png)
<div align="center">
  <img src="https://count.getloli.com/get/@Hum1tab?theme=moebooru" alt="訪問者カウンター" />
</div>
<div align="center">

[![Latest Release](https://img.shields.io/github/v/release/Hum1Tab/Pomotaro-Desktop?style=for-the-badge&color=orange)](https://github.com/Hum1Tab/Pomotaro-Desktop/releases/latest)
[![License](https://img.shields.io/github/license/Hum1Tab/Pomotaro-Desktop?style=for-the-badge&color=blue)](LICENSE)
![Platform](https://img.shields.io/badge/platform-Windows%2010%2F11-lightgrey?style=for-the-badge)

**[日本語版はこちら](./README.ja.md)**

</div>

---

### Your Ultimate Productivity Companion.

**Pomotaro** is not just another timer. It is a precision-engineered tool designed to protect your focus at all costs. With millisecond-accurate timing, robust data persistence, and seamless integrations, it stands as your faithful guardian in the battle against distraction.

> **v2.1.0** — app-wide language switching, the window-title timer, a much smaller first load, accessibility fixes and a Content Security Policy. See the [changelog](CHANGELOG.md).

## ✨ Powerful Features

### 🐕 The Faithful Dog: Unwavering Precision
> *Never lose a second.*
- **Timestamp-Based Logic**: Immune to system lag or freezes. Time is tracked with absolute accuracy.
- **Auto-State Recovery**: Accidentally closed the app? PC crashed? Pomotaro remembers exactly where you left off.

### 🐒 The Clever Monkey: Social & Connected
> *Focus together.*
- **Discord Rich Presence**: Automatically syncs your focus status, session type, and Pomodoro count to your Discord profile. Let your friends know you're in the zone.

### 🕊️ The Sharp Pheasant: Always Aware
> *Glanceable progress.*
- **Window Title Sync**: Track your remaining time directly from the window title bar, visible even when the app is in the background.
- **Tray & Auto-Launch**: Closing the window keeps Pomotaro in the tray, and it can start with Windows.

---

## 🛡️ Ironclad Security

Your data is sacred. Pomotaro employs a **Dual-Layer Storage System**:
1.  **Instant Access**: `localStorage` for lightning-fast performance.
2.  **Physical Backup**: `session-backups/pomotaro-sessions-backup.json` in the app data folder for permanent reliability.

Even if the webview storage is cleared, your session history is automatically restored from the local file system.

> **Upgrading from v1.x?** Pomotaro 2.0 is built with Tauri v2. On first launch it imports the automatic backup from the old Electron data directory (`%APPDATA%\Pomotaro\session-backups`).

---

## 🎨 A Premium Experience

- **Glassmorphism Design**: sleek, dark-themed UI with vibrant orange accents.
- **Zero-Latency Audio**: Pre-loaded High-Quality White/Pink/Brown noise.
- **Keyboard First**: `Space` start/pause, `←`/`→` switch sessions, `Ctrl+R` reset, `Ctrl+S` settings.
- **Faster, lighter**: statistics, calendar, settings and stopwatch screens load on demand instead of on startup.

![Stats](./client/public/screenshots/stats_dashboard.png)

---

## 🛠️ Tech Stack

<div align="center">

![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Tauri](https://img.shields.io/badge/Tauri_2-24C8DB?style=for-the-badge&logo=tauri&logoColor=white)
![Rust](https://img.shields.io/badge/Rust-000000?style=for-the-badge&logo=rust&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)

</div>

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Run the desktop app in development
npm run dev:desktop

# Build the Windows installer
npm run build:desktop

# Type check, unit tests and production build
npm run verify

# Frontend-only preview
npm run dev
```

## 📄 License

Distributed under the MIT License. See [LICENSE](LICENSE) for more information.
