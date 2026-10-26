import type { PropsWithChildren } from 'react';

import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { hrPermissions } from 'src/constants/hr-menus';
import { act, renderHook } from '@testing-library/react';
import { it, vi, expect, describe, beforeEach } from 'vitest';

import { useHRPolicyWorkspace } from './useHRPolicyWorkspace';
import { defaultAttendanceForm } from '../hr-policy-workspace.constants';

const mocks = vi.hoisted(() => {
  const page = { items: [], totalCount: 0 };
  return {
    result: { currentData: page, data: page, isFetching: false, refetch: vi.fn() },
    assignments: vi.fn(),
    operational: vi.fn(),
    mutations: vi.fn(),
    resolution: vi.fn(),
  };
});

vi.mock('next/navigation', () => ({ useSearchParams: () => new URLSearchParams() }));
vi.mock('src/redux/hr/hr-policy-api', async (importOriginal) => {
  const original = await importOriginal<Record<string, unknown>>();
  return Object.fromEntries(
    Object.entries(original).map(([name, value]) => {
      if (!name.startsWith('use')) return [name, value];
      if (name.includes('Mutation') || name.startsWith('useLazy'))
        return [
          name,
          () => [
            vi.fn((args) => {
              mocks.mutations(name, args);
              return { unwrap: async () => ({ id: 'created' }) };
            }),
            { isLoading: false },
          ],
        ];
      return [
        name,
        (args: unknown, options: unknown) => {
          if (name === 'useGetHrPolicyAssignmentsQuery') mocks.assignments(args, options);
          if (name === 'useGetPolicyAssignmentResolutionPreviewQuery')
            mocks.resolution(args, options);
          return mocks.result;
        },
      ];
    })
  );
});
vi.mock('src/redux/hr/leaveApi', () => ({ useGetLeavePoliciesQuery: () => mocks.result }));
vi.mock('src/redux/hr/employeeApi', () => ({
  EMPLOYEE_LIST_MAX_PAGE_SIZE: 100,
  useGetEmployeeQuery: () => mocks.result,
}));
vi.mock('src/redux/calendar/GroupManagement/groupManagementApi', () => ({
  useGetGroupsQuery: () => mocks.result,
}));
vi.mock('src/redux/hr/hrOperationalTableApi', () => ({
  useHrOperationalTableQuery: (args: { table: string }, options: unknown) => {
    if (args.table === 'hr-policy-assignments') mocks.operational(args, options);
    return mocks.result;
  },
}));

function setup(year: string | undefined = 'year-1', previewGrant = false) {
  const store = configureStore({
    reducer: {
      globalState: (state: { currentYear?: { id: string } } | undefined, action) =>
        action.type === 'test/year'
          ? { currentYear: { id: String(action.payload) } }
          : (state ?? { currentYear: year ? { id: year } : undefined }),
      auth: () => ({
        permissions: [
          ...Object.values(hrPermissions.policies),
          ...(previewGrant ? [hrPermissions.policyActions.previewImpact] : []),
        ].map((name) => ({
          name,
          isGranted: true,
        })),
      }),
    },
  });
  const wrapper = ({ children }: PropsWithChildren) => (
    <Provider store={store}>{children}</Provider>
  );
  const hook = renderHook(
    () =>
      useHRPolicyWorkspace({
        focus: 'assignments',
        tabs: [{ value: 'assignments', label: 'Policy Assignments', icon: 'mdi:account' }],
      }),
    { wrapper }
  );
  return { ...hook, store };
}

beforeEach(() => vi.clearAllMocks());

describe('Policy Assignment query after advanced filter removal', () => {
  it('requires the exact preview grant and sends the scoped draft separately from persisted state', () => {
    const { result } = setup('year-1', true);
    expect(mocks.resolution.mock.lastCall?.[1]).toEqual({ skip: true });
    act(() => {
      result.current.openAssignmentDrawer();
      result.current.setAssignmentForm({
        targetType: 'group',
        targetKey: 'group-1',
        targetDisplayName: 'Synthetic group',
        payrollPolicyId: 'payroll-1',
        attendancePolicyId: 'attendance-1',
        leavePolicyId: 'leave-1',
        effectiveFrom: '2026-04-01',
        effectiveTo: '',
        priority: '100',
        assignmentReason: '',
        isActive: true,
      });
      result.current.setAssignmentSampleEmployeeId('staff-1');
    });
    expect(mocks.resolution.mock.lastCall).toEqual([
      expect.objectContaining({
        date: '2026-04-01',
        sampleEmployeeId: 'staff-1',
        assignment: expect.objectContaining({
          academicYearId: 'year-1',
          targetType: 'group',
          targetKey: 'group-1',
          priority: 100,
          effectiveTo: null,
        }),
      }),
      { skip: false },
    ]);
    act(() => result.current.setAssignmentForm((form) => ({ ...form, effectiveTo: '2026-03-31' })));
    expect(mocks.resolution.mock.lastCall?.[1]).toEqual({ skip: true });
  });
  it('saves the same custom attendance payload when advanced rules are hidden', async () => {
    const { result } = setup();
    act(() => {
      result.current.openAttendanceDrawer();
      result.current.setAttendanceForm({
        ...defaultAttendanceForm('calendar'),
        name: 'Synthetic custom rules',
        status: 'draft',
        graceTime: '7',
        maxLateAllowedPerMonth: '4',
        earlyExitEnabled: true,
        earlyExitGraceTime: '8',
        overtimeEnabled: true,
        overtimeRate: '1.5x',
        minOvertimeMinutes: '30',
        holidayWorkBehavior: 'both',
        payrollPreviewEnabled: false,
      });
      result.current.setAttendanceAdvancedMode(false);
    });
    await act(async () => {
      await result.current.saveAttendance();
    });
    expect(mocks.mutations).toHaveBeenCalledWith(
      'useCreateAttendancePolicyMutation',
      expect.objectContaining({
        graceTime: 7,
        maxLateAllowedPerMonth: 4,
        earlyExitEnabled: true,
        earlyExitGraceTime: 8,
        overtimeEnabled: true,
        overtimeRate: '1.5x',
        minOvertimeMinutes: 30,
        holidayWorkBehavior: 'both',
        payrollPreviewEnabled: false,
      })
    );
  });
  it('requests only academic scope, paging and normal search, including after paging and clearing search', () => {
    const { result } = setup();
    const expected = { academicYearId: 'year-1', maxResultCount: 20, skipCount: 0, search: '' };
    expect(result.current.assignmentListArgs).toEqual(expected);
    expect(mocks.assignments).toHaveBeenLastCalledWith(expected, { skip: false });

    act(() => result.current.setAssignmentPage({ number: 3, size: 20 }));
    expect(result.current.assignmentListArgs.skipCount).toBe(40);
    act(() => result.current.setAssignmentSearch('Teaching Staff'));
    expect(result.current.assignmentListArgs).toEqual({ ...expected, search: 'Teaching Staff' });
    act(() => result.current.setAssignmentPage({ number: 2, size: 10 }));
    expect(result.current.assignmentListArgs).toEqual({
      ...expected,
      maxResultCount: 10,
      skipCount: 10,
      search: 'Teaching Staff',
    });
    act(() => result.current.setAssignmentSearch(''));
    expect(result.current.assignmentListArgs).toEqual({ ...expected, maxResultCount: 10 });
  });

  it('retains independent visible column criteria and sorting without adding advanced query criteria', () => {
    const { result } = setup();
    act(() => result.current.setAssignmentPage({ number: 3, size: 20 }));
    act(() =>
      result.current.assignmentTableProps.onServerFilter!([
        {
          column: 'status',
          type: 'equals',
          value: 'Inactive',
          valueType: 'string',
          label: 'Status',
        },
      ])
    );
    act(() =>
      result.current.assignmentTableProps.onServerSort!('priority', [
        { column: 'priority', direction: 'desc' },
      ])
    );
    expect(result.current.assignmentPage.number).toBe(1);
    expect(mocks.operational.mock.lastCall?.[0]).toMatchObject({
      table: 'hr-policy-assignments',
      query: { academicYearId: 'year-1', maxResultCount: 20, skipCount: 0, search: '' },
      criteria: {
        search: '',
        filters: [{ column: 'status', type: 'equals', value: 'Inactive' }],
        sorts: [{ column: 'priority', direction: 'desc' }],
      },
    });
    act(() => result.current.assignmentTableProps.onServerFilter!([]));
    act(() => result.current.assignmentTableProps.onServerSort!('priority', []));
    expect(mocks.operational.mock.lastCall?.[1]).toMatchObject({ skip: true });
  });

  it('preserves the academic-year request guard and resets paging on scope changes', () => {
    const { result, store } = setup('');
    expect(mocks.assignments.mock.lastCall?.[1]).toEqual({ skip: true });
    expect(mocks.operational.mock.lastCall?.[1]).toMatchObject({ skip: true });
    act(() => result.current.setAssignmentPage({ number: 4, size: 20 }));
    act(() => store.dispatch({ type: 'test/year', payload: 'year-2' }));
    expect(result.current.assignmentListArgs).toEqual({
      academicYearId: 'year-2',
      maxResultCount: 20,
      skipCount: 0,
      search: '',
    });
  });
});
