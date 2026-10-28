import type { PropsWithChildren } from 'react';

import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { it, vi, expect, beforeEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { hrLeavePolicyPermissions } from 'src/constants/hr-policy-permissions';

import { useHRPolicyWorkspace } from './useHRPolicyWorkspace';

const mocks = vi.hoisted(() => ({
  error: undefined as unknown,
  mutation: vi.fn(),
  empty: { currentData: { items: [], totalCount: 0 }, isFetching: false, refetch: vi.fn() },
}));
const version = {
  id: 'version',
  policyType: 'leave',
  policyId: 'policy',
  versionNumber: 2,
  name: 'Recorded leave',
  changeAction: 'edited',
};
vi.mock('next/navigation', () => ({ useSearchParams: () => new URLSearchParams() }));
vi.mock('src/redux/hr/hr-policy-api', async (importOriginal) => {
  const original = await importOriginal<Record<string, unknown>>();
  return Object.fromEntries(
    Object.entries(original).map(([name, value]) => {
      if (!name.startsWith('use')) return [name, value];
      if (name.includes('Mutation') || name.startsWith('useLazy'))
        return [name, () => [mocks.mutation, { isLoading: false }]];
      return [
        name,
        () => {
          if (name === 'useGetPolicyVersionsQuery')
            return {
              ...mocks.empty,
              currentData: { items: [version], totalCount: 1 },
              error: mocks.error,
            };
          if (name === 'useComparePolicyVersionsQuery')
            return { currentData: { differences: [{ fieldKey: 'private' }] }, error: mocks.error };
          if (name === 'useGetPolicyRestorePreviewQuery')
            return { currentData: { warnings: [], blockingWarnings: [] } };
          return mocks.empty;
        },
      ];
    })
  );
});
vi.mock('src/redux/hr/leaveApi', () => ({
  useGetLeavePoliciesQuery: () => mocks.empty,
  leaveApi: { util: { invalidateTags: vi.fn() } },
}));
vi.mock('src/redux/hr/employeeApi', () => ({
  EMPLOYEE_LIST_MAX_PAGE_SIZE: 100,
  useGetEmployeeQuery: () => mocks.empty,
}));
vi.mock('src/redux/calendar/GroupManagement/groupManagementApi', () => ({
  useGetGroupsQuery: () => mocks.empty,
}));
vi.mock('src/redux/hr/hrOperationalTableApi', () => ({
  useHrOperationalTableQuery: () => mocks.empty,
}));

function setup() {
  const grants = [hrLeavePolicyPermissions.view, hrLeavePolicyPermissions.create].map((name) => ({
    name,
    isGranted: true,
  }));
  const store = configureStore({
    reducer: {
      auth: (state: { permissions: typeof grants } | undefined, action) =>
        action.type === 'test/revoke'
          ? { permissions: grants.filter((x) => x.name !== hrLeavePolicyPermissions.view) }
          : (state ?? { permissions: grants }),
      globalState: (state: { currentYear: { id: string } } | undefined, action) =>
        action.type === 'test/year'
          ? { currentYear: { id: 'other' } }
          : (state ?? { currentYear: { id: 'year' } }),
    },
  });
  const wrapper = ({ children }: PropsWithChildren) => (
    <Provider store={store}>{children}</Provider>
  );
  const hook = renderHook(
    () =>
      useHRPolicyWorkspace({
        focus: 'leave',
        tabs: [{ value: 'leave', label: 'Leave', icon: 'mdi:leaf' }],
      }),
    { wrapper }
  );
  act(() =>
    hook.result.current.setVersionTarget({
      policyType: 'leave',
      policyId: 'policy',
      policyName: 'Recorded leave',
    })
  );
  act(() =>
    hook.result.current.setRestoreVersion({
      version: version as any,
      name: 'Draft',
      reason: 'Restore',
    })
  );
  return { ...hook, store };
}
beforeEach(() => {
  mocks.error = undefined;
  vi.clearAllMocks();
});

it.each(['403', 'revoked'] as const)(
  'clears populated leave versions, comparison and selected restore after %s',
  async (failure) => {
    const hook = setup();
    expect(hook.result.current.versionHistory?.items).toHaveLength(1);
    expect(hook.result.current.restoreVersion).not.toBeNull();
    expect(hook.result.current.canRestoreVersion).toBe(true);
    if (failure === '403') {
      mocks.error = { status: 403 };
      hook.rerender();
    } else act(() => hook.store.dispatch({ type: 'test/revoke' }));
    expect(hook.result.current.versionHistory).toBeUndefined();
    expect(hook.result.current.versionCompare).toBeUndefined();
    expect(hook.result.current.restorePreview).toBeUndefined();
    expect(hook.result.current.restoreVersion).toBeNull();
    expect(hook.result.current.canRestoreVersion).toBe(false);
    await act(async () => hook.result.current.restoreVersionAsDraft(version as any));
    expect(mocks.mutation).not.toHaveBeenCalled();
  }
);

it('closes version history and selected restore when the academic year changes', () => {
  const hook = setup();
  act(() => hook.store.dispatch({ type: 'test/year' }));
  expect(hook.result.current.versionTarget).toBeNull();
  expect(hook.result.current.restoreVersion).toBeNull();
  expect(hook.result.current.compareVersionIds).toEqual({ from: '', to: '' });
});
