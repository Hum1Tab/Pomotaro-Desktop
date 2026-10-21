# Pomotaro 🍑

![Pomotaro](./client/public/screenshots/readme-header.png)

<div align="center">

[![Latest Release](https://img.shields.io/github/v/release/Hum1Tab/Pomotaro-Desktop?style=for-the-badge&color=orange)](https://github.com/Hum1Tab/Pomotaro-Desktop/releases/latest)
[![License](https://img.shields.io/github/license/Hum1Tab/Pomotaro-Desktop?style=for-the-badge&color=blue)](LICENSE)
![Platform](https://img.shields.io/badge/platform-Windows%2010%2F11-lightgrey?style=for-the-badge)

**[English Version](./README.md)**

</div>

---

### あなたの集中力を極限まで高める、最強のお供。

**Pomotaro（ポモタロウ）** は、単なるタイマーではありません。「1秒の狂いもない正確さ」と「中断しても再開できる安心感」を備え、あなたの集中（鬼退治）を強力にサポートする、現代のワークフローのための最高のパートナーです。

## ✨ 強力な「お供」たち

### 🐕 忠実な「イヌ」：絶対的な精度
> *一瞬たりとも逃さない。*
- **タイムスタンプ駆動**: OSの処理負荷やラグに一切影響されず、実時間を正確に刻み続けます。
- **完全自動復旧**: アプリを誤って閉じても、PCがクラッシュしても大丈夫。再起動すれば、中断したその瞬間からタイマーが復活します。

### 🐒 賢い「サル」：繋がる集中
> *背中で語る。*
- **Discord Rich Presence連携**: あなたの現在のステータス（集中/休憩）、何セット目かをDiscordのプロフィールにリアルタイム同期。
- リモートワークや作業通話で、仲間と「集中のリズム」を共有できます。

### 🕊️ 鋭い「キジ」：常に寄り添う
> *視線を外さずに。*
- **ウィンドウタイトル通知**: アプリが画面の裏に隠れていても、ウィンドウタイトルで残り時間を確認可能。作業の手を止める必要はありません。
- **トレイ常駐 & 自動起動**: ウィンドウを閉じてもトレイに残り、Windows 起動時の自動起動にも対応。

---

## 🛡️ 鉄壁のデータ保護

あなたの努力の証（ログ）を決して無駄にしません。
**デュアルレイヤー保存システム**を採用：

1.  **高速アクセス**: `localStorage` による瞬時の読み書き。
2.  **物理バックアップ**: アプリデータフォルダー内の `session-backups/pomotaro-sessions-backup.json` へ保存。

たとえ WebView のストレージがクリアされても、物理ファイルから自動的に履歴を復元します。

> **v1.x からのアップグレード:** Pomotaro 2.0 は Tauri v2 製です。初回起動時に旧 Electron 版のデータフォルダー（`%APPDATA%\Pomotaro\session-backups`）から自動バックアップをインポートします。

---

## 🎨 洗練された体験

- **Glassmorphism Design**: ダークテーマを基調とし、鮮やかなオレンジが映える美しいガラス風デザイン。
- **Zero-Latency Audio**: 集中力を高めるホワイトノイズ（White/Pink/Brown）と通知音をラグなしで再生。
- **Keyboard First**: マウスを使わず、矢印キーだけでセッションを切り替え可能。

![Stats](./client/public/screenshots/stats_dashboard.png)

---

## 🛠️ 技術スタック

<div align="center">

![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Tauri](https://img.shields.io/badge/Tauri_2-24C8DB?style=for-the-badge&logo=tauri&logoColor=white)
![Rust](https://img.shields.io/badge/Rust-000000?style=for-the-badge&logo=rust&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)

</div>

## 🚀 はじめ方

```bash
# 依存関係のインストール
npm install

# デスクトップアプリを開発モードで起動
npm run dev:desktop

# Windows インストーラーをビルド
npm run build:desktop

# フロントエンドのみプレビュー
npm run dev
```

## 📄 ライセンス

[MIT License](LICENSE)
