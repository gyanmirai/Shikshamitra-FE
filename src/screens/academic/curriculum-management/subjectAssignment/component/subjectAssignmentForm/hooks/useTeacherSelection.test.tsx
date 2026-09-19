import { act, waitFor, renderHook } from '@testing-library/react';
import { it, vi, expect, describe, beforeEach } from 'vitest';

import { useTeacherSelection } from './useTeacherSelection';

const employeeApiMocks = vi.hoisted(() => ({
  useLazyGetEmployeeQuery: vi.fn(),
  useLazyGetEmployeeByIdQuery: vi.fn(),
}));

vi.mock('src/redux/hr/employeeApi', () => employeeApiMocks);

describe('useTeacherSelection', () => {
  const teacherSearch = vi.fn();
  const getEmployeeById = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    employeeApiMocks.useLazyGetEmployeeQuery.mockReturnValue([teacherSearch]);
    employeeApiMocks.useLazyGetEmployeeByIdQuery.mockReturnValue([getEmployeeById]);
    teacherSearch.mockReturnValue({
      unwrap: () =>
        Promise.resolve({
          currentPage: 1,
          totalPages: 1,
          items: [
            { id: 'teacher-1', fullName: 'Jay Dalia', employeeIdentifier: 'TEA150001' },
          ],
        }),
    });
    getEmployeeById.mockImplementation((id: string) => ({
      unwrap: () =>
        Promise.resolve({ id, fullName: 'Jay Dalia', employeeIdentifier: 'TEA150001' }),
    }));
  });

  it('requests active teaching employees and displays code with name', async () => {
    const { result } = renderHook(() => useTeacherSelection({ teacherIds: [] }));

    await act(async () => {
      const response = await result.current.fetchTeacherOptions('jay', 2);
      expect(response.data).toEqual([
        {
          id: 'teacher-1',
          name: 'Jay Dalia',
          employeeCode: 'TEA150001',
          label: 'TEA150001 - Jay Dalia',
        },
      ]);
    });

    expect(teacherSearch).toHaveBeenCalledWith({
      search: 'jay',
      page: 2,
      isTeaching: true,
      status: 'Active',
    });
  });

  it('hydrates every selected teacher with the same code-name label', async () => {
    const { result } = renderHook(() =>
      useTeacherSelection({ teacherIds: ['teacher-1', 'teacher-2'] })
    );

    await waitFor(() => expect(result.current.teacherObjs).toHaveLength(2));

    expect(getEmployeeById).toHaveBeenCalledWith('teacher-1');
    expect(getEmployeeById).toHaveBeenCalledWith('teacher-2');
    expect(result.current.teacherObjs[0].label).toBe('TEA150001 - Jay Dalia');
  });
});
