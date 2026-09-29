import { it, vi, expect, describe } from 'vitest';
import { act, renderHook } from '@testing-library/react';

import { useStudentAcademic360List } from './useStudentAcademic360List';

const query = vi.hoisted(() => vi.fn(() => ({ currentData: undefined, isFetching: false })));

vi.mock('src/redux/academicAPI/StudentAcademic360Api/studentAcademic360Api', () => ({
  useGetStudentAcademic360ListQuery: query,
}));

const scope = {
  academicYearId: 'year-1',
  boardId: 'board-1',
  educationMediumId: 'medium-1',
};

describe('Student Academic 360 list request', () => {
  it('loads one scoped page and resets pagination for a new filter or search', () => {
    const { result } = renderHook(() => useStudentAcademic360List(scope));

    expect(query).toHaveBeenLastCalledWith(
      expect.objectContaining({
        ...scope,
        skipCount: 0,
        maxResultCount: 10,
        smartFilter: 0,
      }),
      { skip: false }
    );

    act(() => result.current.changePagination(3, 25));
    expect(query).toHaveBeenLastCalledWith(
      expect.objectContaining({ skipCount: 50, maxResultCount: 25 }),
      { skip: false }
    );

    act(() => result.current.changeFilter('needsAttention'));
    expect(query).toHaveBeenLastCalledWith(
      expect.objectContaining({ skipCount: 0, smartFilter: 1 }),
      { skip: false }
    );

    act(() => result.current.changeSearch('Aadhya'));
    expect(query).toHaveBeenLastCalledWith(
      expect.objectContaining({ skipCount: 0, searchTerm: 'Aadhya' }),
      { skip: false }
    );
  });

  it('sends selected division and sorting while skipping an incomplete context', () => {
    const { result, rerender } = renderHook(
      ({ context }) => useStudentAcademic360List(context),
      { initialProps: { context: { ...scope, standardId: 'class-1', divisionId: 'division-1' } } }
    );

    act(() => result.current.changeSort('name', [{ column: 'name', direction: 'desc' }]));
    expect(query).toHaveBeenLastCalledWith(
      expect.objectContaining({ standardId: 'class-1', divisionId: 'division-1', sorting: 'name desc' }),
      { skip: false }
    );

    rerender({ context: { ...scope, academicYearId: '', standardId: 'class-1', divisionId: 'division-1' } });
    expect(query).toHaveBeenLastCalledWith(expect.any(Object), { skip: true });
  });
});
