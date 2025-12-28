import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
    updateActivity: (activity: any) => ipcRenderer.invoke('update-activity', activity),
    setProgressBar: (progress: number) => ipcRenderer.invoke('set-progressbar', progress),
    setAlwaysOnTop: (flag: boolean) => ipcRenderer.invoke('set-always-on-top', flag),
});
