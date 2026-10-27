import { it, vi, expect } from 'vitest';

import { saveUnicodeTablePdf } from './pdf-export';

vi.mock('./indic-pdf-export', () => ({
  createIndicTablePdfBlob: async () => new Blob(['synthetic PDF']),
}));

it('rechecks access after asynchronous Indic PDF formatting and before downloading', async () => {
  const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
  try {
    await expect(
      saveUnicodeTablePdf({ title: 'History', head: ['School'], body: [['શાળા']] }, () => {
        throw new Error('Session changed');
      })
    ).rejects.toThrow('Session changed');
    expect(click).not.toHaveBeenCalled();
  } finally {
    click.mockRestore();
  }
});
