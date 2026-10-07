import type { TextContent, StructTreeNode } from 'pdfjs-dist/types/src/display/api';

type Replacement = { key: string; text: string };

// PDF.js exposes standard structure-tree Alt/ActualText as `alt` at runtime.
// Only replace text actually covered by a tagged text span in the stored PDF.
// Payroll responses are deliberately not inputs to this reader.
export function extractPayslipPdfText(
  content: TextContent,
  structure: StructTreeNode | null,
  emittedSpans = new Set<string>()
): string {
  const replacements = new Map<string, Replacement>();
  const ambiguous = new Set<string>();
  const contentIds = (node: StructTreeNode): string[] => node.children.flatMap((child) => (
    'children' in child ? contentIds(child) : child.type === 'content' ? [child.id] : []
  ));
  const visit = (node: StructTreeNode) => {
    if (node.role === 'Span' && 'alt' in node && typeof node.alt === 'string' && node.alt.length) {
      const ids = contentIds(node);
      const replacement = { key: ids.join('|'), text: node.alt };
      ids.forEach((id) => {
        const existing = replacements.get(id);
        if (ambiguous.has(id) || (existing && (existing.key !== replacement.key || existing.text !== replacement.text))) {
          replacements.delete(id);
          ambiguous.add(id);
        } else {
          replacements.set(id, replacement);
        }
      });
    } else {
      node.children.forEach((child) => { if ('children' in child) visit(child); });
    }
  };
  if (structure) visit(structure);

  const markedContent: (string | undefined)[] = [];
  const fragments: string[] = [];
  content.items.forEach((item) => {
    if ('str' in item) {
      const id = markedContent.findLast((value) => value !== undefined && replacements.has(value));
      const replacement = id === undefined ? undefined : replacements.get(id);
      if (!replacement) {
        fragments.push(item.str);
      } else if (!emittedSpans.has(replacement.key)) {
        fragments.push(replacement.text);
        emittedSpans.add(replacement.key);
      }
    } else if (item.type === 'endMarkedContent') {
      markedContent.pop();
    } else {
      markedContent.push(item.id);
    }
  });
  return fragments.join(' ');
}
