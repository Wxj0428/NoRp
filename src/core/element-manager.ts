/**
 * Element Manager
 *
 * Core service for managing DOM elements in the canvas.
 * Handles selection, manipulation, and CRUD operations.
 */

export class ElementManager {
  private canvasDocument: Document | null = null;

  constructor(canvasDocument: Document | null = null) {
    this.canvasDocument = canvasDocument;
  }

  /**
   * Set the canvas document
   */
  setCanvasDocument(doc: Document | null): void {
    this.canvasDocument = doc;
  }

  /**
   * Select an element
   */
  selectElement(element: HTMLElement | null): void {
    // Remove selection from previous element
    const previous = this.canvasDocument?.querySelector('.selected');
    if (previous) {
      previous.classList.remove('selected');
    }

    // Add selection to new element
    if (element) {
      element.classList.add('selected');
    }
  }

  /**
   * Move an element to new coordinates
   */
  moveElement(element: HTMLElement, x: number, y: number): void {
    const computedStyle = window.getComputedStyle(element);
    const position = computedStyle.position;

    if (position === 'static' || position === 'normal') {
      element.style.position = 'absolute';
    }

    element.style.left = `${x}px`;
    element.style.top = `${y}px`;
  }

  /**
   * Resize an element
   */
  resizeElement(element: HTMLElement, width: number, height: number): void {
    element.style.width = `${width}px`;
    element.style.height = `${height}px`;
  }

  /**
   * Update element styles
   */
  updateStyle(element: HTMLElement, styles: Partial<CSSStyleDeclaration>): void {
    Object.assign(element.style, styles);
  }

  /**
   * Add a new element to the canvas
   */
  addElement(html: string, parent?: HTMLElement): HTMLElement | null {
    if (!this.canvasDocument) return null;

    const container = parent || this.canvasDocument.querySelector('.page-container');
    if (!container) return null;

    container.insertAdjacentHTML('beforeend', html);
    const newElement = container.lastElementChild as HTMLElement;

    return newElement;
  }

  /**
   * Delete an element
   */
  deleteElement(element: HTMLElement): void {
    element.remove();
  }

  /**
   * Duplicate an element
   */
  duplicateElement(element: HTMLElement): HTMLElement | null {
    const clone = element.cloneNode(true) as HTMLElement;

    // Generate unique IDs for cloned element
    this.makeIdsUnique(clone);

    // Insert after original
    element.parentNode?.insertBefore(clone, element.nextSibling);

    return clone;
  }

  /**
   * Copy element styles
   */
  copyStyles(source: HTMLElement, target: HTMLElement): void {
    const computedStyle = window.getComputedStyle(source);

    // Copy all computed styles
    for (let i = 0; i < computedStyle.length; i++) {
      const property = computedStyle[i];
      target.style.setProperty(property, computedStyle.getPropertyValue(property));
    }
  }

  /**
   * Bring element to front
   */
  bringToFront(element: HTMLElement): void {
    const parent = element.parentNode;
    if (parent && parent.lastElementChild !== element) {
      parent.appendChild(element);
    }
  }

  /**
   * Send element to back
   */
  sendToBack(element: HTMLElement): void {
    const parent = element.parentNode;
    if (parent && parent.firstElementChild !== element) {
      parent.insertBefore(element, parent.firstElementChild);
    }
  }

  /**
   * Get element data for serialization
   */
  getElementData(element: HTMLElement): any {
    return {
      tagName: element.tagName,
      id: element.id,
      className: element.className,
      attributes: this.getAttributes(element),
      styles: this.getInlineStyles(element),
      content: element.textContent,
      children: Array.from(element.children).map((child) =>
        this.getElementData(child as HTMLElement)
      )
    };
  }

  /**
   * Get all attributes of an element
   */
  private getAttributes(element: HTMLElement): Record<string, string> {
    const attrs: Record<string, string> = {};
    for (let i = 0; i < element.attributes.length; i++) {
      const attr = element.attributes[i];
      if (attr.name !== 'style' && attr.name !== 'class') {
        attrs[attr.name] = attr.value;
      }
    }
    return attrs;
  }

  /**
   * Get inline styles of an element
   */
  private getInlineStyles(element: HTMLElement): Record<string, string> {
    const styles: Record<string, string> = {};
    if (element.style.length) {
      for (let i = 0; i < element.style.length; i++) {
        const property = element.style[i];
        styles[property] = element.style.getPropertyValue(property);
      }
    }
    return styles;
  }

  /**
   * Make IDs unique within the document
   */
  private makeIdsUnique(element: HTMLElement): void {
    if (element.id) {
      element.id = this.generateUniqueId(element.id);
    }

    // Process children
    Array.from(element.children).forEach((child) => {
      this.makeIdsUnique(child as HTMLElement);
    });
  }

  /**
   * Generate a unique ID based on a base ID
   */
  private generateUniqueId(baseId: string): string {
    const suffix = Math.random().toString(36).substr(2, 9);
    return `${baseId}-${suffix}`;
  }

  /**
   * Get element at position
   */
  getElementAtPosition(x: number, y: number): HTMLElement | null {
    if (!this.canvasDocument) return null;

    const element = this.canvasDocument.elementFromPoint(x, y);
    return element as HTMLElement;
  }

  /**
   * Get element hierarchy (for layer tree)
   */
  getElementHierarchy(): HTMLElement[] {
    if (!this.canvasDocument) return [];

    const container = this.canvasDocument.querySelector('.page-container');
    if (!container) return [];

    return Array.from(container.children) as HTMLElement[];
  }

  /**
   * Wrap element in container
   */
  wrapElement(element: HTMLElement, wrapperHtml: string): HTMLElement | null {
    if (!this.canvasDocument) return null;

    const wrapper = this.canvasDocument.createElement('div');
    wrapper.innerHTML = wrapperHtml;
    const wrapperElement = wrapper.firstElementChild as HTMLElement;

    if (element.parentNode) {
      element.parentNode.insertBefore(wrapperElement, element);
      wrapperElement.appendChild(element);
    }

    return wrapperElement;
  }

  /**
   * Unwrap element (remove parent, keep children)
   */
  unwrapElement(element: HTMLElement): void {
    const parent = element.parentNode;
    if (parent && parent.parentNode) {
      while (element.firstChild) {
        parent.parentNode.insertBefore(element.firstChild, element);
      }
      parent.removeChild(element);
    }
  }
}

// Export singleton instance
export const elementManager = new ElementManager();
