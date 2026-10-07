import type { TextItem, TextContent, StructTreeNode, TextMarkedContent } from 'pdfjs-dist/types/src/display/api';

import { it, expect, describe } from 'vitest';

import { extractPayslipPdfText } from './payslip-pdf-text';

const text = (str: string): TextItem => ({ str, dir: 'ltr', width: 10, height: 10,
  transform: [1, 0, 0, 1, 0, 0], fontName: 'embedded', hasEOL: false });
const begin = (id = ''): TextMarkedContent => ({ type: 'beginMarkedContentProps', id });
const end: TextMarkedContent = { type: 'endMarkedContent', id: '' };
const content = (...items: TextContent['items']): TextContent => ({ items, styles: {}, lang: null });
const span = (alt: string, ...ids: string[]): StructTreeNode & { alt: string } => ({
  role: 'Span', alt, children: ids.map((id) => ({ type: 'content', id })),
});
const root = (...children: StructTreeNode[]): StructTreeNode => ({ role: 'Root', children });

describe('stored PDF logical text', () => {
  it('uses the recorded logical text for covered glyphs, including nested shaping spans', () => {
    const page = content(begin('name'), text('દી'), begin(), text('\u0000િ'), end, text(' શાહ'), end,
      text('Employee ESI Rs. 75.00; Net pay Rs. 9,925.00'));
    expect(extractPayslipPdfText(page, root(span('દીપ્તિ શાહ', 'name'))))
      .toBe('દીપ્તિ શાહ Employee ESI Rs. 75.00; Net pay Rs. 9,925.00');
  });

  it('keeps uncovered NUL glyphs visible to the caller and never guesses source letters', () => {
    const page = content(begin('known'), text('covered\u0000'), end, text('unknown\u0000'));
    expect(extractPayslipPdfText(page, root(span('Recorded name', 'known'))))
      .toBe('Recorded name unknown\u0000');
    expect(extractPayslipPdfText(content(text('original\u0000')), null)).toBe('original\u0000');
  });

  it('retains repeated values belonging to distinct spans and raw table amounts', () => {
    const page = content(begin('first'), text('old'), end, text('Rs. 100.00'), begin('second'), text('old'), end);
    expect(extractPayslipPdfText(page, root(span('Teacher', 'first'), span('Teacher', 'second'))))
      .toBe('Teacher Rs. 100.00 Teacher');
  });

  it('does not consume an unrelated or conflicting span replacement', () => {
    const page = content(begin('name'), text('actual\u0000'), end);
    expect(extractPayslipPdfText(page, root(span('Unrelated employee', 'other')))).toBe('actual\u0000');
    expect(extractPayslipPdfText(page, root(span('One', 'name'), span('Another', 'name')))).toBe('actual\u0000');
    expect(extractPayslipPdfText(page, root(span('Same', 'name'), span('Same', 'name', 'another')))).toBe('actual\u0000');
  });

  it('does not substitute figure descriptions for payroll text', () => {
    const figure = { ...span('Decorative logo', 'logo'), role: 'Figure' };
    expect(extractPayslipPdfText(content(begin('logo'), text('School'), end), root(figure))).toBe('School');
  });

  it('reads a shared span once across extraction fragments when both content IDs are available', () => {
    const structure = root(span('A long recorded employee name', 'first-name', 'second-name'));
    const emitted = new Set<string>();
    expect(extractPayslipPdfText(content(begin('first-name'), text('A long'), end, text('Rs. 100.00')), structure, emitted))
      .toBe('A long recorded employee name Rs. 100.00');
    expect(extractPayslipPdfText(content(begin('second-name'), text('name'), end, text('Rs. 75.00')), structure, emitted))
      .toBe('Rs. 75.00');
  });
});
