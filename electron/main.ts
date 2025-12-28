import { app, BrowserWindow, ipcMain, Tray, Menu } from 'electron';
import path from 'path';
import DiscordRPC from 'discord-rpc';
import { autoUpdater } from 'electron-updater';

const clientId = '1454874975994515723'; // User's Discord Application ID

let mainWindow: BrowserWindow | null;
let tray: Tray | null = null;
let rpc: DiscordRPC.Client | null;

// Ensure proper App ID for notifications on Windows
app.setAppUserModelId('com.pomotaro.app');

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, 'preload.cjs'),
            nodeIntegration: false,
            contextIsolation: true,
        },
        icon: path.join(__dirname, '../icon.png'),
        autoHideMenuBar: true, // Hide the default menu bar
    });

    // Check for updates
    autoUpdater.checkForUpdatesAndNotify();

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
            return false;
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

    rpc.login({ clientId }).catch(console.error);
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
ipcMain.handle('set-progressbar', (_, progress) => {
    if (mainWindow) {
        mainWindow.setProgressBar(progress);
    }
});

// 3. Set Always on Top
ipcMain.handle('set-always-on-top', (_, flag) => {
    if (mainWindow) {
        mainWindow.setAlwaysOnTop(flag);
    }
});
