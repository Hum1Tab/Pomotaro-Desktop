import { invoke } from '@tauri-apps/api/core';
import { listen, type UnlistenFn } from '@tauri-apps/api/event';
import type { DesktopAPI, DiscordActivity, BridgeInfo, BridgeRequest } from '@shared/desktop-api';

export const isDesktop = typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;

function invokeCommand<T>(command: string, args?: Record<string, unknown>): Promise<T> {
  if (!isDesktop) {
    return Promise.reject(new Error('Desktop commands are only available in the Pomotaro app'));
  }
  return invoke<T>(command, args);
}

function subscribe<T>(eventName: string, callback: (payload: T) => void): () => void {
  if (!isDesktop) {
    return () => undefined;
  }

  let unlisten: UnlistenFn | null = null;
  let disposed = false;

  void listen<T>(eventName, (event) => callback(event.payload))
    .then((remove) => {
      if (disposed) {
        remove();
      } else {
        unlisten = remove;
      }
    })
    .catch((error) => {
      console.error(`Failed to listen for "${eventName}"`, error);
    });

  return () => {
    disposed = true;
    unlisten?.();
    unlisten = null;
  };
}

function timestamp(value: Date | number | undefined): number | undefined {
  if (value instanceof Date) return value.getTime();
  return value;
}

function serializeActivity(activity: DiscordActivity): DiscordActivity {
  return {
    ...activity,
    startTimestamp: timestamp(activity.startTimestamp),
    endTimestamp: timestamp(activity.endTimestamp),
  };
}

export const desktopAPI: DesktopAPI = {
  updateActivity: (activity) =>
    invokeCommand<void>('update_activity', { activity: serializeActivity(activity) }),
  clearActivity: () => invokeCommand<void>('clear_activity'),
  setProgressBar: (progress) => invokeCommand<void>('set_progress_bar', { progress }),
  setAlwaysOnTop: (flag) => invokeCommand<void>('set_always_on_top', { flag }),
  setWindowSize: (width, height) =>
    invokeCommand<void>('set_window_size', { width, height }),
  toggleFullscreen: (flag) => invokeCommand<void>('toggle_fullscreen', { flag }),
  unmaximizeWindow: () => invokeCommand<void>('unmaximize_window'),
  isMaximized: () => invokeCommand<boolean>('is_maximized'),
  setWindowTitle: (title) => invokeCommand<void>('set_window_title', { title }),
  onWindowStateChanged: (callback) => subscribe('window-state-changed', callback),
  onUpdateStatus: (callback) => subscribe('update-status', callback),
  onUpdateError: (callback) => subscribe('update-error', callback),
  onUpdateDownloaded: (callback) => subscribe('update-downloaded', callback),
  restartApp: () => invokeCommand<void>('restart_app'),
  openExternal: (url) => invokeCommand<void>('open_external', { url }),
  setAutoLaunch: (enabled) => invokeCommand<void>('set_auto_launch', { enabled }),
  getAutoLaunch: () => invokeCommand<boolean>('get_auto_launch'),
  setPowerSaveBlocker: (enabled) =>
    invokeCommand<void>('set_power_save_blocker', { enabled }),
  checkForUpdates: () => invokeCommand<string | null>('check_for_updates'),
  saveSessionBackup: (sessionsJson) =>
    invokeCommand('save_session_backup', { sessionsJson }),
  loadSessionBackup: () => invokeCommand('load_session_backup'),
  getBackupPath: () => invokeCommand<string>('get_backup_path'),
  sendNotification: (title, body) =>
    invokeCommand<void>('send_notification', { title, body }),
  setBridgeEnabled: (enabled) =>
    invokeCommand<BridgeInfo | null>('set_bridge_enabled', { enabled }),
  getBridgeInfo: () => invokeCommand<BridgeInfo | null>('get_bridge_info'),
  respondToBridge: (id, response) =>
    invokeCommand<void>('bridge_respond', { id, response }),
  onBridgeRequest: (callback) => subscribe<BridgeRequest>('bridge-request', callback),
};

if (isDesktop) {
  window.desktopAPI = desktopAPI;
}

export default desktopAPI;
