/**
 * Lightweight markdown → HTML renderer (zero dependencies)
 * Used for AI chat message rendering
 */

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function renderMarkdown(text: string): string {
  if (!text) return '';

  // Protect code blocks and inline code from markdown transforms
  const codeBlocks: string[] = [];
  const inlineCodes: string[] = [];

  // Extract fenced code blocks (```...```)
  let processed = text.replace(/```[\s\S]*?```/g, (match) => {
    codeBlocks.push(match);
    return `\x00CB${codeBlocks.length - 1}\x00`;
  });

  // Extract inline code (`...`)
  processed = processed.replace(/`([^`\n]+)`/g, (_match, code) => {
    inlineCodes.push(code);
    return `\x00IC${inlineCodes.length - 1}\x00`;
  });

  // Escape HTML in non-code content
  processed = escapeHtml(processed);

  // Apply markdown transforms

  // Bold: **text** or __text__
  processed = processed.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  processed = processed.replace(/__(.+?)__/g, '<strong>$1</strong>');

  // Italic: *text* or _text_ (but not inside ** or __)
  processed = processed.replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, '<em>$1</em>');

  // Headings: ### heading (limit to h3-h6 for chat bubbles)
  processed = processed.replace(/^####\s+(.+)$/gm, '<h6 class="text-xs font-semibold text-gray-300 mt-2 mb-1">$1</h6>');
  processed = processed.replace(/^###\s+(.+)$/gm, '<h5 class="text-sm font-semibold text-gray-200 mt-2 mb-1">$1</h5>');
  processed = processed.replace(/^##\s+(.+)$/gm, '<h4 class="text-sm font-bold text-gray-100 mt-2 mb-1">$1</h4>');

  // Links: [text](url)
  processed = processed.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-400 hover:underline" target="_blank">$1</a>');

  // Unordered lists: lines starting with - or *
  processed = processed.replace(/(^[\-\*]\s+.+(\n|$))+/gm, (block) => {
    const items = block.trim().split(/\n/).map((line: string) => {
      const content = line.replace(/^[\-\*]\s+/, '');
      return `<li class="ml-3 list-disc">${content}</li>`;
    }).join('');
    return `<ul class="space-y-0.5">${items}</ul>`;
  });

  // Ordered lists: lines starting with 1. 2. etc.
  processed = processed.replace(/(^\d+\.\s+.+(\n|$))+/gm, (block) => {
    const items = block.trim().split(/\n/).map((line: string) => {
      const content = line.replace(/^\d+\.\s+/, '');
      return `<li class="ml-3 list-decimal">${content}</li>`;
    }).join('');
    return `<ol class="space-y-0.5">${items}</ol>`;
  });

  // Paragraphs: double newline
  processed = processed.replace(/\n\n+/g, '</p><p class="mt-2">');
  // Single newline → <br>
  processed = processed.replace(/\n/g, '<br>');

  // Wrap in paragraph if not already wrapped
  if (!processed.startsWith('<')) {
    processed = `<p>${processed}</p>`;
  }

  // Restore inline code
  processed = processed.replace(/\x00IC(\d+)\x00/g, (_match, idx) => {
    const code = escapeHtml(inlineCodes[parseInt(idx)]);
    return `<code class="px-1 py-0.5 bg-gray-900 text-green-400 rounded text-xs">${code}</code>`;
  });

  // Restore fenced code blocks (already escaped by the original content)
  processed = processed.replace(/\x00CB(\d+)\x00/g, (_match, idx) => {
    return codeBlocks[parseInt(idx)];
  });

  return processed;
}
