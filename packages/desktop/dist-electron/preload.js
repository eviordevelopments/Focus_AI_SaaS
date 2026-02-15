"use strict";const e=require("electron");e.contextBridge.exposeInMainWorld("electronAPI",{ping:()=>e.ipcRenderer.invoke("ping")});
