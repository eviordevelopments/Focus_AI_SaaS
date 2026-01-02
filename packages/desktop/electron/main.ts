import { app, BrowserWindow } from 'electron';
import * as path from 'path';


function createWindow() {
    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
        },
        titleBarStyle: 'hiddenInset', // Mac style
        vibrancy: 'under-window', // Mac glass effect
        visualEffectState: 'active',
        backgroundColor: '#00000000', // Transparent bg for glass effect
        trafficLightPosition: { x: 15, y: 15 }
    })

    // Basic environment handling for Vite + Electron
    if (process.env.VITE_DEV_SERVER_URL) {
        win.loadURL(process.env.VITE_DEV_SERVER_URL)
    } else {
        // Load your file
        win.loadFile(path.join(__dirname, '../dist/index.html'))
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
