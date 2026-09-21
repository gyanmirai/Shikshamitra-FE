import { renderHook } from '@testing-library/react';
import { vi, it, expect, describe, beforeEach } from 'vitest';

import {
  useSubstitutionsDataQuery,
  getSubstitutionTabQueryOptions,
  shouldFetchTeacherAvailability,
  useTeacherAvailabilityDataQuery,
  useMySubstitutionDutiesDataQuery,
} from './substitutionManagement.hooks';

const useQueryAndMutationMock = vi.hoisted(() => vi.fn());

vi.mock('src/redux/customQueryAndMutation', () => ({
  default: useQueryAndMutationMock,
}));

describe('substitution management query hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useQueryAndMutationMock.mockReturnValue({ data: undefined, isLoading: false });
  });

  it('does not load teacher availability for the passive substitution board', () => {
    expect(shouldFetchTeacherAvailability('board', false)).toBe(false);
    expect(shouldFetchTeacherAvailability('myDuties', false)).toBe(false);
    expect(shouldFetchTeacherAvailability('availability', false)).toBe(true);
    expect(shouldFetchTeacherAvailability('board', true)).toBe(true);
  });

  it('keeps only the active tab query subscribed and forces a fresh request on every revisit', () => {
    expect(getSubstitutionTabQueryOptions('board', false)).toEqual({
      board: { skip: false, refetchOnMountOrArgChange: true },
      availability: { skip: true, refetchOnMountOrArgChange: true },
      myDuties: { skip: true, refetchOnMountOrArgChange: true },
    });
    expect(getSubstitutionTabQueryOptions('availability', false)).toEqual({
      board: { skip: true, refetchOnMountOrArgChange: true },
      availability: { skip: false, refetchOnMountOrArgChange: true },
      myDuties: { skip: true, refetchOnMountOrArgChange: true },
    });
    expect(getSubstitutionTabQueryOptions('myDuties', false)).toEqual({
      board: { skip: true, refetchOnMountOrArgChange: true },
      availability: { skip: true, refetchOnMountOrArgChange: true },
      myDuties: { skip: false, refetchOnMountOrArgChange: true },
    });
  });

  it('forwards active-tab lifecycle options to the board and duties queries', () => {
    const params = { fromDate: '2026-09-21', toDate: '2026-09-21' };
    const options = { skip: true, refetchOnMountOrArgChange: true };

    renderHook(() => useSubstitutionsDataQuery(params, options));
    renderHook(() => useMySubstitutionDutiesDataQuery(params, options));

    expect(useQueryAndMutationMock).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ type: 'query', params, options })
    );
    expect(useQueryAndMutationMock).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ type: 'query', params, options })
    );
  });

  it('forwards the passive-view skip guard to the teacher availability query', () => {
    renderHook(() =>
      useTeacherAvailabilityDataQuery(
        { fromDate: '2026-09-19', toDate: '2026-09-19' },
        { skip: true }
      )
    );

    expect(useQueryAndMutationMock).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'query',
        params: { fromDate: '2026-09-19', toDate: '2026-09-19' },
        options: { skip: true },
      })
    );
  });
});
