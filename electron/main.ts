import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import DiscordRPC from 'discord-rpc';

// 開発中のアプリID（必要に応じて変更してください）
const clientId = '1322588373846659132'; // Test ID or Placeholder

let mainWindow: BrowserWindow | null;
let rpc: DiscordRPC.Client | null;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
        },
    });

    // VITE_DEV_SERVER_URL is provided by vite-plugin-electron in development
    if (process.env.VITE_DEV_SERVER_URL) {
        mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
    } else {
        // In production, load the index.html from the dist folder
        // Adjust path as necessary based on where vite builds to
        mainWindow.loadFile(path.join(__dirname, '../dist/public/index.html'));
    }
}

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
        largeImageKey: 'pomotaro_logo', // Ensure you have this asset uploaded to Discord Dev Portal or remove
        largeImageText: 'Pomotaro',
        instance: false,
    });
}

// IPC handler to update activity from renderer
ipcMain.handle('update-activity', (_, activity) => {
    if (rpc) {
        rpc.setActivity({
            ...activity,
            instance: false,
        });
    }
});
