/**
 * Keyboard Shortcuts Manager
 *
 * Dispatches keyboard shortcuts as custom events that Canvas.vue and other components listen to.
 */

export interface ShortcutConfig {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
  handler: () => void;
  description: string;
}

export class ShortcutManager {
  private shortcuts: ShortcutConfig[] = [];

  /**
   * Register a keyboard shortcut
   */
  register(config: ShortcutConfig): void {
    this.shortcuts.push(config);
  }

  /**
   * Unregister a keyboard shortcut
   */
  unregister(key: string): void {
    this.shortcuts = this.shortcuts.filter((s) => s.key !== key);
  }

  /**
   * Handle keyboard event
   */
  handle(event: KeyboardEvent): boolean {
    for (const shortcut of this.shortcuts) {
      if (this.matches(event, shortcut)) {
        event.preventDefault();
        shortcut.handler();
        return true;
      }
    }
    return false;
  }

  private matches(event: KeyboardEvent, shortcut: ShortcutConfig): boolean {
    if (event.key.toLowerCase() !== shortcut.key.toLowerCase()) {
      return false;
    }

    if (shortcut.ctrl && !event.ctrlKey && !event.metaKey) return false;
    if (shortcut.shift && !event.shiftKey) return false;
    if (shortcut.alt && !event.altKey) return false;
    if (shortcut.meta && !event.metaKey) return false;

    // Check if unwanted modifiers are pressed
    if (!shortcut.ctrl && (event.ctrlKey || event.metaKey)) return false;
    if (!shortcut.shift && event.shiftKey) return false;
    if (!shortcut.alt && event.altKey) return false;

    return true;
  }

  /**
   * Get all shortcuts
   */
  getAllShortcuts(): ShortcutConfig[] {
    return [...this.shortcuts];
  }

  /**
   * Clear all shortcuts
   */
  clear(): void {
    this.shortcuts = [];
  }
}

// Export singleton instance
export const shortcutManager = new ShortcutManager();

/**
 * Register default shortcuts with dependency injection.
 * Call this from App.vue after stores are available.
 */
export function registerDefaultShortcuts(deps: {
  editorStore: any;
  projectStore: any;
  saveProject: () => void;
}) {
  shortcutManager.clear();

  // Undo
  shortcutManager.register({
    key: 'z',
    ctrl: true,
    handler: () => {
      // Dispatch custom event that Canvas.vue listens to
      window.dispatchEvent(new CustomEvent('editor:undo'));
    },
    description: 'Undo'
  });

  // Redo (Ctrl+Shift+Z)
  shortcutManager.register({
    key: 'z',
    ctrl: true,
    shift: true,
    handler: () => {
      window.dispatchEvent(new CustomEvent('editor:redo'));
    },
    description: 'Redo'
  });

  // Redo (Ctrl+Y)
  shortcutManager.register({
    key: 'y',
    ctrl: true,
    handler: () => {
      window.dispatchEvent(new CustomEvent('editor:redo'));
    },
    description: 'Redo'
  });

  // Delete
  shortcutManager.register({
    key: 'Delete',
    handler: () => {
      window.dispatchEvent(new CustomEvent('editor:delete'));
    },
    description: 'Delete selected element'
  });

  // Save
  shortcutManager.register({
    key: 's',
    ctrl: true,
    handler: () => {
      deps.saveProject();
    },
    description: 'Save project'
  });

  // Copy
  shortcutManager.register({
    key: 'c',
    ctrl: true,
    handler: () => {
      const el = deps.editorStore.selectedElement;
      if (el) {
        deps.editorStore.copy({
          tagName: el.tagName,
          html: el.outerHTML,
          styles: { ...el.style },
          attributes: {},
          content: el.textContent || ''
        });
      }
    },
    description: 'Copy'
  });

  // Paste
  shortcutManager.register({
    key: 'v',
    ctrl: true,
    handler: () => {
      const clipData = deps.editorStore.paste();
      if (clipData?.html) {
        // Use pendingInsert to insert clipboard content
        deps.editorStore.setPendingInsert(clipData.html);
      }
    },
    description: 'Paste'
  });

  // Cut
  shortcutManager.register({
    key: 'x',
    ctrl: true,
    handler: () => {
      const el = deps.editorStore.selectedElement;
      if (el) {
        deps.editorStore.copy({
          tagName: el.tagName,
          html: el.outerHTML,
          styles: { ...el.style },
          attributes: {},
          content: el.textContent || ''
        });
        window.dispatchEvent(new CustomEvent('editor:delete'));
      }
    },
    description: 'Cut'
  });

  // Duplicate (with offset to avoid overlap)
  shortcutManager.register({
    key: 'd',
    ctrl: true,
    handler: () => {
      const el = deps.editorStore.selectedElement;
      if (el) {
        let html = el.outerHTML;
        // Add offset to avoid overlapping the original
        const topMatch = html.match(/top\s*:\s*(\d+(?:\.\d+)?)(px|rem|em)?/);
        const leftMatch = html.match(/left\s*:\s*(\d+(?:\.\d+)?)(px|rem|em)?/);
        if (topMatch) {
          html = html.replace(/top\s*:\s*\d+(?:\.\d+)?(px|rem|em)?/, `top: ${parseFloat(topMatch[1]) + 20}${topMatch[2] || 'px'}`);
        }
        if (leftMatch) {
          html = html.replace(/left\s*:\s*\d+(?:\.\d+)?(px|rem|em)?/, `left: ${parseFloat(leftMatch[1]) + 20}${leftMatch[2] || 'px'}`);
        }
        deps.editorStore.setPendingInsert(html);
      }
    },
    description: 'Duplicate selected element'
  });
}
