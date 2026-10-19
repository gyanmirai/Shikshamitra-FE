import { it, vi, expect, describe } from 'vitest';

import { arrayBufferToBase64 } from './pdf-export';
import {
  exportTable,
  formatCellValue,
  getCellValueForExport,
  getTypedCellValueForExport,
} from './table-export';

import type { IData, IColumn } from './types';

describe('table export', () => {
  it('writes complete typed Excel rows with frozen identifiers and filters, excluding hidden controls', async () => {
    const XLSX = await import('xlsx');
    let output: Blob | undefined;
    const create = vi.spyOn(URL, 'createObjectURL').mockImplementation((blob) => {
      output = blob as Blob;
      return 'blob:table-test';
    });
    const revoke = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    try {
      await exportTable({
        format: 'excel',
        tableTitle: 'Staff balances',
        columns: [
          { id: 'name', label: 'Staff' },
          { id: 'amount', label: 'Amount', valueType: 'money' },
          { id: 'date', label: 'Date', valueType: 'date' },
          { id: 'actions', label: 'Actions' },
          { id: 'bank', label: 'Bank' },
        ],
        columnVisibility: { name: true, amount: true, date: true, actions: true, bank: false },
        rows: [
          { name: 'Staff A', amount: 1234.56, date: '2026-09-01' },
          { name: 'Staff B', amount: 0, date: '2026-09-02' },
        ],
        context: ['Synthetic school', 'September 2026'],
      });
      const bytes = await output!.arrayBuffer();
      const book = XLSX.read(bytes, { type: 'array', cellDates: true });
      expect(book.Sheets.Data.B2.v).toBe(1234.56);
      expect(book.Sheets.Data.B3.v).toBe(0);
      expect(book.Sheets.Data.C2.t).toBe('d');
      expect(book.Sheets.Data.D1).toBeUndefined();
      expect(book.Sheets.Data['!autofilter']?.ref).toBe('A1:C3');
      const archive = XLSX.CFB.read(new Uint8Array(bytes), { type: 'array' });
      const sheetPath = archive.FullPaths.find((name: string) =>
        name.endsWith('/xl/worksheets/sheet1.xml')
      );
      expect(new TextDecoder().decode(XLSX.CFB.find(archive, sheetPath).content)).toContain(
        'state="frozen"'
      );
    } finally {
      create.mockRestore();
      revoke.mockRestore();
      click.mockRestore();
    }
  });
  it('retains numeric precision and dates while keeping masked display values protected', () => {
    expect(
      getTypedCellValueForExport(
        { amount: 1234.56 },
        { id: 'amount', label: 'Amount', filterType: 'number', render: () => '₹1,235' }
      )
    ).toBe(1234.56);
    expect(
      getTypedCellValueForExport(
        { amount: 0 },
        { id: 'amount', label: 'Amount', valueType: 'money' }
      )
    ).toBe(0);
    expect(
      getTypedCellValueForExport(
        { bank: '123456789012' },
        { id: 'bank', label: 'Bank', render: () => '****9012' }
      )
    ).toBe('****9012');
    expect(
      getTypedCellValueForExport(
        { date: '2026-09-01' },
        { id: 'date', label: 'Date', valueType: 'date' }
      )
    ).toBeInstanceOf(Date);
    expect(
      getTypedCellValueForExport(
        { amount: null },
        { id: 'amount', label: 'Amount', valueType: 'money' }
      )
    ).toBeNull();
  });
  it('preserves Gujarati text without encoding it through a Latin code page', () => {
    const question = 'પહેલો સબક કોને કહેવાય છે ?';

    expect(formatCellValue(question)).toBe(question);
  });

  it('preserves Gujarati text extracted from a rendered cell', () => {
    const row: IData = { question: 'પહેલો સબક કોને કહેવાય છે ?' };
    const column = {
      id: 'question',
      label: 'Question',
      render: (value: unknown) => <span>{String(value)}</span>,
    } as IColumn;

    expect(getCellValueForExport(row, column)).toBe(row.question);
  });

  it('converts arbitrary font bytes to base64 without data loss', () => {
    const bytes = new Uint8Array([0, 1, 127, 128, 255]);

    expect(arrayBufferToBase64(bytes.buffer)).toBe('AAF/gP8=');
  });
});
