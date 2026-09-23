import { it, expect, describe } from 'vitest';

import { parseSubjectImportMatrix } from './parser';

const headers = [
  'Subject Name*',
  'Display Name',
  'Category*',
  'Color*',
  'Icon',
  'Status*',
  'Sort Order',
  'Description',
];

describe('parseSubjectImportMatrix', () => {
  it('parses a valid template row', () => {
    const result = parseSubjectImportMatrix(
      [
        headers,
        [
          'Mathematics',
          'Maths',
          'Scholastic',
          '#0D47A1',
          'calculator',
          'Active',
          1,
          'Core subject',
        ],
      ],
      new Set()
    );

    expect(result.fileError).toBeUndefined();
    expect(result.rows).toEqual([
      expect.objectContaining({
        rowNumber: 2,
        name: 'Mathematics',
        sortOrder: '1',
        issues: [],
      }),
    ]);
  });

  it('rejects files with missing required columns', () => {
    const result = parseSubjectImportMatrix(
      [
        ['Subject Name*', 'Category*'],
        ['Science', 'Scholastic'],
      ],
      new Set()
    );

    expect(result.rows).toEqual([]);
    expect(result.fileError).toContain('color, status');
  });

  it('reports duplicate and existing subject names by row', () => {
    const result = parseSubjectImportMatrix(
      [
        headers,
        ['Science', '', 'Scholastic', '#2196F3', '', 'Active', '', ''],
        ['science', '', 'General', '#00B96B', '', 'Active', '', ''],
        ['English', '', 'Language', '#8E24AA', 'book', 'Active', '', ''],
      ],
      new Set(['english'])
    );

    expect(result.rows[0].issues).toContain('Duplicate subject name in this file.');
    expect(result.rows[1].issues).toContain('Duplicate subject name in this file.');
    expect(result.rows[2].issues).toContain('Subject already exists.');
  });

  it('reports invalid field values without discarding the preview row', () => {
    const result = parseSubjectImportMatrix(
      [headers, ['!', '', 'Unknown', 'blue', 'unknown', 'Enabled', 0, '']],
      new Set()
    );

    expect(result.rows).toHaveLength(1);
    expect(result.rows[0].issues).toEqual(
      expect.arrayContaining([
        'Subject name is invalid.',
        'Category is invalid.',
        'Color is invalid.',
        'Icon is invalid.',
        'Status is invalid.',
        'Sort order is invalid.',
      ])
    );
  });
});
