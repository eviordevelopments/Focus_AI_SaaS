import { app, BrowserWindow } from 'electron';
import * as path from 'path';


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
        // If we are in dev (inferred by absence of dist file or explicit check), try localhost:5173
        // We can try to load the local URL if the file doesn't exist
        const distIndex = path.join(__dirname, '../dist/index.html');

        // Simple heuristic: If we can't find the dist file, or if we just want to force dev:
        // win.loadURL('http://localhost:5173'); 

        // Better: Try to load from localhost:5173 first if we suspect dev mode.
        // Since the user is running dev:desktop, we expect the server on 5173.
        console.log('VITE_DEV_SERVER_URL not set. Attempting fallback to http://localhost:5173');
        win.loadURL('http://localhost:5173').catch(() => {
            console.log('Localhost failed, loading file:', distIndex);
            win.loadFile(distIndex);
        });
    }
}

app.whenReady().then(() => {
    createWindow()

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow()
        }
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})
