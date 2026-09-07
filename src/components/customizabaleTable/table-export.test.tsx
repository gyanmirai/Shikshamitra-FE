import { it, expect, describe } from 'vitest';

import { arrayBufferToBase64 } from './pdf-export';
import { formatCellValue, getCellValueForExport } from './table-export';

import type { IData, IColumn } from './types';

describe('table export', () => {
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
