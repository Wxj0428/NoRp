/**
 * Selection Manager
 *
 * Manages element selection state in the canvas.
 */

import { ref } from 'vue';

export class SelectionManager {
  private selectedElement = ref<HTMLElement | null>(null);
  private hoveredElement = ref<HTMLElement | null>(null);
  private selectionHistory: HTMLElement[] = [];

  /**
   * Get the currently selected element
   */
  getSelected() {
    return this.selectedElement;
  }

  /**
   * Get the currently hovered element
   */
  getHovered() {
    return this.hoveredElement;
  }

  /**
   * Select an element
   */
  select(element: HTMLElement | null): void {
    // Remove selection class from previous
    if (this.selectedElement.value) {
      this.selectedElement.value.classList.remove('selected');
    }

    // Add to history if different
    if (element && element !== this.selectedElement.value) {
      this.selectionHistory.push(element);
    }

    // Set new selection
    this.selectedElement.value = element;

    if (element) {
      element.classList.add('selected');
    }
  }

  /**
   * Clear selection
   */
  clear(): void {
    if (this.selectedElement.value) {
      this.selectedElement.value.classList.remove('selected');
    }
    this.selectedElement.value = null;
  }

  /**
   * Set hovered element
   */
  hover(element: HTMLElement | null): void {
    // Remove hover class from previous
    if (this.hoveredElement.value && this.hoveredElement.value !== this.selectedElement.value) {
      this.hoveredElement.value.classList.remove('hovered');
    }

    this.hoveredElement.value = element;

    if (element && element !== this.selectedElement.value) {
      element.classList.add('hovered');
    }
  }

  /**
   * Select parent of current element
   */
  selectParent(): boolean {
    if (!this.selectedElement.value?.parentElement) return false;

    const parent = this.selectedElement.value.parentElement;
    this.select(parent);
    return true;
  }

  /**
   * Select first child of current element
   */
  selectFirstChild(): boolean {
    const element = this.selectedElement.value;
    if (!element?.children.length) return false;

    this.select(element.children[0] as HTMLElement);
    return true;
  }

  /**
   * Select next sibling
   */
  selectNextSibling(): boolean {
    const element = this.selectedElement.value;
    if (!element?.nextElementSibling) return false;

    this.select(element.nextElementSibling as HTMLElement);
    return true;
  }

  /**
   * Select previous sibling
   */
  selectPreviousSibling(): boolean {
    const element = this.selectedElement.value;
    if (!element?.previousElementSibling) return false;

    this.select(element.previousElementSibling as HTMLElement);
    return true;
  }

  /**
   * Check if element is selected
   */
  isSelected(element: HTMLElement): boolean {
    return this.selectedElement.value === element;
  }

  /**
   * Get selection history
   */
  getHistory(): HTMLElement[] {
    return [...this.selectionHistory];
  }

  /**
   * Clear history
   */
  clearHistory(): void {
    this.selectionHistory = [];
  }
}

// Export singleton instance
export const selectionManager = new SelectionManager();
