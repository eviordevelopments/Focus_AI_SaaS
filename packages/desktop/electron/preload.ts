import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
    // expose methods here
    ping: () => ipcRenderer.invoke('ping')
})
