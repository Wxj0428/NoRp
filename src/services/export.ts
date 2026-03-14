/**
 * Export Service
 *
 * Handles exporting projects to various formats (HTML, Vue, React, etc.)
 */

import type { Project, ExportOptions, ExportResult } from '@/types';

export class ExportService {
  /**
   * Export project as a single HTML file with inline CSS/JS
   */
  exportToSingleHTML(project: Project, options: ExportOptions): ExportResult {
    const page = project.pages[0]; // Use first page for now

    // Clean up the HTML
    let cleanHtml = this.cleanHtml(page.html);

    // Add responsive viewport meta tag if needed
    if (options.responsive && !cleanHtml.includes('viewport')) {
      cleanHtml = this.injectViewport(cleanHtml);
    }

    // Build complete HTML document
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  ${options.responsive ? '  <meta name="viewport" content="width=device-width, initial-scale=1.0">' : ''}
  <title>${project.name}</title>
  <style>
    /* Reset and base styles */
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      line-height: 1.6;
      color: #333;
    }
  </style>
</head>
<body>
${cleanHtml}
${page.scripts ? `<script>\n${page.scripts}\n</script>` : ''}
</body>
</html>`;

    // Minify if requested
    const finalHtml = options.minify ? this.minifyHtml(html) : html;

    return {
      html: finalHtml
    };
  }

  /**
   * Export project as separate HTML and CSS files
   */
  exportToSplitFiles(project: Project, options: ExportOptions): ExportResult {
    const page = project.pages[0];
    const cleanHtml = this.cleanHtml(page.html);

    // Extract inline styles and convert to CSS classes
    const { css: extractedCss, html: processedHtml } = this.extractInlineStyles(cleanHtml);

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  ${options.responsive ? '  <meta name="viewport" content="width=device-width, initial-scale=1.0">' : ''}
  <title>${project.name}</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
${processedHtml}
${page.scripts ? `<script src="script.js"></script>` : ''}
</body>
</html>`;

    const css = `/* Reset and base styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  line-height: 1.6;
  color: #333;
}

/* Extracted styles */
${extractedCss}`;

    const files = [
      { name: 'index.html', content: options.minify ? this.minifyHtml(html) : html },
      { name: 'styles.css', content: css }
    ];

    if (page.scripts) {
      files.push({ name: 'script.js', content: page.scripts });
    }

    return {
      html,
      css,
      files
    };
  }

  /**
   * Export project as Vue component
   */
  exportToVueComponent(project: Project): ExportResult {
    const page = project.pages[0];
    const cleanHtml = this.cleanHtml(page.html);

    const vueComponent = `<template>
${this.indentHtml(cleanHtml, 2)}
</template>

<script setup lang="ts">
// Add your component logic here
</script>

<style scoped>
/* Add your component styles here */
</style>`;

    return {
      html: vueComponent
    };
  }

  /**
   * Export project as React component
   */
  exportToReactComponent(project: Project): ExportResult {
    const page = project.pages[0];
    const cleanHtml = this.cleanHtml(page.html);

    // Convert HTML to JSX
    const jsx = this.htmlToJSX(cleanHtml);

    const reactComponent = `import React from 'react';

export default function ${this.toPascalCase(project.name)}() {
  return (
${this.indentHtml(jsx, 4)}
  );
}`;

    return {
      html: reactComponent
    };
  }

  /**
   * Clean HTML by removing editor-specific attributes
   */
  private cleanHtml(html: string): string {
    return html
      .replace(/ data-element-id="[^"]*"/g, '')
      .replace(/ class="selected"/g, '')
      .replace(/ class="hovered"/g, '')
      .trim();
  }

  /**
   * Inject viewport meta tag
   */
  private injectViewport(html: string): string {
    if (html.includes('<head>')) {
      return html.replace(
        '<head>',
        '<head>\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">'
      );
    }
    return '<meta name="viewport" content="width=device-width, initial-scale=1.0">\n' + html;
  }

  /**
   * Minify HTML by removing unnecessary whitespace
   */
  private minifyHtml(html: string): string {
    return html
      .replace(/\s+/g, ' ')
      .replace(/>\s+</g, '><')
      .trim();
  }

  /**
   * Extract inline styles and convert to CSS classes
   * (Simplified version - real implementation would be more sophisticated)
   */
  private extractInlineStyles(html: string): { css: string; html: string } {
    // This is a placeholder - real implementation would parse HTML,
    // extract inline styles, generate unique class names, and replace
    return {
      css: '/* Styles would be extracted here */',
      html
    };
  }

  /**
   * Convert HTML to JSX format
   */
  private htmlToJSX(html: string): string {
    return html
      .replace(/class=/g, 'className=')
      .replace(/for=/g, 'htmlFor=')
      .replace(/ tabindex=/g, ' tabIndex=')
      .replace(/<input([^>]*)>/g, (_match, attrs) => {
        // Self-close input tags
        if (!attrs.includes('/')) {
          return `<input${attrs} />`;
        }
        return `<input${attrs}>`;
      })
      .replace(/<img([^>]*)>/g, (_match, attrs) => {
        // Self-close img tags
        if (!attrs.includes('/')) {
          return `<img${attrs} />`;
        }
        return `<img${attrs}>`;
      })
      .replace(/<br>/g, '<br />')
      .replace(/<hr>/g, '<hr />');
  }

  /**
   * Indent HTML for pretty printing
   */
  private indentHtml(html: string, spaces: number): string {
    const indent = ' '.repeat(spaces);
    return html
      .split('\n')
      .map((line) => (line.trim() ? indent + line.trim() : ''))
      .join('\n');
  }

  /**
   * Convert string to PascalCase
   */
  private toPascalCase(str: string): string {
    return str
      .replace(/[^a-zA-Z0-9]/g, ' ')
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('');
  }
}

// Export singleton instance
export const exportService = new ExportService();
