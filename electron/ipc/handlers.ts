// IPC handlers are registered in electron/main.ts
// This file documents available IPC channels for reference

/**
 * Available IPC Channels:
 *
 * fs:readFile - Read file content
 *   @param filePath: string
 *   @returns { success: boolean, content?: string, error?: string }
 *
 * fs:writeFile - Write content to file
 *   @param filePath: string, content: string
 *   @returns { success: boolean, error?: string }
 *
 * fs:readDir - Read directory contents
 *   @param dirPath: string
 *   @returns { success: boolean, files?: string[], error?: string }
 *
 * fs:ensureDir - Create directory if not exists
 *   @param dirPath: string
 *   @returns { success: boolean, error?: string }
 *
 * dialog:showOpenDialog - Show open file dialog
 *   @param options: OpenDialogOptions
 *   @returns { canceled: boolean, filePaths: string[] }
 *
 * dialog:showSaveDialog - Show save file dialog
 *   @param options: SaveDialogOptions
 *   @returns { canceled: boolean, filePath?: string }
 *
 * Menu Events (renderer -> main):
 *   menu:new-project
 *   menu:open-project - sends filePath
 *   menu:save
 *   menu:save-as - sends filePath
 *   menu:export - sends filePath
 *   menu:ai-settings
 */
