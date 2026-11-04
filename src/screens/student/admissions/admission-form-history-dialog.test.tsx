import type { ReactNode } from 'react';
import type {
  AdmissionForm,
  AdmissionFormAuditEntry,
  AdmissionFormVersionSummary,
  AdmissionFormVersionComparison,
} from 'src/redux/student/admissions/admission-forms-api';

import userEvent from '@testing-library/user-event';
import { vi, it, expect, describe, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

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

const form = { id: 'current-form', name: 'School inquiry', version: 2 } as AdmissionForm;
const props = { form, canRestore: true, onClose: vi.fn(), onRestoreVersion: vi.fn() };
const olderVersion = { id: 'older-form', version: 1 } as AdmissionFormVersionSummary;

const selectVersion = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(screen.getByRole('combobox', { name: 'Compare With' }));
  await user.click(screen.getByRole('option', { name: 'Version 1' }));
};

describe('Admission form history dialog', () => {
  it('lets view-only staff compare history without offering a restore mutation', async () => {
    const user = userEvent.setup();
    hooks.versions.currentData = [olderVersion];
    render(<AdmissionFormHistoryDialog {...props} canRestore={false} />);
    await selectVersion(user);
    expect(screen.queryByRole('button', { name: 'Restore as New Draft' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /^Compare$/ }));
    expect(hooks.compare).toHaveBeenCalledWith({ id: form.id, otherId: olderVersion.id }, true);
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
    expect(screen.getByRole('heading', { name: 'Compare Versions' })).toBeVisible();
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
    expect(hooks.versions.refetch).toHaveBeenCalledOnce();
    expect(hooks.audit.refetch).toHaveBeenCalledOnce();
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
    expect(screen.getByText('Admin Override Approved')).toBeVisible();
    expect(screen.getByText(/version 1 · Approved by the school administrator/)).toBeVisible();
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
    expect(hooks.compare).toHaveBeenCalledWith({ id: form.id, otherId: olderVersion.id }, true);
    hooks.comparison.originalArgs = { id: form.id, otherId: olderVersion.id };
    hooks.comparison.data = {
      fromId: form.id,
      toId: olderVersion.id,
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
    hooks.comparison.originalArgs = { id: form.id, otherId: olderVersion.id };
    hooks.comparison.data = {
      fromId: form.id,
      toId: olderVersion.id,
      changes: ['Field changed: Parent email (Contact)', 'Field changed: Parent email (Contact)'],
    };
    const errors = vi.spyOn(console, 'error').mockImplementation(() => {});
    try {
      render(<AdmissionFormHistoryDialog {...props} />);
      await selectVersion(user);
      expect(screen.getAllByText('Field changed: Parent email (Contact)')).toHaveLength(2);
      expect(errors.mock.calls.flat().join(' ')).not.toContain('same key');
    } finally {
      errors.mockRestore();
    }
  });

  it('displays an actionable comparison error and a valid zero-change result', async () => {
    const user = userEvent.setup();
    hooks.versions.currentData = [olderVersion];
    hooks.comparison.originalArgs = { id: form.id, otherId: olderVersion.id };
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
    expect(hooks.compare).toHaveBeenCalledWith({ id: form.id, otherId: olderVersion.id }, false);
    hooks.comparison.isError = false;
    hooks.comparison.data = { fromId: form.id, toId: olderVersion.id, changes: [] };
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
    await waitFor(() =>
      expect(
        screen.getByText('This version is not available for restoration.', { exact: false })
      ).toBeVisible()
    );
    expect(screen.getByRole('button', { name: 'Restore as New Draft' })).toBeEnabled();
    expect(props.onClose).not.toHaveBeenCalled();
  });

  it('shows inline retry feedback when the owning restore workflow reports false', async () => {
    const user = userEvent.setup();
    hooks.versions.currentData = [olderVersion];
    props.onRestoreVersion.mockResolvedValueOnce(false).mockResolvedValueOnce(undefined);
    render(<AdmissionFormHistoryDialog {...props} />);
    await selectVersion(user);
    await user.click(screen.getByRole('button', { name: 'Restore as New Draft' }));
    expect(
      screen.getByText('Unable to restore this version. Please try again.', { exact: false })
    ).toBeVisible();
    expect(props.onClose).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Restore as New Draft' })).toBeEnabled();
    await user.click(screen.getByRole('button', { name: 'Restore as New Draft' }));
    expect(props.onRestoreVersion).toHaveBeenCalledTimes(2);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
