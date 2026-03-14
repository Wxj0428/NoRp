/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

interface Window {
  electronAPI: {
    fs: {
      readFile: (path: string) => Promise<{
        success: boolean;
        content?: string;
        error?: string;
      }>;
      writeFile: (path: string, content: string) => Promise<{
        success: boolean;
        error?: string;
      }>;
      readDir: (path: string) => Promise<{
        success: boolean;
        files?: string[];
        error?: string;
      }>;
      ensureDir: (path: string) => Promise<{
        success: boolean;
        error?: string;
      }>;
    };
    dialog: {
      showOpenDialog: (options?: any) => Promise<any>;
      showSaveDialog: (options?: any) => Promise<any>;
    };
    onMenuEvent: (callback: (event: string, ...args: any[]) => void) => void;
  };
}
