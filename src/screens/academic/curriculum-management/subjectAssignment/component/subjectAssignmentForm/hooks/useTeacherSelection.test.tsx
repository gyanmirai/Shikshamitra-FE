import { act, renderHook } from '@testing-library/react';
import { it, vi, expect, describe, beforeEach } from 'vitest';

import { useTeacherSelection } from './useTeacherSelection';

const employeeApiMocks = vi.hoisted(() => ({
  useLazyGetEmployeeQuery: vi.fn(),
  useLazyGetEmployeeByIdQuery: vi.fn(),
}));

vi.mock('src/redux/hr/employeeApi', () => employeeApiMocks);

describe('useTeacherSelection', () => {
  const primarySearch = vi.fn();
  const secondarySearch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    employeeApiMocks.useLazyGetEmployeeQuery
      .mockReturnValueOnce([primarySearch])
      .mockReturnValueOnce([secondarySearch]);
    employeeApiMocks.useLazyGetEmployeeByIdQuery.mockReturnValue([vi.fn()]);
    primarySearch.mockReturnValue({
      unwrap: () => Promise.resolve({ currentPage: 1, totalPages: 1, items: [] }),
    });
    secondarySearch.mockReturnValue({
      unwrap: () => Promise.resolve({ currentPage: 1, totalPages: 1, items: [] }),
    });
  });

  it('requests only active teaching employees for both teacher selectors', async () => {
    const { result } = renderHook(() =>
      useTeacherSelection({ primaryTeacherId: '', secondaryTeacherIds: [] })
    );

    await act(async () => {
      await result.current.fetchPrimaryTeacherOptions('akshay', 2);
      await result.current.fetchSecondaryTeacherOptions('hiren', 3);
    });

    expect(primarySearch).toHaveBeenCalledWith({
      search: 'akshay',
      page: 2,
      isTeaching: true,
      status: 'Active',
    });
    expect(secondarySearch).toHaveBeenCalledWith({
      search: 'hiren',
      page: 3,
      isTeaching: true,
      status: 'Active',
    });
  });
});
