import { it, expect, describe } from 'vitest';

import { parseChapterImportRows } from './chapterImport';

const headers = ['Chapter Number', 'Chapter Name', 'Start Date', 'End Date', 'Description'];

describe('parseChapterImportRows', () => {
  it('parses multiple valid chapter rows', () => {
    const result = parseChapterImportRows([
      headers,
      [1, 'Numbers', '2026-09-23', '2026-09-30', 'Counting basics'],
      [2, 'Shapes', '2026-10-01', '2026-10-08', ''],
    ]);

    expect(result.errors).toEqual([]);
    expect(result.entries).toHaveLength(2);
    expect(result.entries[0]).toMatchObject({
      chapterNo: 1,
      chapterName: 'Numbers',
      description: 'Counting basics',
    });
    expect(result.entries[0].startDate?.format('YYYY-MM-DD')).toBe('2026-09-23');
    expect(result.entries[1].endDate?.format('YYYY-MM-DD')).toBe('2026-10-08');
  });

  it('reports missing required columns', () => {
    const result = parseChapterImportRows([
      ['Chapter Number', 'Chapter Name'],
      [1, 'Numbers'],
    ]);

    expect(result.entries).toEqual([]);
    expect(result.errors[0]).toContain('Start Date');
    expect(result.errors[0]).toContain('End Date');
  });

  it('rejects duplicate and already-added chapter numbers atomically', () => {
    const result = parseChapterImportRows(
      [
        headers,
        [4, 'Numbers', '2026-09-23', '2026-09-30', ''],
        [5, 'Shapes', '2026-10-01', '2026-10-08', ''],
        [5, 'Patterns', '2026-10-09', '2026-10-15', ''],
      ],
      [4]
    );

    expect(result.entries).toEqual([]);
    expect(result.errors).toEqual(
      expect.arrayContaining([
        expect.stringContaining('already exists'),
        expect.stringContaining('duplicated'),
      ])
    );
  });

  it('rejects invalid date order and non-integer chapter numbers', () => {
    const result = parseChapterImportRows([
      headers,
      [1.5, 'Fractions', '2026-10-10', '2026-10-01', ''],
    ]);

    expect(result.entries).toEqual([]);
    expect(result.errors[0]).toContain('whole number');
    expect(result.errors[0]).toContain('End Date cannot be before Start Date');
  });

  it('keeps invalid rows available for preview with row-level validation', () => {
    const result = parseChapterImportRows([
      headers,
      [1, 'OK', 'not-a-date', '2026-09-30', 'Preview this row'],
      [2, 'Shapes', '2026-10-01', '2026-10-08', 'Valid row'],
    ]);

    expect(result.entries).toEqual([]);
    expect(result.rows).toHaveLength(2);
    expect(result.rows[0]).toMatchObject({
      rowNumber: 2,
      chapterNo: '1',
      chapterName: 'OK',
      startDate: 'not-a-date',
    });
    expect(result.rows[0].errors).toEqual(
      expect.arrayContaining([
        expect.stringContaining('at least 3 characters'),
        expect.stringContaining('YYYY-MM-DD'),
      ])
    );
    expect(result.rows[1].errors).toEqual([]);
  });

  it('validates imported dates against the active academic year', () => {
    const result = parseChapterImportRows(
      [headers, [1, 'Numbers', '2027-06-01', '2027-06-08', '']],
      [],
      {
        academicYearStart: '2026-06-01',
        academicYearEnd: '2027-05-31',
        today: '2026-09-22',
      }
    );

    expect(result.entries).toEqual([]);
    expect(result.rows[0].errors).toEqual(
      expect.arrayContaining([
        'Start Date is after the academic year',
        'End Date is after the academic year',
      ])
    );
  });
});
