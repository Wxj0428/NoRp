import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  // File System APIs
  fs: {
    readFile: (filePath: string) => ipcRenderer.invoke('fs:readFile', filePath),
    writeFile: (filePath: string, content: string) =>
      ipcRenderer.invoke('fs:writeFile', filePath, content),
    readDir: (dirPath: string) => ipcRenderer.invoke('fs:readDir', dirPath),
    ensureDir: (dirPath: string) => ipcRenderer.invoke('fs:ensureDir', dirPath)
  },

  // Dialog APIs
  dialog: {
    showOpenDialog: (options: any) => ipcRenderer.invoke('dialog:showOpenDialog', options),
    showSaveDialog: (options: any) => ipcRenderer.invoke('dialog:showSaveDialog', options)
  },

  // Menu event listeners
  onMenuEvent: (callback: (event: string, ...args: any[]) => void) => {
    const events = [
      'menu:new-project',
      'menu:open-project',
      'menu:save',
      'menu:save-as',
      'menu:export',
      'menu:ai-settings'
    ];

    events.forEach((event) => {
      ipcRenderer.on(event, (_event, ...args) => callback(event, ...args));
    });
  }
});

export type ElectronAPI = typeof window.electronAPI;
