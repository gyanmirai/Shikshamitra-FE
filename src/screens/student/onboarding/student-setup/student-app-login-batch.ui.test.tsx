import type { StudentCredentialsWorkspace } from 'src/redux/student/onboarding/student-onboarding-types';

import { it, vi, expect, beforeEach } from 'vitest';
import { render, screen, within, waitFor, fireEvent } from '@testing-library/react';

import StudentOnboardingPortalAccounts from './student-onboarding-portal-accounts';

import type { StudentOnboardingItem } from './student-onboarding-model';

const state = vi.hoisted(() => ({
  workspace: undefined as StudentCredentialsWorkspace | undefined,
  send: vi.fn(),
  link: vi.fn(),
  retry: vi.fn(),
  refetch: vi.fn(),
  busy: vi.fn(),
  parent: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
  success: vi.fn(),
  fetching: false,
  failed: false,
}));
vi.mock('react-redux', () => ({
  useSelector: (select: any) => select({ auth: { permissions: [] } }),
}));
vi.mock('src/components/iconify', () => ({ Iconify: () => <span /> }));
vi.mock('src/components/toast', () => ({
  shikshaMitraToast: {
    error: state.error,
    success: state.success,
    info: state.info,
    warning: vi.fn(),
    dismiss: vi.fn(),
  },
}));
vi.mock('src/components/custom-select', () => ({
  default: ({ label, value, options, onChange, disabled, helperText }: any) => (
    <>
      <select
        aria-label={label}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="" />
        {options.map((option: any) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {helperText && <span>{helperText}</span>}
    </>
  ),
}));
vi.mock('./guardian-profile-email-dialog', () => ({ default: () => null }));
vi.mock('./student-credential-profile-email-dialog', () => ({
  default: ({ recipient, onClose }: any) => (
    <div role="dialog" aria-label="Edit saved email">
      <span>{recipient.relationship}</span>
      <button type="button" onClick={onClose}>
        Close email editor
      </button>
    </div>
  ),
}));
vi.mock('src/redux/student/onboarding/student-onboarding-api', () => ({
  useGetStudentOnboardingCredentialsQuery: () => ({
    currentData: state.workspace,
    isFetching: state.fetching,
    isLoading: state.fetching,
    isError: state.failed,
    refetch: state.refetch,
  }),
  useSendStudentOnboardingCredentialsMutation: () => [state.send, { isLoading: false }],
  useRetryStudentOnboardingParentSetupMutation: () => [state.retry, { isLoading: false }],
  useLinkStudentOnboardingParentMutation: () => [state.link, { isLoading: false }],
}));
const student = {
  id: 'case-1',
  studentId: 'student-1',
  studentName: 'Jay',
  backendStatus: 3,
  studentEnrollmentId: 'enrollment-1',
} as StudentOnboardingItem;
const panel = (props = {}) =>
  render(
    <StudentOnboardingPortalAccounts
      student={student}
      canManage
      onBusyChange={state.busy}
      onParentStateChange={state.parent}
      {...props}
    />
  );
const selectStudent = () =>
  fireEvent.click(screen.getByRole('checkbox', { name: 'Send to student' }));
const selectParent = () =>
  fireEvent.click(screen.getByRole('checkbox', { name: 'Send to parent / guardian' }));
const confirm = () =>
  fireEvent.click(screen.getByRole('checkbox', { name: /I confirm .* may access/ }));
const send = () => screen.getByRole('button', { name: 'Send selected login details' });
const delivered = (
  accountType: 'student' | 'guardian',
  status = 'Pending',
  base = state.workspace!
) =>
  ({
    ...base,
    concurrencyStamp: `${base.concurrencyStamp}-next`,
    recipients: base.recipients.map((recipient) =>
      recipient.accountType === accountType
        ? {
            ...recipient,
            delivery: {
              id: accountType,
              accountType,
              email: recipient.email!,
              status,
              attemptCount: 1,
              message: status === 'Failed' ? 'Sender unavailable. Try again later.' : null,
            },
          }
        : recipient
    ),
  }) as StudentCredentialsWorkspace;
beforeEach(() => {
  vi.clearAllMocks();
  state.fetching = false;
  state.failed = false;
  state.workspace = {
    caseId: 'case-1',
    concurrencyStamp: 'stamp-1',
    guardianAccessEnabled: true,
    recipients: [
      {
        accountType: 'student',
        relationship: 'self',
        name: 'Jay',
        email: 'jay@example.test',
        canSend: true,
        canEditEmail: true,
      },
      {
        accountType: 'guardian',
        relationship: 'father',
        name: 'Raj',
        email: 'raj@example.test',
        canSend: true,
        canEditEmail: true,
      },
    ],
  };
  state.send.mockImplementation((body) => ({ unwrap: async () => delivered(body.accountType) }));
  state.refetch.mockImplementation(async () => ({ data: state.workspace }));
});

it('shows both own saved emails with no send recipients preselected', () => {
  panel();
  expect(screen.getByRole('textbox', { name: 'Student email' })).toHaveValue('jay@example.test');
  expect(screen.getByRole('textbox', { name: 'Parent / guardian email' })).toHaveValue(
    'raj@example.test'
  );
  expect(screen.getByRole('textbox', { name: 'Student email' })).toHaveAttribute('readonly');
  expect(screen.getByRole('checkbox', { name: 'Send to student' })).not.toBeChecked();
  expect(screen.getByRole('checkbox', { name: 'Send to parent / guardian' })).not.toBeChecked();
  expect(send()).toBeDisabled();
  expect(screen.queryByRole('combobox', { name: 'Account type' })).not.toBeInTheDocument();
});
it('sends both selected recipients sequentially using the returned fresh stamp', async () => {
  const first = delivered('student');
  state.send
    .mockImplementationOnce(() => ({ unwrap: async () => first }))
    .mockImplementationOnce(() => ({
      unwrap: async () => delivered('guardian', 'Pending', first),
    }));
  panel();
  selectStudent();
  selectParent();
  confirm();
  fireEvent.click(send());
  await waitFor(() => expect(state.send).toHaveBeenCalledTimes(2));
  expect(state.send.mock.calls.map(([body]) => body)).toEqual([
    {
      id: 'case-1',
      accountType: 'student',
      relationship: 'self',
      expectedEmail: 'jay@example.test',
      concurrencyStamp: 'stamp-1',
      confirmRecipientAccess: false,
    },
    {
      id: 'case-1',
      accountType: 'guardian',
      relationship: 'father',
      expectedEmail: 'raj@example.test',
      concurrencyStamp: 'stamp-1-next',
      confirmRecipientAccess: true,
    },
  ]);
});
it.each(['student', 'guardian'])(
  'sends only the explicitly selected %s recipient',
  async (accountType) => {
    panel();
    if (accountType === 'student') selectStudent();
    else {
      selectParent();
      confirm();
    }
    fireEvent.click(send());
    await waitFor(() => expect(state.send).toHaveBeenCalledOnce());
    expect(state.send.mock.calls[0][0].accountType).toBe(accountType);
  }
);
it('requires adult access confirmation separately from recipient selection', () => {
  panel();
  selectParent();
  expect(send()).toBeDisabled();
  confirm();
  expect(send()).toBeEnabled();
});
it('retains Student success and retries only the failed parent', async () => {
  const first = delivered('student');
  const failure = delivered('guardian', 'Failed', first);
  state.send
    .mockImplementationOnce(() => ({ unwrap: async () => first }))
    .mockImplementationOnce(() => ({ unwrap: async () => failure }))
    .mockImplementationOnce(() => ({
      unwrap: async () => delivered('guardian', 'Pending', failure),
    }));
  panel();
  selectStudent();
  selectParent();
  confirm();
  fireEvent.click(send());
  const retry = await screen.findByRole('button', { name: 'Retry parent email' });
  expect(screen.getByRole('textbox', { name: 'Student email' })).toHaveValue('jay@example.test');
  fireEvent.click(retry);
  await waitFor(() => expect(state.send).toHaveBeenCalledTimes(3));
  expect(state.send.mock.calls[2][0]).toMatchObject({
    accountType: 'guardian',
    concurrencyStamp: failure.concurrencyStamp,
  });
  expect(state.send.mock.calls.filter(([body]) => body.accountType === 'student')).toHaveLength(1);
});
it('refetches after a rejected first send before continuing with the second recipient', async () => {
  const refreshed = { ...state.workspace!, concurrencyStamp: 'refreshed' };
  state.refetch.mockResolvedValue({ data: refreshed });
  state.send.mockImplementationOnce(() => ({
    unwrap: async () => {
      throw new Error('offline');
    },
  }));
  panel();
  selectStudent();
  selectParent();
  confirm();
  fireEvent.click(send());
  await waitFor(() => expect(state.send).toHaveBeenCalledTimes(2));
  expect(state.refetch).toHaveBeenCalledOnce();
  expect(state.send.mock.calls[1][0]).toMatchObject({
    accountType: 'guardian',
    concurrencyStamp: 'refreshed',
  });
  expect(await screen.findByRole('button', { name: 'Retry student email' })).toBeEnabled();
});
it('stops the batch when failure recovery cannot load a current workspace', async () => {
  state.refetch.mockRejectedValue(new Error('offline'));
  state.send.mockImplementationOnce(() => ({
    unwrap: async () => {
      throw new Error('offline');
    },
  }));
  panel();
  selectStudent();
  selectParent();
  confirm();
  fireEvent.click(send());
  await waitFor(() => expect(state.busy).toHaveBeenLastCalledWith(false));
  expect(state.send).toHaveBeenCalledOnce();
});

it.each(['isError', 'error'])(
  'keeps writes locked when a resolved recovery read includes cached data and %s',
  async (failureKey) => {
    state.refetch.mockResolvedValueOnce({
      data: state.workspace,
      [failureKey]: failureKey === 'isError' ? true : { status: 503 },
    });
    state.send.mockImplementationOnce(() => ({
      unwrap: async () => {
        throw new Error('offline');
      },
    }));
    panel();
    selectStudent();
    selectParent();
    confirm();
    fireEvent.click(send());
    await waitFor(() => expect(state.refetch).toHaveBeenCalledOnce());
    await waitFor(() => expect(state.busy).toHaveBeenLastCalledWith(false));
    expect(state.send).toHaveBeenCalledOnce();
    expect(send()).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Retry student email' })).toBeDisabled();
    fireEvent.click(send());
    expect(state.send).toHaveBeenCalledOnce();
    state.refetch.mockResolvedValueOnce({
      data: { ...state.workspace!, concurrencyStamp: 'verified-refresh' },
      isError: false,
    });
    fireEvent.click(screen.getByRole('button', { name: 'Refresh' }));
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Retry student email' })).toBeEnabled()
    );
    expect(state.send).toHaveBeenCalledOnce();
  }
);

it('does not adopt a changed cached source from a failed background read for the second send', async () => {
  let resolve!: (workspace: StudentCredentialsWorkspace) => void;
  state.send.mockReturnValueOnce({
    unwrap: () =>
      new Promise((finish) => {
        resolve = finish;
      }),
  });
  const view = panel();
  selectStudent();
  selectParent();
  confirm();
  fireEvent.click(send());
  await waitFor(() => expect(state.send).toHaveBeenCalledOnce());
  const first = delivered('student');
  state.workspace = { ...state.workspace!, concurrencyStamp: 'cached-stale-stamp' };
  state.failed = true;
  view.rerender(
    <StudentOnboardingPortalAccounts student={student} canManage onBusyChange={state.busy} />
  );
  resolve(first);
  await waitFor(() => expect(state.busy).toHaveBeenLastCalledWith(false));
  expect(state.send).toHaveBeenCalledOnce();
});
it('stops after recovery detects a changed parent email', async () => {
  state.refetch.mockResolvedValue({
    data: {
      ...state.workspace!,
      recipients: state.workspace!.recipients.map((r) =>
        r.accountType === 'guardian' ? { ...r, email: 'changed@example.test' } : r
      ),
    },
  });
  state.send.mockImplementationOnce(() => ({
    unwrap: async () => {
      throw new Error('offline');
    },
  }));
  panel();
  selectStudent();
  selectParent();
  confirm();
  fireEvent.click(send());
  await waitFor(() => expect(state.busy).toHaveBeenLastCalledWith(false));
  expect(state.send).toHaveBeenCalledOnce();
});
it.each(['unmount', 'case switch'])('stops remaining sends after %s', async (mode) => {
  let resolve!: (workspace: StudentCredentialsWorkspace) => void;
  state.send.mockReturnValue({
    unwrap: () =>
      new Promise((finish) => {
        resolve = finish;
      }),
  });
  const view = panel();
  selectStudent();
  selectParent();
  confirm();
  fireEvent.click(send());
  await waitFor(() => expect(state.send).toHaveBeenCalledOnce());
  if (mode === 'unmount') view.unmount();
  else
    view.rerender(
      <StudentOnboardingPortalAccounts student={{ ...student, id: 'case-2' }} canManage />
    );
  resolve(delivered('student'));
  await new Promise((finish) => setTimeout(finish, 10));
  expect(state.send).toHaveBeenCalledOnce();
});
it('locks controls and duplicate submits for the whole batch', async () => {
  let resolve!: (workspace: StudentCredentialsWorkspace) => void;
  state.send.mockReturnValue({
    unwrap: () =>
      new Promise((finish) => {
        resolve = finish;
      }),
  });
  panel();
  selectStudent();
  selectParent();
  confirm();
  fireEvent.click(send());
  fireEvent.click(send());
  await waitFor(() => expect(state.send).toHaveBeenCalledOnce());
  expect(screen.getByRole('checkbox', { name: 'Send to parent / guardian' })).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Refresh' })).toBeDisabled();
  expect(state.busy).toHaveBeenLastCalledWith(true);
  resolve(delivered('student'));
});
it('clears confirmation and parent selection after saved email drift', () => {
  const view = panel();
  selectParent();
  confirm();
  state.workspace = {
    ...state.workspace!,
    recipients: state.workspace!.recipients.map((r) =>
      r.accountType === 'guardian' ? { ...r, email: 'changed@example.test' } : r
    ),
  };
  view.rerender(<StudentOnboardingPortalAccounts student={student} canManage />);
  expect(screen.getByRole('checkbox', { name: /I confirm .* may access/ })).not.toBeChecked();
  expect(screen.getByRole('checkbox', { name: 'Send to parent / guardian' })).not.toBeChecked();
  expect(send()).toBeDisabled();
});
it.each(['Pending', 'Processing'])(
  'does not replay %s delivery even with a true capability',
  (status) => {
    state.workspace = delivered('student', status);
    panel();
    selectStudent();
    expect(send()).toBeDisabled();
    expect(screen.getByText('Queued')).toBeVisible();
  }
);
it('shows sent as sender acceptance and excludes that recipient from the initial send', () => {
  state.workspace = delivered('student', 'Sent');
  panel();
  expect(screen.getByText('Login details sent')).toBeVisible();
  expect(screen.getByText('Accepted by the email sender.')).toBeVisible();
  expect(screen.getByRole('checkbox', { name: 'Send to student' })).toBeDisabled();
  selectStudent();
  expect(send()).toBeDisabled();
  selectParent();
  confirm();
  expect(send()).toBeEnabled();
  fireEvent.click(send());
  expect(state.send).toHaveBeenCalledOnce();
  expect(state.send.mock.calls[0][0].accountType).toBe('guardian');
});
it('disables normal sending when both recipients have already been sent', () => {
  state.workspace = delivered('guardian', 'Sent', delivered('student', 'Sent'));
  panel({ compact: true });
  expect(screen.getAllByText('Login details sent')).toHaveLength(2);
  expect(screen.getByRole('checkbox', { name: 'Send to student' })).toBeDisabled();
  expect(screen.getByRole('checkbox', { name: 'Send to parent / guardian' })).toBeDisabled();
  expect(send()).toBeDisabled();
  expect(state.send).not.toHaveBeenCalled();
});
it('requires a separate confirmation for resending the exact sent recipient', async () => {
  state.workspace = delivered('student', 'Sent');
  panel();
  fireEvent.click(screen.getByRole('button', { name: 'Resend login details' }));
  let dialog = screen.getByRole('dialog', { name: 'Resend Login Details?' });
  expect(dialog).toHaveTextContent('jay@example.test');
  expect(state.send).not.toHaveBeenCalled();
  fireEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }));
  await waitFor(() =>
    expect(screen.queryByRole('dialog', { name: 'Resend Login Details?' })).not.toBeInTheDocument()
  );
  expect(state.send).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: 'Resend login details' }));
  dialog = screen.getByRole('dialog', { name: 'Resend Login Details?' });
  expect(within(dialog).getByRole('button', { name: 'Resend login details' })).toBeEnabled();
  fireEvent.click(within(dialog).getByRole('button', { name: 'Resend login details' }));
  await waitFor(() => expect(state.send).toHaveBeenCalledOnce());
  expect(state.send.mock.calls[0][0]).toMatchObject({
    accountType: 'student',
    expectedEmail: 'jay@example.test',
    concurrencyStamp: state.workspace!.concurrencyStamp,
  });
});
it.each(['cooldown', 'permission', 'loading'])(
  'keeps sent-recipient resend unavailable during %s',
  (reason) => {
    state.workspace = delivered('student', 'Sent');
    if (reason === 'cooldown') {
      state.workspace.recipients[0].canSend = false;
      state.workspace.recipients[0].blockedReason =
        'Wait two minutes before sending credentials again.';
    }
    if (reason === 'loading') state.fetching = true;
    panel({ canManage: reason !== 'permission' });
    expect(screen.getByRole('button', { name: 'Resend login details' })).toBeDisabled();
    if (reason === 'cooldown')
      expect(
        screen.getByText('Wait two minutes before sending login details again.')
      ).toBeVisible();
  }
);
it('invalidates resend confirmation when the saved recipient changes', async () => {
  state.workspace = delivered('student', 'Sent');
  const view = panel();
  fireEvent.click(screen.getByRole('button', { name: 'Resend login details' }));
  state.workspace = {
    ...state.workspace!,
    recipients: state.workspace!.recipients.map((recipient) =>
      recipient.accountType === 'student' ? { ...recipient, email: 'new@example.test' } : recipient
    ),
  };
  view.rerender(<StudentOnboardingPortalAccounts student={student} canManage />);
  await waitFor(() =>
    expect(screen.queryByRole('dialog', { name: 'Resend Login Details?' })).not.toBeInTheDocument()
  );
  expect(state.send).not.toHaveBeenCalled();
});
it('requires parent access confirmation before a separate resend in compact setup', async () => {
  state.workspace = delivered('guardian', 'Sent');
  panel({ compact: true });
  const resend = screen.getByRole('button', { name: 'Resend login details' });
  expect(resend).toBeDisabled();
  confirm();
  expect(resend).toBeEnabled();
  fireEvent.click(resend);
  fireEvent.click(
    within(screen.getByRole('dialog', { name: 'Resend Login Details?' })).getByRole('button', {
      name: 'Resend login details',
    })
  );
  await waitFor(() => expect(state.send).toHaveBeenCalledOnce());
  expect(state.send.mock.calls[0][0]).toMatchObject({
    accountType: 'guardian',
    confirmRecipientAccess: true,
    expectedEmail: 'raj@example.test',
  });
});
it('removes a stale checked recipient when a refresh reports it was already sent', () => {
  const view = panel();
  selectStudent();
  expect(send()).toBeEnabled();
  state.workspace = delivered('student', 'Sent');
  view.rerender(<StudentOnboardingPortalAccounts student={student} canManage />);
  expect(screen.getByRole('checkbox', { name: 'Send to student' })).not.toBeChecked();
  expect(send()).toBeDisabled();
  fireEvent.submit(screen.getByRole('form', { name: 'Send credentials' }));
  expect(state.send).not.toHaveBeenCalled();
});
it('keeps failed resends outside ordinary sending and requires confirmation again', async () => {
  state.workspace = delivered('student', 'Failed');
  state.workspace.recipients[0].delivery!.sentAt = '2026-10-29T10:00:00Z';
  panel();
  expect(screen.getByText('Failed')).toBeVisible();
  expect(screen.getByRole('checkbox', { name: 'Send to student' })).toBeDisabled();
  expect(screen.queryByRole('button', { name: 'Retry student email' })).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Resend login details' }));
  expect(state.send).not.toHaveBeenCalled();
  fireEvent.click(
    within(screen.getByRole('dialog', { name: 'Resend Login Details?' })).getByRole('button', {
      name: 'Resend login details',
    })
  );
  await waitFor(() => expect(state.send).toHaveBeenCalledOnce());
});
it.each(['permission', 'loading', 'unavailable'])(
  'prevents sends while %s blocks action',
  (reason) => {
    if (reason === 'loading') state.fetching = true;
    if (reason === 'unavailable') state.workspace!.recipients[0].canSend = false;
    panel({ canManage: reason !== 'permission' });
    selectStudent();
    expect(send()).toBeDisabled();
  }
);
it('opens the exact missing Guardian editor and locks send until the editor closes', () => {
  state.workspace!.recipients[1] = {
    ...state.workspace!.recipients[1],
    relationship: 'guardian',
    email: null,
    canSend: false,
  };
  panel();
  fireEvent.click(screen.getByRole('button', { name: 'Add email' }));
  expect(screen.getByRole('dialog', { name: 'Edit saved email' })).toHaveTextContent('guardian');
  expect(send()).toBeDisabled();
  expect(state.busy).toHaveBeenLastCalledWith(true);
});

it('explicitly confirms and links an exact existing parent without Admission family proof', async () => {
  state.workspace!.parentSibling = {
    enabled: true,
    familyConfirmed: false,
    requiresOnboardingConfirmation: true,
    isLinked: false,
    requiresSelection: false,
    canLink: true,
    status: 'Available',
    canRetrySetup: false,
    candidates: [
      {
        relationship: 'father',
        name: 'Raj',
        email: 'raj@example.test',
        userId: 'parent-1',
        setupStatus: 'Ready',
      },
    ],
  };
  state.link.mockReturnValue({
    unwrap: async () => ({
      ...state.workspace!,
      parentSibling: {
        ...state.workspace!.parentSibling!,
        isLinked: true,
        linkedRelationship: 'father',
        status: 'Linked',
      },
    }),
  });
  panel();
  expect(state.parent).toHaveBeenLastCalledWith({ caseId: 'case-1', loaded: true });
  const link = screen.getByRole('button', { name: 'Confirm & link parent' });
  expect(link).toBeDisabled();
  selectParent();
  expect(link).toBeDisabled();
  confirm();
  fireEvent.click(link);
  await waitFor(() =>
    expect(state.link).toHaveBeenCalledExactlyOnceWith({
      id: 'case-1',
      concurrencyStamp: 'stamp-1',
      confirmExistingParentAccess: true,
      siblingParentSelection: {
        relationship: 'father',
        expectedEmail: 'raj@example.test',
        expectedUserId: 'parent-1',
      },
    })
  );
  expect(state.send).not.toHaveBeenCalled();
});
it('requests existing-parent sign-in help with the explicit capability and flag', async () => {
  state.workspace!.recipients[1] = {
    ...state.workspace!.recipients[1],
    canSend: false,
    canSendExistingParentHelp: true,
    hasLinkedAccount: true,
  };
  state.workspace!.parentSibling = {
    enabled: true,
    familyConfirmed: true,
    isLinked: true,
    linkedRelationship: 'father',
    requiresSelection: false,
    canLink: false,
    status: 'Linked',
    canRetrySetup: false,
    candidates: [
      {
        relationship: 'father',
        email: 'raj@example.test',
        userId: 'parent-1',
        setupStatus: 'Ready',
      },
    ],
  };
  panel();
  selectParent();
  confirm();
  fireEvent.click(send());
  await waitFor(() => expect(state.send).toHaveBeenCalledOnce());
  expect(state.send.mock.calls[0][0]).toMatchObject({
    accountType: 'guardian',
    sendExistingParentHelp: true,
    expectedEmail: 'raj@example.test',
  });
  expect(screen.getByText(/no new password is created/)).toBeVisible();
});

it('does not treat a reused linked parent canSend flag as permission to generate new credentials', () => {
  state.workspace!.parentSibling = {
    enabled: true,
    familyConfirmed: true,
    isLinked: true,
    linkedRelationship: 'father',
    requiresSelection: false,
    canLink: false,
    status: 'Linked',
    canRetrySetup: false,
    candidates: [
      {
        relationship: 'father',
        email: 'raj@example.test',
        userId: 'parent-1',
        setupStatus: 'Ready',
      },
    ],
  };
  panel();
  selectParent();
  confirm();
  expect(send()).toBeDisabled();
  expect(state.send).not.toHaveBeenCalled();
});
it('does not create activation intent for a no-proof parent before explicit late linking', () => {
  state.workspace!.parentSibling = {
    enabled: true,
    familyConfirmed: false,
    requiresOnboardingConfirmation: true,
    isLinked: false,
    requiresSelection: false,
    canLink: true,
    status: 'Available',
    canRetrySetup: false,
    candidates: [
      {
        relationship: 'father',
        email: 'raj@example.test',
        userId: 'parent-1',
        setupStatus: 'Ready',
      },
    ],
  };
  panel({ student: { ...student, studentEnrollmentId: undefined } });
  expect(state.parent).toHaveBeenLastCalledWith({ caseId: 'case-1', loaded: true });
  expect(screen.queryByRole('button', { name: 'Confirm & link parent' })).not.toBeInTheDocument();
});

it('uses authoritative queued status after a lost response and never offers a retry for that recipient', async () => {
  state.refetch.mockResolvedValue({ data: delivered('student') });
  state.send.mockImplementationOnce(() => ({
    unwrap: async () => {
      throw new Error('offline');
    },
  }));
  panel();
  selectStudent();
  fireEvent.click(send());
  await waitFor(() => expect(state.busy).toHaveBeenLastCalledWith(false));
  expect(screen.getByText('Queued')).toBeVisible();
  expect(screen.queryByRole('button', { name: 'Retry student email' })).not.toBeInTheDocument();
});
it('shows a failed local request on its own row and preserves it when the other email changes', async () => {
  state.send.mockImplementationOnce(() => ({
    unwrap: async () => {
      throw new Error('offline');
    },
  }));
  const view = panel();
  selectStudent();
  fireEvent.click(send());
  expect(await screen.findByText('Failed')).toBeVisible();
  state.workspace = {
    ...state.workspace!,
    recipients: state.workspace!.recipients.map((r) =>
      r.accountType === 'guardian' ? { ...r, email: 'new-parent@example.test' } : r
    ),
  };
  view.rerender(<StudentOnboardingPortalAccounts student={student} canManage />);
  expect(screen.getByRole('button', { name: 'Retry student email' })).toBeEnabled();
  expect(screen.getByText('Failed')).toBeVisible();
});
it('preserves a new server blocker for the second recipient after the first send', async () => {
  const first = delivered('student');
  first.recipients[1] = {
    ...first.recipients[1],
    canSend: false,
    blockedReason: 'This email already has a student login. Use a different parent email.',
  };
  state.send.mockReturnValue({ unwrap: async () => first });
  panel();
  selectStudent();
  selectParent();
  confirm();
  fireEvent.click(send());
  expect(
    await screen.findByText('This email already has a student login. Use a different parent email.')
  ).toBeVisible();
  expect(state.send).toHaveBeenCalledOnce();
  expect(screen.getByText('Queued')).toBeVisible();
});
it.each(['case', 'permission'])(
  'releases operation busy after %s changes and stops remaining sends',
  async (mode) => {
    let resolve!: (workspace: StudentCredentialsWorkspace) => void;
    state.send.mockReturnValue({
      unwrap: () =>
        new Promise((finish) => {
          resolve = finish;
        }),
    });
    const view = panel();
    selectStudent();
    selectParent();
    confirm();
    fireEvent.click(send());
    await waitFor(() => expect(state.send).toHaveBeenCalledOnce());
    const nextStudent = mode === 'case' ? { ...student, id: 'case-2' } : student;
    if (mode === 'case') state.workspace = { ...state.workspace!, caseId: 'case-2' };
    view.rerender(
      <StudentOnboardingPortalAccounts
        student={nextStudent}
        canManage={mode !== 'permission'}
        onBusyChange={state.busy}
      />
    );
    resolve(delivered('student', 'Pending', { ...state.workspace!, caseId: 'case-1' }));
    await waitFor(() => expect(state.busy).toHaveBeenLastCalledWith(false));
    expect(state.send).toHaveBeenCalledOnce();
    view.rerender(
      <StudentOnboardingPortalAccounts student={nextStudent} canManage onBusyChange={state.busy} />
    );
    expect(screen.getByRole('button', { name: 'Refresh' })).toBeEnabled();
  }
);
it('keeps an unchecked missing optional email neutral until that recipient is selected', () => {
  state.workspace!.recipients[1] = {
    ...state.workspace!.recipients[1],
    email: null,
    canSend: false,
  };
  panel();
  expect(screen.getByRole('textbox', { name: 'Parent / guardian email' })).toHaveAttribute(
    'aria-invalid',
    'false'
  );
  selectParent();
  expect(screen.getByRole('textbox', { name: 'Parent / guardian email' })).toHaveAttribute(
    'aria-invalid',
    'true'
  );
});
