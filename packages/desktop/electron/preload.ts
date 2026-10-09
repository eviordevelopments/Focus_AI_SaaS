import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
    // expose methods here
    ping: () => ipcRenderer.invoke('ping'),
    openWidget: () => ipcRenderer.send('open-widget'),
    closeWidget: () => ipcRenderer.send('close-widget'),
    syncTimer: (data: any) => ipcRenderer.send('sync-timer', data),
    onTimerSync: (callback: (event: any, data: any) => void) => {
        ipcRenderer.on('timer-sync', callback);
        return () => {
            ipcRenderer.removeListener('timer-sync', callback);
        };
    },
    sendWidgetCommand: (command: string) => ipcRenderer.send('widget-command', command),
    onWidgetCommand: (callback: (event: any, command: string) => void) => {
        ipcRenderer.on('widget-command', callback);
        return () => {
            ipcRenderer.removeListener('widget-command', callback);
        };
    }
})
