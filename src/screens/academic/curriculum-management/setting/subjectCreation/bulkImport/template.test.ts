import { vi, it, expect, describe, afterEach } from 'vitest';

import { downloadSubjectTemplate } from './template';

const spreadsheetMocks = vi.hoisted(() => ({
  aoaToSheet: vi.fn(() => ({})),
  bookNew: vi.fn(() => ({ SheetNames: [], Sheets: {} })),
  appendSheet: vi.fn(),
  writeFile: vi.fn(),
}));

vi.mock('xlsx', () => ({
  utils: {
    aoa_to_sheet: spreadsheetMocks.aoaToSheet,
    book_new: spreadsheetMocks.bookNew,
    book_append_sheet: spreadsheetMocks.appendSheet,
  },
  writeFile: spreadsheetMocks.writeFile,
}));

describe('downloadSubjectTemplate', () => {
  afterEach(() => vi.restoreAllMocks());

  it('downloads the CSV template with the expected filename', async () => {
    let appendedAnchor: HTMLAnchorElement | undefined;
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:subject-template');
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);
    const click = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => undefined);
    vi.spyOn(document.body, 'appendChild').mockImplementation((node) => {
      appendedAnchor = node as HTMLAnchorElement;
      return node;
    });

    await downloadSubjectTemplate('csv');

    expect(click).toHaveBeenCalledOnce();
    expect(appendedAnchor?.download).toBe('subject-import-template.csv');
    expect(appendedAnchor?.href).toBe('blob:subject-template');
  });

  it('generates the Excel template workbook', async () => {
    await downloadSubjectTemplate('xlsx');

    expect(spreadsheetMocks.aoaToSheet).toHaveBeenCalledOnce();
    expect(spreadsheetMocks.appendSheet).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      'Subjects'
    );
    expect(spreadsheetMocks.writeFile).toHaveBeenCalledWith(
      expect.anything(),
      'subject-import-template.xlsx'
    );
  });
});
