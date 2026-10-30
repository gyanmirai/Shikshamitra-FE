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
vi.mock('./student-credential-profile-email-dialog', () => ({
  default: ({
    recipient,
    onClose,
  }: {
    recipient: StudentCredentialsRecipient;
    onClose: () => void;
  }) => (
    <div role="dialog" aria-label={`Edit ${recipient.relationship} email`}>
      <button type="button" onClick={onClose}>
        Close email editor
      </button>
    </div>
  ),
}));
vi.mock('./student-app-access-dialog', () => ({
  default: ({ caseId, onClose }: { caseId: string; onClose: () => void }) => (
    <div role="dialog" aria-label={`Enable Student ${caseId}`}>
      <button type="button" onClick={onClose}>
        Close access editor
      </button>
    </div>
  ),
}));
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

const panel = (props: Partial<ComponentProps<typeof StudentOnboardingPortalAccounts>> = {}) =>
  render(
    <ThemeProvider theme={createTheme()}>
      <StudentOnboardingPortalAccounts student={student} canManage {...props} />
    </ThemeProvider>
  );
const studentEmail = () => screen.getByRole('textbox', { name: 'Student email' });
const parentEmail = () => screen.getByRole('textbox', { name: 'Parent / guardian email' });
const sendButton = () => screen.getByRole('button', { name: 'Send selected login details' });

it('offers a case-specific Student enable action only when the server allows it', () => {
  setRecipients([
    { ...studentRecipient, canSend: false, blockedReason: 'Student access is disabled' },
  ]);
  mocks.query.currentData!.studentAccessEnabled = false;
  mocks.query.currentData!.canEnableStudentAccess = true;
  const view = panel();
  expect(screen.getByRole('button', { name: 'Enable student login' })).toBeEnabled();
  view.rerender(
    <ThemeProvider theme={createTheme()}>
      <StudentOnboardingPortalAccounts student={student} canManage={false} />
    </ThemeProvider>
  );
  expect(screen.queryByRole('button', { name: 'Enable student login' })).not.toBeInTheDocument();
});

it('closes the Student access editor when the case or permission changes', () => {
  setRecipients([{ ...studentRecipient, canSend: false }]);
  mocks.query.currentData!.studentAccessEnabled = false;
  mocks.query.currentData!.canEnableStudentAccess = true;
  const view = panel();
  fireEvent.click(screen.getByRole('button', { name: 'Enable student login' }));
  expect(screen.getByRole('dialog', { name: 'Enable Student case-1' })).toBeVisible();
  view.rerender(
    <ThemeProvider theme={createTheme()}>
      <StudentOnboardingPortalAccounts student={student} canManage={false} />
    </ThemeProvider>
  );
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  view.rerender(
    <ThemeProvider theme={createTheme()}>
      <StudentOnboardingPortalAccounts student={student} canManage />
    </ThemeProvider>
  );
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Enable student login' }));
  view.rerender(
    <ThemeProvider theme={createTheme()}>
      <StudentOnboardingPortalAccounts student={{ ...student, id: 'case-2' }} canManage />
    </ThemeProvider>
  );
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});

it('does not infer Student enable authority from missing capability or blocked-reason text', () => {
  setRecipients([
    {
      ...studentRecipient,
      canSend: false,
      blockedReason: 'Student app access is not enabled for this case.',
    },
  ]);
  panel();
  expect(screen.queryByRole('button', { name: 'Enable student login' })).not.toBeInTheDocument();
});
const selectStudent = () =>
  fireEvent.click(screen.getByRole('checkbox', { name: 'Send to student' }));
const selectAdult = () =>
  fireEvent.click(screen.getByRole('checkbox', { name: 'Send to parent / guardian' }));
const confirm = () =>
  fireEvent.click(screen.getByRole('checkbox', { name: /I confirm .* may access/ }));
const choosePerson = (value: string) =>
  fireEvent.change(screen.getByRole('combobox', { name: 'Person' }), { target: { value } });
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
  mocks.query.refetch.mockImplementation(async () => ({ data: mocks.query.currentData }));
  mocks.send.mockImplementation(() => ({ unwrap: async () => workspaceWithDelivery('Pending') }));
});
it('shows both own read-only saved emails without account steps or legacy queries', () => {
  panel();
  expect(studentEmail()).toHaveValue('jay@example.test');
  expect(parentEmail()).toHaveValue('raj@example.test');
  expect(studentEmail()).toHaveAttribute('readonly');
  expect(parentEmail()).toHaveAttribute('readonly');
  expect(sendButton()).toBeDisabled();
  expect(screen.queryByRole('combobox', { name: 'Account type' })).not.toBeInTheDocument();
  expect(mocks.legacyAccounts).not.toHaveBeenCalled();
  expect(mocks.legacyHandoffs).not.toHaveBeenCalled();
  expect(mocks.legacyEmails).not.toHaveBeenCalled();
});
it('keeps compact recipient selection and manual sending with an accessible email edit action', async () => {
  setRecipients([
    { ...studentRecipient, canEditEmail: true },
    { ...fatherRecipient, canEditEmail: true },
  ]);
  panel({ compact: true });
  expect(screen.getByText('jay@example.test')).toBeVisible();
  expect(screen.getByText('raj@example.test')).toBeVisible();
  expect(screen.getByRole('button', { name: 'Update Student email' })).toBeEnabled();
  expect(screen.getByRole('button', { name: 'Update Father email' })).toBeEnabled();
  fireEvent.click(screen.getByRole('button', { name: 'Update Father email' }));
  expect(screen.getByRole('dialog', { name: 'Edit father email' })).toBeVisible();
  fireEvent.click(screen.getByRole('button', { name: 'Close email editor' }));
  expect(
    screen.queryByText('Choose who should receive their own login details.')
  ).not.toBeInTheDocument();
  selectAdult();
  expect(sendButton()).toBeDisabled();
  confirm();
  fireEvent.click(sendButton());
  await waitFor(() => expect(mocks.send).toHaveBeenCalledOnce());
  expect(mocks.send.mock.calls[0][0]).toMatchObject({
    accountType: 'guardian',
    relationship: 'father',
    expectedEmail: 'raj@example.test',
  });
});

it('explains the activation prerequisite once while preserving the blocked send with all consent selected', () => {
  setRecipients([
    {
      ...studentRecipient,
      canSend: false,
      blockedReason: 'The student must be actively enrolled in the school.',
    },
    {
      ...fatherRecipient,
      canSend: false,
      blockedReason: 'The student must be actively enrolled in the school.',
    },
  ]);
  panel({ compact: true, student: { ...student, studentEnrollmentId: null } });
  selectStudent();
  selectAdult();
  confirm();
  expect(screen.getAllByText('Use Save & Activate first, then send login details.')).toHaveLength(
    1
  );
  expect(
    screen.queryByText('The student must be active before login details can be sent.')
  ).not.toBeInTheDocument();
  expect(sendButton()).toBeDisabled();
  expect(mocks.send).not.toHaveBeenCalled();
});
it('shows compact column labels and asks for parent consent only after selecting that recipient', () => {
  panel({ compact: true });
  ['Recipient', 'Email', 'Status', 'Actions'].forEach((label) => {
    expect(screen.getByText(label, { exact: true })).toBeInTheDocument();
  });
  expect(
    screen.queryByRole('checkbox', { name: /I confirm .* may access/ })
  ).not.toBeInTheDocument();
  selectAdult();
  expect(screen.getByRole('checkbox', { name: /I confirm .* may access/ })).not.toBeChecked();
  expect(sendButton()).toBeDisabled();
  expect(mocks.send).not.toHaveBeenCalled();
});

it('shows Off for disabled student access instead of implying its saved email is ready to send', () => {
  setRecipients([
    { ...studentRecipient, canSend: false, blockedReason: 'Student login is turned off.' },
    fatherRecipient,
  ]);
  mocks.query.currentData!.studentAccessEnabled = false;
  panel({ compact: true });
  expect(screen.getByText('Off', { exact: true })).toBeVisible();
  selectStudent();
  expect(sendButton()).toBeDisabled();
  expect(screen.getByText('Student login is turned off.')).toBeVisible();
});
it('keeps compact missing-email guidance, legal adult choices and permission restrictions', () => {
  setRecipients([
    { ...studentRecipient, email: null, canEditEmail: true },
    fatherRecipient,
    motherRecipient,
  ]);
  panel({ compact: true });
  expect(screen.getByText('No email added')).toBeVisible();
  expect(screen.getByRole('button', { name: 'Add Student email' })).toBeEnabled();
  expect(screen.getByRole('combobox', { name: 'Person' })).toBeVisible();
  selectStudent();
  expect(screen.getByText('Add an email before sending login details.')).toBeVisible();
  expect(sendButton()).toBeDisabled();
});
it('retains both saved parent emails in Person choices with readiness blockers', () => {
  setRecipients([
    {
      ...fatherRecipient,
      name: null,
      canSend: false,
      blockedReason: 'Activate the student first.',
    },
    { ...motherRecipient, canSend: false, blockedReason: 'Activate the student first.' },
  ]);
  panel();
  expect(screen.getByRole('option', { name: 'Father · raj@example.test' })).toBeVisible();
  expect(
    screen.getByRole('option', { name: 'Mother — Rina Patel · rina@example.test' })
  ).toBeVisible();
  selectAdult();
  confirm();
  expect(sendButton()).toBeDisabled();
  choosePerson('mother');
  expect(parentEmail()).toHaveValue('rina@example.test');
  expect(screen.getByText('Activate the student before sending login details.')).toBeVisible();
  expect(mocks.send).not.toHaveBeenCalled();
});
it('suggests the parent first even when only Guardian has email', () => {
  setRecipients([
    { ...fatherRecipient, email: null, canSend: false },
    { ...motherRecipient, relationship: 'guardian', email: 'aunt@example.test' },
  ]);
  panel();
  expect(screen.getByRole('combobox', { name: 'Person' })).toHaveValue('father');
  expect(parentEmail()).toHaveValue('');
});
it('suggests the main-contact parent but permits explicit saved Guardian access', async () => {
  setRecipients([
    { ...fatherRecipient, email: null, canSend: false },
    { ...motherRecipient, isMainContact: true },
    { ...fatherRecipient, relationship: 'guardian', name: 'Meera', email: 'aunt@example.test' },
  ]);
  panel();
  expect(screen.getByRole('combobox', { name: 'Person' })).toHaveValue('mother');
  selectAdult();
  confirm();
  expect(sendButton()).toBeEnabled();
  choosePerson('guardian');
  expect(parentEmail()).toHaveValue('aunt@example.test');
  expect(screen.getByRole('checkbox', { name: /I confirm .* may access/ })).not.toBeChecked();
  selectAdult();
  confirm();
  fireEvent.click(sendButton());
  await waitFor(() =>
    expect(mocks.send).toHaveBeenCalledWith(
      expect.objectContaining({
        relationship: 'guardian',
        expectedEmail: 'aunt@example.test',
        confirmRecipientAccess: true,
      })
    )
  );
});
it.each(['mother', 'guardian'] as const)(
  'restores linked %s before main-contact father and locks owner replacement',
  (relationship) => {
    setRecipients([
      { ...fatherRecipient, isMainContact: true },
      { ...motherRecipient, relationship, hasLinkedAccount: true },
    ]);
    panel();
    expect(screen.getByRole('combobox', { name: 'Person' })).toHaveValue(relationship);
    expect(screen.getByRole('combobox', { name: 'Person' })).toBeDisabled();
    expect(parentEmail()).toHaveValue('rina@example.test');
    expect(mocks.send).not.toHaveBeenCalled();
  }
);
it('never invents a Guardian or Other recipient absent from the server', () => {
  setRecipients([fatherRecipient, motherRecipient]);
  panel();
  expect(screen.queryByRole('option', { name: /Other|Guardian/ })).not.toBeInTheDocument();
});
it('does not silently skip a missing-email parent or borrow another email', () => {
  setRecipients([
    { ...studentRecipient, email: null, canSend: false },
    fatherRecipient,
    { ...motherRecipient, email: null, canSend: false },
  ]);
  panel();
  expect(studentEmail()).toHaveValue('');
  choosePerson('mother');
  expect(parentEmail()).toHaveValue('');
  selectAdult();
  confirm();
  expect(sendButton()).toBeDisabled();
  expect(screen.getByRole('option', { name: /Mother/ })).toBeVisible();
});
it('blocks invalid saved email and gives actionable field guidance', () => {
  setRecipients([{ ...studentRecipient, email: 'invalid-email' }]);
  panel();
  selectStudent();
  expect(studentEmail()).toHaveAttribute('aria-invalid', 'true');
  expect(screen.getByText(/The saved email is invalid/)).toBeVisible();
  expect(sendButton()).toBeDisabled();
});
it('offers missing-email editing only with recipient capability and management permission', () => {
  setRecipients([{ ...studentRecipient, email: null, canSend: false, canEditEmail: true }]);
  const view = panel();
  expect(screen.getByRole('button', { name: 'Add email' })).toBeEnabled();
  expect(screen.getByText('Add an email before sending login details.')).toBeVisible();
  expect(shikshaMitraToast.error).not.toHaveBeenCalled();
  view.rerender(
    <ThemeProvider theme={createTheme()}>
      <StudentOnboardingPortalAccounts student={student} canManage={false} />
    </ThemeProvider>
  );
  expect(screen.queryByRole('button', { name: 'Add email' })).not.toBeInTheDocument();
  expect(screen.getByText(/No email is saved for this student/)).toBeVisible();
});
it('shows one current policy blocker without a settings-enabling action', () => {
  setRecipients([
    {
      ...studentRecipient,
      canSend: false,
      blockedReason: 'Complete enrollment activation before sending credentials.',
    },
  ]);
  panel();
  selectStudent();
  expect(screen.getAllByText('Activate the student before sending login details.')).toHaveLength(1);
  expect(sendButton()).toBeDisabled();
  expect(screen.queryByRole('button', { name: /Enable parent/ })).not.toBeInTheDocument();
});
it('keeps first loading shaped without a false empty state', () => {
  mocks.query.data = undefined;
  mocks.query.currentData = undefined;
  mocks.query.isLoading = true;
  mocks.query.isFetching = true;
  panel();
  expect(screen.getByRole('status', { name: 'Loading credentials' })).toBeVisible();
  expect(screen.queryByText(/No saved account-owner profiles/)).not.toBeInTheDocument();
});
it('hides previous-case recipients while a different case loads', () => {
  mocks.query.isFetching = true;
  panel({ student: { ...student, id: 'case-2' } });
  expect(screen.getByRole('status', { name: 'Loading credentials' })).toBeVisible();
  expect(screen.queryByDisplayValue('jay@example.test')).not.toBeInTheDocument();
});
it('toasts an initial read error without claiming empty data', () => {
  mocks.query.data = undefined;
  mocks.query.currentData = undefined;
  mocks.query.isError = true;
  panel();
  expect(shikshaMitraToast.error).toHaveBeenCalledWith(
    expect.objectContaining({ message: expect.stringMatching(/Credentials could not be loaded/) })
  );
  expect(screen.queryByText(/No saved account-owner profiles/)).not.toBeInTheDocument();
});
it('offers refresh for an empty workspace without a send action', () => {
  setRecipients([]);
  panel();
  fireEvent.click(screen.getByRole('button', { name: 'Refresh' }));
  expect(mocks.query.refetch).toHaveBeenCalledOnce();
  expect(
    screen.queryByRole('button', { name: 'Send selected login details' })
  ).not.toBeInTheDocument();
});
it('retains readable emails during refresh and prohibits stale sends', () => {
  mocks.query.isFetching = true;
  panel();
  expect(studentEmail()).toHaveValue('jay@example.test');
  expect(screen.getByRole('progressbar', { name: 'Refreshing credentials' })).toBeVisible();
  selectStudent();
  expect(sendButton()).toBeDisabled();
});
it('preserves Person and saved email after a failed background refresh', () => {
  setRecipients([studentRecipient, fatherRecipient, motherRecipient]);
  const view = panel();
  choosePerson('mother');
  mocks.query.isError = true;
  view.rerender(
    <ThemeProvider theme={createTheme()}>
      <StudentOnboardingPortalAccounts student={student} canManage />
    </ThemeProvider>
  );
  expect(parentEmail()).toHaveValue('rina@example.test');
  expect(screen.getByRole('combobox', { name: 'Person' })).toHaveValue('mother');
  expect(sendButton()).toBeDisabled();
  expect(shikshaMitraToast.error).toHaveBeenCalledWith(
    expect.objectContaining({
      message: expect.stringMatching(/Credentials could not be refreshed/),
    })
  );
});
it('keeps view-only recipients visible with disabled send choices', () => {
  panel({ canManage: false });
  expect(studentEmail()).toHaveValue('jay@example.test');
  expect(sendButton()).toBeDisabled();
  expect(screen.getByRole('checkbox', { name: 'Send to student' })).toBeDisabled();
  expect(mocks.send).not.toHaveBeenCalled();
});
it('locks fields and the owning drawer throughout a duplicate submission attempt', async () => {
  let resolve!: (workspace: StudentCredentialsWorkspace) => void;
  mocks.send.mockReturnValue({
    unwrap: () =>
      new Promise<StudentCredentialsWorkspace>((finish) => {
        resolve = finish;
      }),
  });
  const busy = vi.fn();
  const view = panel({ onBusyChange: busy });
  selectStudent();
  fireEvent.click(sendButton());
  fireEvent.click(sendButton());
  await waitFor(() => expect(mocks.send).toHaveBeenCalledOnce());
  expect(studentEmail()).toBeDisabled();
  expect(parentEmail()).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Refresh' })).toBeDisabled();
  expect(screen.getByRole('form', { name: 'Send credentials' })).toHaveAttribute(
    'aria-busy',
    'true'
  );
  expect(busy).toHaveBeenLastCalledWith(true);
  resolve(workspaceWithDelivery('Pending'));
  await waitFor(() => expect(busy).toHaveBeenLastCalledWith(false));
  view.unmount();
  expect(busy).toHaveBeenLastCalledWith(false);
});
it('reports queued requests honestly without claiming mailbox delivery', async () => {
  panel();
  selectStudent();
  fireEvent.click(sendButton());
  await waitFor(() =>
    expect(shikshaMitraToast.info).toHaveBeenCalledWith({ message: 'Login email is queued.' })
  );
  expect(mocks.success).not.toHaveBeenCalled();
});
it('shows Queued and blocks duplicate sends despite an inconsistent true canSend capability', () => {
  setRecipients(workspaceWithDelivery('Pending').recipients);
  panel();
  selectStudent();
  expect(screen.getAllByText('Queued')).toHaveLength(2);
  expect(sendButton()).toBeDisabled();
});
it('uses the server completion-timing message on the matching recipient', () => {
  const pending = workspaceWithDelivery('Pending');
  pending.recipients[0].delivery.message = 'Delivery starts after onboarding completes.';
  setRecipients(pending.recipients);
  panel();
  expect(screen.getByText('Login email is queued until onboarding is complete.')).toBeVisible();
});
it('shows sender acceptance without exposing an editable password', () => {
  setRecipients(workspaceWithDelivery('Sent').recipients);
  panel();
  expect(screen.getAllByText('Login details sent')).toHaveLength(2);
  expect(screen.queryByRole('textbox', { name: /password/i })).not.toBeInTheDocument();
});
it('preserves the actual safe server Reason in one toast after a rejected send', async () => {
  mocks.send.mockReturnValue({
    unwrap: async () => {
      throw Object.assign(new Error('Request rejected'), {
        status: 400,
        data: {
          detail: 'One or more business rules were violated.',
          data: {
            Reason: 'The saved email changed. Refresh and review the recipient before sending.',
          },
        },
      });
    },
  });
  panel();
  selectAdult();
  confirm();
  fireEvent.click(sendButton());
  await waitFor(() =>
    expect(shikshaMitraToast.error).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringContaining('The email has changed.') })
    )
  );
  expect(parentEmail()).toHaveValue('raj@example.test');
  expect(mocks.success).not.toHaveBeenCalled();
  expect(screen.queryByText('One or more business rules were violated.')).not.toBeInTheDocument();
});
it('does not report success for a returned failed delivery and exposes failed-only retry', async () => {
  mocks.send.mockReturnValue({ unwrap: async () => workspaceWithDelivery('Failed') });
  panel();
  selectStudent();
  fireEvent.click(sendButton());
  expect(await screen.findByRole('button', { name: 'Retry student email' })).toBeEnabled();
  expect(mocks.success).not.toHaveBeenCalled();
  expect(screen.getAllByText('Sender unavailable. Try again later.')).not.toHaveLength(0);
});
it('retains Person after a saved-email refresh but requires renewed selection and access review', () => {
  setRecipients([studentRecipient, fatherRecipient, motherRecipient]);
  const view = panel();
  choosePerson('mother');
  selectAdult();
  confirm();
  setRecipients([
    studentRecipient,
    fatherRecipient,
    { ...motherRecipient, email: 'new-rina@example.test' },
  ]);
  view.rerender(
    <ThemeProvider theme={createTheme()}>
      <StudentOnboardingPortalAccounts student={student} canManage />
    </ThemeProvider>
  );
  expect(parentEmail()).toHaveValue('new-rina@example.test');
  expect(screen.getByRole('combobox', { name: 'Person' })).toHaveValue('mother');
  expect(screen.getByRole('checkbox', { name: /I confirm .* may access/ })).not.toBeChecked();
  expect(sendButton()).toBeDisabled();
});
it('keeps Records correction and review links when direct email editing is unavailable', async () => {
  setRecipients([{ ...fatherRecipient, email: null, canSend: false }]);
  mocks.permissions.push(
    { name: 'Students.Records.Changes.View', isGranted: true },
    { name: 'Students.Records.Changes.Add', isGranted: true }
  );
  panel();
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
it('does not expose Records correction with only the Create grant', () => {
  setRecipients([{ ...fatherRecipient, email: null, canSend: false }]);
  mocks.permissions.push({ name: 'Students.Records.Changes.Add', isGranted: true });
  panel();
  expect(screen.queryByRole('button', { name: 'Correct Saved Email' })).not.toBeInTheDocument();
});
