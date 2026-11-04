import type { AdmissionForm } from 'src/redux/student/admissions/admission-forms-api';

import { act, renderHook } from '@testing-library/react';
import { vi, it, expect, describe, beforeEach } from 'vitest';

import { useFormLifecycleActions } from './use-form-lifecycle-actions';

const mocks = vi.hoisted(() => ({
  archive: vi.fn(),
  restore: vi.fn(),
  toast: vi.fn(),
  impact: undefined as any,
  loading: false,
  failed: false,
  refetch: vi.fn(),
}));
vi.mock('src/components/toast', () => ({
  shikshaMitraToast: { success: mocks.toast, error: mocks.toast },
}));
vi.mock('src/redux/student/admissions/admission-forms-api', () => ({
  useArchiveAdmissionFormMutation: () => [mocks.archive, { isLoading: false }],
  useRestoreAdmissionFormMutation: () => [mocks.restore, { isLoading: false }],
  useGetAdmissionFormArchiveImpactQuery: () => ({
    currentData: mocks.impact,
    isFetching: mocks.loading,
    isError: mocks.failed,
    refetch: mocks.refetch,
  }),
}));
const form = { id: 'form-1', name: 'Inquiry', status: 1, concurrencyStamp: 'old' } as AdmissionForm;
describe('form lifecycle commands', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.loading = false;
    mocks.failed = false;
    mocks.impact = { formDefinitionId: form.id, status: 1, concurrencyStamp: 'fresh' };
    mocks.archive.mockReturnValue({ unwrap: async () => ({ ...form, status: 2 }) });
    mocks.restore.mockReturnValue({ unwrap: async () => ({ ...form, status: 1 }) });
  });
  it('uses verified impact concurrency and submits only once while pending', async () => {
    let finish!: () => void;
    mocks.archive.mockReturnValue({
      unwrap: () =>
        new Promise<void>((resolve) => {
          finish = resolve;
        }),
    });
    const { result } = renderHook(() => useFormLifecycleActions(true));
    act(() => result.current.request('archive', form));
    let saving!: Promise<void>;
    act(() => {
      saving = result.current.confirm();
    });
    await act(async () => result.current.confirm());
    act(() => result.current.close());
    expect(result.current.pending).not.toBeNull();
    expect(mocks.archive).toHaveBeenCalledExactlyOnceWith({
      id: form.id,
      concurrencyStamp: 'fresh',
    });
    await act(async () => {
      finish();
      await saving;
    });
    expect(result.current.pending).toBeNull();
  });
  it('blocks missing/failed impact and callers without management access', async () => {
    mocks.failed = true;
    const { result } = renderHook(() => useFormLifecycleActions(true));
    act(() => result.current.request('archive', form));
    await act(async () => result.current.confirm());
    expect(mocks.archive).not.toHaveBeenCalled();
    expect(result.current.queryError).toBe(true);
    expect(result.current.error).toBeNull();
    const denied = renderHook(() => useFormLifecycleActions(false));
    act(() => denied.result.current.request('restore', { ...form, status: 2 }));
    expect(denied.result.current.pending).toBeNull();
  });
  it('retains a refused restore for retry and never reports success', async () => {
    mocks.impact = { ...mocks.impact, status: 2 };
    mocks.restore.mockReturnValue({
      unwrap: async () => {
        throw Object.assign(new Error('Form changed. Reopen and try again.'), {
          data: {
            errorCode: 'Admissions.FormConcurrencyConflict',
            detail: 'Form changed. Reopen and try again.',
          },
        });
      },
    });
    const { result } = renderHook(() => useFormLifecycleActions(true));
    act(() => result.current.request('restore', { ...form, status: 2 }));
    await act(async () => result.current.confirm());
    expect(result.current.pending?.action).toBe('restore');
    expect(result.current.error).toMatch(/form.*changed/i);
    expect(mocks.toast).not.toHaveBeenCalled();
  });
  it('requires fresh impact review after a concurrency conflict before allowing another command', async () => {
    mocks.archive.mockReturnValue({
      unwrap: async () => {
        throw Object.assign(new Error('The form changed. Reload and try again.'), {
          data: {
            errorCode: 'Admissions.FormConcurrencyConflict',
            detail: 'The form changed. Reload and try again.',
          },
        });
      },
    });
    mocks.refetch.mockReturnValue({ unwrap: async () => mocks.impact });
    const { result } = renderHook(() => useFormLifecycleActions(true));
    act(() => result.current.request('archive', form));
    await act(async () => result.current.confirm());
    expect(result.current.requiresReload).toBe(true);
    expect(result.current.canConfirm).toBe(false);
    await act(async () => result.current.reloadLatest());
    expect(mocks.refetch).toHaveBeenCalledOnce();
    expect(result.current.requiresReload).toBe(false);
  });
  it('keeps a failed request retryable using the standard toast without a duplicate inline API error', async () => {
    mocks.archive.mockReturnValue({
      unwrap: async () => {
        throw new Error('Network unavailable');
      },
    });
    const { result } = renderHook(() => useFormLifecycleActions(true));
    act(() => result.current.request('archive', form));
    await act(async () => result.current.confirm());
    expect(result.current.pending?.action).toBe('archive');
    expect(result.current.error).toBeNull();
    expect(mocks.toast).toHaveBeenCalledWith({ message: 'Network unavailable' });
  });
});
