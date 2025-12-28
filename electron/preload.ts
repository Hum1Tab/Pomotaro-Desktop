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
});

