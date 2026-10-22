import { it, expect, describe } from 'vitest';

import { matchesTableRowSearch } from './table-row-search';

describe('restricted table search', () => {
  const row = { name: 'Aarav Shah', rollNo: 12, grNo: 'GR-431', remarks: 'Medical leave' };
  const fields = ['name', 'rollNo', 'grNo'];

  it('matches student name, roll number and GR number across the full row', () => {
    expect(matchesTableRowSearch(row, [], {}, 'aarav', fields)).toBe(true);
    expect(matchesTableRowSearch(row, [], {}, '12', fields)).toBe(true);
    expect(matchesTableRowSearch(row, [], {}, 'gr-431', fields)).toBe(true);
  });

  it('does not match unrelated attendance details', () => {
    expect(matchesTableRowSearch(row, [], {}, 'medical', fields)).toBe(false);
  });
});

describe('column search values', () => {
  const row = { name: 'Choir', displayName: 'School Choir', category: 'Activity' };
  const columns = [
    { id: 'name', label: 'Subject', searchValue: () => 'School Choir' },
    { id: 'category', label: 'Category' },
  ];

  it('matches custom cell text case insensitively while preserving other visible columns', () => {
    expect(matchesTableRowSearch(row, columns, { name: true }, 'school choir')).toBe(true);
    expect(matchesTableRowSearch(row, columns, { name: true, category: true }, 'activity')).toBe(true);
    expect(matchesTableRowSearch(row, columns, { name: false }, 'school choir')).toBe(false);
  });

  it('preserves an explicit restricted field list', () => {
    expect(matchesTableRowSearch(row, columns, { name: true }, 'school', ['category'])).toBe(false);
  });
});
