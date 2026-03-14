import { app, BrowserWindow, ipcMain, dialog, Menu } from 'electron';
import * as path from 'path';
import * as fs from 'fs/promises';

let mainWindow: BrowserWindow | null = null;

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: true
    },
    icon: path.join(__dirname, '../build/icon.png'),
    show: false
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    // 开发模式下不自动打开开发者工具，需要时按 F12 打开
    // mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function createMenu() {
  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: '文件',
      submenu: [
        {
          label: '新建项目',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            mainWindow?.webContents.send('menu:new-project');
          }
        },
        {
          label: '打开项目',
          accelerator: 'CmdOrCtrl+O',
          click: async () => {
            const result = await dialog.showOpenDialog(mainWindow!, {
              filters: [{ name: 'NoRp 项目', extensions: ['norp'] }],
              properties: ['openFile']
            });
            if (!result.canceled && result.filePaths.length > 0) {
              mainWindow?.webContents.send('menu:open-project', result.filePaths[0]);
            }
          }
        },
        { type: 'separator' },
        {
          label: '保存',
          accelerator: 'CmdOrCtrl+S',
          click: () => {
            mainWindow?.webContents.send('menu:save');
          }
        },
        {
          label: '另存为',
          accelerator: 'CmdOrCtrl+Shift+S',
          click: async () => {
            const result = await dialog.showSaveDialog(mainWindow!, {
              filters: [{ name: 'NoRp 项目', extensions: ['norp'] }]
            });
            if (!result.canceled && result.filePath) {
              mainWindow?.webContents.send('menu:save-as', result.filePath);
            }
          }
        },
        { type: 'separator' },
        {
          label: '项目设置',
          click: () => {
            mainWindow?.webContents.send('menu:project-settings');
          }
        },
        { type: 'separator' },
        {
          label: '导出 HTML',
          accelerator: 'CmdOrCtrl+E',
          click: async () => {
            const result = await dialog.showSaveDialog(mainWindow!, {
              filters: [{ name: 'HTML 文件', extensions: ['html'] }]
            });
            if (!result.canceled && result.filePath) {
              mainWindow?.webContents.send('menu:export', result.filePath);
            }
          }
        },
        { type: 'separator' },
        { role: 'quit', label: '退出' }
      ]
    },
    {
      label: '编辑',
      submenu: [
        { role: 'undo', accelerator: 'CmdOrCtrl+Z', label: '撤销' },
        { role: 'redo', accelerator: 'CmdOrCtrl+Shift+Z', label: '重做' },
        { type: 'separator' },
        { role: 'cut', accelerator: 'CmdOrCtrl+X', label: '剪切' },
        { role: 'copy', accelerator: 'CmdOrCtrl+C', label: '复制' },
        { role: 'paste', accelerator: 'CmdOrCtrl+V', label: '粘贴' },
        { role: 'delete', accelerator: 'Delete', label: '删除' },
        { type: 'separator' },
        {
          label: '全选',
          accelerator: 'CmdOrCtrl+A',
          click: () => {
            mainWindow?.webContents.send('menu:select-all');
          }
        }
      ]
    },
    {
      label: '视图',
      submenu: [
        { role: 'reload', label: '重新加载' },
        { role: 'forceReload', label: '强制重新加载' },
        { type: 'separator' },
        {
          label: '放大',
          accelerator: 'CmdOrCtrl+Plus',
          click: () => {
            mainWindow?.webContents.send('menu:zoom-in');
          }
        },
        {
          label: '缩小',
          accelerator: 'CmdOrCtrl+-',
          click: () => {
            mainWindow?.webContents.send('menu:zoom-out');
          }
        },
        {
          label: '重置缩放',
          accelerator: 'CmdOrCtrl+0',
          click: () => {
            mainWindow?.webContents.send('menu:reset-zoom');
          }
        },
        { type: 'separator' },
        { role: 'toggleDevTools', label: '切换开发者工具' },
        { role: 'togglefullscreen', label: '切换全屏' }
      ]
    },
    {
      label: '设置',
      submenu: [
        {
          label: '应用设置',
          accelerator: 'CmdOrCtrl+,',
          click: () => {
            mainWindow?.webContents.send('menu:app-settings');
          }
        },
        {
          label: 'AI 配置',
          click: () => {
            mainWindow?.webContents.send('menu:ai-settings');
          }
        }
      ]
    },
    {
      label: '帮助',
      submenu: [
        {
          label: '快捷键',
          click: () => {
            mainWindow?.webContents.send('menu:shortcuts');
          }
        },
        {
          label: '关于',
          click: () => {
            mainWindow?.webContents.send('menu:about');
          }
        },
        { type: 'separator' },
        {
          label: 'GitHub',
          click: () => {
            require('electron').shell.openExternal('https://github.com/norp/ui-designer');
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// IPC Handlers
ipcMain.handle('fs:readFile', async (_event, filePath: string) => {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return { success: true, content };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
});

ipcMain.handle('fs:writeFile', async (_event, filePath: string, content: string) => {
  try {
    await fs.writeFile(filePath, content, 'utf-8');
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
});

ipcMain.handle('fs:readDir', async (_event, dirPath: string) => {
  try {
    const files = await fs.readdir(dirPath);
    return { success: true, files };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
});

ipcMain.handle('fs:ensureDir', async (_event, dirPath: string) => {
  try {
    await fs.mkdir(dirPath, { recursive: true });
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
});

ipcMain.handle('dialog:showOpenDialog', async (_event, options) => {
  const result = await dialog.showOpenDialog(mainWindow!, options);
  return result;
});

ipcMain.handle('dialog:showSaveDialog', async (_event, options) => {
  const result = await dialog.showSaveDialog(mainWindow!, options);
  return result;
});

app.whenReady().then(() => {
  createWindow();
  createMenu();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
