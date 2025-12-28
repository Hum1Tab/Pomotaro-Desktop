import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
    updateActivity: (activity: any) => ipcRenderer.invoke('update-activity', activity),
});
