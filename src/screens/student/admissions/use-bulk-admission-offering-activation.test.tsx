import type {
  AdmissionOffering,
  AdmissionOfferingListItem,
} from 'src/redux/student/admissions/admission-offerings-api';

import { act, renderHook } from '@testing-library/react';
import { vi, it, expect, describe, beforeEach } from 'vitest';

import { useBulkAdmissionOfferingActivation } from './use-bulk-admission-offering-activation';

const mocks = vi.hoisted(() => ({
  load: vi.fn(),
  activate: vi.fn(),
  success: vi.fn(),
  warning: vi.fn(),
  error: vi.fn(),
}));

vi.mock('src/components/toast', () => ({
  shikshaMitraToast: { success: mocks.success, warning: mocks.warning, error: mocks.error },
}));
vi.mock('src/redux/student/admissions/admission-offerings-api', () => ({
  useLazyGetAdmissionOfferingQuery: () => [mocks.load, { isFetching: false }],
  useActivateAdmissionOfferingMutation: () => [mocks.activate, { isLoading: false }],
}));

const offering = (id: string, changes: Partial<AdmissionOfferingListItem> = {}) =>
  ({
    id,
    name: `Offering ${id}`,
    admissionCycleId: 'cycle-1',
    isActive: false,
    canActivate: true,
    configurationStatus: 1,
    ...changes,
  }) as AdmissionOfferingListItem;
const rows = [
  offering('first'),
  offering('second', { canActivate: false }),
  offering('active', { isActive: true }),
  offering('incomplete', { canActivate: false, configurationStatus: 0 }),
];
const detail = (id: string, changes: Partial<AdmissionOffering> = {}) =>
  ({ ...offering(id), concurrencyStamp: `${id}-fresh-stamp`, ...changes }) as AdmissionOffering;
const query = <T,>(value: T | Promise<T>) => ({
  unwrap: () => Promise.resolve(value),
  abort: vi.fn(),
  unsubscribe: vi.fn(),
});
const deferred = <T,>() => {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((accept, refuse) => {
    resolve = accept;
    reject = refuse;
  });
  return { promise, resolve, reject };
};
const options = { rows, scopeKey: 'tenant-user-year-cycle-1', canActivate: true, disabled: false };
const render = (overrides: Partial<typeof options> = {}) =>
  renderHook((props) => useBulkAdmissionOfferingActivation(props), {
    initialProps: { ...options, ...overrides },
  });
type ActivationHook = ReturnType<typeof render>;
const selectAndRequest = (hook: ActivationHook) => {
  act(() => hook.result.current.toggleAll(true));
  act(() => hook.result.current.requestActivation());
};

describe('Bulk admission offering activation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.load.mockImplementation((id: string) => query(detail(id)));
    mocks.activate.mockImplementation(({ id }: { id: string }) =>
      query(detail(id, { isActive: true }))
    );
  });

  it('selects only current, inactive, ready offerings and prevents duplicate IDs', () => {
    const hook = render();
    expect(hook.result.current.eligibleRows.map((row) => row.id)).toEqual(['first', 'second']);
    act(() => {
      hook.result.current.toggleSelection(rows[2], true);
      hook.result.current.toggleSelection(rows[3], true);
      hook.result.current.toggleSelection(offering('other-scope'), true);
      hook.result.current.toggleSelection(rows[0], true);
      hook.result.current.toggleSelection(rows[0], true);
    });
    expect(hook.result.current.selectedIds).toEqual(['first']);
    act(() => hook.result.current.toggleSelection(rows[0], false));
    expect(hook.result.current.selectedIds).toEqual([]);
  });

  it('selects and clears all eligible loaded rows', () => {
    const hook = render();
    act(() => hook.result.current.toggleAll(true));
    expect(hook.result.current.selectedIds).toEqual(['first', 'second']);
    expect(hook.result.current.selectedRows.map((row) => row.id)).toEqual(['first', 'second']);
    act(() => hook.result.current.toggleAll(false));
    expect(hook.result.current.selectedIds).toEqual([]);
  });

  it('does not allow selection or activation without permission', async () => {
    const hook = render({ canActivate: false });
    act(() => {
      hook.result.current.toggleSelection(rows[0], true);
      hook.result.current.toggleAll(true);
      hook.result.current.requestActivation();
    });
    await act(async () => hook.result.current.confirmActivation());
    expect(hook.result.current.eligibleRows).toEqual([]);
    expect(hook.result.current.selectedIds).toEqual([]);
    expect(hook.result.current.confirmationOpen).toBe(false);
    expect(mocks.load).not.toHaveBeenCalled();
    expect(mocks.activate).not.toHaveBeenCalled();
  });

  it('guards selection and confirmation while the owning screen is disabled', async () => {
    const hook = render();
    selectAndRequest(hook);
    hook.rerender({ ...options, disabled: true });
    act(() => {
      hook.result.current.toggleSelection(rows[0], false);
      hook.result.current.toggleAll(false);
    });
    await act(async () => hook.result.current.confirmActivation());
    expect(hook.result.current.selectedIds).toEqual(['first', 'second']);
    expect(mocks.load).not.toHaveBeenCalled();
    act(() => hook.result.current.cancelActivation());
    expect(hook.result.current.confirmationOpen).toBe(false);
    act(() => hook.result.current.requestActivation());
    expect(hook.result.current.confirmationOpen).toBe(false);
  });

  it('does not submit empty selections or selections that were not confirmed', async () => {
    const hook = render({ rows: [] });
    act(() => hook.result.current.requestActivation());
    await act(async () => hook.result.current.confirmActivation());
    expect(hook.result.current.confirmationOpen).toBe(false);
    hook.rerender(options);
    act(() => hook.result.current.toggleAll(true));
    await act(async () => hook.result.current.confirmActivation());
    expect(mocks.load).not.toHaveBeenCalled();
  });

  it('uses fresh concurrency stamps, releases detail subscriptions, and reports one completed outcome', async () => {
    const firstRequest = query(detail('first'));
    const secondRequest = query(detail('second'));
    mocks.load.mockReturnValueOnce(firstRequest).mockReturnValueOnce(secondRequest);
    const hook = render();
    selectAndRequest(hook);
    await act(async () => hook.result.current.confirmActivation());
    expect(mocks.load).toHaveBeenNthCalledWith(1, 'first');
    expect(mocks.load).toHaveBeenNthCalledWith(2, 'second');
    expect(mocks.activate).toHaveBeenNthCalledWith(1, {
      id: 'first',
      concurrencyStamp: 'first-fresh-stamp',
    });
    expect(mocks.activate).toHaveBeenNthCalledWith(2, {
      id: 'second',
      concurrencyStamp: 'second-fresh-stamp',
    });
    expect(firstRequest.unsubscribe).toHaveBeenCalledOnce();
    expect(secondRequest.unsubscribe).toHaveBeenCalledOnce();
    expect(hook.result.current.selectedIds).toEqual([]);
    expect(hook.result.current.failures).toEqual([]);
    expect(hook.result.current.busy).toBe(false);
    expect(hook.result.current.progress).toBeNull();
    expect(hook.result.current.confirmationOpen).toBe(false);
    expect(mocks.success).toHaveBeenCalledExactlyOnceWith({
      message: '2 selected offerings are active.',
    });
    expect(mocks.error).not.toHaveBeenCalled();
    expect(mocks.warning).not.toHaveBeenCalled();
  });

  it('skips a selected offering that another user has already activated', async () => {
    mocks.load.mockReturnValueOnce(query(detail('first', { isActive: true })));
    const hook = render({ rows: [rows[0]] });
    selectAndRequest(hook);
    await act(async () => hook.result.current.confirmActivation());
    expect(mocks.activate).not.toHaveBeenCalled();
    expect(hook.result.current.selectedIds).toEqual([]);
    expect(mocks.success).toHaveBeenCalledWith({ message: '1 selected offering is active.' });
  });

  it('blocks duplicate submits and selection/dismissal during a sequential batch', async () => {
    const response = deferred<AdmissionOffering>();
    mocks.activate.mockReturnValueOnce(query(response.promise));
    const hook = render();
    selectAndRequest(hook);
    let pending!: Promise<void>;
    await act(async () => {
      pending = hook.result.current.confirmActivation();
      await hook.result.current.confirmActivation();
    });
    expect(hook.result.current.busy).toBe(true);
    expect(hook.result.current.progress).toEqual({ completed: 0, total: 2 });
    expect(mocks.load).toHaveBeenCalledTimes(1);
    act(() => {
      hook.result.current.toggleSelection(rows[0], false);
      hook.result.current.toggleAll(false);
      hook.result.current.clearSelection();
      hook.result.current.cancelActivation();
    });
    expect(hook.result.current.selectedIds).toEqual(['first', 'second']);
    expect(hook.result.current.confirmationOpen).toBe(true);
    await act(async () => {
      response.resolve(detail('first', { isActive: true }));
      await pending;
    });
    expect(mocks.activate).toHaveBeenCalledTimes(2);
    expect(mocks.load).toHaveBeenCalledTimes(2);
    expect(mocks.success).toHaveBeenCalledOnce();
  });

  it('keeps only failed offerings selected with their reason and retries with a fresh stamp', async () => {
    mocks.activate
      .mockReturnValueOnce(query(detail('first', { isActive: true })))
      .mockReturnValueOnce({
        unwrap: async () =>
          Promise.reject(
            Object.assign(new Error('Activation blocked'), {
              data: { detail: 'Publish the form first.' },
            })
          ),
      });
    const hook = render();
    selectAndRequest(hook);
    await act(async () => hook.result.current.confirmActivation());
    expect(hook.result.current.selectedIds).toEqual(['second']);
    expect(hook.result.current.failures).toEqual([
      { id: 'second', name: 'Offering second', message: 'Publish the form first.' },
    ]);
    expect(mocks.warning).toHaveBeenCalledExactlyOnceWith({
      message:
        '1 of 2 offerings are active. 1 could not be activated; review the issues and retry.',
    });
    expect(mocks.success).not.toHaveBeenCalled();
    mocks.load.mockReturnValueOnce(query(detail('second', { concurrencyStamp: 'retry-stamp' })));
    act(() => hook.result.current.requestActivation());
    await act(async () => hook.result.current.confirmActivation());
    expect(mocks.load).toHaveBeenNthCalledWith(3, 'second');
    expect(mocks.activate).toHaveBeenLastCalledWith({
      id: 'second',
      concurrencyStamp: 'retry-stamp',
    });
    expect(hook.result.current.selectedIds).toEqual([]);
    expect(hook.result.current.failures).toEqual([]);
    expect(mocks.success).toHaveBeenCalledWith({ message: '1 selected offering is active.' });
  });

  it('continues after detail failures and retains failures with one overall error', async () => {
    mocks.load.mockImplementation(() => ({
      unwrap: async () =>
        Promise.reject(
          Object.assign(new Error('Detail request failed'), {
            data: { detail: 'Offering could not be loaded.' },
          })
        ),
      abort: vi.fn(),
      unsubscribe: vi.fn(),
    }));
    const hook = render();
    selectAndRequest(hook);
    await act(async () => hook.result.current.confirmActivation());
    expect(mocks.load).toHaveBeenCalledTimes(2);
    expect(mocks.activate).not.toHaveBeenCalled();
    expect(hook.result.current.selectedIds).toEqual(['first', 'second']);
    expect(hook.result.current.failures).toHaveLength(2);
    expect(hook.result.current.failures[0].message).toBe('Offering could not be loaded.');
    expect(mocks.error).toHaveBeenCalledExactlyOnceWith({
      message: 'Unable to activate the selected offerings. Review the issues and try again.',
    });
    act(() => hook.result.current.clearSelection());
    expect(hook.result.current.failures).toEqual([]);
  });

  it('clears selection and confirmation when table context changes', () => {
    const hook = render();
    selectAndRequest(hook);
    hook.rerender({ ...options, scopeKey: 'tenant-user-year-cycle-2' });
    expect(hook.result.current.selectedIds).toEqual([]);
    expect(hook.result.current.confirmationOpen).toBe(false);
  });

  it('aborts stale reads and stops activation when the scope changes', async () => {
    const response = deferred<AdmissionOffering>();
    const request = query(response.promise);
    mocks.load.mockReturnValueOnce(request);
    const hook = render();
    selectAndRequest(hook);
    let pending!: Promise<void>;
    act(() => {
      pending = hook.result.current.confirmActivation();
    });
    hook.rerender({ ...options, scopeKey: 'different-tenant' });
    expect(request.abort).toHaveBeenCalledOnce();
    expect(hook.result.current.selectedIds).toEqual([]);
    expect(hook.result.current.confirmationOpen).toBe(false);
    await act(async () => {
      response.resolve(detail('first'));
      await pending;
    });
    expect(mocks.load).toHaveBeenCalledOnce();
    expect(mocks.activate).not.toHaveBeenCalled();
    expect(hook.result.current.failures).toEqual([]);
    expect(hook.result.current.busy).toBe(false);
    expect(mocks.success).not.toHaveBeenCalled();
    expect(mocks.error).not.toHaveBeenCalled();
    expect(mocks.warning).not.toHaveBeenCalled();
  });

  it('does not send remaining writes or apply old results after a scope change during activation', async () => {
    const response = deferred<AdmissionOffering>();
    mocks.activate.mockReturnValueOnce(query(response.promise));
    const hook = render();
    selectAndRequest(hook);
    let pending!: Promise<void>;
    await act(async () => {
      pending = hook.result.current.confirmActivation();
    });
    hook.rerender({ ...options, scopeKey: 'new-cycle' });
    await act(async () => {
      response.resolve(detail('first', { isActive: true }));
      await pending;
    });
    expect(mocks.activate).toHaveBeenCalledOnce();
    expect(mocks.load).toHaveBeenCalledOnce();
    expect(hook.result.current.selectedIds).toEqual([]);
    expect(hook.result.current.failures).toEqual([]);
    expect(mocks.success).not.toHaveBeenCalled();
  });

  it('stops pending activation when permission is revoked', async () => {
    const response = deferred<AdmissionOffering>();
    mocks.load.mockReturnValueOnce(query(response.promise));
    const hook = render();
    selectAndRequest(hook);
    let pending!: Promise<void>;
    act(() => {
      pending = hook.result.current.confirmActivation();
    });
    hook.rerender({ ...options, canActivate: false });
    await act(async () => {
      response.resolve(detail('first'));
      await pending;
    });
    expect(mocks.activate).not.toHaveBeenCalled();
    expect(hook.result.current.selectedIds).toEqual([]);
    expect(hook.result.current.eligibleRows).toEqual([]);
  });

  it('ignores late detail responses after unmount', async () => {
    const response = deferred<AdmissionOffering>();
    const request = query(response.promise);
    mocks.load.mockReturnValueOnce(request);
    const hook = render();
    selectAndRequest(hook);
    let pending!: Promise<void>;
    act(() => {
      pending = hook.result.current.confirmActivation();
    });
    hook.unmount();
    expect(request.abort).toHaveBeenCalledOnce();
    await act(async () => {
      response.resolve(detail('first'));
      await pending;
    });
    expect(mocks.activate).not.toHaveBeenCalled();
    expect(mocks.success).not.toHaveBeenCalled();
  });

  it('prunes rows that have become active or are no longer in the loaded table scope', () => {
    const hook = render();
    selectAndRequest(hook);
    hook.rerender({ ...options, rows: [offering('first', { isActive: true })] });
    expect(hook.result.current.selectedIds).toEqual([]);
    expect(hook.result.current.confirmationOpen).toBe(false);
  });
});
