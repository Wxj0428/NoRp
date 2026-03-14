/**
 * Keyboard Shortcuts Manager
 *
 * Handles keyboard shortcuts for the application.
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

  /**
   * Check if event matches shortcut
   */
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
   * Get formatted shortcut string
   */
  formatShortcut(shortcut: ShortcutConfig): string {
    const parts: string[] = [];

    if (shortcut.ctrl || shortcut.meta) parts.push('Ctrl');
    if (shortcut.shift) parts.push('Shift');
    if (shortcut.alt) parts.push('Alt');

    parts.push(shortcut.key.toUpperCase());

    return parts.join(' + ');
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

// Default shortcuts
shortcutManager.register({
  key: 'z',
  ctrl: true,
  handler: () => {
    // Undo - will be connected to editor store
    console.log('Undo');
  },
  description: 'Undo'
});

shortcutManager.register({
  key: 'z',
  ctrl: true,
  shift: true,
  handler: () => {
    // Redo - will be connected to editor store
    console.log('Redo');
  },
  description: 'Redo'
});

shortcutManager.register({
  key: 'c',
  ctrl: true,
  handler: () => {
    // Copy - will be connected to editor store
    console.log('Copy');
  },
  description: 'Copy'
});

shortcutManager.register({
  key: 'v',
  ctrl: true,
  handler: () => {
    // Paste - will be connected to editor store
    console.log('Paste');
  },
  description: 'Paste'
});

shortcutManager.register({
  key: 'x',
  ctrl: true,
  handler: () => {
    // Cut - will be connected to editor store
    console.log('Cut');
  },
  description: 'Cut'
});

shortcutManager.register({
  key: 'Delete',
  handler: () => {
    // Delete - will be connected to editor store
    console.log('Delete');
  },
  description: 'Delete selected element'
});

shortcutManager.register({
  key: 'd',
  ctrl: true,
  handler: () => {
    // Duplicate - will be connected to editor store
    console.log('Duplicate');
  },
  description: 'Duplicate selected element'
});

shortcutManager.register({
  key: 's',
  ctrl: true,
  handler: () => {
    // Save - will be connected to project store
    console.log('Save');
  },
  description: 'Save project'
});
