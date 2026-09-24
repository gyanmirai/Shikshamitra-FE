import type { Medium } from 'src/types/school';

import { renderHook } from '@testing-library/react';
import { vi, it, expect, describe, beforeEach } from 'vitest';

import { useClassShiftData } from './useClassShiftData';

const { queryMock } = vi.hoisted(() => ({ queryMock: vi.fn() }));

vi.mock('src/redux/customQueryAndMutation', () => ({ default: queryMock }));
vi.mock('src/redux/class/classApi', () => ({ useGetClassByMediumQuery: vi.fn() }));

const medium = {
  id: 'medium-1',
  educationMediumStages: [],
} as unknown as Medium;

describe('useClassShiftData', () => {
  beforeEach(() => queryMock.mockReset());

  it('reports background refetching as a class timing loading state', () => {
    queryMock.mockReturnValue({ data: [], isLoading: false, isFetching: true });

    const { result } = renderHook(() => useClassShiftData(medium));

    expect(result.current.isClassTimingLoading).toBe(true);
  });

  it('clears the timing loading state after fresh class data arrives', () => {
    queryMock.mockReturnValue({ data: [], isLoading: false, isFetching: false });

    const { result } = renderHook(() => useClassShiftData(medium));

    expect(result.current.isClassTimingLoading).toBe(false);
  });
});
