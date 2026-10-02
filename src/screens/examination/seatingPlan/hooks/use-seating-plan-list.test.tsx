import { act, renderHook } from '@testing-library/react';
import { vi, it, expect, describe, beforeEach } from 'vitest';

import { useSeatingPlanList } from './use-seating-plan-list';
import {
  buildSeatingPlanListUrl,
  buildSeatingPlanSetupUrl,
} from '../utils/seating-plan-navigation';

const mocks = vi.hoisted(() => ({ query: '', replace: vi.fn(), request: vi.fn() }));
const schoolState = vi.hoisted(() => ({
  globalState: {
    currentMedium: {
      educationMediumStages: [
        {
          standards: [
            { id: 'nursery', name: 'Nursery' },
            { id: 'class-1', name: 'Class 1' },
          ],
        },
      ],
    },
  },
  auth: { permissions: [] },
}));
vi.mock('react-redux', () => ({
  useSelector: (select: (state: typeof schoolState) => unknown) => select(schoolState),
}));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mocks.replace }),
  useSearchParams: () => new URLSearchParams(mocks.query),
}));
vi.mock('src/redux/customQueryAndMutation', () => ({
  default: (args: unknown) => {
    mocks.request(args);
    return { data: { items: [] }, isLoading: false, isFetching: false };
  },
}));
vi.mock('src/redux/academicAPI/ExaminationApi/ScheduleExamApi/seat-allocationApi', () => ({
  useGetSeatAllocationTableDataQuery: vi.fn(),
}));

describe('seating list navigation context', () => {
  beforeEach(() => {
    mocks.query = '';
    mocks.request.mockClear();
    mocks.replace.mockReset().mockImplementation((url: string) => {
      mocks.query = url.split('?')[1] || '';
    });
  });

  it('restores the previous class and status on return instead of selecting the first class', () => {
    mocks.query = 'standardId=class-1&status=ready-for-review';
    const { result } = renderHook(() => useSeatingPlanList());
    expect(result.current.selectedClassId).toBe('class-1');
    expect(result.current.activeSummaryFilter).toBe('ready-for-review');
    expect(mocks.request.mock.lastCall?.[0].params.standardId).toBe('class-1');
  });

  it('persists class changes and restores them after the list unmounts', () => {
    const first = renderHook(() => useSeatingPlanList());
    act(() => first.result.current.setSelectedClassId('class-1'));
    first.rerender();
    act(() => first.result.current.setActiveSummaryFilter('in-progress'));
    first.unmount();
    const restored = renderHook(() => useSeatingPlanList());
    expect(restored.result.current.selectedClassId).toBe('class-1');
    expect(restored.result.current.activeSummaryFilter).toBe('in-progress');
    act(() => restored.result.current.setSelectedClassId('nursery'));
    restored.rerender();
    expect(restored.result.current.activeSummaryFilter).toBeNull();
    expect(restored.result.current.selectedClassId).toBe('nursery');
  });

  it('falls back to an available class if the returned class no longer belongs to this context', () => {
    mocks.query = 'standardId=class-from-another-medium';
    const { result } = renderHook(() => useSeatingPlanList());
    expect(result.current.selectedClassId).toBe('nursery');
    expect(mocks.request.mock.lastCall?.[0].params.standardId).toBe('nursery');
  });

  it('carries only list context between list and setup, excluding workflow-only parameters', () => {
    expect(buildSeatingPlanSetupUrl('exam-1', 'class-1', 'in-progress')).toBe(
      '/academic/seatallocation/exam-1/setup?standardId=class-1&status=in-progress&step=0'
    );
    expect(buildSeatingPlanListUrl('class-1', 'in-progress')).toBe(
      '/academic/seatallocation?standardId=class-1&status=in-progress'
    );
    expect(buildSeatingPlanListUrl('class-1', 'all')).toBe(
      '/academic/seatallocation?standardId=class-1'
    );
  });
});
