import type { ComponentProps } from 'react';
import type {
  StudentCredentialsRecipient,
  StudentCredentialsWorkspace,
} from 'src/redux/student/onboarding/student-onboarding-types';

import { vi, it, expect, beforeEach } from 'vitest';
import { shikshaMitraToast } from 'src/components/toast';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

import StudentOnboardingPortalAccounts from './student-onboarding-portal-accounts';

import type { StudentOnboardingItem } from './student-onboarding-model';

const mocks = vi.hoisted(() => ({
  query: {
    data: undefined as StudentCredentialsWorkspace | undefined,
    currentData: undefined as StudentCredentialsWorkspace | undefined,
    isLoading: false,
    isFetching: false,
    isError: false,
    refetch: vi.fn(),
  },
  permissions: [] as { name: string; isGranted: boolean }[],
  send: vi.fn(),
  success: vi.fn(),
  sending: false,
  legacyAccounts: vi.fn(),
  legacyHandoffs: vi.fn(),
  legacyEmails: vi.fn(),
}));

vi.mock('react-redux', () => ({
  useSelector: (selector: (state: unknown) => unknown) =>
    selector({ auth: { permissions: mocks.permissions } }),
}));
vi.mock('src/components/iconify', () => ({ Iconify: () => <span aria-hidden /> }));
vi.mock('src/components/toast', () => ({
  shikshaMitraToast: {
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
    dismiss: vi.fn(),
    success: mocks.success,
  },
}));
vi.mock('src/components/custom-select', () => ({
  default: ({
    label,
    value,
    options,
    onChange,
    onBlur,
    disabled,
    helperText,
  }: {
    label: string;
    value: string;
    options: { value: string; label: string }[];
    onChange: (value: string) => void;
    onBlur?: () => void;
    disabled?: boolean;
    helperText?: string;
  }) => (
    <label htmlFor={`mock-${label.replace(/\s/g, '-')}`}>
      {label}
      <select
        id={`mock-${label.replace(/\s/g, '-')}`}
        aria-label={label}
        value={value}
        disabled={disabled}
        onBlur={onBlur}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="" />
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {helperText && <span>{helperText}</span>}
    </label>
  ),
}));
vi.mock('./guardian-profile-email-dialog', () => ({
  default: ({
    onClose,
    onSaved,
  }: {
    onClose: () => void;
    onSaved: (change: { id: string; status: string }) => void;
  }) => (
    <div role="dialog" aria-label="Correct Guardian Profile Email">
      <button
        type="button"
        onClick={() => {
          onSaved({ id: 'correction-1', status: 'Pending' });
          onClose();
        }}
      >
        Submit Correction
      </button>
    </div>
  ),
}));
vi.mock('src/redux/student/onboarding/student-onboarding-api', () => ({
  useGetStudentOnboardingCredentialsQuery: () => mocks.query,
  useSendStudentOnboardingCredentialsMutation: () => [mocks.send, { isLoading: mocks.sending }],
  useRetryStudentOnboardingParentSetupMutation: () => [vi.fn(), { isLoading: false }],
  useLinkStudentOnboardingParentMutation: () => [vi.fn(), { isLoading: false }],
  useGetStudentPortalAccountsQuery: mocks.legacyAccounts,
  useGetStudentOnboardingServiceHandoffsQuery: mocks.legacyHandoffs,
  useGetStudentCredentialEmailsQuery: mocks.legacyEmails,
}));

const student = {
  id: 'case-1',
  studentId: 'student-1',
  studentName: 'Jay Patel',
  applicationNumber: 'APP-2026-8',
  studentEnrollmentId: 'enrollment-1',
  backendStatus: 3,
  concurrencyStamp: 'list-stamp',
} as StudentOnboardingItem;
const studentRecipient: StudentCredentialsRecipient = {
  accountType: 'student',
  relationship: 'self',
  name: 'Jay Patel',
  email: 'jay@example.test',
  canSend: true,
};
const fatherRecipient: StudentCredentialsRecipient = {
  accountType: 'guardian',
  relationship: 'father',
  name: 'Raj Patel',
  email: 'raj@example.test',
  canSend: true,
};
const motherRecipient: StudentCredentialsRecipient = {
  accountType: 'guardian',
  relationship: 'mother',
  name: 'Rina Patel',
  email: 'rina@example.test',
  canSend: true,
};
const setRecipients = (recipients: StudentCredentialsRecipient[]) => {
  mocks.query.data = {
    caseId: 'case-1',
    concurrencyStamp: 'workspace-stamp',
    guardianAccessEnabled: true,
    recipients,
  };
  mocks.query.currentData = mocks.query.data;
};

it('shows saved email addresses in the parent choices and retains the activation block', async () => {
  setRecipients([
    studentRecipient,
    {
      ...fatherRecipient,
      name: null,
      canSend: false,
      blockedReason: 'Activate the student first.',
    },
    { ...motherRecipient, canSend: false, blockedReason: 'Activate the student first.' },
  ]);
  panel();
  chooseGuardian();
  selectRecipient('father');
  await waitFor(() => expect(email()).toHaveValue('raj@example.test'));
  expect(screen.getByRole('option', { name: 'Father · raj@example.test' })).toBeVisible();
  expect(
    screen.getByRole('option', { name: 'Mother — Rina Patel · rina@example.test' })
  ).toBeVisible();
  expect(sendButton()).toBeDisabled();
  selectRecipient('mother');
  await waitFor(() => expect(email()).toHaveValue('rina@example.test'));
  expect(sendButton()).toBeDisabled();
  expect(mocks.send).not.toHaveBeenCalled();
});
const workspaceWithDelivery = (status: 'Pending' | 'Sent' | 'Failed' | 'Blocked') => ({
  ...mocks.query.data!,
  concurrencyStamp: 'after-send-stamp',
  recipients: mocks.query.data!.recipients.map((recipient) => ({
    ...recipient,
    delivery: {
      id: 'email-1',
      accountType: recipient.accountType,
      email: recipient.email ?? '',
      status,
      attemptCount: 1,
      message: status === 'Failed' ? 'Sender unavailable. Try again later.' : undefined,
    },
  })),
});
const panel = (props: Partial<ComponentProps<typeof StudentOnboardingPortalAccounts>> = {}) =>
  render(
    <ThemeProvider theme={createTheme()}>
      <StudentOnboardingPortalAccounts student={student} canManage {...props} />
    </ThemeProvider>
  );
const type = () => screen.getByRole('combobox', { name: 'Account type' });
const email = () => screen.getByRole('textbox', { name: 'Email' });
const sendButton = () => screen.getByRole('button', { name: 'Send login details' });
const chooseGuardian = () => fireEvent.change(type(), { target: { value: 'guardian' } });
const confirmAdultIfShown = () => {
  const checkbox = screen.queryByRole('checkbox', { name: /confirm this person may access/i });
  if (checkbox && !(checkbox as HTMLInputElement).checked) fireEvent.click(checkbox);
};
const selectRecipient = (relationship: string) =>
  fireEvent.change(screen.getByRole('combobox', { name: 'Recipient' }), {
    target: { value: relationship },
  });

it('requires adult confirmation and allows an explicitly selected saved guardian beside parents', async () => {
  setRecipients([
    { ...fatherRecipient, email: null, canSend: false },
    { ...motherRecipient, isMainContact: true },
    {
      accountType: 'guardian',
      relationship: 'guardian',
      name: 'Aunt Meera',
      email: 'meera@example.test',
      canSend: true,
    },
  ]);
  panel();
  await waitFor(() => expect(type()).toHaveValue('guardian'));
  expect(screen.getByRole('combobox', { name: 'Recipient' })).toHaveValue('mother');
  expect(sendButton()).toBeDisabled();
  const confirmation = screen.getByRole('checkbox', { name: /confirm this person may access/i });
  fireEvent.click(confirmation);
  await waitFor(() => expect(sendButton()).toBeEnabled());
  selectRecipient('guardian');
  await waitFor(() => expect(email()).toHaveValue('meera@example.test'));
  expect(confirmation).not.toBeChecked();
  expect(sendButton()).toBeDisabled();
  fireEvent.click(confirmation);
  confirmAdultIfShown();
  fireEvent.click(sendButton());
  await waitFor(() =>
    expect(mocks.send).toHaveBeenCalledWith(
      expect.objectContaining({
        relationship: 'guardian',
        expectedEmail: 'meera@example.test',
        confirmRecipientAccess: true,
      })
    )
  );
});

it('keeps the only parent selected when a guardian has email and the parent does not', async () => {
  setRecipients([
    { ...fatherRecipient, email: null, canSend: false },
    {
      accountType: 'guardian',
      relationship: 'guardian',
      name: 'Aunt Meera',
      email: 'meera@example.test',
      canSend: true,
    },
  ]);
  panel();
  await waitFor(() =>
    expect(screen.getByRole('combobox', { name: 'Recipient' })).toHaveValue('father')
  );
  expect(email()).toHaveValue('');
  expect(sendButton()).toBeDisabled();
});

it('requires fresh adult confirmation after the saved email refreshes', async () => {
  setRecipients([fatherRecipient]);
  const view = panel();
  const confirmation = await screen.findByRole('checkbox', {
    name: /confirm this person may access/i,
  });
  fireEvent.click(confirmation);
  await waitFor(() => expect(sendButton()).toBeEnabled());
  setRecipients([{ ...fatherRecipient, email: 'new-raj@example.test' }]);
  view.rerender(
    <ThemeProvider theme={createTheme()}>
      <StudentOnboardingPortalAccounts student={student} canManage />
    </ThemeProvider>
  );
  await waitFor(() => expect(email()).toHaveValue('new-raj@example.test'));
  expect(confirmation).not.toBeChecked();
  expect(sendButton()).toBeDisabled();
});

it('reloads the exact linked guardian with parents saved and keeps guardian email editing reviewed', async () => {
  setRecipients([
    { ...fatherRecipient, isMainContact: true, hasLinkedAccount: false, canSend: false },
    { ...motherRecipient, hasLinkedAccount: false, canSend: false },
    {
      accountType: 'guardian',
      relationship: 'guardian',
      relationshipLabel: 'Aunt',
      name: 'Meera',
      email: 'meera@example.test',
      canSend: true,
      hasLinkedAccount: true,
      canEditEmail: false,
    },
  ]);
  panel();
  await waitFor(() =>
    expect(screen.getByRole('combobox', { name: 'Recipient' })).toHaveValue('guardian')
  );
  expect(email()).toHaveValue('meera@example.test');
  expect(screen.getByText('Meera · Guardian (Aunt)')).toBeVisible();
  expect(screen.queryByRole('button', { name: 'Update email' })).not.toBeInTheDocument();
  expect(mocks.send).not.toHaveBeenCalled();
});

it('reloads the linked mother ahead of the saved main-contact father', async () => {
  setRecipients([
    { ...fatherRecipient, isMainContact: true, hasLinkedAccount: false, canSend: false },
    { ...motherRecipient, hasLinkedAccount: true, canSend: true },
  ]);
  panel();
  await waitFor(() =>
    expect(screen.getByRole('combobox', { name: 'Recipient' })).toHaveValue('mother')
  );
  expect(email()).toHaveValue('rina@example.test');
  expect(mocks.send).not.toHaveBeenCalled();
});

it('carries only a checked guardian choice for an enabled legacy case with no sibling candidates', async () => {
  setRecipients([
    { ...fatherRecipient, canSend: false },
    {
      accountType: 'guardian',
      relationship: 'guardian',
      name: 'Aunt Meera',
      email: 'meera@example.test',
      isMainContact: true,
      canSend: false,
    },
  ]);
  mocks.query.data = {
    ...mocks.query.data!,
    guardianAccessEnabled: true,
  } as StudentCredentialsWorkspace;
  mocks.query.currentData = mocks.query.data;
  const onParentStateChange = vi.fn();
  panel({ onParentStateChange });
  await waitFor(() => expect(email()).toHaveValue('meera@example.test'));
  expect(onParentStateChange).toHaveBeenLastCalledWith({ caseId: 'case-1', loaded: true });
  fireEvent.click(screen.getByRole('checkbox', { name: /confirm this person may access/i }));
  await waitFor(() =>
    expect(onParentStateChange).toHaveBeenLastCalledWith({
      caseId: 'case-1',
      loaded: true,
      guardianAccessSelection: {
        expectedEmail: 'meera@example.test',
        confirmRecipientAccess: true,
      },
    })
  );
  expect(mocks.send).not.toHaveBeenCalled();
});

it('ignores even a checked guardian suggestion when adult app access is not needed', async () => {
  setRecipients([
    {
      accountType: 'guardian',
      relationship: 'guardian',
      name: 'Aunt Meera',
      email: 'meera@example.test',
      canSend: false,
    },
  ]);
  mocks.query.data = {
    ...mocks.query.data!,
    guardianAccessEnabled: false,
  } as StudentCredentialsWorkspace;
  mocks.query.currentData = mocks.query.data;
  const onParentStateChange = vi.fn();
  panel({ onParentStateChange });
  await waitFor(() => expect(email()).toHaveValue('meera@example.test'));
  fireEvent.click(screen.getByRole('checkbox', { name: /confirm this person may access/i }));
  await waitFor(() =>
    expect(onParentStateChange).toHaveBeenLastCalledWith({ caseId: 'case-1', loaded: true })
  );
  expect(sendButton()).toBeDisabled();
  expect(mocks.send).not.toHaveBeenCalled();
});

beforeEach(() => {
  vi.clearAllMocks();
  mocks.query.isLoading = false;
  mocks.query.isFetching = false;
  mocks.query.isError = false;
  mocks.sending = false;
  mocks.permissions = ['AbpIdentity.Users.Create', 'AbpIdentity.Users.Update'].map((name) => ({
    name,
    isGranted: true,
  }));
  setRecipients([structuredClone(studentRecipient), structuredClone(fatherRecipient)]);
  mocks.send.mockImplementation(() => ({
    unwrap: () => Promise.resolve(workspaceWithDelivery('Pending')),
  }));
});

it('shows a read-only student email and one send action without the old account steps', async () => {
  panel();
  await waitFor(() => expect(email()).toHaveValue('jay@example.test'));
  expect(email()).toHaveAttribute('readonly');
  expect(screen.queryByRole('combobox', { name: 'Recipient' })).not.toBeInTheDocument();
  expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
  expect(screen.queryByText('Credential Emails')).not.toBeInTheDocument();
  expect(screen.queryByText('Disabled')).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Create and link account' })).not.toBeInTheDocument();
  confirmAdultIfShown();
  fireEvent.click(sendButton());
  await waitFor(() =>
    expect(mocks.send).toHaveBeenCalledWith({
      id: 'case-1',
      accountType: 'student',
      relationship: 'self',
      expectedEmail: 'jay@example.test',
      concurrencyStamp: 'workspace-stamp',
      confirmRecipientAccess: false,
    })
  );
  expect(mocks.legacyAccounts).not.toHaveBeenCalled();
  expect(mocks.legacyHandoffs).not.toHaveBeenCalled();
  expect(mocks.legacyEmails).not.toHaveBeenCalled();
});

it('auto-selects the sole parent recipient and switches the saved email with account type', async () => {
  panel();
  chooseGuardian();
  await waitFor(() => expect(email()).toHaveValue('raj@example.test'));
  expect(screen.queryByRole('combobox', { name: 'Recipient' })).not.toBeInTheDocument();
  confirmAdultIfShown();
  fireEvent.click(sendButton());
  await waitFor(() =>
    expect(mocks.send).toHaveBeenCalledWith(
      expect.objectContaining({
        accountType: 'guardian',
        relationship: 'father',
        expectedEmail: 'raj@example.test',
      })
    )
  );
  fireEvent.change(type(), { target: { value: 'student' } });
  await waitFor(() => expect(email()).toHaveValue('jay@example.test'));
});

it('requires an explicit recipient when both parent emails are available', async () => {
  setRecipients([studentRecipient, fatherRecipient, motherRecipient]);
  panel();
  chooseGuardian();
  expect(screen.getByRole('combobox', { name: 'Recipient' })).toHaveValue('');
  expect(sendButton()).toBeDisabled();
  selectRecipient('mother');
  await waitFor(() => expect(email()).toHaveValue('rina@example.test'));
  confirmAdultIfShown();
  fireEvent.click(sendButton());
  await waitFor(() =>
    expect(mocks.send).toHaveBeenCalledWith(
      expect.objectContaining({ relationship: 'mother', expectedEmail: 'rina@example.test' })
    )
  );
});

it('requires a parent choice without skipping a missing-email parent', async () => {
  setRecipients([
    studentRecipient,
    fatherRecipient,
    { ...motherRecipient, email: null, canSend: false },
  ]);
  panel();
  chooseGuardian();
  expect(screen.getByRole('combobox', { name: 'Recipient' })).toHaveValue('');
  selectRecipient('father');
  await waitFor(() => expect(email()).toHaveValue('raj@example.test'));
  expect(screen.getByRole('combobox', { name: 'Recipient' })).toBeVisible();
  expect(screen.getByRole('option', { name: /Mother/ })).toBeVisible();
  confirmAdultIfShown();
  fireEvent.click(sendButton());
  await waitFor(() =>
    expect(mocks.send).toHaveBeenCalledWith(
      expect.objectContaining({ relationship: 'father', expectedEmail: 'raj@example.test' })
    )
  );
});

it('uses only legal recipients returned by the server without inventing an Other guardian option', () => {
  setRecipients([fatherRecipient, motherRecipient]);
  panel();
  expect(screen.queryByRole('option', { name: /Other guardian/ })).not.toBeInTheDocument();
  expect(screen.getByRole('option', { name: /Father/ })).toBeInTheDocument();
  expect(screen.getByRole('option', { name: /Mother/ })).toBeInTheDocument();
});

it('uses an eligible non-parent guardian when that is the sole server recipient', async () => {
  setRecipients([{ ...fatherRecipient, relationship: 'guardian', name: 'Other Guardian' }]);
  panel();
  await waitFor(() => expect(email()).toHaveValue('raj@example.test'));
  expect(screen.queryByRole('combobox', { name: 'Recipient' })).not.toBeInTheDocument();
  confirmAdultIfShown();
  fireEvent.click(sendButton());
  await waitFor(() =>
    expect(mocks.send).toHaveBeenCalledWith(
      expect.objectContaining({ relationship: 'guardian', expectedEmail: 'raj@example.test' })
    )
  );
});

it('does not substitute a parent email when no student email is saved', async () => {
  setRecipients([{ ...studentRecipient, email: null, canSend: false }, fatherRecipient]);
  panel();
  fireEvent.change(type(), { target: { value: 'student' } });
  await waitFor(() => expect(email()).toHaveValue(''));
  expect(screen.getByText(/No email is saved for this student/)).toBeVisible();
  expect(sendButton()).toBeDisabled();
  expect(mocks.send).not.toHaveBeenCalled();
});

it('blocks an invalid saved email with actionable field feedback', async () => {
  setRecipients([{ ...studentRecipient, email: 'invalid-email' }]);
  panel();
  await waitFor(() => expect(email()).toHaveValue('invalid-email'));
  expect(screen.getByText(/The saved email is invalid/)).toBeVisible();
  expect(sendButton()).toBeDisabled();
});

it('offers short missing-email guidance only to an authorized email editor', async () => {
  setRecipients([{ ...studentRecipient, email: null, canSend: false, canEditEmail: true }]);
  const view = panel();
  await waitFor(() =>
    expect(screen.getByText('Add an email before sending login details.')).toBeVisible()
  );
  expect(screen.getByRole('button', { name: 'Add email' })).toBeEnabled();
  expect(sendButton()).toBeDisabled();
  expect(shikshaMitraToast.warning).not.toHaveBeenCalled();
  expect(shikshaMitraToast.error).not.toHaveBeenCalled();
  view.rerender(
    <ThemeProvider theme={createTheme()}>
      <StudentOnboardingPortalAccounts student={student} canManage={false} />
    </ThemeProvider>
  );
  expect(screen.queryByRole('button', { name: 'Add email' })).not.toBeInTheDocument();
  expect(screen.getByText(/No email is saved for this student/)).toBeVisible();
});

it('shows only the selected school policy/readiness reason without enabling settings', async () => {
  setRecipients([
    {
      ...studentRecipient,
      canSend: false,
      blockedReason: 'Complete enrollment activation before sending credentials.',
    },
    fatherRecipient,
  ]);
  panel();
  fireEvent.change(type(), { target: { value: 'student' } });
  await waitFor(() =>
    expect(
      screen.getByText('Activate the student before sending login details.')
    ).toBeVisible()
  );
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  expect(
    screen.getAllByText('Activate the student before sending login details.')
  ).toHaveLength(1);
  expect(sendButton()).toBeDisabled();
  expect(screen.queryByRole('button', { name: /Enable parent email/ })).not.toBeInTheDocument();
});

it('keeps first loading shaped and hides the empty state until loading finishes', () => {
  mocks.query.data = undefined;
  mocks.query.currentData = undefined;
  mocks.query.isLoading = true;
  mocks.query.isFetching = true;
  panel();
  expect(screen.getByRole('status', { name: 'Loading credentials' })).toBeVisible();
  expect(screen.queryByText(/No saved account-owner profiles/)).not.toBeInTheDocument();
});

it('never displays a previous case recipient while the selected case loads', () => {
  mocks.query.isFetching = true;
  panel({ student: { ...student, id: 'case-2' } });
  expect(screen.getByRole('status', { name: 'Loading credentials' })).toBeVisible();
  expect(screen.queryByDisplayValue('jay@example.test')).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Send login details' })).not.toBeInTheDocument();
});

it('toasts an initial error without claiming empty data or adding a Retry row', () => {
  mocks.query.data = undefined;
  mocks.query.currentData = undefined;
  mocks.query.isError = true;
  panel();
  expect(shikshaMitraToast.error).toHaveBeenCalledWith(
    expect.objectContaining({ message: expect.stringMatching(/Credentials could not be loaded/) })
  );
  expect(screen.queryByRole('button', { name: 'Retry' })).not.toBeInTheDocument();
  expect(screen.queryByText(/No saved account-owner profiles/)).not.toBeInTheDocument();
});

it('offers refresh for an empty workspace without a send action', () => {
  setRecipients([]);
  panel();
  expect(
    screen.getByText('No saved account-owner profiles are available.', { exact: false })
  ).toBeVisible();
  fireEvent.click(screen.getByRole('button', { name: 'Refresh' }));
  expect(mocks.query.refetch).toHaveBeenCalledOnce();
  expect(screen.queryByRole('button', { name: 'Send login details' })).not.toBeInTheDocument();
});

it('retains safe fields during refresh while preventing a stale send', async () => {
  mocks.query.isFetching = true;
  panel();
  await waitFor(() => expect(email()).toHaveValue('jay@example.test'));
  expect(screen.getByRole('progressbar', { name: 'Refreshing credentials' })).toBeVisible();
  expect(type()).toBeEnabled();
  chooseGuardian();
  await waitFor(() => expect(email()).toHaveValue('raj@example.test'));
  expect(sendButton()).toBeDisabled();
});

it('preserves the chosen parent and email after a failed background refresh', async () => {
  const view = panel();
  chooseGuardian();
  await waitFor(() => expect(email()).toHaveValue('raj@example.test'));
  mocks.query.isError = true;
  view.rerender(
    <ThemeProvider theme={createTheme()}>
      <StudentOnboardingPortalAccounts student={student} canManage />
    </ThemeProvider>
  );
  expect(email()).toHaveValue('raj@example.test');
  expect(shikshaMitraToast.error).toHaveBeenCalledWith(
    expect.objectContaining({
      message: expect.stringMatching(/Credentials could not be refreshed/),
    })
  );
  expect(sendButton()).toBeDisabled();
  fireEvent.click(screen.getByRole('button', { name: 'Refresh' }));
  expect(mocks.query.refetch).toHaveBeenCalledOnce();
});

it('keeps view-only recipients visible without allowing a send', async () => {
  panel({ canManage: false });
  await waitFor(() => expect(email()).toHaveValue('jay@example.test'));
  expect(
    screen.getByText('Ask authorized staff to send login details.')
  ).toBeVisible();
  expect(sendButton()).toBeDisabled();
  confirmAdultIfShown();
  fireEvent.click(sendButton());
  expect(mocks.send).not.toHaveBeenCalled();
});

it('prevents duplicate submissions and locks the owning drawer during a request', async () => {
  let resolve: (workspace: StudentCredentialsWorkspace) => void = () => {};
  const pending = new Promise<StudentCredentialsWorkspace>((finish) => {
    resolve = finish;
  });
  mocks.send.mockReturnValue({ unwrap: () => pending });
  const busy = vi.fn();
  const view = panel({ onBusyChange: busy });
  await waitFor(() => expect(sendButton()).toBeEnabled());
  confirmAdultIfShown();
  fireEvent.click(sendButton());
  confirmAdultIfShown();
  fireEvent.click(sendButton());
  await waitFor(() => expect(mocks.send).toHaveBeenCalledOnce());
  expect(type()).toBeDisabled();
  expect(email()).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Refresh' })).toBeDisabled();
  expect(screen.getByRole('form', { name: 'Send credentials' })).toHaveAttribute(
    'aria-busy',
    'true'
  );
  expect(screen.getByRole('status', { name: 'Requesting credentials' })).toBeVisible();
  expect(busy).toHaveBeenLastCalledWith(true);
  resolve(workspaceWithDelivery('Pending'));
  await waitFor(() => expect(busy).toHaveBeenLastCalledWith(false));
  view.unmount();
  expect(busy).toHaveBeenLastCalledWith(false);
});

it('reports requested delivery as pending instead of claiming the email was sent', async () => {
  panel();
  await waitFor(() => expect(sendButton()).toBeEnabled());
  confirmAdultIfShown();
  fireEvent.click(sendButton());
  await waitFor(() =>
    expect(shikshaMitraToast.info).toHaveBeenCalledWith({
      message: 'Login email is queued.',
    })
  );
  expect(mocks.success).not.toHaveBeenCalled();
});

it('shows Queued status and disables duplicate sends even if the server canSend flag is inconsistent', async () => {
  const pending = workspaceWithDelivery('Pending');
  setRecipients(pending.recipients);
  panel();
  await waitFor(() => expect(email()).toHaveValue('jay@example.test'));
  expect(screen.getByText('Queued')).toBeVisible();
  expect(screen.getByText(/Login email is queued/)).toBeVisible();
  expect(sendButton()).toBeDisabled();
  expect(screen.queryByText('Sent')).not.toBeInTheDocument();
});

it('explains a queued completion-timing wait using the server message', async () => {
  const pending = workspaceWithDelivery('Pending');
  pending.recipients[0].delivery.message = 'Delivery starts after onboarding completes.';
  setRecipients(pending.recipients);
  panel();
  await waitFor(() =>
    expect(screen.getByText('Login email is queued until onboarding is complete.')).toBeVisible()
  );
  expect(screen.getByText('Queued')).toBeVisible();
  expect(sendButton()).toBeDisabled();
  expect(screen.queryByText('Sent')).not.toBeInTheDocument();
});

it('shows sender-accepted delivery without exposing or editing any password', async () => {
  setRecipients(workspaceWithDelivery('Sent').recipients);
  panel();
  await waitFor(() => expect(email()).toHaveValue('jay@example.test'));
  expect(screen.getByText('Submitted')).toBeVisible();
  expect(screen.getByText('Submitted for sending.')).toBeVisible();
  expect(screen.queryByRole('textbox', { name: /password/i })).not.toBeInTheDocument();
  expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
});

it('preserves the selected recipient and displays the actual server Reason after a rejected send', async () => {
  mocks.send.mockReturnValue({
    unwrap: () =>
      Promise.reject(
        Object.assign(new Error('Request rejected'), {
          status: 400,
          data: {
            detail: 'One or more business rules were violated.',
            data: {
              Reason: 'The saved email changed. Refresh and review the recipient before sending.',
            },
          },
        })
      ),
  });
  panel();
  chooseGuardian();
  await waitFor(() => expect(email()).toHaveValue('raj@example.test'));
  confirmAdultIfShown();
  fireEvent.click(sendButton());
  await waitFor(() =>
    expect(shikshaMitraToast.error).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringContaining('The email has changed.') })
    )
  );
  expect(type()).toHaveValue('guardian');
  expect(email()).toHaveValue('raj@example.test');
  expect(mocks.success).not.toHaveBeenCalled();
  expect(screen.queryByText('One or more business rules were violated.')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Refresh' }));
  expect(mocks.query.refetch).toHaveBeenCalledOnce();
});

it('does not report success if the command returns a blocked or failed delivery', async () => {
  mocks.send.mockImplementation(() => ({
    unwrap: () => Promise.resolve(workspaceWithDelivery('Failed')),
  }));
  panel();
  await waitFor(() => expect(sendButton()).toBeEnabled());
  confirmAdultIfShown();
  fireEvent.click(sendButton());
  await waitFor(() =>
    expect(screen.getByText('Sender unavailable. Try again later.', { exact: false })).toBeVisible()
  );
  expect(mocks.success).not.toHaveBeenCalled();
  expect(sendButton()).toBeEnabled();
});

it('preserves an explicit parent selection across workspace refreshes and uses the latest saved email', async () => {
  setRecipients([studentRecipient, fatherRecipient, motherRecipient]);
  const view = panel();
  chooseGuardian();
  selectRecipient('mother');
  await waitFor(() => expect(email()).toHaveValue('rina@example.test'));
  setRecipients([
    studentRecipient,
    fatherRecipient,
    { ...motherRecipient, email: 'updated-rina@example.test' },
  ]);
  view.rerender(
    <ThemeProvider theme={createTheme()}>
      <StudentOnboardingPortalAccounts student={student} canManage />
    </ThemeProvider>
  );
  await waitFor(() => expect(email()).toHaveValue('updated-rina@example.test'));
  expect(screen.getByRole('combobox', { name: 'Recipient' })).toHaveValue('mother');
  confirmAdultIfShown();
  fireEvent.click(sendButton());
  await waitFor(() =>
    expect(mocks.send).toHaveBeenCalledWith(
      expect.objectContaining({
        relationship: 'mother',
        expectedEmail: 'updated-rina@example.test',
      })
    )
  );
});

it('offers the existing Records correction only for a missing guardian email with exact permissions', async () => {
  setRecipients([{ ...fatherRecipient, email: null, canSend: false }]);
  mocks.permissions.push(
    { name: 'Students.Records.Changes.View', isGranted: true },
    { name: 'Students.Records.Changes.Add', isGranted: true }
  );
  panel();
  await waitFor(() =>
    expect(screen.getByRole('button', { name: 'Correct Saved Email' })).toBeVisible()
  );
  expect(sendButton()).toBeDisabled();
  fireEvent.click(screen.getByRole('button', { name: 'Correct Saved Email' }));
  fireEvent.click(screen.getByRole('button', { name: 'Submit Correction' }));
  expect(mocks.query.refetch).toHaveBeenCalledOnce();
  expect(screen.getByText(/Email correction awaits Records approval/)).toBeVisible();
  expect(screen.getByRole('link', { name: 'Review Correction' })).toHaveAttribute(
    'href',
    expect.stringContaining('request=correction-1')
  );
  expect(mocks.send).not.toHaveBeenCalled();
});

it('does not offer a Records correction without both View and Create grants', async () => {
  setRecipients([{ ...fatherRecipient, email: null, canSend: false }]);
  mocks.permissions.push({ name: 'Students.Records.Changes.Add', isGranted: true });
  panel();
  await waitFor(() => expect(type()).toHaveValue('guardian'));
  expect(screen.queryByRole('button', { name: 'Correct Saved Email' })).not.toBeInTheDocument();
});
