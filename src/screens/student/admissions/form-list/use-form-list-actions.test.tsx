import type {
  AdmissionForm,
  CreateUpdateAdmissionForm,
} from 'src/redux/student/admissions/admission-forms-api';

import { it, vi, expect, describe, beforeEach } from 'vitest';
import { act, waitFor, renderHook } from '@testing-library/react';

import { useFormListActions } from './use-form-list-actions';

const query = vi.hoisted(() => ({ data: null as AdmissionForm | null, isError: false }));
const publication = vi.hoisted(() => ({ validate: vi.fn(), publish: vi.fn() }));
const saving = vi.hoisted(() => ({ create: vi.fn(), update: vi.fn() }));
const deletion = vi.hoisted(() => ({ remove: vi.fn() }));
const freshForm = vi.hoisted(() => ({ load: vi.fn() }));
const toast = vi.hoisted(() => ({ error: vi.fn(), success: vi.fn() }));
const navigation = vi.hoisted(() => ({ push: vi.fn() }));

vi.mock('next/navigation', () => ({ useRouter: () => navigation }));
vi.mock('src/components/toast', () => ({ shikshaMitraToast: toast }));
vi.mock('react-redux', () => ({
  useSelector: (selector: (state: unknown) => unknown) =>
    selector({ auth: { permissions: [], user: { sub: 'test-user', role: 'admin' } } }),
}));
vi.mock('src/redux/student/admissions/admission-forms-api', () => {
  const mutation = () => [vi.fn(), { isLoading: false }];
  return {
    useGetAdmissionFormQuery: () => ({ ...query, refetch: vi.fn() }),
    useLazyGetAdmissionFormQuery: () => [freshForm.load],
    useCloneAdmissionFormMutation: mutation,
    useCreateAdmissionFormMutation: () => [saving.create, { isLoading: false }],
    useDeleteAdmissionFormMutation: () => [deletion.remove, { isLoading: false }],
    useUpdateAdmissionFormMutation: () => [saving.update, { isLoading: false }],
    usePublishAdmissionFormMutation: () => [publication.publish, { isLoading: false }],
    useArchiveAdmissionFormMutation: mutation,
    useValidateAdmissionFormMutation: () => [publication.validate, { isLoading: false }],
    useCreateAdmissionFormVersionMutation: mutation,
  };
});

describe('useFormListActions editor mode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    query.data = null;
    query.isError = false;
    freshForm.load.mockReturnValue({
      unwrap: () => Promise.resolve({ id: 'draft', status: 0, concurrencyStamp: 'latest' }),
      unsubscribe: vi.fn(),
    });
  });

  it('passes the originating Forms list context to the shared preview route', () => {
    const { result } = renderHook(() => useFormListActions());
    const origin = '/student/admissions/settings/forms?view=registration&page=2';
    act(() => result.current.preview('registration-form', origin));
    const destination = new URL(navigation.push.mock.lastCall![0], 'https://school.test');
    expect(destination.pathname).toBe(
      '/student/admissions/settings/forms/registration-form/preview'
    );
    expect(destination.searchParams.get('returnTo')).toBe(origin);
  });

  it('checks Inquiry minimum questions before creating a draft for Publish now', async () => {
    const { result } = renderHook(() => useFormListActions());
    await act(async () => {
      await expect(result.current.saveAndPublish({ name: 'Inquiry', purpose: 0, sections: [] } as unknown as CreateUpdateAdmissionForm)).rejects.toThrow('Add a required Student name field before publishing.');
    });
    expect(saving.create).not.toHaveBeenCalled();
    expect(publication.publish).not.toHaveBeenCalled();
  });

  it('shows form validation issues before publishing a draft', async () => {
    publication.validate.mockReturnValue({
      unwrap: () =>
        Promise.resolve({ isValid: false, errors: ['Admissions.FormStepperRequiresTwoSteps'] }),
    });
    const { result } = renderHook(() => useFormListActions());

    await act(async () => {
      await result.current.requestPublish({
        id: 'draft',
        concurrencyStamp: 'current',
      } as AdmissionForm);
    });

    expect(publication.validate).toHaveBeenCalledWith('draft');
    expect(publication.publish).not.toHaveBeenCalled();
    expect(result.current.publishIssues).toEqual([
      'Add a second step or change the form layout to Single page before publishing.',
    ]);
  });

  it('publishes a valid draft directly without a review request', async () => {
    publication.validate.mockReturnValue({
      unwrap: () => Promise.resolve({ isValid: true, errors: [] }),
    });
    publication.publish.mockReturnValue({ unwrap: () => Promise.resolve({}) });
    const { result } = renderHook(() => useFormListActions());

    await act(async () => {
      await result.current.requestPublish({
        id: 'draft',
        concurrencyStamp: 'current',
      } as AdmissionForm);
    });
    expect(result.current.publishIssues).toEqual([]);
    await act(async () => {
      await result.current.confirmPublish();
    });

    expect(publication.publish).toHaveBeenCalledWith({ id: 'draft', concurrencyStamp: 'current' });
    expect(toast.success).toHaveBeenCalledWith({ message: 'Form published' });
  });

  it('keeps a saved draft for retry if Save and publish fails validation', async () => {
    const draft = { id: 'new-draft', name: 'New form', status: 0, concurrencyStamp: 'saved' };
    saving.create.mockReturnValue({ unwrap: () => Promise.resolve(draft) });
    publication.validate.mockReturnValue({
      unwrap: () => Promise.resolve({ isValid: false, errors: ['Admissions.FormNoFields'] }),
    });
    const { result } = renderHook(() => useFormListActions());

    await act(async () => {
      await expect(
        result.current.saveAndPublish({ name: 'New form' } as CreateUpdateAdmissionForm)
      ).rejects.toThrow('Draft saved, but not published.');
    });

    expect(result.current.editingId).toBe('new-draft');
    expect(publication.publish).not.toHaveBeenCalled();
    publication.validate.mockReturnValue({
      unwrap: () => Promise.resolve({ isValid: true, errors: [] }),
    });
    saving.update.mockReturnValue({ unwrap: () => Promise.resolve(draft) });
    publication.publish.mockReturnValue({ unwrap: () => Promise.resolve({ ...draft, status: 1 }) });

    await act(async () => {
      await result.current.saveAndPublish({ name: 'New form' } as CreateUpdateAdmissionForm);
    });

    expect(saving.create).toHaveBeenCalledOnce();
    expect(saving.update).toHaveBeenCalledWith({ id: 'new-draft', body: { name: 'New form' } });
    expect(publication.publish).toHaveBeenCalledWith({
      id: 'new-draft',
      concurrencyStamp: 'saved',
    });
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

  it('keeps the delete confirmation open and explains a rejected dependency', async () => {
    deletion.remove.mockReturnValue({
      unwrap: () =>
        Promise.reject(
          Object.assign(new Error('Form in use'), {
            data: {
              errorCode: 'Admissions.FormInUse',
              detail: 'Cannot delete this draft: it is linked to 1 offering.',
            },
          })
        ),
    });
    const { result } = renderHook(() => useFormListActions());

    act(() =>
      result.current.requestDelete({ id: 'draft', concurrencyStamp: 'current' } as AdmissionForm)
    );
    await act(async () => {
      await result.current.confirmDelete();
    });

    expect(freshForm.load).toHaveBeenCalledWith('draft', false);
    expect(freshForm.load.mock.results[0].value.unsubscribe).toHaveBeenCalledOnce();
    expect(deletion.remove).toHaveBeenCalledWith({ id: 'draft', concurrencyStamp: 'latest' });
    expect(result.current.pendingDelete?.id).toBe('draft');
    expect(result.current.deleteError).toBe(
      'Cannot delete this draft: it is linked to 1 offering.'
    );
    expect(toast.error).toHaveBeenCalledWith({ message: result.current.deleteError });
  });

  it('closes the delete confirmation after a successful draft deletion', async () => {
    deletion.remove.mockReturnValue({ unwrap: () => Promise.resolve({}) });
    const { result } = renderHook(() => useFormListActions());

    act(() =>
      result.current.requestDelete({ id: 'draft', concurrencyStamp: 'current' } as AdmissionForm)
    );
    await act(async () => {
      await result.current.confirmDelete();
    });

    expect(freshForm.load).toHaveBeenCalledWith('draft', false);
    expect(deletion.remove).toHaveBeenCalledWith({ id: 'draft', concurrencyStamp: 'latest' });
    expect(result.current.pendingDelete).toBeNull();
    expect(result.current.deleteError).toBeNull();
    expect(toast.success).toHaveBeenCalledWith({
      message: 'Admission form draft deleted successfully',
    });
  });

  it('does not delete when the fresh form has no concurrency stamp', async () => {
    freshForm.load.mockReturnValue({
      unwrap: () => Promise.resolve({ id: 'draft', status: 0, concurrencyStamp: '' }),
      unsubscribe: vi.fn(),
    });
    const { result } = renderHook(() => useFormListActions());

    act(() =>
      result.current.requestDelete({ id: 'draft', concurrencyStamp: 'old' } as AdmissionForm)
    );
    await act(async () => {
      await result.current.confirmDelete();
    });

    expect(deletion.remove).not.toHaveBeenCalled();
    expect(result.current.pendingDelete?.id).toBe('draft');
    expect(result.current.deleteError).toContain('Unable to verify the latest form version');
  });

  it('keeps confirmation open and blocks repeated actions while checking the latest version', async () => {
    let resolveForm!: (value: unknown) => void;
    freshForm.load.mockReturnValue({
      unwrap: () =>
        new Promise((resolve) => {
          resolveForm = resolve;
        }),
      unsubscribe: vi.fn(),
    });
    deletion.remove.mockReturnValue({ unwrap: () => Promise.resolve({}) });
    const { result } = renderHook(() => useFormListActions());
    act(() =>
      result.current.requestDelete({ id: 'draft', concurrencyStamp: 'old' } as AdmissionForm)
    );
    let pending!: Promise<boolean>;
    act(() => {
      pending = result.current.confirmDelete();
    });

    expect(result.current.deleting).toBe(true);
    act(() => result.current.clearPendingDelete());
    await act(async () => {
      await result.current.confirmDelete();
    });
    expect(result.current.pendingDelete?.id).toBe('draft');
    expect(freshForm.load).toHaveBeenCalledOnce();

    await act(async () => {
      resolveForm({ id: 'draft', status: 0, concurrencyStamp: 'latest' });
      await pending;
    });
    expect(deletion.remove).toHaveBeenCalledOnce();
  });

  it('does not delete a draft that was published before confirmation', async () => {
    freshForm.load.mockReturnValue({
      unwrap: () => Promise.resolve({ id: 'draft', status: 1, concurrencyStamp: 'latest' }),
      unsubscribe: vi.fn(),
    });
    const { result } = renderHook(() => useFormListActions());
    act(() =>
      result.current.requestDelete({ id: 'draft', concurrencyStamp: 'old' } as AdmissionForm)
    );
    await act(async () => {
      await result.current.confirmDelete();
    });
    expect(deletion.remove).not.toHaveBeenCalled();
    expect(result.current.deleteError).toContain('Only a draft');
  });
});
