import { renderHook } from '@testing-library/react';
import { it, vi, expect, describe, beforeEach } from 'vitest';

import { useAccountHeadOptions } from './useAccountHeadOptions';
import { useAccountSettingPermissions } from './useAccountSettingPermissions';

const { state, query } = vi.hoisted(() => ({
  state: {
    auth: {
      permissions: [] as { name: string; isGranted: boolean }[],
      permissionsInitialized: true,
      loading: false,
    },
    globalState: { currentYear: { id: 'year-1' } as { id: string } | null },
  },
  query: vi.fn(),
}));

vi.mock('react-redux', () => ({ useSelector: (selector: any) => selector(state) }));
vi.mock('src/redux/finance/accountHeadApi', () => ({ useGetAccountHeadOptionsQuery: query }));

const grant = (name: string) => ({ name, isGranted: true });
const view = 'Finance.Accounts.Settings.AccountHead.View';

beforeEach(() => {
  state.auth.permissions = [];
  state.auth.permissionsInitialized = true;
  state.auth.loading = false;
  state.globalState.currentYear = { id: 'year-1' };
  query.mockReset().mockReturnValue({ currentData: [], isFetching: false, isError: false });
});

describe('Account Head lookup permissions', () => {
  it.each(['Income', 'Expense'] as const)('enables %s category lookup with Add or Edit alone', (kind) => {
    ['Add', 'Edit'].forEach((action) => {
      state.auth.permissions = [grant(`Finance.Accounts.Settings.${kind}Category.${action}`)];
      query.mockReturnValue({ currentData: [{ id: 'head', name: 'Revenue' }], isFetching: false });
      const { result, unmount } = renderHook(() => useAccountHeadOptions(kind, kind));
      expect(query.mock.lastCall).toEqual([
        { academicYearId: 'year-1', headType: kind, categoryType: kind }, { skip: false },
      ]);
      expect(result.current.disabled).toBe(false);
      expect(result.current.options).toHaveLength(1);
      unmount();
    });
  });

  it.each(['Income', 'Expense'] as const)('does not grant %s category lookup through another category or View', (kind) => {
    state.auth.permissions = [
      grant(`Finance.Accounts.Settings.${kind === 'Income' ? 'Expense' : 'Income'}Category.Add`),
      grant(`Finance.Accounts.Settings.${kind}Category.View`),
    ];
    const { result } = renderHook(() => useAccountHeadOptions(kind, kind));
    expect(result.current.disabled).toBe(true);
    expect(result.current.errorMessage).toContain('Add or Edit');
  });

  it('explains the missing permission when the old admin snapshot only grants category access', () => {
    state.auth.permissions = [
      grant('ShikshaMitra.Module.Finance.Accounts.Settings'),
      grant('Finance.Accounts.Settings.IncomeCategory.View'),
      grant('Finance.Accounts.Settings.IncomeCategory.Add'),
    ];
    query.mockReturnValue({ currentData: [{ id: 'cached-head' }] });
    const { result } = renderHook(() => useAccountHeadOptions('Income'));
    expect(query).toHaveBeenLastCalledWith(
      { academicYearId: 'year-1', headType: 'Income' },
      { skip: true }
    );
    expect(result.current.options).toEqual([]);
    expect(result.current.errorMessage).toContain('Account Heads View permission is required');
    expect(result.current.disabled).toBe(true);
  });

  it('waits for permission initialization without showing a false denial', () => {
    state.auth.permissionsInitialized = false;
    const { result } = renderHook(() => useAccountHeadOptions());
    expect(result.current.isLoading).toBe(true);
    expect(result.current.errorMessage).toBeUndefined();
    expect(query.mock.lastCall?.[1]).toEqual({ skip: true });
  });

  it('loads the selected type and year only with the dedicated View permission', () => {
    state.auth.permissions = [grant(view)];
    const heads = [{ id: 'income-head', postingAllowed: true }];
    query.mockReturnValue({ currentData: heads, isFetching: false });
    const { result } = renderHook(() => useAccountHeadOptions('Income'));
    expect(query.mock.lastCall).toEqual([
      { academicYearId: 'year-1', headType: 'Income' },
      { skip: false },
    ]);
    expect(result.current.options).toEqual(heads);
    expect(result.current.disabled).toBeFalsy();
  });

  it.each([403, 404, 500])('distinguishes an API failure (%s) from an empty master', (status) => {
    state.auth.permissions = [grant(view)];
    query.mockReturnValue({ isError: true, error: { status }, currentData: [{ id: 'stale' }] });
    const { result } = renderHook(() => useAccountHeadOptions());
    expect(result.current.errorMessage).toContain(
      status === 403 ? 'denied' : 'could not be loaded'
    );
    expect(result.current.options).toEqual([]);
    expect(result.current.disabled).toBe(true);
  });

  it('does not reuse results from a previous academic year while the new year loads', () => {
    state.auth.permissions = [grant(view)];
    query.mockReturnValue({ data: [{ id: 'old-year-head' }], isFetching: true });
    const { result } = renderHook(() => useAccountHeadOptions());
    expect(result.current.options).toEqual([]);
    expect(result.current.isLoading).toBe(true);
  });

  it('asks for the academic year before querying', () => {
    state.auth.permissions = [grant(view)];
    state.globalState.currentYear = null;
    const { result } = renderHook(() => useAccountHeadOptions());
    expect(result.current.needsAcademicYear).toBe(true);
    expect(query.mock.lastCall?.[1]).toEqual({ skip: true });
  });
});

describe.each(['AccountHead', 'IncomeCategory', 'ExpenseCategory', 'BankAccount'] as const)(
  '%s action permissions',
  (setting) => {
    it('does not turn Add or a module grant into Edit, ChangeStatus or Delete', () => {
      state.auth.permissions = [
        grant('ShikshaMitra.Module.Finance.Accounts.Settings'),
        grant(`Finance.Accounts.Settings.${setting}.Add`),
      ];
      const { result } = renderHook(() => useAccountSettingPermissions(setting));
      expect(result.current).toEqual({
        canAdd: true,
        canEdit: false,
        canChangeStatus: false,
        canDelete: false,
      });
    });

    it('honors each dedicated action grant', () => {
      state.auth.permissions = ['Edit', 'ChangeStatus', 'Delete'].map((action) =>
        grant(`Finance.Accounts.Settings.${setting}.${action}`)
      );
      const { result } = renderHook(() => useAccountSettingPermissions(setting));
      expect(result.current).toEqual({
        canAdd: false,
        canEdit: true,
        canChangeStatus: true,
        canDelete: true,
      });
    });
  }
);
