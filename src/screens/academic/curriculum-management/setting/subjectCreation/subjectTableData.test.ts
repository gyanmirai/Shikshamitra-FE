import { it, expect, describe } from 'vitest';
import { matchesTableRowSearch } from 'src/components/customizabaleTable/hooks/table-row-search';
import { matchesTableRowFilters } from 'src/components/customizabaleTable/hooks/table-row-filter';

import { getSubjectTableRows, getSubjectNameSearchValue } from './subjectTableData';

import type { ISubject } from './type';

const choir: ISubject = {
  id: 'school-choir',
  name: 'Senior Choir',
  displayName: 'School Choir',
  category: 'Activity',
  color: '#8E24AA',
  status: 1,
  lastUpdatedAt: '2026-10-22T10:00:00Z',
};

describe('subject table status filters', () => {
  it.each([
    [0, 'Active'],
    [1, 'Inactive'],
    [2, 'Archived'],
    ['Active', 'Active'],
    ['Inactive', 'Inactive'],
    ['Archived', 'Archived'],
    [undefined, 'Active'],
  ] as const)('matches API status %s with the %s filter', (status, label) => {
    const source = { ...choir, status };
    const [row] = getSubjectTableRows([source]);
    ['Active', 'Inactive', 'Archived'].forEach((option) => {
      expect(
        matchesTableRowFilters(
          row,
          [{ column: 'status', type: 'equals', value: option, valueType: 'enum' }],
          [{ id: 'status', label: 'Status' }]
        )
      ).toBe(option === label);
    });
    expect(source.status).toBe(status);
    expect(row).toEqual({ ...source, status: label });
  });

  it('handles the list before the query returns', () => {
    expect(getSubjectTableRows()).toEqual([]);
  });
});

describe('subject table search', () => {
  const columns = [
    { id: 'name', label: 'Subject', searchValue: getSubjectNameSearchValue },
    { id: 'category', label: 'Category' },
    { id: 'status', label: 'Status' },
    { id: 'lastUpdatedAt', label: 'Last Updated' },
  ];
  const visible = Object.fromEntries(columns.map((column) => [column.id, true]));
  const [row] = getSubjectTableRows([choir]);

  it.each(['school choir', 'school', 'senior', 'activity', 'inactive', '22-10-2026'])(
    'finds the subject by %s without losing existing column search',
    (query) => {
      expect(matchesTableRowSearch(row, columns, visible, query)).toBe(true);
    }
  );

  it('does not search hidden subject identity or unrelated fields', () => {
    expect(matchesTableRowSearch(row, columns, { ...visible, name: false }, 'school')).toBe(false);
    expect(matchesTableRowSearch(row, columns, visible, 'not a subject')).toBe(false);
    expect(getSubjectNameSearchValue(undefined, {})).toBe(' ');
  });
});
