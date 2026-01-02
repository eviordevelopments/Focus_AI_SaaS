"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("electronAPI", {
  // expose methods here
  ping: () => electron.ipcRenderer.invoke("ping")
});
