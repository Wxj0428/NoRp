/**
 * History Manager
 *
 * Manages undo/redo functionality for the editor.
 */

import type { HistoryAction } from '@/types';

export class HistoryManager {
  private history: HistoryAction[] = [];
  private currentIndex: number = -1;
  private maxHistory: number = 100;

  /**
   * Add a new action to history
   */
  push(action: HistoryAction): void {
    // Remove any future history if we're not at the end
    if (this.currentIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.currentIndex + 1);
    }

    this.history.push(action);
    this.currentIndex++;

    // Limit history size
    if (this.history.length > this.maxHistory) {
      this.history.shift();
      this.currentIndex--;
    }
  }

  /**
   * Undo the last action
   */
  undo(): HistoryAction | null {
    if (this.currentIndex < 0) return null;

    const action = this.history[this.currentIndex];
    this.currentIndex--;
    return action;
  }

  /**
   * Redo the next action
   */
  redo(): HistoryAction | null {
    if (this.currentIndex >= this.history.length - 1) return null;

    this.currentIndex++;
    return this.history[this.currentIndex];
  }

  /**
   * Check if undo is available
   */
  canUndo(): boolean {
    return this.currentIndex >= 0;
  }

  /**
   * Check if redo is available
   */
  canRedo(): boolean {
    return this.currentIndex < this.history.length - 1;
  }

  /**
   * Clear all history
   */
  clear(): void {
    this.history = [];
    this.currentIndex = -1;
  }

  /**
   * Get current index
   */
  getCurrentIndex(): number {
    return this.currentIndex;
  }

  /**
   * Get history length
   */
  getLength(): number {
    return this.history.length;
  }

  /**
   * Get all history actions
   */
  getAll(): HistoryAction[] {
    return [...this.history];
  }

  /**
   * Get action at specific index
   */
  getAt(index: number): HistoryAction | null {
    return this.history[index] || null;
  }
}

// Export singleton instance
export const historyManager = new HistoryManager();
