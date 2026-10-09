import type { AdmissionApplicant360 } from 'src/redux/student/admissions/admission-applicants-api';

import { vi, it, expect, describe, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

import { ApplicationApplicantNotesDialog } from './application-applicant-notes-dialog';
import { ApplicationApplicantIdentityDialog } from './application-applicant-identity-dialog';

const state = vi.hoisted(() => ({
  query: vi.fn(),
  refetch: vi.fn(),
  saveIdentity: vi.fn(),
  createNote: vi.fn(),
  updateNote: vi.fn(),
  push: vi.fn(),
  toastError: vi.fn(),
  toastSuccess: vi.fn(),
  permissions: [] as { name: string; isGranted: boolean }[],
  result: {} as {
    currentData?: AdmissionApplicant360;
    isLoading?: boolean;
    isFetching?: boolean;
    isError?: boolean;
  },
  saving: false,
}));
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: state.push }) }));
vi.mock('react-redux', () => ({
  useSelector: (select: (value: unknown) => unknown) =>
    select({ auth: { permissions: state.permissions } }),
}));
vi.mock('src/redux/student/admissions/admission-applicants-api', () => ({
  useGetAdmissionApplicant360Query: (...args: unknown[]) => {
    state.query(...args);
    return { ...state.result, refetch: state.refetch };
  },
  useUpdateAdmissionApplicantProfileMutation: () => [
    state.saveIdentity,
    { isLoading: state.saving },
  ],
  useCreateAdmissionApplicantNoteMutation: () => [state.createNote, { isLoading: state.saving }],
  useUpdateAdmissionApplicantNoteMutation: () => [state.updateNote, { isLoading: state.saving }],
}));
vi.mock('src/components/toast', () => ({
  shikshaMitraToast: { success: state.toastSuccess, error: state.toastError },
}));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('src/components/empty-content', () => ({
  EmptyContent: ({ title }: { title: string }) => <p>{title}</p>,
}));
vi.mock('src/components/loading-button', () => ({
  LoadingButton: ({
    children,
    onClick,
    disabled,
    loading,
  }: {
    children: React.ReactNode;
    onClick: () => void;
    disabled?: boolean;
    loading?: boolean;
  }) => (
    <button type="button" disabled={disabled || loading} onClick={onClick}>
      {children}
    </button>
  ),
}));
vi.mock('src/components/customDialog', () => ({
  default: ({
    open,
    title,
    children,
    handleClose,
    disableClose,
  }: {
    open: boolean;
    title: string;
    children: React.ReactNode;
    handleClose: () => void;
    disableClose?: boolean;
  }) =>
    open ? (
      <section role="dialog" aria-label={title}>
        <h2>{title}</h2>
        <button
          type="button"
          aria-label={`Close ${title}`}
          disabled={disableClose}
          onClick={handleClose}
        >
          ×
        </button>
        {children}
      </section>
    ) : null,
  DialogScrollContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
vi.mock('@mui/x-date-pickers', () => ({ DatePicker: () => <span>Date of birth</span> }));
vi.mock('src/components/custom-select', () => ({
  default: ({ label, value }: { label: string; value: string }) => (
    <input aria-label={label} readOnly value={value} />
  ),
}));

const fixture: AdmissionApplicant360 = {
  applicant: {
    id: 'applicant-1',
    familyId: 'family-1',
    firstName: 'Parth',
    lastName: 'Patel',
    dateOfBirth: '2020-01-01',
    gender: 'Male',
  },
  primaryGuardian: { firstName: 'Nisha', mobile: '9876543210' },
  applications: [],
  activities: [],
  notes: [
    { id: 'note-1', text: 'Family prefers morning visit', creationTime: '2026-10-09T08:00:00Z' },
  ],
};
beforeEach(() => {
  vi.clearAllMocks();
  state.saving = false;
  state.permissions = [
    'Students.Admissions.Applicants.View',
    'Students.Admissions.Applicants.Add',
  ].map((name) => ({ name, isGranted: true }));
  state.result = { currentData: fixture };
  state.saveIdentity.mockReturnValue({ unwrap: () => Promise.resolve({}) });
  state.createNote.mockReturnValue({ unwrap: () => Promise.resolve({}) });
  state.updateNote.mockReturnValue({ unwrap: () => Promise.resolve({}) });
});

describe('focused applicant identity repair', () => {
  it('queries only while open and authorized', () => {
    const view = render(
      <ApplicationApplicantIdentityDialog
        open={false}
        applicantId="applicant-1"
        onClose={vi.fn()}
      />
    );
    expect(state.query).toHaveBeenLastCalledWith('applicant-1', { skip: true });
    view.rerender(
      <ApplicationApplicantIdentityDialog open applicantId="applicant-1" onClose={vi.fn()} />
    );
    expect(state.query).toHaveBeenLastCalledWith('applicant-1', { skip: false });
  });
  it.each(['Students.Admissions.Applicants.View', 'Students.Admissions.Applicants.Add'])(
    'denies identity repair without exact %s grant',
    (name) => {
      state.permissions = state.permissions.filter((permission) => permission.name !== name);
      render(
        <ApplicationApplicantIdentityDialog open applicantId="applicant-1" onClose={vi.fn()} />
      );
      expect(state.query).toHaveBeenLastCalledWith('applicant-1', { skip: true });
      expect(screen.getByText(/permission to edit applicant identity/)).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Save identity' })).not.toBeInTheDocument();
    }
  );
  it('shows fetching before data arrives and supports retry for missing data', () => {
    state.result = { isFetching: true };
    const view = render(
      <ApplicationApplicantIdentityDialog open applicantId="applicant-1" onClose={vi.fn()} />
    );
    expect(screen.getByRole('status', { name: 'Loading applicant identity' })).toBeInTheDocument();
    state.result = {};
    view.rerender(
      <ApplicationApplicantIdentityDialog open applicantId="applicant-1" onClose={vi.fn()} />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(state.refetch).toHaveBeenCalledOnce();
  });
  it.each([10, 11])('preserves identity locks for closed admission status %s', (status) => {
    state.result = {
      currentData: {
        ...fixture,
        applications: [{ id: 'app', status } as AdmissionApplicant360['applications'][number]],
      },
    };
    render(<ApplicationApplicantIdentityDialog open applicantId="applicant-1" onClose={vi.fn()} />);
    expect(screen.getByText(/finalized or enrolled admission/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Save identity' })).not.toBeInTheDocument();
  });
  it('saves the existing validated identity contract and refreshes its parent', async () => {
    const close = vi.fn();
    const updated = vi.fn();
    render(
      <ApplicationApplicantIdentityDialog
        open
        applicantId="applicant-1"
        onClose={close}
        onUpdated={updated}
      />
    );
    fireEvent.change(screen.getByRole('textbox', { name: /First name/ }), {
      target: { value: ' Parth Updated ' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save identity' }));
    await waitFor(() => expect(close).toHaveBeenCalledOnce());
    expect(state.saveIdentity).toHaveBeenCalledWith({
      applicantId: 'applicant-1',
      body: expect.objectContaining({
        firstName: 'Parth Updated',
        guardianMobile: '9876543210',
        gender: 'Male',
      }),
    });
    expect(updated).toHaveBeenCalledOnce();
  });
  it('preserves form values after failed save and guards footer cancellation locally', async () => {
    const close = vi.fn();
    state.saveIdentity.mockReturnValue({
      unwrap: () =>
        Promise.reject(
          Object.assign(new Error('Identity is locked'), { data: { detail: 'Identity is locked' } })
        ),
    });
    render(<ApplicationApplicantIdentityDialog open applicantId="applicant-1" onClose={close} />);
    fireEvent.change(screen.getByRole('textbox', { name: /First name/ }), {
      target: { value: 'Edited name' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save identity' }));
    await waitFor(() => expect(state.toastError).toHaveBeenCalled());
    expect(screen.getByRole('textbox', { name: /First name/ })).toHaveValue('Edited name');
    expect(close).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(
      screen.getByRole('dialog', { name: 'Discard Unsaved Identity Changes?' })
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Keep editing' }));
    expect(close).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    fireEvent.click(screen.getByRole('button', { name: 'Discard changes' }));
    expect(close).toHaveBeenCalledOnce();
  });
  it('blocks closing while saving and releases its parent busy flag on unmount', () => {
    state.saving = true;
    const busy = vi.fn();
    const close = vi.fn();
    const view = render(
      <ApplicationApplicantIdentityDialog
        open
        applicantId="applicant-1"
        onClose={close}
        onBusyChange={busy}
      />
    );
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Close Edit Applicant Identity' })).toBeDisabled();
    expect(busy).toHaveBeenLastCalledWith(true);
    view.unmount();
    expect(busy).toHaveBeenLastCalledWith(false);
    expect(close).not.toHaveBeenCalled();
  });
});

describe('applicant notes dialog', () => {
  it('does not fetch while closed or denied', () => {
    state.permissions = [];
    const view = render(
      <ApplicationApplicantNotesDialog open={false} applicantId="applicant-1" onClose={vi.fn()} />
    );
    expect(state.query).toHaveBeenLastCalledWith('applicant-1', { skip: true });
    view.rerender(
      <ApplicationApplicantNotesDialog open applicantId="applicant-1" onClose={vi.fn()} />
    );
    expect(screen.getByText(/permission to view applicant notes/)).toBeInTheDocument();
    expect(screen.queryByText(fixture.notes[0].text)).not.toBeInTheDocument();
  });
  it('permits reading existing notes without granting note mutations', () => {
    state.permissions = state.permissions.filter((permission) => permission.name.endsWith('.View'));
    render(<ApplicationApplicantNotesDialog open applicantId="applicant-1" onClose={vi.fn()} />);
    expect(screen.getByText(fixture.notes[0].text)).toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Edit' })).not.toBeInTheDocument();
    expect(state.createNote).not.toHaveBeenCalled();
  });
  it('shows a recoverable loading/error state', () => {
    state.result = { isFetching: true };
    const view = render(
      <ApplicationApplicantNotesDialog open applicantId="applicant-1" onClose={vi.fn()} />
    );
    expect(screen.getByRole('status', { name: 'Loading applicant notes' })).toBeInTheDocument();
    state.result = { isError: true };
    view.rerender(
      <ApplicationApplicantNotesDialog open applicantId="applicant-1" onClose={vi.fn()} />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(state.refetch).toHaveBeenCalledOnce();
  });
  it('reuses note edit mutation and clears answers only after successful save', async () => {
    render(<ApplicationApplicantNotesDialog open applicantId="applicant-1" onClose={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Edit' }));
    fireEvent.change(screen.getByRole('textbox', { name: 'Edit note' }), {
      target: { value: ' Updated context ' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Update note' }));
    await waitFor(() => expect(screen.getByRole('textbox', { name: 'Add note' })).toHaveValue(''));
    expect(state.updateNote).toHaveBeenCalledWith({
      applicantId: 'applicant-1',
      noteId: 'note-1',
      text: 'Updated context',
    });
  });
  it('retains a failed new note and asks before discarding it', async () => {
    const close = vi.fn();
    state.createNote.mockReturnValue({
      unwrap: () =>
        Promise.reject(Object.assign(new Error('Try later'), { data: { detail: 'Try later' } })),
    });
    render(<ApplicationApplicantNotesDialog open applicantId="applicant-1" onClose={close} />);
    fireEvent.change(screen.getByRole('textbox', { name: 'Add note' }), {
      target: { value: 'Unsaved context' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Add note' }));
    await waitFor(() => expect(state.toastError).toHaveBeenCalledWith({ message: 'Try later' }));
    expect(screen.getByRole('textbox', { name: 'Add note' })).toHaveValue('Unsaved context');
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(close).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Discard changes' }));
    expect(close).toHaveBeenCalledOnce();
  });
  it('blocks editing and close while a note is saving and reports busy cleanup', () => {
    state.saving = true;
    const busy = vi.fn();
    const view = render(
      <ApplicationApplicantNotesDialog
        open
        applicantId="applicant-1"
        onClose={vi.fn()}
        onBusyChange={busy}
      />
    );
    expect(screen.getByRole('textbox', { name: 'Add note' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Close' })).toBeDisabled();
    expect(busy).toHaveBeenLastCalledWith(true);
    view.unmount();
    expect(busy).toHaveBeenLastCalledWith(false);
  });
});
