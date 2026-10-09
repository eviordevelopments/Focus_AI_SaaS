"use strict";
const electron = require("electron");
const path = require("path");
const child_process = require("child_process");
function _interopNamespaceDefault(e) {
  const n = Object.create(null, { [Symbol.toStringTag]: { value: "Module" } });
  if (e) {
    for (const k in e) {
      if (k !== "default") {
        const d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: () => e[k]
        });
      }
    }
  }
  n.default = e;
  return Object.freeze(n);
}
const path__namespace = /* @__PURE__ */ _interopNamespaceDefault(path);
let serverProcess = null;
let widgetWindow = null;
let mainWindow = null;
function startBackend() {
  const isDev = !electron.app.isPackaged;
  if (isDev) {
    console.log("Starting backend in development mode...");
    const rootPath = path__namespace.join(__dirname, "..", "..", "..");
    console.log("Project root detected at:", rootPath);
    serverProcess = child_process.spawn("npm", ["run", "dev:server"], {
      cwd: rootPath,
      shell: true,
      stdio: "inherit"
    });
  } else {
    const serverPath = path__namespace.join(process.resourcesPath, "server/dist/src/index.js");
    console.log("Starting backend in production mode at:", serverPath);
    serverProcess = child_process.spawn("node", [serverPath], {
      env: { ...process.env, PORT: "4000", NODE_ENV: "production" },
      stdio: "inherit"
    });
  }
  if (serverProcess) {
    serverProcess.on("error", (err) => {
      console.error("Failed to start backend server:", err);
    });
  }
}
function createWindow() {
  mainWindow = new electron.BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path__namespace.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true
    },
    titleBarStyle: "default",
    // Using default to rule out UI issues
    // vibrancy: 'under-window', 
    // visualEffectState: 'active',
    backgroundColor: "#050505",
    trafficLightPosition: { x: 15, y: 15 }
  });
  console.log("Electron Window Created. Target URL:", process.env.VITE_DEV_SERVER_URL);
  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    const distIndex = path__namespace.join(__dirname, "../dist/index.html");
    console.log("VITE_DEV_SERVER_URL not set. Attempting fallback to http://localhost:5173");
    mainWindow.loadURL("http://localhost:5173").catch(() => {
      console.log("Localhost failed, loading file:", distIndex);
      mainWindow == null ? void 0 : mainWindow.loadFile(distIndex);
    });
  }
}
function createWidgetWindow() {
  if (widgetWindow) return;
  widgetWindow = new electron.BrowserWindow({
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
      preload: path__namespace.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true
    }
  });
  widgetWindow.setAlwaysOnTop(true, "floating");
  widgetWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  if (process.env.VITE_DEV_SERVER_URL) {
    widgetWindow.loadURL(`${process.env.VITE_DEV_SERVER_URL}#/widget`);
  } else {
    widgetWindow.loadURL("http://localhost:5173/#/widget");
  }
  widgetWindow.on("closed", () => {
    widgetWindow = null;
  });
}
electron.app.whenReady().then(() => {
  electron.session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
    if (permission === "media") {
      callback(true);
    } else {
      callback(true);
    }
  });
  electron.session.defaultSession.setPermissionCheckHandler((webContents, permission) => {
    if (permission === "media") return true;
    return true;
  });
  startBackend();
  createWindow();
  electron.app.on("activate", () => {
    if (electron.BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
  electron.ipcMain.on("open-widget", () => {
    createWidgetWindow();
  });
  electron.ipcMain.on("close-widget", () => {
    if (widgetWindow) {
      widgetWindow.close();
      widgetWindow = null;
    }
  });
  electron.ipcMain.on("sync-timer", (event, data) => {
    if (widgetWindow && !widgetWindow.isDestroyed()) {
      widgetWindow.webContents.send("timer-sync", data);
    }
  });
  electron.ipcMain.on("widget-command", (event, command) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send("widget-command", command);
    }
  });
});
electron.app.on("window-all-closed", () => {
  if (serverProcess) {
    serverProcess.kill();
  }
  if (process.platform !== "darwin") {
    electron.app.quit();
  }
});
