import { it, expect, describe } from 'vitest';
import { studentDirectoryQueryParams } from 'src/redux/student/records/student-directory-query';

import {
  directoryTableFilters,
  directoryColumnFilters,
  serializeDirectoryFilters,
} from './student-directory-column-filters';

describe('Student List column filter contract', () => {
  it('round trips text, numeric ranges, and statuses through URL state and the model-bound API query', () => {
    const filters = [
      { column: 'name', type: 'contains', value: 'Riya & Shah', valueType: 'string' },
      { column: 'rollNo', type: 'between', value: { min: 0, max: 15 }, valueType: 'number' },
      { column: 'status', type: 'equals', value: 6, valueType: 'enum' },
    ];
    const criteria = directoryColumnFilters(serializeDirectoryFilters(filters)!);
    const params = studentDirectoryQueryParams({
      academicYearId: 'year',
      boardIds: ['board-a', 'board-b'],
      skipCount: 0,
      columnFilters: criteria,
    });
    expect(params.get('columnFilters[0].value')).toBe('Riya & Shah');
    expect(params.get('columnFilters[1].min')).toBe('0');
    expect(params.get('columnFilters[1].max')).toBe('15');
    expect(params.get('columnFilters[2].value')).toBe('6');
    expect(params.getAll('boardIds')).toEqual(['board-a', 'board-b']);
    expect(params.get('columnFilters')).toBeNull();
    expect(directoryTableFilters(criteria)[2]).toMatchObject({
      value: '6',
      displayValue: 'Active',
      label: 'Status',
      valueType: 'enum',
    });
    expect(serializeDirectoryFilters(directoryTableFilters(criteria))).toBe(
      serializeDirectoryFilters(filters)
    );
  });

  it('rejects malformed URL state, Actions, invalid operators, statuses, and numeric ranges', () => {
    expect(directoryColumnFilters('{broken')).toEqual([]);
    expect(
      directoryColumnFilters(
        JSON.stringify([
          { column: 'actions', operator: 'contains', value: 'view' },
          { column: 'name', operator: 'greaterThan', value: 'Riya' },
          { column: 'status', operator: 'equals', value: '9' },
          { column: 'rollNo', operator: 'equals', value: 'NaN' },
          { column: 'rollNo', operator: 'between', min: 20, max: 10 },
        ])
      )
    ).toEqual([]);
    expect(serializeDirectoryFilters([])).toBeUndefined();
  });
});
