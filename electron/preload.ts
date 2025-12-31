import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
    updateActivity: (activity: any) => ipcRenderer.invoke('update-activity', activity),
    setProgressBar: (progress: number) => ipcRenderer.invoke('set-progress-bar', progress),
    setAlwaysOnTop: (flag: boolean) => ipcRenderer.invoke('set-always-on-top', flag),
    setWindowSize: (width: number, height: number) => ipcRenderer.invoke('set-window-size', width, height),
    toggleFullscreen: (flag: boolean) => ipcRenderer.invoke('toggle-fullscreen', flag),
    unmaximizeWindow: () => ipcRenderer.invoke('unmaximize-window'),
    isMaximized: () => ipcRenderer.invoke('is-maximized'),
    onWindowStateChanged: (callback: (state: string) => void) => {
        ipcRenderer.on('window-state-changed', (_, state) => callback(state));
    },
    onUpdateStatus: (callback: (message: string) => void) => {
        ipcRenderer.on('update-status', (_, message) => callback(message));
    },
    onUpdateError: (callback: (message: string) => void) => {
        ipcRenderer.on('update-error', (_, message) => callback(message));
    },
    onUpdateDownloaded: (callback: () => void) => {
        ipcRenderer.on('update-downloaded', () => callback());
    },
    restartApp: () => ipcRenderer.invoke('restart-app'),
    openExternal: (url: string) => ipcRenderer.invoke('open-external', url),
    setAutoLaunch: (enabled: boolean) => ipcRenderer.invoke('set-auto-launch', enabled),
    getAutoLaunch: () => ipcRenderer.invoke('get-auto-launch'),
    setPowerSaveBlocker: (enabled: boolean) => ipcRenderer.invoke('set-power-save-blocker', enabled),
});

