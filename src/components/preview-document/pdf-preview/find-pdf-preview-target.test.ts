import type { PDFDocumentProxy } from 'pdfjs-dist';

import { vi, it, expect } from 'vitest';

import { findPdfPreviewTarget } from './find-pdf-preview-target';

function mockDocument(pages: { text: string; y: number }[][]) {
  return {
    numPages: pages.length,
    getPage: vi.fn(async (number: number) => ({
      getTextContent: async () => ({
        items: pages[number - 1].map(({ text, y }) => ({
          str: text,
          transform: [1, 0, 0, 1, 20, y],
        })),
      }),
      getViewport: () => ({
        height: 1000,
        convertToViewportPoint: (x: number, y: number) => [x, 1000 - y],
      }),
    })),
  } as unknown as PDFDocumentProxy;
}

it('locates a wrapped field after its printed section rather than an earlier matching label', async () => {
  const pdf = mockDocument([
    [{ text: 'Relationship to student', y: 800 }],
    [{ text: 'Family Details', y: 900 }],
    [
      { text: 'Relationship', y: 600 },
      { text: 'to student', y: 575 },
    ],
  ]);
  await expect(
    findPdfPreviewTarget(
      pdf,
      { text: ['Relationship to student'], afterText: 'Family Details' },
      1,
      () => true
    )
  ).resolves.toEqual({ page: 3, top: 39 });
});

it('uses the last page and footer edge when no matching content remains', async () => {
  const pdf = mockDocument([[], [], []]);
  await expect(
    findPdfPreviewTarget(pdf, { text: ['Signatures'], page: 'last', edge: 'bottom' }, 1, () => true)
  ).resolves.toEqual({ page: 3, top: 94 });
});

it('opens the authored destination on page 3 even when the same label is on page 1', async () => {
  const pdf = mockDocument([
    [{ text: 'Student details', y: 900 }],
    [],
    [{ text: 'Student details', y: 650 }],
  ]);
  const pageReference = { num: 9, gen: 0 };
  pdf.getDestination = vi.fn().mockResolvedValue([pageReference, { name: 'XYZ' }, 0, 0, null]);
  pdf.getPageIndex = vi.fn().mockResolvedValue(2);

  await expect(
    findPdfPreviewTarget(
      pdf,
      { destination: 'section:student-2', text: ['Student details'] },
      1,
      () => true
    )
  ).resolves.toEqual({ page: 3, top: 34 });
  expect(pdf.getPage).toHaveBeenCalledExactlyOnceWith(3);
});
