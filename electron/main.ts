import { app, BrowserWindow, ipcMain, Tray, Menu, shell, powerSaveBlocker } from 'electron';
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




    // Check for updates only in production
    if (app.isPackaged) {


        autoUpdater.on('update-available', () => {
            if (mainWindow?.isDestroyed()) return;
            // 翻訳キーを送信（レンダラー側で翻訳）
            mainWindow?.webContents.send('update-status', { key: 'update.available' });
        });

        // Modification: Do not quit automatically. Notify renderer to show button.
        autoUpdater.on('update-downloaded', () => {
            if (mainWindow?.isDestroyed()) return;
            mainWindow?.webContents.send('update-status', { key: 'update.downloaded' });
            mainWindow?.webContents.send('update-downloaded');
        });

        autoUpdater.on('error', (err) => {
            console.error('Auto update error:', err);
            if (mainWindow?.isDestroyed()) return;
            mainWindow?.webContents.send('update-error', { key: 'update.error', message: err.message });
        });

    }

    ipcMain.handle('check-for-updates', () => {
        if (app.isPackaged) {
            return autoUpdater.checkForUpdatesAndNotify();
        } else {
            return Promise.resolve();
        }
    });

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
let powerSaveBlockerId: number | null = null;

app.on('before-quit', () => {
    isQuitting = true;
    saveWindowState();
});

app.on('quit', () => {
    // #7: powerSaveBlockerのメモリリーク対策
    if (powerSaveBlockerId !== null) {
        powerSaveBlocker.stop(powerSaveBlockerId);
        powerSaveBlockerId = null;
    }
});

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
    app.quit();
} else {
    app.on('second-instance', (event, commandLine, workingDirectory) => {
        // Someone tried to run a second instance, we should focus our window.
        if (mainWindow) {
            if (mainWindow.isMinimized()) mainWindow.restore();
            if (!mainWindow.isVisible()) mainWindow.show();
            mainWindow.focus();
        }
    });

    app.whenReady().then(() => {
        createWindow();
        initDiscordRpc();
    });
}

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

// #6: Discord RPC Initialization with reconnect logic
const RPC_RECONNECT_INTERVAL = 30000; // 30秒ごとに再接続を試みる
let rpcReconnectTimer: NodeJS.Timeout | null = null;

function initDiscordRpc() {
    // 既存のタイマーをクリア
    if (rpcReconnectTimer) {
        clearInterval(rpcReconnectTimer);
        rpcReconnectTimer = null;
    }

    rpc = new DiscordRPC.Client({ transport: 'ipc' });

    rpc.on('ready', () => {
        console.log('Discord RPC connected');
        setActivity();
        // 接続成功時は再接続タイマーをクリア
        if (rpcReconnectTimer) {
            clearInterval(rpcReconnectTimer);
            rpcReconnectTimer = null;
        }
    });

    // Handle potential connection errors gracefully
    rpc.login({ clientId }).catch(err => {
        console.log('Discord RPC connection failed (Discord might be closed):', err.message);
        rpc = null;
        // #6: 再接続タイマーを開始
        scheduleRpcReconnect();
    });
}

// #6: Discord RPCの再接続をスケジュール
function scheduleRpcReconnect() {
    if (rpcReconnectTimer) return; // 既にスケジュールされている場合はスキップ

    rpcReconnectTimer = setInterval(() => {
        if (!rpc) {
            console.log('Attempting Discord RPC reconnection...');
            initDiscordRpc();
        }
    }, RPC_RECONNECT_INTERVAL);
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
ipcMain.handle('open-external', (_, url) => {
    if (url.startsWith('http://') || url.startsWith('https://')) {
        return shell.openExternal(url);
    }
    console.warn('Blocked opening non-http url:', url);
    return Promise.resolve();
});

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

// 1.5 Clear Discord Activity
ipcMain.handle('clear-activity', () => {
    if (rpc) {
        rpc.clearActivity();
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

// 5. Auto Launch Handler
ipcMain.handle('set-auto-launch', (_, enabled) => {
    app.setLoginItemSettings({
        openAtLogin: enabled,
    });
});

ipcMain.handle('get-auto-launch', () => {
    return app.getLoginItemSettings().openAtLogin;
});


// 6. Power Save Blocker Handler

ipcMain.handle('set-power-save-blocker', (_, enabled) => {
    if (enabled) {
        if (powerSaveBlockerId === null) {
            powerSaveBlockerId = powerSaveBlocker.start('prevent-display-sleep');
        }
    } else {
        if (powerSaveBlockerId !== null) {
            powerSaveBlocker.stop(powerSaveBlockerId);
            powerSaveBlockerId = null;
        }
    }
});

// 7. 記録ツール: セッションバックアップをファイルに保存
const backupDir = path.join(app.getPath('userData'), 'session-backups');

// バックアップディレクトリを作成
if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
}

ipcMain.handle('save-session-backup', (_, sessionsJson: string) => {
    try {
        // 常に同じファイル名で上書き（最新のバックアップのみ保持）
        const backupPath = path.join(backupDir, 'pomotaro-sessions-backup.json');
        fs.writeFileSync(backupPath, sessionsJson, 'utf8');
        console.log('Session backup saved:', backupPath);
        return { success: true, path: backupPath };
    } catch (e) {
        console.error('Failed to save session backup:', e);
        return { success: false, error: (e as Error).message };
    }
});

ipcMain.handle('load-session-backup', () => {
    try {
        const backupPath = path.join(backupDir, 'pomotaro-sessions-backup.json');
        if (fs.existsSync(backupPath)) {
            const data = fs.readFileSync(backupPath, 'utf8');
            return { success: true, data };
        }
        return { success: false, error: 'Backup file not found' };
    } catch (e) {
        console.error('Failed to load session backup:', e);
        return { success: false, error: (e as Error).message };
    }
});

ipcMain.handle('get-backup-path', () => {
    return path.join(backupDir, 'pomotaro-sessions-backup.json');
});
