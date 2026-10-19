import { it, vi, expect, describe } from 'vitest';
import { renderHook } from '@testing-library/react';

import { useFinancePermissions } from './useFinancePermissions';

const state = vi.hoisted(() => ({ auth: {
  loading: false,
  permissionsInitialized: true,
  permissions: [] as { name: string; isGranted: boolean }[],
} }));
vi.mock('react-redux', () => ({ useSelector: (selector: any) => selector(state) }));

describe('Finance runtime action checks', () => {
  const base = 'Finance.Fees.FeeCollections';
  it.each(['View', 'Add', 'Delete'])(
    'only authorizes the exact %s action and respects revocation', (action) => {
      state.auth = { loading: false, permissionsInitialized: true, permissions: [
        { name: `${base}.${action}`, isGranted: true },
        { name: base, isGranted: true },
      ] };
      const { result, rerender } = renderHook(() => useFinancePermissions(base));
      expect(result.current).toEqual({
        isReady: true, canView: action === 'View', canAdd: action === 'Add', canDelete: action === 'Delete',
      });
      state.auth.permissions[0].isGranted = false;
      rerender();
      expect(result.current).toEqual({ isReady: true, canView: false, canAdd: false, canDelete: false });
    }
  );
  it.each([{ loading: true, permissionsInitialized: true }, { loading: false, permissionsInitialized: false }])(
    'blocks all actions before permissions are ready: %j', (readiness) => {
      state.auth = { ...readiness, permissions: ['View', 'Add', 'Delete'].map((action) => ({ name: `${base}.${action}`, isGranted: true })) };
      const { result } = renderHook(() => useFinancePermissions(base));
      expect(result.current).toEqual({ isReady: false, canView: false, canAdd: false, canDelete: false });
    }
  );
});
