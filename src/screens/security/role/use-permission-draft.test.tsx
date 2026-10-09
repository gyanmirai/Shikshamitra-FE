import { it, vi, expect, describe, beforeEach } from 'vitest';
import { act, waitFor, renderHook } from '@testing-library/react';

import { usePermissionDraft } from './use-permission-draft';

import type { GrantProvider, PermissionCatalogue } from './permission-catalogue';

const mocks = vi.hoisted(() => ({
  query: { currentData: undefined as unknown, isError: false, isFetching: false, refetch: vi.fn() },
  update: vi.fn(),
  dispatch: vi.fn(),
}));
vi.mock('react-redux', () => ({ useDispatch: () => mocks.dispatch }));
vi.mock('src/redux/permission/permissionApi', () => ({
  useGetPermissionsQuery: () => mocks.query,
  useUpdatePermissionMutation: () => [mocks.update],
  useGetUserPermissionOverridesQuery: () => mocks.query,
  useUpdateUserPermissionOverridesMutation: () => [mocks.update],
}));
const role = { providerName: 'R', providerKey: 'synthetic-role' };
const user = { providerName: 'U', providerKey: 'synthetic-user' };
const catalogue = (
  granted: string[] = [],
  provider = role,
  inherited = false
): PermissionCatalogue => ({
  groups: [
    {
      name: 'Payroll',
      displayName: 'Payroll',
      permissions: ['View', 'Edit', 'Activate'].map((name) => ({
        name,
        displayName: name,
        allowedProviders: [],
        isGranted: granted.includes(name) || inherited,
        grantedProviders: [
          ...(granted.includes(name) ? [provider] : []),
          ...(inherited ? [role] : []),
        ],
      })),
    },
  ],
});
const resolve = (value: unknown) => ({ unwrap: () => Promise.resolve(value) });
function start(provider: GrantProvider = role) {
  const saved = vi.fn();
  const hook = renderHook(({ target }) => usePermissionDraft(target, saved), {
    initialProps: { target: provider },
  });
  return { ...hook, saved };
}
beforeEach(() => {
  vi.clearAllMocks();
  mocks.query.currentData = catalogue();
  mocks.query.isError = false;
  mocks.query.isFetching = false;
  mocks.query.refetch.mockImplementation(() => resolve(mocks.query.currentData));
  mocks.update.mockImplementation(() => resolve(undefined));
});

describe('permission drafts and verified changed-only writes', () => {
  it('discards an unsaved rule without reloading or writing permissions', () => {
    mocks.query.currentData = { ...catalogue([], user, true), overrides: { Edit: 'deny' as const } };
    const { result } = start(user);
    act(() => result.current.setStates(['Edit', 'View'], 'allow'));
    expect(result.current.dirty).toBe(true);
    act(() => result.current.discard());
    expect(result.current.states.Edit).toBe('deny');
    expect(result.current.states.View).toBe('inherit');
    expect(result.current.dirty).toBe(false);
    expect(mocks.update).not.toHaveBeenCalled();
    expect(mocks.query.refetch).not.toHaveBeenCalled();
  });
  it('saves a deny despite a role-default change during the draft', async () => {
    mocks.query.currentData = catalogue([], user, true);
    const { result, saved } = start(user);
    act(() => result.current.setStates(['Edit'], 'deny'));
    const persisted = { ...catalogue([], user), overrides: { Edit: 'deny' as const } };
    mocks.query.refetch.mockReturnValueOnce(resolve(catalogue([], user)))
      .mockReturnValueOnce(resolve(persisted));
    await act(() => result.current.submit());
    expect(mocks.update).toHaveBeenCalledExactlyOnceWith({ ...user, data: { permissions: [{ name: 'Edit', state: 'deny' }] } });
    expect(saved).toHaveBeenCalledOnce();
  });
  it('distinguishes persisted deny from follow role even when both lack a direct grant', async () => {
    mocks.query.currentData = { ...catalogue([], user, true), overrides: { Edit: 'deny' } };
    const { result, saved } = start(user);
    act(() => result.current.setStates(['Edit'], 'inherit'));
    await act(() => result.current.submit());
    expect(result.current.error).toContain('could not be verified');
    expect(result.current.states.Edit).toBe('inherit');
    expect(saved).not.toHaveBeenCalled();
  });
  it('blocks edits while an explicit reload is pending', async () => {
    const { result } = start();
    let release!: (value: PermissionCatalogue) => void;
    mocks.query.refetch.mockReturnValueOnce({
      unwrap: () =>
        new Promise<PermissionCatalogue>((resolveRead) => {
          release = resolveRead;
        }),
    });
    let pending!: Promise<unknown>;
    act(() => {
      pending = result.current.reload();
    });
    expect(result.current.busy).toBe(true);
    act(() => result.current.setGrants(['Edit'], true));
    expect(result.current.grants.Edit).toBe(false);
    await act(async () => {
      const refreshed = catalogue(['View']);
      mocks.query.currentData = refreshed;
      release(refreshed);
      await pending;
    });
    expect(result.current.grants.View).toBe(true);
    expect(result.current.busy).toBe(false);
  });
  it.each([role, user])(
    'round trips only the changed direct grant for $providerName',
    async (provider) => {
      mocks.query.currentData = catalogue(['View'], provider, provider === user);
      const { result, saved } = start(provider);
      await waitFor(() => expect(result.current.grants.View).toBe(true));
      expect(result.current.grants.Edit).toBe(false);
      act(() => result.current.setGrants(['Edit'], true));
      expect(result.current.changes.map((entry) => entry.name)).toEqual(['Edit']);
      mocks.query.refetch
        .mockReturnValueOnce(resolve(catalogue(['View'], provider, provider === user)))
        .mockReturnValueOnce(resolve(catalogue(['View', 'Edit'], provider, provider === user)));
      await act(() => result.current.submit());
      expect(mocks.update).toHaveBeenCalledExactlyOnceWith({
        ...provider,
        data: { permissions: [provider === user ? { name: 'Edit', state: 'allow' } : { name: 'Edit', isGranted: true }] },
      });
      expect(saved).toHaveBeenCalledOnce();
      expect(mocks.query.refetch).toHaveBeenCalledTimes(2);
    }
  );

  it('removes a direct user grant without trying to revoke inherited grants', async () => {
    mocks.query.currentData = catalogue(['Edit'], user, true);
    const { result, saved } = start(user);
    act(() => result.current.setStates(['Edit'], 'inherit'));
    mocks.query.refetch
      .mockReturnValueOnce(resolve(catalogue(['Edit'], user, true)))
      .mockReturnValueOnce(resolve(catalogue([], user, true)));
    await act(() => result.current.submit());
    expect(mocks.update).toHaveBeenCalledExactlyOnceWith({
      ...user,
      data: { permissions: [{ name: 'Edit', state: 'inherit' }] },
    });
    expect(saved).toHaveBeenCalledOnce();
  });

  it('preserves a dirty draft across background catalogue refresh and read failure', async () => {
    const { result, rerender } = start();
    act(() => result.current.setGrants(['Edit'], true));
    mocks.query.currentData = catalogue(['View']);
    rerender({ target: role });
    expect(result.current.grants).toEqual({ View: false, Edit: true, Activate: false });
    mocks.query.isError = true;
    rerender({ target: role });
    expect(result.current.dirty).toBe(true);
    expect(result.current.blocked).toBe(true);
    await act(() => result.current.submit());
    expect(mocks.update).not.toHaveBeenCalled();
  });

  it('preserves and blocks the old draft on provider change until confirmed reload', async () => {
    const { result, rerender } = start();
    act(() => result.current.setGrants(['Activate'], true));
    mocks.query.currentData = catalogue([], user);
    rerender({ target: user });
    expect(result.current.mismatch).toBe(true);
    await act(() => result.current.submit());
    expect(mocks.update).not.toHaveBeenCalled();
    vi.stubGlobal('confirm', vi.fn().mockReturnValueOnce(false).mockReturnValueOnce(true));
    await act(() => result.current.reload());
    expect(result.current.grants.Activate).toBe(true);
    await act(() => result.current.reload());
    expect(result.current.mismatch).toBe(false);
    expect(result.current.grants.Activate).toBe(false);
    vi.unstubAllGlobals();
  });

  it('rejects changed server baseline instead of overwriting another administrator', async () => {
    const { result, saved } = start();
    act(() => result.current.setGrants(['Edit'], true));
    mocks.query.refetch.mockReturnValue(resolve(catalogue(['Edit'])));
    await act(() => result.current.submit());
    expect(result.current.error).toContain('changed on the server');
    expect(result.current.dirty).toBe(true);
    expect(mocks.update).not.toHaveBeenCalled();
    expect(saved).not.toHaveBeenCalled();
  });

  it('rejects provider eligibility changes before writing', async () => {
    const { result } = start(user);
    act(() => result.current.setGrants(['Edit'], true));
    const current = catalogue([], user);
    current.groups[0].permissions[1].allowedProviders = ['R'];
    mocks.query.refetch.mockReturnValue(resolve(current));
    await act(() => result.current.submit());
    expect(result.current.error).toContain('changed on the server');
    expect(mocks.update).not.toHaveBeenCalled();
  });

  it('ignores unknown and provider-ineligible names in bulk changes', () => {
    const current = catalogue([], user);
    current.groups[0].permissions[1].allowedProviders = ['R'];
    mocks.query.currentData = current;
    const { result } = start(user);
    act(() => result.current.setGrants(['Edit', 'Activate', 'Unknown'], true));
    expect(result.current.grants).toEqual({ View: false, Edit: false, Activate: true });
    expect(result.current.changes.map((entry) => entry.name)).toEqual(['Activate']);
  });

  it('does not report success when the persisted direct grant differs', async () => {
    const { result, saved } = start();
    act(() => result.current.setGrants(['Edit'], true));
    await act(() => result.current.submit());
    expect(result.current.error).toContain('could not be verified');
    expect(result.current.grants.Edit).toBe(true);
    expect(saved).not.toHaveBeenCalled();
  });

  it('preserves the draft when a mutation fails', async () => {
    const { result, saved } = start();
    act(() => result.current.setGrants(['Edit'], true));
    mocks.update.mockReturnValue({ unwrap: () => Promise.reject(new Error('synthetic failure')) });
    await act(() => result.current.submit());
    expect(result.current.error).toContain('Could not save');
    expect(result.current.dirty).toBe(true);
    expect(saved).not.toHaveBeenCalled();
  });

  it('deduplicates submission while awaiting the pre-save read', async () => {
    const { result } = start();
    act(() => result.current.setGrants(['Edit'], true));
    let release!: (value: PermissionCatalogue) => void;
    mocks.query.refetch
      .mockReturnValueOnce({
        unwrap: () =>
          new Promise<PermissionCatalogue>((resolveRead) => {
            release = resolveRead;
          }),
      })
      .mockReturnValueOnce(resolve(catalogue(['Edit'])));
    let first!: Promise<unknown>;
    act(() => {
      first = result.current.submit();
    });
    await waitFor(() => expect(mocks.query.refetch).toHaveBeenCalledOnce());
    await act(() => result.current.submit());
    expect(result.current.blocked).toBe(true);
    await act(async () => {
      release(catalogue());
      await first;
    });
    expect(mocks.update).toHaveBeenCalledOnce();
  });

  it('does not apply a pending save to a newly selected provider', async () => {
    const { result, rerender, saved } = start();
    act(() => result.current.setGrants(['Edit'], true));
    let release!: (value: PermissionCatalogue) => void;
    mocks.query.refetch.mockReturnValueOnce({
      unwrap: () =>
        new Promise<PermissionCatalogue>((resolveRead) => {
          release = resolveRead;
        }),
    });
    let pending!: Promise<unknown>;
    act(() => {
      pending = result.current.submit();
    });
    await waitFor(() => expect(mocks.query.refetch).toHaveBeenCalledOnce());
    mocks.query.currentData = catalogue([], user);
    rerender({ target: user });
    await act(async () => {
      release(catalogue());
      await pending;
    });
    expect(mocks.update).not.toHaveBeenCalled();
    expect(saved).not.toHaveBeenCalled();
    expect(result.current.mismatch).toBe(true);
  });
});
