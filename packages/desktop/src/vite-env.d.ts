/// <reference types="vite/client" />
/// <reference types="vite-plugin-electron/electron-env" />

interface Window {
  electronAPI: {
    ping: () => Promise<string>;
    openWidget: () => void;
    closeWidget: () => void;
    syncTimer: (data: any) => void;
    onTimerSync: (callback: (event: any, data: any) => void) => () => void;
    sendWidgetCommand: (command: string) => void;
    onWidgetCommand: (callback: (event: any, command: string) => void) => () => void;
  }
}

declare module '*.png' {
    const value: string;
    export default value;
}

declare module '*.jpg' {
    const value: string;
    export default value;
}

declare module '*.svg' {
    const value: string;
    export default value;
}
