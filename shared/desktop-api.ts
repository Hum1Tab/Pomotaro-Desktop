export type WindowStateChange = 'maximized' | 'unmaximized';

export interface UpdateMessage {
  key: string;
  message?: string;
}

export interface SessionBackupResult {
  success: boolean;
  path?: string;
  data?: string;
  error?: string;
}

export interface DiscordActivity {
  details?: string;
  state?: string;
  startTimestamp?: Date | number;
  endTimestamp?: Date | number;
  largeImageKey?: string;
  largeImageText?: string;
  smallImageKey?: string;
  smallImageText?: string;
  // Renderer-only metadata; it is deliberately omitted before calling Discord.
  sessionType?: string;
  sessionsCompleted?: number;
}

/**
 * Contract for the native bridge exposed by the Tauri backend.
 * Every method maps to a Rust `#[tauri::command]` or a Tauri event.
 */
export interface DesktopAPI {
  updateActivity(activity: DiscordActivity): Promise<void>;
  clearActivity(): Promise<void>;
  setProgressBar(progress: number): Promise<void>;
  setAlwaysOnTop(flag: boolean): Promise<void>;
  setWindowSize(width: number, height: number): Promise<void>;
  toggleFullscreen(flag: boolean): Promise<void>;
  unmaximizeWindow(): Promise<void>;
  isMaximized(): Promise<boolean>;
  setWindowTitle(title: string): Promise<void>;
  onWindowStateChanged(callback: (state: WindowStateChange) => void): () => void;
  onUpdateStatus(callback: (message: UpdateMessage) => void): () => void;
  onUpdateError(callback: (message: UpdateMessage) => void): () => void;
  onUpdateDownloaded(callback: () => void): () => void;
  restartApp(): Promise<void>;
  openExternal(url: string): Promise<void>;
  setAutoLaunch(enabled: boolean): Promise<void>;
  getAutoLaunch(): Promise<boolean>;
  setPowerSaveBlocker(enabled: boolean): Promise<void>;
  /** Returns the new version when one was downloaded, or null when up to date. */
  checkForUpdates(): Promise<string | null>;
  saveSessionBackup(sessionsJson: string): Promise<SessionBackupResult>;
  loadSessionBackup(): Promise<SessionBackupResult>;
  getBackupPath(): Promise<string>;
  sendNotification(title: string, body: string): Promise<void>;
}
