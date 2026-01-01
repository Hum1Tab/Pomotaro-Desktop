
export { };

declare global {
    interface Window {
        electronAPI?: {
            setAlwaysOnTop: (flag: boolean) => Promise<void>;
            // Note: 'setProgressBar' in preload but 'set-progress-bar' in main/ipc.
            // Preload maps: setProgressBar -> invoke('set-progress-bar')
            setProgressBar: (progress: number) => Promise<void>;
            setWindowSize: (width: number, height: number) => Promise<void>;
            toggleFullscreen: (flag: boolean) => Promise<void>;
            updateActivity: (activity: any) => Promise<void>;
            clearActivity: () => Promise<void>;
            unmaximizeWindow: () => Promise<void>;
            isMaximized: () => Promise<boolean>;
            onWindowStateChanged: (callback: (state: string) => void) => void;
            onUpdateStatus: (callback: (message: string) => void) => void;
            onUpdateError: (callback: (message: string) => void) => void;
            onUpdateDownloaded: (callback: () => void) => void;
            restartApp: () => Promise<void>;
            openExternal: (url: string) => Promise<void>;
            setAutoLaunch: (enabled: boolean) => Promise<void>;
            getAutoLaunch: () => Promise<boolean>;
            setPowerSaveBlocker: (enabled: boolean) => Promise<void>;
            checkForUpdates: () => Promise<any>;
        };
    }
}
