import type {
  AdmissionForm,
  CreateUpdateAdmissionForm,
} from 'src/redux/student/admissions/admission-forms-api';

import { useState } from 'react';
import { it, vi, expect, describe, beforeEach } from 'vitest';
import { act, render, screen, waitFor, fireEvent, renderHook } from '@testing-library/react';

import { useFormListActions } from './use-form-list-actions';
import { AdmissionFormPublishDialog } from '../admission-form-publish-dialog';

const query = vi.hoisted(() => ({ data: null as AdmissionForm | null, isError: false }));
const publication = vi.hoisted(() => ({ validate: vi.fn(), publish: vi.fn() }));
const saving = vi.hoisted(() => ({ create: vi.fn(), update: vi.fn() }));
const deletion = vi.hoisted(() => ({ remove: vi.fn() }));
const freshForm = vi.hoisted(() => ({ load: vi.fn() }));
const toast = vi.hoisted(() => ({ error: vi.fn(), success: vi.fn() }));
const navigation = vi.hoisted(() => ({ push: vi.fn() }));

vi.mock('next/navigation', () => ({ useRouter: () => navigation }));
vi.mock('src/components/iconify', () => ({ Iconify: () => <span aria-hidden="true" /> }));
vi.mock('src/components/toast', () => ({ shikshaMitraToast: toast }));
vi.mock('react-redux', () => ({
  useSelector: (selector: (state: unknown) => unknown) =>
    selector({ auth: { permissions: [], user: { sub: 'test-user', role: 'admin' } } }),
}));
vi.mock('src/redux/student/admissions/admission-forms-api', () => {
  const mutation = () => [vi.fn(), { isLoading: false }];
  return {
    useGetAdmissionFormQuery: () => ({ ...query, refetch: vi.fn() }),
    useGetAdmissionFormUsageQuery: () => ({
      data: { offeringCount: 0, applicationCount: 0 },
      isError: false,
    }),
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

  it('runs table validation, opens Edit for invalid choices, then publishes a corrected row with its saved stamp', async () => {
    const currentRow = {
      id: 'draft',
      name: 'Inquiry with Other',
      version: 1,
      status: 0,
      concurrencyStamp: 'original',
    } as AdmissionForm;
    const savedRow = { ...currentRow, concurrencyStamp: 'saved-corrected' };
    const correction: CreateUpdateAdmissionForm = {
      name: currentRow.name,
      concurrencyStamp: 'original',
      purpose: 1,
      code: 'INQUIRY',
      layoutType: 0,
      fieldsPerRow: 2,
      defaultLanguage: 'en',
      supportedLanguages: ['en'],
      sections: [],
    };
    saving.update.mockReturnValue({ unwrap: async () => savedRow });
    publication.validate
      .mockReturnValueOnce({
        unwrap: async () => ({
          isValid: false,
          errors: ['Admissions.FormInvalidOptions:APPLICANT_GENDER'],
        }),
      })
      .mockReturnValue({ unwrap: async () => ({ isValid: true, errors: [] }) });
    publication.publish.mockReturnValue({ unwrap: async () => ({ ...currentRow, status: 1 }) });
    function TablePublication() {
      const actions = useFormListActions();
      const [row, setRow] = useState(currentRow);
      return (
        <>
          <button type="button" onClick={() => actions.requestPublish(row)}>
            Publish from table
          </button>
          <output aria-label="Editing form">{actions.editingId}</output>
          <button
            type="button"
            onClick={async () => {
              await actions.save(correction);
              setRow(savedRow);
            }}
          >
            Save correction
          </button>
          <AdmissionFormPublishDialog
            form={actions.pendingPublish}
            issues={actions.publishIssues}
            validating={actions.validatingPublish}
            publishing={actions.publishing}
            onClose={actions.clearPendingPublish}
            onEdit={actions.editPendingPublish}
            onPublish={actions.confirmPublish}
          />
        </>
      );
    }
    render(<TablePublication />);
    fireEvent.click(screen.getByRole('button', { name: 'Publish from table' }));
    await screen.findByRole('dialog', { name: 'Form needs changes' });
    expect(screen.getByText('APPLICANT_GENDER needs valid choices.')).toBeVisible();
    expect(screen.queryByRole('button', { name: 'Publish form' })).not.toBeInTheDocument();
    expect(publication.publish).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Edit draft' }));
    expect(screen.getByLabelText('Editing form')).toHaveTextContent('draft');
    fireEvent.click(await screen.findByRole('button', { name: 'Save correction' }));
    await waitFor(() => expect(screen.getByLabelText('Editing form')).toBeEmptyDOMElement());
    expect(saving.update).toHaveBeenCalledExactlyOnceWith({ id: 'draft', body: correction });
    fireEvent.click(screen.getByRole('button', { name: 'Publish from table' }));
    await screen.findByRole('dialog', { name: 'Publish Inquiry with Other?' });
    await waitFor(() => expect(screen.getByRole('button', { name: 'Publish form' })).toBeEnabled());
    fireEvent.click(screen.getByRole('button', { name: 'Publish form' }));
    await waitFor(() =>
      expect(publication.publish).toHaveBeenCalledExactlyOnceWith({
        id: 'draft',
        concurrencyStamp: 'saved-corrected',
      })
    );
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('retains the opened revision when a newer same-ID background snapshot arrives', async () => {
    const { result, rerender } = renderHook(() => useFormListActions());
    act(() => result.current.edit('draft'));
    query.data = { id: 'draft', name: 'Opened form', concurrencyStamp: 'opened' } as AdmissionForm;
    rerender();
    await waitFor(() => expect(result.current.editing?.concurrencyStamp).toBe('opened'));
    query.data = { ...query.data, name: 'Changed by another user', concurrencyStamp: 'external' };
    rerender();
    expect(result.current.editing?.concurrencyStamp).toBe('opened');
    expect(result.current.editing?.name).toBe('Opened form');
  });

  it('does not silently refresh or retry a genuine conflict during table publication', async () => {
    publication.validate.mockReturnValue({ unwrap: async () => ({ isValid: true, errors: [] }) });
    publication.publish.mockReturnValue({
      unwrap: () =>
        Promise.reject(
          Object.assign(new Error('Form changed'), {
            status: 400,
            data: {
              errorCode: 'Admissions.FormConcurrencyConflict',
              detail: 'One or more business rules were violated.',
            },
          })
        ),
    });
    const { result } = renderHook(() => useFormListActions());
    await act(async () => {
      await result.current.requestPublish({
        id: 'draft',
        concurrencyStamp: 'reviewed-version',
      } as AdmissionForm);
    });
    await act(async () => {
      expect(await result.current.confirmPublish()).toBe(false);
    });
    expect(publication.publish).toHaveBeenCalledExactlyOnceWith({
      id: 'draft',
      concurrencyStamp: 'reviewed-version',
    });
    expect(freshForm.load).not.toHaveBeenCalled();
    expect(result.current.pendingPublish?.id).toBe('draft');
    expect(toast.error).toHaveBeenCalledWith({
      message:
        'This form has changed since it was opened. Close and reopen it to review the latest version before trying again.',
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
      await expect(
        result.current.saveAndPublish({
          name: 'Inquiry',
          purpose: 0,
          sections: [],
        } as unknown as CreateUpdateAdmissionForm)
      ).rejects.toThrow('Add a required Student name field before publishing.');
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
