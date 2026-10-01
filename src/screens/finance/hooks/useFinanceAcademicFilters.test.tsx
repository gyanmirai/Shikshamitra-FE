import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useFinanceAcademicFilters } from './useFinanceAcademicFilters';

const testState = vi.hoisted(() => ({
  currentYear: {
    id: 'year-1',
    boards: [{ id: 'board-1', educationMediums: [{ id: 'medium-1' }] }],
  },
}));

vi.mock('react-redux', () => ({
  useSelector: (selector: (state: unknown) => unknown) =>
    selector({ globalState: { currentYear: testState.currentYear } }),
}));

vi.mock('src/redux/customQueryAndMutation', () => ({
  default: () => ({
    currentData: [{ id: 'class-1', divisions: [{ id: 'division-1' }] }],
    isFetching: false,
  }),
}));

vi.mock('src/redux/class/classApi', () => ({ useGetClassByMediumQuery: vi.fn() }));

describe('finance academic filters', () => {
  beforeEach(() => {
    testState.currentYear = {
      id: 'year-1',
      boards: [{ id: 'board-1', educationMediums: [{ id: 'medium-1' }] }],
    };
  });

  it('keeps class and division when the same academic year refreshes', () => {
    const { result, rerender } = renderHook(() => useFinanceAcademicFilters());
    act(() => {
      result.current.setSelectedStandardId('class-1');
      result.current.setSelectedDivisionId('division-1');
    });

    testState.currentYear = {
      id: 'year-1',
      boards: [{ id: 'board-1', educationMediums: [{ id: 'medium-1' }] }],
    };
    rerender();

    expect(result.current.selectedStandardId).toBe('class-1');
    expect(result.current.selectedDivisionId).toBe('division-1');
    expect(result.current.filterPayload).toMatchObject({
      standardId: 'class-1',
      divisionId: 'division-1',
    });
  });

  it('clears class and division when the academic year changes', () => {
    const { result, rerender } = renderHook(() => useFinanceAcademicFilters());
    act(() => {
      result.current.setSelectedStandardId('class-1');
      result.current.setSelectedDivisionId('division-1');
    });

    testState.currentYear = {
      id: 'year-2',
      boards: [{ id: 'board-1', educationMediums: [{ id: 'medium-1' }] }],
    };
    rerender();

    expect(result.current.selectedStandardId).toBe('All Classes');
    expect(result.current.selectedDivisionId).toBe('All Divisions');
  });

  it('clears the division while preserving the selected class when selecting another class', () => {
    const { result } = renderHook(() => useFinanceAcademicFilters());
    act(() => {
      result.current.setSelectedStandardId('class-1');
      result.current.setSelectedDivisionId('division-1');
    });
    act(() => {
      result.current.setSelectedStandardId('class-2');
    });
    expect(result.current.selectedStandardId).toBe('class-2');
    expect(result.current.selectedDivisionId).toBe('All Divisions');
    expect(result.current.filterPayload).toMatchObject({ standardId: 'class-2' });
    expect(result.current.filterPayload).not.toHaveProperty('divisionId');
  });

  it('clears class and division when the medium changes', () => {
    testState.currentYear.boards[0].educationMediums.push({ id: 'medium-2' });
    const { result } = renderHook(() => useFinanceAcademicFilters());
    act(() => {
      result.current.setSelectedStandardId('class-1');
      result.current.setSelectedDivisionId('division-1');
    });
    act(() => {
      result.current.setSelectedMedium('medium-2');
    });
    expect(result.current.selectedStandardId).toBe('All Classes');
    expect(result.current.selectedDivisionId).toBe('All Divisions');
    expect(result.current.filterPayload).toMatchObject({ educationMediumId: 'medium-2' });
    expect(result.current.filterPayload).not.toHaveProperty('standardId');
    expect(result.current.filterPayload).not.toHaveProperty('divisionId');
  });
});
