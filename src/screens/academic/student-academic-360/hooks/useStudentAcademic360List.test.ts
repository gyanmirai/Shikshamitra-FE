import { act, renderHook } from '@testing-library/react';
import { vi, it, expect, describe, beforeEach } from 'vitest';

import { useStudentAcademic360List } from './useStudentAcademic360List';

import type { AcademicSmartFilter } from '../listUtils';

const { queryMock, refetchMock } = vi.hoisted(() => ({
  queryMock: vi.fn(),
  refetchMock: vi.fn(),
}));

const state = {
  globalState: {
    currentYear: { id: 'year-1' },
    currentBoard: { id: 'board-1' },
    currentMedium: { id: 'medium-1' },
  },
};

vi.mock('react-redux', () => ({
  useSelector: (selector: (value: typeof state) => unknown) => selector(state),
}));

vi.mock('src/redux/academicAPI/StudentAcademic360Api/studentAcademic360Api', () => ({
  useGetStudentAcademic360ListQuery: queryMock,
}));

describe('useStudentAcademic360List', () => {
  beforeEach(() => {
    queryMock.mockReset();
    refetchMock.mockReset();
    queryMock.mockReturnValue({
      currentData: {
        items: [],
        totalCount: 90,
        summary: {
          totalStudents: 90,
          needsAttention: 4,
          averageAttendance: 80,
          homeworkCompletion: 70,
          averageExamScore: 75,
        },
      },
      isLoading: false,
      isFetching: false,
      isError: false,
      refetch: refetchMock,
    });
  });

  it('uses one scoped list query for all classes instead of one query per division', () => {
    const { result } = renderHook(() => useStudentAcademic360List('ALL', 'ALL', 'all'));

    expect(queryMock).toHaveBeenCalledTimes(1);
    expect(queryMock).toHaveBeenLastCalledWith(
      expect.objectContaining({
        academicYearId: 'year-1',
        boardId: 'board-1',
        educationMediumId: 'medium-1',
        standardId: undefined,
        divisionId: undefined,
        smartFilter: 'All',
        skipCount: 0,
        maxResultCount: 10,
      }),
      { skip: false }
    );
    expect(result.current.totalCount).toBe(90);
    expect(result.current.summary.needsAttention).toBe(4);
  });

  it('updates server paging, search, sorting and smart-filter arguments', () => {
    const { result, rerender } = renderHook(
      ({ filter }: { filter: AcademicSmartFilter }) =>
        useStudentAcademic360List('standard-1', 'division-1', filter),
      { initialProps: { filter: 'all' } as { filter: AcademicSmartFilter } }
    );

    act(() => result.current.handlePagination(2, 25));
    expect(queryMock.mock.calls.at(-1)?.[0]).toEqual(
      expect.objectContaining({ skipCount: 25, maxResultCount: 25 })
    );

    act(() => result.current.handleSearch('Riya'));
    expect(queryMock.mock.calls.at(-1)?.[0]).toEqual(
      expect.objectContaining({ searchTerm: 'Riya', skipCount: 0 })
    );

    act(() =>
      result.current.handleSort('attendance.percentage', [
        { column: 'attendance.percentage', direction: 'desc' },
      ])
    );
    expect(queryMock.mock.calls.at(-1)?.[0]).toEqual(
      expect.objectContaining({ sorting: 'attendance.percentage desc' })
    );

    rerender({ filter: 'lowAttendance' });
    expect(queryMock.mock.calls.at(-1)?.[0]).toEqual(
      expect.objectContaining({ smartFilter: 'LowAttendance' })
    );
  });
});
