import { it, expect, describe } from 'vitest';

import {
  assignmentInput,
  houseWorkspaceState,
  selectionForContext,
} from './house-management-model';

describe('house workspace state', () => {
  it('accepts only peer tabs and bounded server paging', () => {
    expect(
      houseWorkspaceState(
        new URLSearchParams('tab=wrong&page=-1&pageSize=999&sort=studentName%20desc')
      )
    ).toEqual({ tab: 'houses', page: 0, pageSize: 25, search: '', sorting: 'name asc' });
    expect(
      houseWorkspaceState(
        new URLSearchParams('tab=students&page=2&pageSize=50&search=Riya&sort=studentName%20desc')
      )
    ).toEqual({
      tab: 'students',
      page: 2,
      pageSize: 50,
      search: 'Riya',
      sorting: 'studentName desc',
    });
  });
  it('clears checked students whenever academic or filter scope changes', () => {
    const selected = { context: 'english', ids: ['enrollment-1', 'enrollment-2'] };
    expect(selectionForContext(selected, 'english')).toEqual(selected.ids);
    expect(selectionForContext(selected, 'hindi')).toEqual([]);
  });
  it('serializes unique enrollment IDs and a null destination for removal', () => {
    expect(assignmentInput('medium', 'division', '', ['a', 'a', 'b'])).toEqual({
      academicMediumId: 'medium',
      divisionId: 'division',
      houseId: null,
      enrollmentIds: ['a', 'b'],
    });
  });
  it('requires a division and bounds the number of selected students', () => {
    expect(() => assignmentInput('medium', '', 'house', ['a'])).toThrow(
      'Select a division to change house membership.'
    );
    expect(() => assignmentInput('medium', 'division', 'house', [])).toThrow(
      'Select at least one student.'
    );
    expect(() =>
      assignmentInput(
        'medium',
        'division',
        'house',
        Array.from({ length: 501 }, (_, i) => String(i))
      )
    ).toThrow('Select up to 500 students per change.');
  });
});
