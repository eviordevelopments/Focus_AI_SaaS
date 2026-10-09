"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("electronAPI", {
  // expose methods here
  ping: () => electron.ipcRenderer.invoke("ping"),
  openWidget: () => electron.ipcRenderer.send("open-widget"),
  closeWidget: () => electron.ipcRenderer.send("close-widget"),
  syncTimer: (data) => electron.ipcRenderer.send("sync-timer", data),
  onTimerSync: (callback) => {
    electron.ipcRenderer.on("timer-sync", callback);
    return () => {
      electron.ipcRenderer.removeListener("timer-sync", callback);
    };
  },
  sendWidgetCommand: (command) => electron.ipcRenderer.send("widget-command", command),
  onWidgetCommand: (callback) => {
    electron.ipcRenderer.on("widget-command", callback);
    return () => {
      electron.ipcRenderer.removeListener("widget-command", callback);
    };
  }
});
