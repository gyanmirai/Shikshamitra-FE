import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useFinanceAcademicFilters } from './useFinanceAcademicFilters';

const testState = vi.hoisted(() => ({
  currentYear: {
    id: 'year-1',
    boards: [{ id: 'board-1', educationMediums: [{ id: 'medium-1' }] }],
  },
  getClasses: vi.fn(),
}));

vi.mock('react-redux', () => ({
  useSelector: (selector: (state: unknown) => unknown) =>
    selector({ globalState: { currentYear: testState.currentYear } }),
}));

vi.mock('src/redux/customQueryAndMutation', () => ({
  default: () => [testState.getClasses, { data: [{ id: 'class-1', divisions: [{ id: 'division-1' }] }], isLoading: false }],
}));

vi.mock('src/redux/class/classApi', () => ({ useLazyGetClassByMediumQuery: vi.fn() }));

describe('finance academic filters', () => {
  beforeEach(() => {
    testState.currentYear = {
      id: 'year-1',
      boards: [{ id: 'board-1', educationMediums: [{ id: 'medium-1' }] }],
    };
    testState.getClasses.mockClear();
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
    expect(result.current.filterPayload).toMatchObject({ standardId: 'class-1', divisionId: 'division-1' });
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
});
