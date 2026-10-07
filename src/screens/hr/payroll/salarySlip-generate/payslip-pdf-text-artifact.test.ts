// @vitest-environment node
import { it, expect } from 'vitest';
import { pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { readFile } from 'node:fs/promises';

import { extractPayslipPdfText } from './payslip-pdf-text';

it('reads exact Gujarati logical text from immutable tagged PDF bytes using the deployed PDF.js version', async () => {
  const pdfjs: typeof import('pdfjs-dist') = await import(/* @vite-ignore */ pathToFileURL(
    createRequire(import.meta.url).resolve('pdfjs-dist/legacy/build/pdf.mjs')
  ).href);
  expect(pdfjs.version).toBe('5.6.205');
  const bytes = await readFile(new URL('./__fixtures__/tagged-gujarati.pdf', import.meta.url));
  const hash = createHash('sha256').update(bytes).digest('hex');
  expect(hash).toBe('825c561c6dc8951dcf284bc398a80f3d6b91ef62845a410b9f38db01901d87a7');
  const loading = pdfjs.getDocument({ data: new Uint8Array(bytes) });
  const document = await loading.promise;
  try {
    expect(document.numPages).toBe(2);
    const emitted = new Set<string>();
    const first = await document.getPage(1);
    const second = await document.getPage(2);
    const firstContent = await first.getTextContent({ includeMarkedContent: true });
    const secondContent = await second.getTextContent({ includeMarkedContent: true });
    const raw = [...firstContent.items, ...secondContent.items]
      .map((item) => ('str' in item ? item.str : '')).join(' ');
    // Prove this is an actual shaping failure that ordinary extraction cannot recover.
    expect(raw).toContain('\u0000');
    expect(raw).not.toContain('દીપ્તિ શાહ');
    const firstText = extractPayslipPdfText(firstContent, await first.getStructTree(), emitted);
    const secondText = extractPayslipPdfText(secondContent, await second.getStructTree(), emitted);
    expect(firstText).toContain('દીપ્તિ શાહ');
    expect(firstText).toContain('Employee ESI Rs. 75.00; Net pay Rs. 9,925.00');
    expect(secondText).toContain('ગુજરાતી વિભાગ');
    expect(secondText).toContain('શિક્ષક');
    expect(secondText).toContain('દીપ્તિ શાહ');
    expect(secondText).toContain('Unchanged second-page amount Rs. 325.00');
    expect(firstText + secondText).not.toContain('\u0000');
    expect(firstText + secondText).not.toContain('\ufffd');
    expect(createHash('sha256').update(bytes).digest('hex')).toBe(hash);
  } finally { await loading.destroy(); }
});
