import { renderHook } from '@testing-library/react';
import { vi, it, expect, describe, beforeEach } from 'vitest';

import {
  shouldFetchTeacherAvailability,
  useTeacherAvailabilityDataQuery,
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
    expect(shouldFetchTeacherAvailability('duties', false)).toBe(false);
    expect(shouldFetchTeacherAvailability('availability', false)).toBe(true);
    expect(shouldFetchTeacherAvailability('board', true)).toBe(true);
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
