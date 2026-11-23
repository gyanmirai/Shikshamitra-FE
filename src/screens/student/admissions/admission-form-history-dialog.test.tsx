import type { ReactNode } from 'react';
import type {
  AdmissionForm,
  AdmissionFormAuditEntry,
  AdmissionFormVersionSummary,
  AdmissionFormVersionComparison,
} from 'src/redux/student/admissions/admission-forms-api';

import userEvent from '@testing-library/user-event';
import { vi, it, expect, describe, beforeEach } from 'vitest';
import { render, screen, within, waitFor } from '@testing-library/react';

import { AdmissionFormHistoryDialog } from './admission-form-history-dialog';

const toast = vi.hoisted(() => ({
  error: vi.fn(
    (_options: { message: ReactNode; alertProps: (id: string) => { action?: ReactNode } }) =>
      'history-error'
  ),
  dismiss: vi.fn(),
}));
vi.mock('src/components/toast', () => ({ shikshaMitraToast: toast }));

const hooks = vi.hoisted(() => ({
  audit: {
    currentData: [] as AdmissionFormAuditEntry[] | undefined,
    data: [] as AdmissionFormAuditEntry[],
    isLoading: false,
    isFetching: false,
    isError: false,
    refetch: vi.fn(),
  },
  versions: {
    currentData: [] as AdmissionFormVersionSummary[] | undefined,
    data: [] as AdmissionFormVersionSummary[],
    isLoading: false,
    isFetching: false,
    isError: false,
    refetch: vi.fn(),
  },
  compare: vi.fn(),
  comparison: {
    data: undefined as AdmissionFormVersionComparison | undefined,
    originalArgs: undefined as { id: string; otherId: string } | undefined,
    isFetching: false,
    isError: false,
  },
}));

vi.mock('src/redux/student/admissions/admission-forms-api', () => ({
  useGetAdmissionFormAuditQuery: () => hooks.audit,
  useGetAdmissionFormVersionsQuery: () => hooks.versions,
  useLazyCompareAdmissionFormVersionsQuery: () => [hooks.compare, hooks.comparison],
}));
vi.mock('src/components/iconify', () => ({
  Iconify: ({ icon }: { icon: string }) => <span data-icon={icon} />,
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
    children: ReactNode;
    handleClose: () => void;
    disableClose: boolean;
  }) =>
    open ? (
      <div role="dialog" aria-label={title}>
        <button type="button" aria-label="close" disabled={disableClose} onClick={handleClose} />
        {children}
      </div>
    ) : null,
  DialogScrollContent: ({ children }: { children: ReactNode }) => children,
}));

const form = { id: 'current-form', name: 'School inquiry', version: 2, status: 0 } as AdmissionForm;
const props = {
  form,
  canRestore: true,
  onClose: vi.fn(),
  onRestoreVersion: vi.fn(),
  onOpenExistingDraft: vi.fn(),
};
const olderVersion = { id: 'older-form', version: 1, status: 1 } as AdmissionFormVersionSummary;

const selectVersion = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(screen.getByRole('combobox', { name: 'From' }));
  await user.click(screen.getByRole('option', { name: /Version 1/ }));
};

describe('Admission form history dialog', () => {
  it('lets view-only staff compare history without offering a restore mutation', async () => {
    const user = userEvent.setup();
    hooks.versions.currentData = [olderVersion];
    render(<AdmissionFormHistoryDialog {...props} canRestore={false} />);
    await selectVersion(user);
    expect(screen.queryByRole('button', { name: 'Restore as New Draft' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /^Compare$/ }));
    expect(hooks.compare).toHaveBeenCalledWith({ id: olderVersion.id, otherId: form.id }, true);
    expect(props.onRestoreVersion).not.toHaveBeenCalled();
  });
  beforeEach(() => {
    vi.clearAllMocks();
    hooks.audit.currentData = [];
    hooks.audit.isLoading = false;
    hooks.audit.isFetching = false;
    hooks.audit.data = [];
    hooks.audit.isError = false;
    hooks.versions.currentData = [];
    hooks.versions.isLoading = false;
    hooks.versions.isFetching = false;
    hooks.versions.data = [];
    hooks.versions.isError = false;
    hooks.comparison.data = undefined;
    hooks.comparison.originalArgs = undefined;
    hooks.comparison.isFetching = false;
    hooks.comparison.isError = false;
    props.onRestoreVersion.mockReset();
  });

  it('shows grouped empty states and both standard close actions', async () => {
    const user = userEvent.setup();
    render(<AdmissionFormHistoryDialog {...props} />);
    expect(
      screen.getByRole('dialog', { name: 'History & Versions · School inquiry' })
    ).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Compare versions' })).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Activity' })).toBeVisible();
    expect(screen.getByText('No other versions are available yet.')).toBeVisible();
    expect(screen.getByText('No recorded form activity is available.')).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'close' }));
    await user.click(screen.getByRole('button', { name: 'close' }));
    expect(props.onClose).toHaveBeenCalledTimes(2);
  });

  it('distinguishes failed reads from empty data and retries each section', async () => {
    const user = userEvent.setup();
    hooks.audit.isError = true;
    hooks.versions.isError = true;
    render(<AdmissionFormHistoryDialog {...props} />);
    expect(toast.error).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Unable to load form versions. Please try again.' })
    );
    expect(toast.error).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Unable to load form activity. Please try again.' })
    );
    expect(screen.queryByText(/Unable to load form versions/)).not.toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.queryByText('No other versions are available yet.')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Retry loading versions' }));
    await user.click(screen.getByRole('button', { name: 'Retry loading activity' }));
    render(
      <>
        {toast.error.mock.calls.map(([notice], index) => (
          <span key={index}>{notice.alertProps('history-error').action}</span>
        ))}
      </>
    );
    const retryActions = screen.getAllByRole('button', { name: 'Retry' });
    await user.click(retryActions[0]);
    await user.click(retryActions[1]);
    expect(hooks.versions.refetch).toHaveBeenCalledTimes(2);
    expect(hooks.audit.refetch).toHaveBeenCalledTimes(2);
  });

  it('keeps read-only close available during loading and displays audit details', () => {
    hooks.audit.isLoading = true;
    hooks.versions.isLoading = true;
    const view = render(<AdmissionFormHistoryDialog {...props} />);
    expect(screen.getByLabelText('Loading Form Versions')).toBeVisible();
    expect(screen.getByLabelText('Loading Form Activity')).toBeVisible();
    expect(screen.getByRole('button', { name: 'close' })).toBeEnabled();
    hooks.audit.isLoading = false;
    hooks.audit.currentData = [
      {
        id: 'event-1',
        action: 'AdminOverrideApproved',
        occurredAt: '2026-10-02T10:00:00Z',
        version: 1,
        comment: 'Approved by the school administrator',
      },
    ];
    view.rerender(<AdmissionFormHistoryDialog {...props} />);
    const entry = within(
      screen.getByRole('list', { name: 'Form activity, newest first' })
    ).getByRole('listitem');
    expect(within(entry).getByText('Admin Override Approved')).toBeVisible();
    expect(within(entry).getByText('Version 1')).toBeVisible();
    expect(within(entry).getByText('Approved by the school administrator')).toBeVisible();
  });

  it('shows loading instead of the previous form history while another form loads', () => {
    hooks.audit.currentData = undefined;
    hooks.audit.isFetching = true;
    hooks.audit.data = [
      {
        id: 'previous-event',
        action: 'PreviousFormPublished',
        occurredAt: '2026-10-02T10:00:00Z',
        version: 1,
      },
    ];
    hooks.versions.currentData = undefined;
    hooks.versions.isFetching = true;
    hooks.versions.data = [olderVersion];
    render(<AdmissionFormHistoryDialog {...props} />);
    expect(screen.getByLabelText('Loading Form Activity')).toBeVisible();
    expect(screen.getByLabelText('Loading Form Versions')).toBeVisible();
    expect(screen.queryByText('Previous Form Published')).not.toBeInTheDocument();
    expect(screen.queryByRole('combobox', { name: 'Compare With' })).not.toBeInTheDocument();
  });

  it('groups each activity with its version, time, actor and comment when available', () => {
    const published = {
      id: 'published-event',
      action: 'Published',
      occurredAt: '2026-10-02T10:00:00Z',
      version: 2,
      actorId: 'recorded-staff',
      actorName: 'Sam Patel',
      comment: 'Ready for admissions',
    };
    hooks.audit.currentData = [
      published,
      { id: 'created-event', action: 'Created', occurredAt: '2026-10-01T09:00:00Z', version: 2 },
    ];
    render(<AdmissionFormHistoryDialog {...props} />);

    const activity = screen.getByRole('list', { name: 'Form activity, newest first' });
    const [publishedItem, createdItem] = within(activity).getAllByRole('listitem');
    expect(within(publishedItem).getByText('Published')).toBeVisible();
    expect(within(publishedItem).getByText('Version 2')).toBeVisible();
    expect(publishedItem.querySelector('time')).toHaveAttribute('datetime', published.occurredAt);
    expect(within(publishedItem).getByText('Sam Patel')).toBeVisible();
    expect(within(publishedItem).getByText('Ready for admissions')).toBeVisible();
    expect(within(createdItem).getByText('Created')).toBeVisible();
    expect(createdItem).not.toHaveTextContent('Sam Patel');
  });

  it('compares the selected version and scopes results to the selected form', async () => {
    const user = userEvent.setup();
    hooks.versions.currentData = [
      olderVersion,
      { id: form.id, version: 2 } as AdmissionFormVersionSummary,
    ];
    const view = render(<AdmissionFormHistoryDialog {...props} />);
    expect(screen.getByRole('button', { name: /^Compare$/ })).toBeDisabled();
    await selectVersion(user);
    await user.click(screen.getByRole('button', { name: /^Compare$/ }));
    expect(hooks.compare).toHaveBeenCalledWith({ id: olderVersion.id, otherId: form.id }, true);
    hooks.comparison.originalArgs = { id: olderVersion.id, otherId: form.id };
    hooks.comparison.data = {
      fromId: olderVersion.id,
      toId: form.id,
      changes: ['Added guardian details'],
    };
    view.rerender(<AdmissionFormHistoryDialog {...props} />);
    expect(screen.getByText('Added guardian details')).toBeVisible();
    view.rerender(<AdmissionFormHistoryDialog {...props} form={{ ...form, id: 'another-form' }} />);
    expect(screen.queryByText('Added guardian details')).not.toBeInTheDocument();
  });

  it('renders every readable comparison when fields share the same label', async () => {
    const user = userEvent.setup();
    hooks.versions.currentData = [olderVersion];
    hooks.comparison.originalArgs = { id: olderVersion.id, otherId: form.id };
    hooks.comparison.data = {
      fromId: olderVersion.id,
      toId: form.id,
      changes: ['Field changed: Parent email (Contact)', 'Field changed: Parent email (Contact)'],
    };
    const errors = vi.spyOn(console, 'error').mockImplementation(() => {});
    try {
      render(<AdmissionFormHistoryDialog {...props} />);
      await selectVersion(user);
      const contact = screen.getByRole('region', { name: 'Contact' });
      expect(within(contact).getAllByText('Parent email')).toHaveLength(2);
      expect(within(contact).getAllByText('Changed')).toHaveLength(2);
      expect(errors.mock.calls.flat().join(' ')).not.toContain('same key');
    } finally {
      errors.mockRestore();
    }
  });

  it('keeps the comparison chronological when History opens from the older version', async () => {
    const user = userEvent.setup();
    hooks.versions.currentData = [{ ...olderVersion, id: form.id, version: 2 }];
    render(<AdmissionFormHistoryDialog {...props} form={{ ...form, ...olderVersion }} />);
    await user.click(screen.getByRole('combobox', { name: 'To' }));
    await user.click(screen.getByRole('option', { name: /Version 2/ }));
    await user.click(screen.getByRole('button', { name: /^Compare$/ }));
    expect(hooks.compare).toHaveBeenCalledWith({ id: olderVersion.id, otherId: form.id }, true);
  });

  it.each([true, false])(
    'groups field changes and retains other changes (structured response: %s)',
    async (structured) => {
      const user = userEvent.setup();
      hooks.versions.currentData = [olderVersion];
      hooks.comparison.originalArgs = { id: olderVersion.id, otherId: form.id };
      hooks.comparison.data = {
        fromId: olderVersion.id,
        toId: form.id,
        changes: [
          'Print settings changed',
          'Field added: Place of birth (as recorded) (Student details (local))',
          'Field removed: Nationality (Student details (local))',
          'Field changed: Additional details',
        ],
        fieldChanges: structured
          ? [
              {
                changeIndex: 1,
                sectionCode: 'STUDENT',
                sectionName: 'Student details (local)',
                fieldName: 'Place of birth (as recorded)',
                kind: 'added',
              },
              {
                changeIndex: 2,
                sectionCode: 'STUDENT',
                sectionName: 'Student details (local)',
                fieldName: 'Nationality',
                kind: 'removed',
              },
            ]
          : undefined,
      } as AdmissionFormVersionComparison;
      render(<AdmissionFormHistoryDialog {...props} />);
      await selectVersion(user);
      expect(
        screen.getByRole('heading', { name: '1 field added · 1 field removed' })
      ).toBeVisible();
      const student = screen.getByRole('region', { name: 'Student details (local)' });
      expect(within(student).getByText('Place of birth (as recorded)')).toBeVisible();
      expect(within(student).getByText('Added')).toBeVisible();
      expect(within(student).getByText('Nationality')).toBeVisible();
      expect(within(student).getByText('Removed')).toBeVisible();
      expect(screen.getByText('Print settings changed')).toBeVisible();
      expect(screen.getByText('Field changed: Additional details')).toBeVisible();
    }
  );

  it('displays an actionable comparison error and a valid zero-change result', async () => {
    const user = userEvent.setup();
    hooks.versions.currentData = [olderVersion];
    hooks.comparison.originalArgs = { id: olderVersion.id, otherId: form.id };
    hooks.comparison.isError = true;
    const view = render(<AdmissionFormHistoryDialog {...props} />);
    await selectVersion(user);
    expect(toast.error).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Unable to compare these versions. Select Compare to try again.',
      })
    );
    expect(
      screen.queryByText('Unable to compare these versions.', { exact: false })
    ).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /^Compare$/ }));
    expect(hooks.compare).toHaveBeenCalledOnce();
    expect(hooks.compare).toHaveBeenCalledWith({ id: olderVersion.id, otherId: form.id }, false);
    hooks.comparison.isError = false;
    hooks.comparison.data = { fromId: olderVersion.id, toId: form.id, changes: [] };
    view.rerender(<AdmissionFormHistoryDialog {...props} />);
    expect(screen.getByText('No structural changes between these versions.')).toBeVisible();
  });

  it('prevents duplicate restores and keeps failures open for a safe retry', async () => {
    const user = userEvent.setup();
    hooks.versions.currentData = [olderVersion];
    let rejectRestore: (error: unknown) => void = () => {};
    props.onRestoreVersion.mockImplementation(
      () =>
        new Promise((_resolve, reject) => {
          rejectRestore = reject;
        })
    );
    render(<AdmissionFormHistoryDialog {...props} />);
    await selectVersion(user);
    await user.click(screen.getByRole('button', { name: 'Restore as New Draft' }));
    expect(props.onRestoreVersion).toHaveBeenCalledWith(olderVersion.id);
    expect(screen.getByRole('button', { name: 'Restore as New Draft' })).toBeDisabled();
    expect(screen.getByRole('button', { name: /^Compare$/ })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'close' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'close' })).toBeDisabled();
    rejectRestore({ data: { detail: 'This version is not available for restoration.' } });
    await waitFor(() => expect(toast.error).toHaveBeenCalledOnce());
    expect(toast.error).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'This version is not available for restoration.' })
    );
    expect(screen.getByRole('button', { name: 'Restore as New Draft' })).toBeEnabled();
    expect(props.onClose).not.toHaveBeenCalled();
  });

  it('offers the existing draft even when History was opened from the draft itself', async () => {
    const user = userEvent.setup();
    const openDraft = vi.fn();
    hooks.versions.currentData = [
      { ...olderVersion, status: 1 },
      { ...olderVersion, id: form.id, version: 2, status: 0 },
    ];
    render(<AdmissionFormHistoryDialog {...props} onOpenExistingDraft={openDraft} />);
    await selectVersion(user);
    expect(screen.getByText(/version 2 is already a draft/i)).toBeVisible();
    expect(screen.queryByRole('button', { name: 'Restore as New Draft' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Open existing draft' }));
    expect(openDraft).toHaveBeenCalledExactlyOnceWith(form.id);
    expect(props.onRestoreVersion).not.toHaveBeenCalled();
    expect(toast.error).not.toHaveBeenCalled();
  });

  it('offers the server-identified draft when one was created after History loaded', async () => {
    const user = userEvent.setup();
    const openDraft = vi.fn();
    hooks.versions.currentData = [{ ...olderVersion, status: 1 }];
    props.onRestoreVersion.mockRejectedValueOnce({
      status: 400,
      data: { errorCode: 'Admissions.FormDraftAlreadyExists', data: { DraftId: 'other-draft' } },
    });
    render(<AdmissionFormHistoryDialog {...props} onOpenExistingDraft={openDraft} />);
    await selectVersion(user);
    await user.click(screen.getByRole('button', { name: 'Restore as New Draft' }));
    await user.click(await screen.findByRole('button', { name: 'Open existing draft' }));
    expect(openDraft).toHaveBeenCalledExactlyOnceWith('other-draft');
    expect(toast.error).not.toHaveBeenCalled();
  });

  it('uses a single error toast when the owning restore workflow reports false', async () => {
    const user = userEvent.setup();
    hooks.versions.currentData = [olderVersion];
    props.onRestoreVersion.mockResolvedValueOnce(false).mockResolvedValueOnce(undefined);
    render(<AdmissionFormHistoryDialog {...props} />);
    await selectVersion(user);
    await user.click(screen.getByRole('button', { name: 'Restore as New Draft' }));
    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Unable to restore this version. Please try again.' })
      )
    );
    expect(screen.queryByText('Unable to restore this version. Please try again.')).toBeNull();
    expect(props.onClose).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Restore as New Draft' })).toBeEnabled();
    await user.click(screen.getByRole('button', { name: 'Restore as New Draft' }));
    expect(props.onRestoreVersion).toHaveBeenCalledTimes(2);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
