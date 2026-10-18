import { it, vi, expect, beforeEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { clearCachedAuthSession } from 'src/redux/session-cache';

import { useEmployeePolicyAccess } from './use-employee-policy-access';
import {
  STAFF_POLICY_REQUIREMENTS,
  STAFF_POLICY_REQUIREMENTS_BY_ACTION,
} from './employee-policy-access';

const mocks = vi.hoisted(() => ({
  state: {
    auth: {
      permissions: [] as { name: string; isGranted: boolean }[],
      user: { sub: 'staff-user' },
      permissionsInitialized: true,
    },
  },
  dispatch: vi.fn(),
  read: vi.fn(),
  payroll: vi.fn(),
  attendance: vi.fn(),
  leave: vi.fn(),
}));
vi.mock('react-redux', () => ({
  useSelector: (selector: (state: typeof mocks.state) => unknown) => selector(mocks.state),
  useDispatch: () => mocks.dispatch,
}));
vi.mock('src/redux/permission/permissionApi', () => ({
  useLazyGetPermissionsQuery: () => [mocks.read],
}));
vi.mock('src/redux/hr/leaveApi', () => ({ useGetLeavePoliciesQuery: mocks.leave }));
vi.mock('src/redux/hr/hr-policy-api', () => ({
  useGetPayrollPoliciesQuery: mocks.payroll,
  useGetAttendancePoliciesQuery: mocks.attendance,
}));

beforeEach(() => {
  vi.resetAllMocks();
  mocks.state.auth.permissions = [];
  mocks.state.auth.user = { sub: 'staff-user' };
  mocks.state.auth.permissionsInitialized = true;
  [mocks.payroll, mocks.attendance, mocks.leave].forEach((query) => {
    query.mockReturnValue({ isUninitialized: true });
  });
});

it('blocks a delegated creator before sending unauthorized policy lookups', () => {
  const { result } = renderHook(() => useEmployeePolicyAccess('year', true));
  expect(result.current.blocked).toBe(true);
  expect(result.current.requirements).toHaveLength(4);
  [mocks.payroll, mocks.attendance, mocks.leave].forEach((query) => {
    expect(query).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ skip: true }));
  });
});

it('loads default policies for the backend catalogue grants without a false leave-policy blocker', () => {
  mocks.state.auth.permissions = [
    'HR.Policies.View',
    'HR.LeaveManagement.Setting.LeavePolicy.View',
    'HR.Policies.Assign',
    'HR.Policies.PreviewImpact',
  ].map((name) => ({ name, isGranted: true }));
  const { result } = renderHook(() => useEmployeePolicyAccess('year', true));

  expect(result.current.blocked).toBe(false);
  expect(result.current.requirements).toEqual([]);
  [mocks.payroll, mocks.attendance, mocks.leave].forEach((query) => {
    expect(query).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ skip: false }));
  });
});

it('does not impose creation policy prerequisites on staff editing', () => {
  const { result } = renderHook(() => useEmployeePolicyAccess('year', false));
  expect(result.current.blocked).toBe(false);
  expect(result.current.requirements).toEqual([]);
  expect(mocks.payroll).toHaveBeenCalledWith(
    expect.anything(),
    expect.objectContaining({ skip: true })
  );
});

it('classifies a revoked server read grant as access denied even with a stale local grant', () => {
  mocks.state.auth.permissions = STAFF_POLICY_REQUIREMENTS.map(({ name }) => ({
    name,
    isGranted: true,
  }));
  mocks.leave.mockReturnValue({ error: { status: 403 } });
  const { result } = renderHook(() => useEmployeePolicyAccess('year', true));
  expect(result.current.blocked).toBe(true);
  expect(result.current.requirements).toEqual([
    STAFF_POLICY_REQUIREMENTS_BY_ACTION.viewLeavePolicies,
  ]);
});

it('preserves the permission blocker when its refresh fails', async () => {
  mocks.read.mockReturnValue({ unwrap: () => Promise.reject(new Error('offline')) });
  const { result } = renderHook(() => useEmployeePolicyAccess('year', true));
  await act(() => result.current.checkAccess());
  expect(mocks.read).toHaveBeenCalledWith({ providerName: 'U', providerKey: 'staff-user' }, false);
  expect(mocks.dispatch).not.toHaveBeenCalled();
  expect(result.current.blocked).toBe(true);
  expect(result.current.refreshError).toContain('Access could not be checked');
});

it('refreshes only the signed-in user’s effective grants and never writes permission changes', async () => {
  const permissions = STAFF_POLICY_REQUIREMENTS.map(({ name }) => ({ name, isGranted: true }));
  mocks.read.mockReturnValue({ unwrap: async () => ({ groups: [{ permissions }] }) });
  const { result } = renderHook(() => useEmployeePolicyAccess('year', true));
  await act(() => result.current.checkAccess());
  expect(mocks.dispatch).toHaveBeenCalledExactlyOnceWith({
    type: 'auth/setPermissions',
    payload: permissions,
  });
});

it('handles only the policy-specific submission denial and keeps unrelated errors with their owner', () => {
  mocks.state.auth.permissions = STAFF_POLICY_REQUIREMENTS.map(({ name }) => ({
    name,
    isGranted: true,
  }));
  const { result } = renderHook(() => useEmployeePolicyAccess('year', true));
  expect(result.current.handleSubmitError({ status: 403 })).toBe(false);
  act(() => {
    expect(
      result.current.handleSubmitError({
        status: 403,
        data: {
          errorCode: 'HR:Employee:010043',
          data: { missingPermissions: ['HR.Policies.Assign'] },
        },
      })
    ).toBe(true);
  });
  expect(result.current.blocked).toBe(true);
  expect(result.current.requirements).toEqual([STAFF_POLICY_REQUIREMENTS_BY_ACTION.assignPolicies]);
});

it.each(['account change', 'session invalidation', 'unmount'] as const)(
  'does not apply a permission response after %s',
  async (change) => {
    let finish!: (value: unknown) => void;
    const pending = new Promise((resolve) => {
      finish = resolve;
    });
    mocks.read.mockReturnValue({ unwrap: () => pending });
    const { result, rerender, unmount } = renderHook(() => useEmployeePolicyAccess('year', true));
    let checking!: Promise<void>;
    act(() => {
      checking = result.current.checkAccess();
    });
    if (change === 'account change') {
      mocks.state.auth.user = { sub: 'another-user' };
      rerender();
    } else if (change === 'session invalidation') {
      clearCachedAuthSession();
    } else {
      unmount();
    }
    await act(async () => {
      finish({
        groups: [
          { permissions: STAFF_POLICY_REQUIREMENTS.map(({ name }) => ({ name, isGranted: true })) },
        ],
      });
      await checking;
    });
    expect(mocks.dispatch).not.toHaveBeenCalled();
    if (change !== 'unmount') expect(result.current.checking).toBe(false);
  }
);
