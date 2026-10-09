import { app, BrowserWindow, ipcMain, session, systemPreferences } from 'electron';
import * as path from 'path';
import { spawn, ChildProcess } from 'child_process';


let serverProcess: ChildProcess | null = null;
let widgetWindow: BrowserWindow | null = null;
let mainWindow: BrowserWindow | null = null;

function startBackend() {
    const isDev = !app.isPackaged;

    if (isDev) {
        console.log('Starting backend in development mode...');
        // Correct path to root from packages/desktop/dist-electron/main.js
        const rootPath = path.join(__dirname, '..', '..', '..');
        console.log('Project root detected at:', rootPath);

        serverProcess = spawn('npm', ['run', 'dev:server'], {
            cwd: rootPath,
            shell: true,
            stdio: 'inherit'
        });
    } else {

        const serverPath = path.join(process.resourcesPath, 'server/dist/src/index.js');
        console.log('Starting backend in production mode at:', serverPath);
        serverProcess = spawn('node', [serverPath], {
            env: { ...process.env, PORT: '4000', NODE_ENV: 'production' },
            stdio: 'inherit'
        });
    }

    if (serverProcess) {
        serverProcess.on('error', (err) => {
            console.error('Failed to start backend server:', err);
        });
    }
}


function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
        },
        titleBarStyle: 'default', // Using default to rule out UI issues
        // vibrancy: 'under-window', 
        // visualEffectState: 'active',
        backgroundColor: '#050505',
        trafficLightPosition: { x: 15, y: 15 }
    })

    console.log('Electron Window Created. Target URL:', process.env.VITE_DEV_SERVER_URL);

    // Removed devtools default open to avoid screen takeover

    // Basic environment handling for Vite + Electron
    if (process.env.VITE_DEV_SERVER_URL) {
        mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL)
    } else {
        // Fallback or Production
        const distIndex = path.join(__dirname, '../dist/index.html');
        console.log('VITE_DEV_SERVER_URL not set. Attempting fallback to http://localhost:5173');
        mainWindow.loadURL('http://localhost:5173').catch(() => {
            console.log('Localhost failed, loading file:', distIndex);
            mainWindow?.loadFile(distIndex);
        });
    }
}

function createWidgetWindow() {
    if (widgetWindow) return;

    widgetWindow = new BrowserWindow({
        width: 300,
        height: 120,
        x: 40,
        y: 40,
        frame: false,
        transparent: true,
        alwaysOnTop: true,
        hasShadow: false,
        resizable: false,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
        },
    });

    widgetWindow.setAlwaysOnTop(true, 'floating');
    widgetWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
    
    // widgetWindow.webContents.openDevTools({ mode: 'detach' });

    if (process.env.VITE_DEV_SERVER_URL) {
        widgetWindow.loadURL(`${process.env.VITE_DEV_SERVER_URL}#/widget`);
    } else {
        widgetWindow.loadURL('http://localhost:5173/#/widget');
    }

    widgetWindow.on('closed', () => {
        widgetWindow = null;
    });
}

app.whenReady().then(() => {

    session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
        if (permission === 'media') {
            callback(true);
        } else {
            callback(true); // Allow all in dev for simplicity
        }
    });

    session.defaultSession.setPermissionCheckHandler((webContents, permission) => {
        if (permission === 'media') return true;
        return true;
    });

    startBackend();
    createWindow()

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow()
        }
    })

    ipcMain.on('open-widget', () => {
        createWidgetWindow();
    });

    ipcMain.on('close-widget', () => {
        if (widgetWindow) {
            widgetWindow.close();
            widgetWindow = null;
        }
    });

    ipcMain.on('sync-timer', (event, data) => {
        if (widgetWindow && !widgetWindow.isDestroyed()) {
            widgetWindow.webContents.send('timer-sync', data);
        }
    });

    ipcMain.on('widget-command', (event, command) => {
        if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.webContents.send('widget-command', command);
        }
    });
})

app.on('window-all-closed', () => {
    if (serverProcess) {
        serverProcess.kill();
    }
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

