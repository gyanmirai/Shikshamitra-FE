import type { StudentCredentialsWorkspace } from 'src/redux/student/onboarding/student-onboarding-types';

import { it, vi, expect, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

import StudentOnboardingPortalAccounts from './student-onboarding-portal-accounts';

import type { StudentOnboardingItem } from './student-onboarding-model';

const state = vi.hoisted(() => ({
  workspace: undefined as StudentCredentialsWorkspace | undefined,
  fetching: false,
  send: vi.fn(),
  retry: vi.fn(),
  link: vi.fn(),
  linking: false,
  parent: vi.fn(),
  error: vi.fn(),
  success: vi.fn(),
}));
vi.mock('react-redux', () => ({
  useSelector: (select: any) => select({ auth: { permissions: [] } }),
}));
vi.mock('src/components/iconify', () => ({ Iconify: () => <span /> }));
vi.mock('src/components/toast', () => ({
  shikshaMitraToast: {
    error: state.error,
    success: state.success,
    info: vi.fn(),
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
vi.mock('src/redux/student/onboarding/student-onboarding-api', () => ({
  useGetStudentOnboardingCredentialsQuery: () => ({
    currentData: state.workspace,
    isFetching: state.fetching,
    isLoading: state.fetching,
    isError: false,
    refetch: vi.fn(),
  }),
  useSendStudentOnboardingCredentialsMutation: () => [state.send, { isLoading: false }],
  useRetryStudentOnboardingParentSetupMutation: () => [state.retry, { isLoading: false }],
  useLinkStudentOnboardingParentMutation: () => [state.link, { isLoading: state.linking }],
}));

const parent = {
  relationship: 'father' as const,
  name: 'Raj',
  email: 'parent@example.com',
  userId: 'parent-1',
  setupStatus: 'Ready' as const,
};
const student = {
  id: 'case-1',
  studentId: 'student-1',
  studentName: 'Anaya',
  backendStatus: 3,
} as StudentOnboardingItem;
const renderPanel = (overrides = {}) =>
  render(
    <StudentOnboardingPortalAccounts
      student={student}
      canManage
      onParentStateChange={state.parent}
      {...overrides}
    />
  );
beforeEach(() => {
  vi.clearAllMocks();
  state.fetching = false;
  state.linking = false;
  state.workspace = {
    caseId: 'case-1',
    guardianAccessEnabled: true,
    concurrencyStamp: 'stamp-1',
    recipients: [
      {
        accountType: 'guardian',
        relationship: 'father',
        email: parent.email,
        name: parent.name,
        canSend: true,
      },
    ],
    parentSibling: {
      enabled: true,
      familyConfirmed: true,
      isLinked: true,
      requiresSelection: false,
      canLink: true,
      status: 'Linked',
      linkedRelationship: 'father',
      canRetrySetup: false,
      candidates: [parent],
    },
  };
  state.retry.mockImplementation(() => ({ unwrap: async () => state.workspace }));
  state.link.mockImplementation(() => ({
    unwrap: async () => ({
      ...state.workspace,
      parentSibling: { ...state.workspace!.parentSibling!, isLinked: true, status: 'Linked' },
    }),
  }));
  state.send.mockImplementation(() => ({
    unwrap: async () => ({
      ...state.workspace,
      recipients: [{ ...state.workspace!.recipients[0], delivery: { status: 'Pending' } }],
    }),
  }));
});

const email = () => screen.getByRole('textbox', { name: 'Parent / guardian email' });
const choose = (value: string) =>
  fireEvent.change(screen.getByRole('combobox', { name: 'Person' }), { target: { value } });
const confirm = () =>
  fireEvent.click(screen.getByRole('checkbox', { name: /I confirm .* may access/ }));
const secondParent = {
  ...parent,
  relationship: 'mother' as const,
  email: 'mother@example.com',
  userId: 'parent-2',
};
const makeUnlinked = (changes = {}) => {
  state.workspace!.parentSibling = {
    ...state.workspace!.parentSibling!,
    isLinked: false,
    linkedRelationship: null,
    status: 'Available',
    ...changes,
  };
};
const bothParents = (changes = {}) => {
  makeUnlinked({
    status: 'SelectParent',
    requiresSelection: true,
    candidates: [parent, secondParent],
    ...changes,
  });
  state.workspace!.recipients.push({
    ...state.workspace!.recipients[0],
    relationship: 'mother',
    email: secondParent.email,
  });
};
it('shows a linked parent honestly and never sends or links just because it loads', () => {
  renderPanel();
  expect(email()).toHaveValue(parent.email);
  expect(screen.getByText(/Linked existing parent/)).toBeVisible();
  expect(state.send).not.toHaveBeenCalled();
  expect(state.link).not.toHaveBeenCalled();
});
it('preserves explicit manual sending for the first new parent', async () => {
  state.workspace!.parentSibling = {
    ...state.workspace!.parentSibling!,
    enabled: false,
    familyConfirmed: false,
    status: 'NewParent',
    isLinked: false,
    linkedRelationship: null,
    candidates: [],
  };
  renderPanel();
  expect(state.send).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('checkbox', { name: 'Send to parent / guardian' }));
  confirm();
  fireEvent.click(screen.getByRole('button', { name: 'Send selected login details' }));
  await waitFor(() => expect(state.send).toHaveBeenCalledOnce());
  expect(state.send.mock.calls[0][0]).toMatchObject({
    accountType: 'guardian',
    relationship: 'father',
    expectedEmail: parent.email,
    concurrencyStamp: 'stamp-1',
  });
});
it('carries a saved Guardian activation choice only after separate access confirmation', () => {
  makeUnlinked();
  state.workspace!.recipients.push({
    accountType: 'guardian',
    relationship: 'guardian',
    name: 'Meera',
    email: 'meera@example.test',
    canSend: false,
  });
  renderPanel();
  choose('guardian');
  expect(state.parent).toHaveBeenLastCalledWith(
    expect.objectContaining({ blockedReason: expect.any(String) })
  );
  confirm();
  expect(state.parent).toHaveBeenLastCalledWith({
    caseId: 'case-1',
    loaded: true,
    guardianAccessSelection: { expectedEmail: 'meera@example.test', confirmRecipientAccess: true },
  });
  expect(state.send).not.toHaveBeenCalled();
  expect(state.link).not.toHaveBeenCalled();
});
it('restores a saved Guardian access choice after candidate disappearance and requires confirmation again', () => {
  makeUnlinked({
    status: 'ReviewRequired',
    guardianAccessSelected: true,
    candidates: [],
    blockedReason: 'The saved guardian changed. Refresh and confirm app access again.',
  });
  state.workspace!.recipients.push({
    accountType: 'guardian',
    relationship: 'guardian',
    name: 'Meera',
    email: 'current-meera@example.test',
    canSend: false,
  });
  renderPanel();
  expect(screen.getByRole('combobox', { name: 'Person' })).toHaveValue('guardian');
  expect(email()).toHaveValue('current-meera@example.test');
  confirm();
  expect(state.parent).toHaveBeenLastCalledWith({
    caseId: 'case-1',
    loaded: true,
    guardianAccessSelection: {
      expectedEmail: 'current-meera@example.test',
      confirmRecipientAccess: true,
    },
  });
});
it('ignores unchecked Guardian suggestions with no sibling candidates and disabled access', () => {
  state.workspace!.guardianAccessEnabled = false;
  state.workspace!.parentSibling = undefined;
  state.workspace!.recipients = [
    {
      accountType: 'guardian',
      relationship: 'guardian',
      email: 'aunt@example.test',
      canSend: false,
    },
  ];
  renderPanel();
  confirm();
  expect(state.parent).toHaveBeenLastCalledWith({ caseId: 'case-1', loaded: true });
  expect(state.send).not.toHaveBeenCalled();
});
it('retains explicit legacy sibling parent selection for activation when both candidates exist', () => {
  bothParents();
  renderPanel();
  expect(screen.getByRole('combobox', { name: 'Person' })).toHaveValue('');
  expect(state.parent).toHaveBeenLastCalledWith(
    expect.objectContaining({ blockedReason: expect.stringMatching(/Choose Father or Mother/) })
  );
  choose('mother');
  expect(state.parent).toHaveBeenLastCalledWith({
    caseId: 'case-1',
    loaded: true,
    selection: {
      relationship: 'mother',
      expectedEmail: secondParent.email,
      expectedUserId: secondParent.userId,
    },
  });
  expect(state.send).not.toHaveBeenCalled();
});
it('shows activation validation beside the Person selector inside the owning form', () => {
  bothParents();
  renderPanel({ parentValidationAttempt: 1 });
  expect(screen.getByText('Choose Father or Mother before activating.')).toBeVisible();
  expect(screen.getByRole('combobox', { name: 'Person' }).closest('form')).toHaveAttribute(
    'aria-label',
    'Send credentials'
  );
});
it('shows pending original setup from the selected server candidate', () => {
  makeUnlinked({ candidates: [{ ...parent, setupStatus: 'Pending' }] });
  renderPanel();
  expect(screen.getByText('Original parent account setup is pending.')).toBeVisible();
  expect(state.send).not.toHaveBeenCalled();
});
it.each([
  { status: 'NotRequired' as const, canLink: true },
  { status: 'Available' as const, canLink: false },
])('retains saved parent details for $status without exposing linking', (changes) => {
  makeUnlinked(changes);
  renderPanel({ student: { ...student, studentEnrollmentId: 'enrollment-1' } });
  expect(email()).toHaveValue(parent.email);
  expect(screen.queryByRole('button', { name: 'Confirm & link parent' })).not.toBeInTheDocument();
  expect(state.link).not.toHaveBeenCalled();
  expect(state.parent.mock.lastCall?.[0].selection).toBeUndefined();
});
it('does not guess a legacy owner or setup status from two denied candidates', () => {
  bothParents({
    canLink: false,
    candidates: [
      { ...parent, setupStatus: 'Pending' },
      { ...secondParent, setupStatus: 'Failed' },
    ],
  });
  renderPanel();
  expect(screen.getByRole('combobox', { name: 'Person' })).toHaveValue('');
  expect(email()).toHaveValue('');
  expect(screen.queryByText('Original parent account setup is pending.')).not.toBeInTheDocument();
  expect(state.parent.mock.lastCall?.[0].selection).toBeUndefined();
});
it('shows an authorization next step without an unavailable choice or raw permission code', () => {
  bothParents({ canLink: false, blockedReason: 'Identity update permission is required.' });
  renderPanel({ parentValidationAttempt: 1 });
  expect(screen.getByRole('combobox', { name: 'Person' })).toBeDisabled();
  expect(screen.getByText('Ask authorized staff to link this parent.')).toBeVisible();
  expect(screen.queryByText('Identity update permission is required.')).not.toBeInTheDocument();
  expect(screen.queryByText('Choose Father or Mother before activating.')).not.toBeInTheDocument();
});
it('locks the server-selected reviewed mother after preparation recovery', () => {
  bothParents({ selectedRelationship: 'mother', status: 'Available' });
  renderPanel();
  expect(screen.getByRole('combobox', { name: 'Person' })).toHaveValue('mother');
  expect(screen.getByRole('combobox', { name: 'Person' })).toBeDisabled();
  expect(state.parent).toHaveBeenLastCalledWith(
    expect.objectContaining({ selection: expect.objectContaining({ relationship: 'mother' }) })
  );
});
it('offers an authorized-review next step when setup retry is unavailable', () => {
  state.workspace!.parentSibling!.status = 'SetupFailed';
  renderPanel();
  expect(
    screen.getByText('Original parent setup failed. Ask authorized staff to review it.')
  ).toBeVisible();
  expect(screen.queryByRole('button', { name: 'Retry parent setup' })).not.toBeInTheDocument();
});
it('retries only the original parent setup using the current workspace stamp', async () => {
  state.workspace!.parentSibling!.status = 'SetupFailed';
  state.workspace!.parentSibling!.canRetrySetup = true;
  renderPanel();
  fireEvent.click(screen.getByRole('button', { name: 'Retry parent setup' }));
  await waitFor(() =>
    expect(state.retry).toHaveBeenCalledWith({ id: 'case-1', concurrencyStamp: 'stamp-1' })
  );
  expect(state.send).not.toHaveBeenCalled();
  expect(state.link).not.toHaveBeenCalled();
});
it('never emits activation-ready data from another case or while fetching', () => {
  const view = renderPanel({ student: { ...student, id: 'case-2' } });
  expect(state.parent).toHaveBeenLastCalledWith({ caseId: 'case-2', loaded: false });
  state.fetching = true;
  view.rerender(
    <StudentOnboardingPortalAccounts
      student={student}
      canManage
      onParentStateChange={state.parent}
    />
  );
  expect(state.parent).toHaveBeenLastCalledWith({ caseId: 'case-1', loaded: false });
});
it.each([3, 4])(
  'links an enrolled child in backend status %s only after explicit access confirmation',
  async (backendStatus) => {
    makeUnlinked();
    renderPanel({ student: { ...student, backendStatus, studentEnrollmentId: 'enrollment-1' } });
    const link = screen.getByRole('button', { name: 'Confirm & link parent' });
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
          expectedEmail: parent.email,
          expectedUserId: parent.userId,
        },
      })
    );
    expect(state.send).not.toHaveBeenCalled();
    expect(state.retry).not.toHaveBeenCalled();
  }
);
it('links only an explicitly chosen second parent from the server candidates', async () => {
  bothParents();
  renderPanel({ student: { ...student, studentEnrollmentId: 'enrollment-1' } });
  choose('mother');
  confirm();
  fireEvent.click(screen.getByRole('button', { name: 'Confirm & link parent' }));
  await waitFor(() =>
    expect(state.link).toHaveBeenCalledWith(
      expect.objectContaining({
        siblingParentSelection: {
          relationship: 'mother',
          expectedEmail: secondParent.email,
          expectedUserId: secondParent.userId,
        },
      })
    )
  );
});
it.each(['permission', 'not-required', 'cancelled'])(
  'does not offer late linking when %s',
  (condition) => {
    makeUnlinked({
      canLink: condition !== 'permission',
      status: condition === 'not-required' ? 'NotRequired' : 'Available',
      blockedReason:
        condition === 'permission' ? 'Ask authorized staff to link this parent.' : null,
    });
    renderPanel({
      student: {
        ...student,
        backendStatus: condition === 'cancelled' ? 5 : 4,
        studentEnrollmentId: 'enrollment-1',
      },
    });
    expect(screen.queryByRole('button', { name: 'Confirm & link parent' })).not.toBeInTheDocument();
    expect(state.link).not.toHaveBeenCalled();
  }
);
it('requires fresh review after a late link failure and preserves the saved recipient', async () => {
  makeUnlinked();
  state.link.mockReturnValue({
    unwrap: async () => {
      throw new Error('offline');
    },
  });
  renderPanel({ student: { ...student, studentEnrollmentId: 'enrollment-1' } });
  confirm();
  fireEvent.click(screen.getByRole('button', { name: 'Confirm & link parent' }));
  await waitFor(() => expect(state.error).toHaveBeenCalledOnce());
  expect(email()).toHaveValue(parent.email);
  expect(screen.getByRole('checkbox', { name: /I confirm .* may access/ })).not.toBeChecked();
  expect(state.send).not.toHaveBeenCalled();
});
it('locks late linking and reports busy while a request is pending', () => {
  makeUnlinked();
  state.linking = true;
  const onBusyChange = vi.fn();
  renderPanel({ student: { ...student, studentEnrollmentId: 'enrollment-1' }, onBusyChange });
  expect(screen.getByRole('button', { name: 'Confirm & link parent' })).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Refresh' })).toBeDisabled();
  expect(onBusyChange).toHaveBeenLastCalledWith(true);
});
