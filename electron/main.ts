import { app, BrowserWindow, ipcMain, Tray, Menu, shell } from 'electron';
import path from 'path';
import fs from 'fs';
import DiscordRPC from 'discord-rpc';
import { autoUpdater } from 'electron-updater';

const clientId = '1454874975994515723'; // User's Discord Application ID

let mainWindow: BrowserWindow | null;
let tray: Tray | null = null;
let rpc: DiscordRPC.Client | null;

// Window state management
const stateFilePath = path.join(app.getPath('userData'), 'window-state.json');

interface WindowState {
    width: number;
    height: number;
    x?: number;
    y?: number;
    isMaximized: boolean;
}

function loadWindowState(): WindowState {
    try {
        if (fs.existsSync(stateFilePath)) {
            const data = fs.readFileSync(stateFilePath, 'utf8');
            return JSON.parse(data);
        }
    } catch (e) {
        console.error('Failed to load window state:', e);
    }
    return { width: 1200, height: 800, isMaximized: false };
}

function saveWindowState() {
    if (!mainWindow) return;
    try {
        const isMaximized = mainWindow.isMaximized();
        let state: WindowState;

        if (isMaximized) {
            // When maximized, we want to keep the previous normal bounds
            // so that unmaximizing restores the correct size.
            // But for simple restoration on startup, we just need the flag.
            // We'll read the existing file to keep the non-maximized bounds if possible.
            const existing = loadWindowState();
            state = {
                ...existing,
                isMaximized: true
            };
        } else {
            const bounds = mainWindow.getBounds();
            state = {
                width: bounds.width,
                height: bounds.height,
                x: bounds.x,
                y: bounds.y,
                isMaximized: false
            };
        }
        fs.writeFileSync(stateFilePath, JSON.stringify(state));
    } catch (e) {
        console.error('Failed to save window state:', e);
    }
}

// Ensure proper App ID for notifications on Windows
app.setAppUserModelId('com.pomotaro.app');

function createWindow() {
    const windowState = loadWindowState();

    mainWindow = new BrowserWindow({
        width: windowState.width,
        height: windowState.height,
        x: windowState.x,
        y: windowState.y,
        webPreferences: {
            preload: path.join(__dirname, 'preload.cjs'),
            nodeIntegration: false,
            contextIsolation: true,
        },
        icon: path.join(__dirname, '../icon.png'),
        autoHideMenuBar: true, // Hide the default menu bar
    });

    if (windowState.isMaximized) {
        mainWindow.maximize();
    }

    // Notify renderer when window state changes
    mainWindow.on('maximize', () => {
        mainWindow?.webContents.send('window-state-changed', 'maximized');
        saveWindowState();
    });
    mainWindow.on('unmaximize', () => {
        mainWindow?.webContents.send('window-state-changed', 'unmaximized');
        saveWindowState();
    });

    // Save state on resize or move
    mainWindow.on('resize', () => {
        if (!mainWindow?.isMaximized()) {
            saveWindowState();
        }
    });

    mainWindow.on('move', () => {
        if (!mainWindow?.isMaximized()) {
            saveWindowState();
        }
    });


    // Check for updates only in production
    if (app.isPackaged) {
        autoUpdater.on('checking-for-update', () => {
            if (mainWindow?.isDestroyed()) return;
            mainWindow?.webContents.send('update-status', 'アップデートを確認中...');
        });

        autoUpdater.on('update-available', () => {
            if (mainWindow?.isDestroyed()) return;
            mainWindow?.webContents.send('update-status', '新しいバージョンが見つかりました。ダウンロードを開始します...');
        });

        // Modification: Do not quit automatically. Notify renderer to show button.
        autoUpdater.on('update-downloaded', () => {
            if (mainWindow?.isDestroyed()) return;
            mainWindow?.webContents.send('update-status', 'ダウンロード完了。準備ができたら再起動してください。');
            mainWindow?.webContents.send('update-downloaded');
        });

        autoUpdater.on('error', (err) => {
            console.error('Auto update error:', err);
            if (mainWindow?.isDestroyed()) return;
            mainWindow?.webContents.send('update-error', `アップデートエラー: ${err.message}`);
        });

        autoUpdater.checkForUpdatesAndNotify().catch(err => {
            console.error('Check for updates failed:', err);
            if (mainWindow?.isDestroyed()) return;
            mainWindow?.webContents.send('update-error', `アップデート確認失敗: ${err.message}`);
        });
    }

    // System Tray Implementation
    tray = new Tray(path.join(__dirname, '../icon.png'));
    const contextMenu = Menu.buildFromTemplate([
        { label: 'Open Pomotaro', click: () => mainWindow?.show() },
        {
            label: 'Quit', click: () => {
                app.quit(); // Explicitly quit
            }
        }
    ]);
    tray.setToolTip('Pomotaro');
    tray.setContextMenu(contextMenu);

    tray.on('click', () => {
        mainWindow?.show();
    });

    // Handle Window Close (Minimize to Tray)
    mainWindow.on('close', (event) => {
        if (!isQuitting) {
            event.preventDefault();
            mainWindow?.hide();
            saveWindowState();
            return false;
        } else {
            saveWindowState();
        }
    });

    // VITE_DEV_SERVER_URL is provided by vite-plugin-electron in development
    if (process.env.VITE_DEV_SERVER_URL) {
        mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
    } else {
        // In production, load the index.html from the dist folder
        mainWindow.loadFile(path.join(__dirname, '../dist/public/index.html'));
    }
}

// Global flag to track if we are quitting or just closing window
let isQuitting = false;

app.on('before-quit', () => {
    isQuitting = true;
    saveWindowState();
});

app.whenReady().then(() => {
    createWindow();
    initDiscordRpc();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

// Discord RPC Initialization
function initDiscordRpc() {
    rpc = new DiscordRPC.Client({ transport: 'ipc' });

    rpc.on('ready', () => {
        setActivity();
    });

    // Handle potential connection errors gracefully
    rpc.login({ clientId }).catch(err => {
        console.log('Discord RPC connection failed (Discord might be closed):', err.message);
        rpc = null;
    });
}


function setActivity() {
    if (!rpc) return;

    rpc.setActivity({
        details: 'Focusing',
        state: 'Using Pomotaro',
        startTimestamp: new Date(),
        largeImageKey: 'pomotaro_logo',
        largeImageText: 'Pomotaro',
        instance: false,
        buttons: [
            { label: 'Get App', url: 'https://github.com/Hum1Tab/Pomotaro-Desktop' }
        ]
    });
}

// IPC Handlers
ipcMain.handle('open-external', (_, url) => shell.openExternal(url));

// 1. Update Discord Activity
ipcMain.handle('update-activity', (_, activity) => {
    if (rpc) {
        rpc.setActivity({
            ...activity,
            instance: false,
            buttons: [
                { label: 'Get App', url: 'https://github.com/Hum1Tab/Pomotaro-Desktop' }
            ]
        });
    }
});

// 2. Set Taskbar Progress
ipcMain.handle('set-progress-bar', (event, progress) => {
    if (mainWindow) {
        mainWindow.setProgressBar(progress);
    }
});

// Toggle Fullscreen Handler
ipcMain.handle('toggle-fullscreen', (event, flag) => {
    if (mainWindow) {
        mainWindow.setFullScreen(flag);
    }
});

// Resize Window Handler for Compact Mode
ipcMain.handle('set-window-size', (event, width, height) => {
    if (mainWindow) {
        if (mainWindow.isMaximized()) {
            mainWindow.unmaximize();
        }
        mainWindow.setSize(width, height);
        mainWindow.center();
        saveWindowState();
    }
});


// Unmaximize Window Handler
ipcMain.handle('unmaximize-window', () => {
    if (mainWindow && mainWindow.isMaximized()) {
        mainWindow.unmaximize();
    }
});

// Check if Window is Maximized
ipcMain.handle('is-maximized', () => {
    return mainWindow ? mainWindow.isMaximized() : false;
});



// 3. Set Always on Top
ipcMain.handle('set-always-on-top', (_, flag) => {
    if (mainWindow) {
        mainWindow.setAlwaysOnTop(flag);
    }
});

// 4. Restart App
ipcMain.handle('restart-app', () => {
    autoUpdater.quitAndInstall(true, true);
});

