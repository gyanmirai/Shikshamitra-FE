import type { AdmissionCycle } from 'src/redux/student/admissions/admission-cycles-api';
import type {
  AdmissionOffering,
  AdmissionOfferingListItem,
} from 'src/redux/student/admissions/admission-offerings-api';

import { act, renderHook } from '@testing-library/react';
import { vi, it, expect, describe, beforeEach } from 'vitest';

import { useAdmissionOfferingActions } from './use-admission-offering-actions';
import { toOfferingWriteInput, getOfferingInitialValues } from './admission-offering-model';

const mocks = vi.hoisted(() => ({
  load: vi.fn(),
  update: vi.fn(),
  other: vi.fn(),
  error: vi.fn(),
  success: vi.fn(),
  granted: [] as { name: string; isGranted: boolean }[],
}));
vi.mock('react-redux', () => ({ useSelector: () => mocks.granted }));
vi.mock('src/components/toast', () => ({
  shikshaMitraToast: {
    warning: vi.fn(),
    info: vi.fn(),
    dismiss: vi.fn(),
    error: mocks.error,
    success: mocks.success,
  },
}));
vi.mock('src/redux/student/admissions/admission-offerings-api', () => ({
  useLazyGetAdmissionOfferingQuery: () => [mocks.load, { isFetching: false }],
  useUpdateAdmissionOfferingMutation: () => [mocks.update, { isLoading: false }],
  useCreateAdmissionOfferingMutation: () => [mocks.other, { isLoading: false }],
  useCloneAdmissionOfferingMutation: () => [mocks.other, { isLoading: false }],
  useActivateAdmissionOfferingMutation: () => [mocks.other, { isLoading: false }],
  useDeactivateAdmissionOfferingMutation: () => [mocks.other, { isLoading: false }],
  useDeleteAdmissionOfferingMutation: () => [mocks.other, { isLoading: false }],
}));
const cycle = { id: 'cycle-1' } as AdmissionCycle;
const row = { id: 'offering-1' } as AdmissionOfferingListItem;
const detail = { id: row.id, concurrencyStamp: 'latest-stamp' } as AdmissionOffering;
const deferred = () => {
  let resolve!: (value: AdmissionOffering) => void;
  const promise = new Promise<AdmissionOffering>((accept) => {
    resolve = accept;
  });
  return { promise, resolve };
};

describe('Offering edit detail loading', () => {
  beforeEach(() => vi.clearAllMocks());
  it.each(['clone', 'edit'] as const)(
    'reveals the authoritative saved scope after %s moves an offering to another class or cycle',
    async (mode) => {
      const onSaved = vi.fn();
      const original = { ...detail, admissionCycleId: cycle.id, standardId: 'old-class' };
      const saved = { ...original, admissionCycleId: 'target-cycle', standardId: 'new-class' };
      mocks.load.mockReturnValue({ unwrap: async () => original });
      mocks.other.mockReturnValue({ unwrap: async () => saved });
      mocks.update.mockReturnValue({ unwrap: async () => saved });
      const { result } = renderHook(() => useAdmissionOfferingActions(cycle, false, onSaved));
      await act(async () => result.current.openDetailed(mode, row));
      await act(async () => {
        await result.current.save(toOfferingWriteInput(getOfferingInitialValues()), 'target-cycle');
      });
      expect(onSaved).toHaveBeenCalledExactlyOnceWith(saved);
      expect(result.current.dialogMode).toBeNull();
    }
  );
  it('preserves table filters after an ordinary edit and never reveals a failed clone', async () => {
    const onSaved = vi.fn();
    mocks.load.mockReturnValue({ unwrap: async () => detail });
    mocks.update.mockReturnValue({ unwrap: async () => detail });
    const { result } = renderHook(() => useAdmissionOfferingActions(cycle, false, onSaved));
    await act(async () => result.current.openDetailed('edit', row));
    await act(async () =>
      result.current.save(toOfferingWriteInput(getOfferingInitialValues()), cycle.id)
    );
    expect(onSaved).not.toHaveBeenCalled();
    await act(async () => result.current.openDetailed('clone', row));
    mocks.other.mockReturnValue({
      unwrap: async () => {
        throw new Error('Clone failed');
      },
    });
    await act(async () => {
      await expect(
        result.current.save(toOfferingWriteInput(getOfferingInitialValues()), 'target-cycle')
      ).rejects.toThrow('Clone failed');
    });
    expect(onSaved).not.toHaveBeenCalled();
    expect(result.current.dialogMode).toBe('clone');
  });
  it('opens Edit immediately without exposing stale form data, then uses the latest details', async () => {
    const request = deferred();
    mocks.load.mockReturnValue({ unwrap: () => request.promise });
    const { result } = renderHook(() => useAdmissionOfferingActions(cycle));
    let pending!: Promise<void>;
    act(() => {
      pending = result.current.openDetailed('edit', row);
    });
    expect(result.current.dialogMode).toBe('edit');
    expect(result.current.selected).toBeNull();
    await act(async () => {
      request.resolve(detail);
      await pending;
    });
    expect(result.current.selected).toEqual(detail);
    mocks.update.mockReturnValue({ unwrap: async () => detail });
    const body = toOfferingWriteInput(getOfferingInitialValues());
    await act(async () => {
      await result.current.save(body, cycle.id);
    });
    expect(mocks.update).toHaveBeenCalledWith({
      id: row.id,
      body: { ...body, concurrencyStamp: 'latest-stamp' },
    });
    expect(result.current.dialogMode).toBeNull();
  });
  it('keeps the edit drawer open on failure and retries the same record', async () => {
    mocks.load
      .mockReturnValueOnce({
        unwrap: async () => {
          throw Object.assign(new Error('Temporary outage'), {
            data: { detail: 'Temporary outage' },
          });
        },
      })
      .mockReturnValueOnce({ unwrap: async () => detail });
    const { result } = renderHook(() => useAdmissionOfferingActions(cycle));
    await act(async () => {
      await result.current.openDetailed('edit', row);
    });
    expect(result.current.dialogMode).toBe('edit');
    expect(result.current.selected).toBeNull();
    expect(result.current.detailError).toBe('Temporary outage');
    expect(mocks.error).not.toHaveBeenCalled();
    await act(async () => {
      await result.current.retryDetail();
    });
    expect(mocks.load).toHaveBeenNthCalledWith(2, row.id);
    expect(result.current.selected).toEqual(detail);
    expect(result.current.detailError).toBeNull();
  });
  it('ignores late detail responses after closing the drawer', async () => {
    const request = deferred();
    mocks.load.mockReturnValue({ unwrap: () => request.promise });
    const { result } = renderHook(() => useAdmissionOfferingActions(cycle));
    let pending!: Promise<void>;
    act(() => {
      pending = result.current.openDetailed('edit', row);
    });
    act(() => result.current.closeDialog());
    await act(async () => {
      request.resolve(detail);
      await pending;
    });
    expect(result.current.dialogMode).toBeNull();
    expect(result.current.selected).toBeNull();
  });
  it('does not overwrite a newer selected record with an older response', async () => {
    const older = deferred();
    const newer = { ...detail, id: 'offering-2' };
    mocks.load
      .mockReturnValueOnce({ unwrap: () => older.promise })
      .mockReturnValueOnce({ unwrap: async () => newer });
    const { result } = renderHook(() => useAdmissionOfferingActions(cycle));
    let pending!: Promise<void>;
    act(() => {
      pending = result.current.openDetailed('edit', row);
    });
    await act(async () => {
      await result.current.openDetailed('edit', { id: newer.id } as AdmissionOfferingListItem);
    });
    await act(async () => {
      older.resolve(detail);
      await pending;
    });
    expect(result.current.selected?.id).toBe(newer.id);
  });
});

describe('Offering activation confirmation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.granted = [{ name: 'Students.Admissions.Offerings.Add', isGranted: true }];
    mocks.other.mockReturnValue({ unwrap: async () => detail });
  });

  it('locks the entire command, including the detail request, against cancellation and duplicate clicks', async () => {
    const request = deferred();
    mocks.load.mockReturnValue({ unwrap: () => request.promise });
    const { result } = renderHook(() => useAdmissionOfferingActions(cycle));
    act(() => result.current.requestAction({ ...row, isActive: false }));
    let pending!: Promise<void>;
    act(() => {
      pending = result.current.confirmAction();
    });
    expect(result.current.commanding).toBe(true);
    await act(async () => {
      await result.current.confirmAction();
    });
    act(() => result.current.cancelAction());
    expect(result.current.pendingAction).not.toBeNull();
    expect(mocks.load).toHaveBeenCalledOnce();
    await act(async () => {
      request.resolve(detail);
      await pending;
    });
    expect(mocks.other).toHaveBeenCalledOnce();
    expect(mocks.other).toHaveBeenCalledWith({ id: row.id, concurrencyStamp: 'latest-stamp' });
    expect(result.current.pendingAction).toBeNull();
    expect(result.current.commanding).toBe(false);
  });

  it('keeps the confirmation open and unlocks retry after a request failure', async () => {
    mocks.load.mockReturnValue({
      unwrap: async () => {
        throw new Error('Unavailable');
      },
    });
    const { result } = renderHook(() => useAdmissionOfferingActions(cycle));
    act(() => result.current.requestAction({ ...row, isActive: false }));
    await act(async () => {
      await result.current.confirmAction();
    });
    expect(result.current.pendingAction?.type).toBe('activate');
    expect(result.current.commanding).toBe(false);
    expect(mocks.other).not.toHaveBeenCalled();
    expect(mocks.error).toHaveBeenCalledOnce();
  });

  it('does not submit activation without the existing permission', async () => {
    mocks.granted = [];
    const { result } = renderHook(() => useAdmissionOfferingActions(cycle));
    act(() => result.current.requestAction({ ...row, isActive: false }));
    await act(async () => {
      await result.current.confirmAction();
    });
    expect(mocks.load).not.toHaveBeenCalled();
    expect(mocks.other).not.toHaveBeenCalled();
  });
});
