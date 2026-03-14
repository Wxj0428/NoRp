/**
 * Storage Service
 *
 * Handles saving and loading projects from the file system.
 * Uses Electron's file system APIs through the context bridge.
 */

import type { Project } from '@/types';

declare global {
  interface Window {
    electronAPI: {
      fs: {
        readFile: (path: string) => Promise<{ success: boolean; content?: string; error?: string }>;
        writeFile: (
          path: string,
          content: string
        ) => Promise<{ success: boolean; error?: string }>;
        readDir: (path: string) => Promise<{ success: boolean; files?: string[]; error?: string }>;
        ensureDir: (path: string) => Promise<{ success: boolean; error?: string }>;
      };
      dialog: {
        showOpenDialog: (options: any) => Promise<any>;
        showSaveDialog: (options: any) => Promise<any>;
      };
    };
  }
}

export class StorageService {
  /**
   * Save a project to a file
   */
  async saveProject(filePath: string, project: Project): Promise<boolean> {
    try {
      const content = JSON.stringify(project, null, 2);
      const result = await window.electronAPI.fs.writeFile(filePath, content);
      return result.success;
    } catch (error) {
      console.error('Failed to save project:', error);
      return false;
    }
  }

  /**
   * Load a project from a file
   */
  async loadProject(filePath: string): Promise<Project | null> {
    try {
      const result = await window.electronAPI.fs.readFile(filePath);
      if (result.success && result.content) {
        const project = JSON.parse(result.content) as Project;
        // Convert date strings back to Date objects
        project.createdAt = new Date(project.createdAt);
        project.modifiedAt = new Date(project.modifiedAt);
        return project;
      }
      return null;
    } catch (error) {
      console.error('Failed to load project:', error);
      return null;
    }
  }

  /**
   * Create a new project directory
   */
  async createProjectDirectory(dirPath: string): Promise<boolean> {
    try {
      const result = await window.electronAPI.fs.ensureDir(dirPath);
      return result.success;
    } catch (error) {
      console.error('Failed to create directory:', error);
      return false;
    }
  }

  /**
   * List files in a directory
   */
  async listFiles(dirPath: string): Promise<string[]> {
    try {
      const result = await window.electronAPI.fs.readDir(dirPath);
      return result.files || [];
    } catch (error) {
      console.error('Failed to list files:', error);
      return [];
    }
  }

  /**
   * Read a text file
   */
  async readFile(filePath: string): Promise<string | null> {
    try {
      const result = await window.electronAPI.fs.readFile(filePath);
      if (result.success && result.content) {
        return result.content;
      }
      return null;
    } catch (error) {
      console.error('Failed to read file:', error);
      return null;
    }
  }

  /**
   * Write a text file
   */
  async writeFile(filePath: string, content: string): Promise<boolean> {
    try {
      const result = await window.electronAPI.fs.writeFile(filePath, content);
      return result.success;
    } catch (error) {
      console.error('Failed to write file:', error);
      return false;
    }
  }

  /**
   * Show open file dialog
   */
  async showOpenDialog(options?: any): Promise<{ canceled: boolean; filePaths: string[] }> {
    const defaultOptions = {
      filters: [{ name: 'NoRp Project', extensions: ['norp'] }],
      properties: ['openFile']
    };

    return await window.electronAPI.dialog.showOpenDialog({ ...defaultOptions, ...options });
  }

  /**
   * Show save file dialog
   */
  async showSaveDialog(options?: any): Promise<{ canceled: boolean; filePath?: string }> {
    const defaultOptions = {
      filters: [{ name: 'NoRp Project', extensions: ['norp'] }]
    };

    return await window.electronAPI.dialog.showSaveDialog({ ...defaultOptions, ...options });
  }

  /**
   * Generate default project name
   */
  generateDefaultProjectName(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `Untitled_${year}${month}${day}_${hours}${minutes}`;
  }
}

// Export singleton instance
export const storageService = new StorageService();
