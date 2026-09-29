import type { AdmissionForm } from 'src/redux/student/admissions/admission-forms-api';

import { it, vi, expect, describe, beforeEach } from 'vitest';
import { act, waitFor, renderHook } from '@testing-library/react';

import { useFormListActions } from './use-form-list-actions';

const query = vi.hoisted(() => ({ data: null as AdmissionForm | null, isError: false }));

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock('react-redux', () => ({
  useSelector: (selector: (state: unknown) => unknown) =>
    selector({ auth: { permissions: [], user: { sub: 'test-user', role: 'admin' } } }),
}));
vi.mock('src/redux/student/admissions/admission-forms-api', () => {
  const mutation = () => [vi.fn(), { isLoading: false }];
  return {
    useGetAdmissionFormQuery: () => ({ ...query, refetch: vi.fn() }),
    useCloneAdmissionFormMutation: mutation,
    useCreateAdmissionFormMutation: mutation,
    useDeleteAdmissionFormMutation: mutation,
    useUpdateAdmissionFormMutation: mutation,
    useRejectAdmissionFormMutation: mutation,
    usePublishAdmissionFormMutation: mutation,
    useArchiveAdmissionFormMutation: mutation,
    useApproveAdmissionFormMutation: mutation,
    useValidateAdmissionFormMutation: mutation,
    useCreateAdmissionFormVersionMutation: mutation,
    useRequestAdmissionFormApprovalMutation: mutation,
  };
});

describe('useFormListActions editor mode', () => {
  beforeEach(() => {
    query.data = null;
    query.isError = false;
  });

  it('opens Create with a fresh form after Edit, even if the old query data remains', async () => {
    const { result, rerender } = renderHook(() => useFormListActions());

    act(() => result.current.edit('saved-form'));
    query.data = { id: 'saved-form', name: 'Existing form' } as AdmissionForm;
    rerender();
    await waitFor(() => expect(result.current.editing?.id).toBe('saved-form'));

    act(() => result.current.close());
    act(() => result.current.create(0));
    rerender();

    expect(result.current.dialog.value).toBe(true);
    expect(result.current.editingId).toBeNull();
    expect(result.current.editing).toBeNull();
    expect(result.current.creatingPurpose).toBe(0);
  });

  it('keeps the loaded Edit form stable if its query temporarily has no data', async () => {
    const { result, rerender } = renderHook(() => useFormListActions());

    act(() => result.current.edit('saved-form'));
    query.data = { id: 'saved-form', name: 'Existing form' } as AdmissionForm;
    rerender();
    await waitFor(() => expect(result.current.editing?.id).toBe('saved-form'));

    query.data = null;
    rerender();

    expect(result.current.editing?.id).toBe('saved-form');
    expect(result.current.dialog.value).toBe(true);
  });

  it('does not display a different form while the selected Edit form loads', () => {
    query.data = { id: 'previous-form', name: 'Previous form' } as AdmissionForm;
    const { result } = renderHook(() => useFormListActions());

    act(() => result.current.edit('next-form'));

    expect(result.current.editing).toBeNull();
    expect(result.current.editingId).toBe('next-form');
  });
});
