import { app, BrowserWindow } from 'electron';
import * as path from 'path';
import { spawn, ChildProcess } from 'child_process';


let serverProcess: ChildProcess | null = null;

function startBackend() {
    const isDev = !app.isPackaged;

    if (isDev) {
        console.log('Starting backend in development mode...');
        // In dev, we can run the root script which handles ts-node-dev
        serverProcess = spawn('npm', ['run', 'dev:server'], {
            cwd: path.join(process.cwd(), '../..'), // Go to root from packages/desktop
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
    const win = new BrowserWindow({
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

    // Open devtools by default to catch errors
    win.webContents.openDevTools();

    // Basic environment handling for Vite + Electron
    if (process.env.VITE_DEV_SERVER_URL) {
        win.loadURL(process.env.VITE_DEV_SERVER_URL)
    } else {
        // Fallback or Production
        const distIndex = path.join(__dirname, '../dist/index.html');
        console.log('VITE_DEV_SERVER_URL not set. Attempting fallback to http://localhost:5173');
        win.loadURL('http://localhost:5173').catch(() => {
            console.log('Localhost failed, loading file:', distIndex);
            win.loadFile(distIndex);
        });
    }
}

app.whenReady().then(() => {
    startBackend();
    createWindow()

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow()
        }
    })
})

app.on('window-all-closed', () => {
    if (serverProcess) {
        serverProcess.kill();
    }
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

