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

it('shows a linked existing parent without a duplicate Send Credentials action or Guardian option', async () => {
  renderPanel();
  await screen.findByText('Linked', { exact: true });
  expect(screen.getByText('Linked', { exact: true })).toBeVisible();
  expect(screen.getByRole('option', { name: /^Parent$/ })).toBeInTheDocument();
  expect(screen.queryByRole('option', { name: /Guardian/ })).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Send Credentials' })).not.toBeInTheDocument();
  expect(state.send).not.toHaveBeenCalled();
});

it('preserves manual first-parent sending and never sends merely because the workspace loads', async () => {
  state.workspace!.parentSibling = {
    ...state.workspace!.parentSibling!,
    isLinked: false,
    status: 'NewParent',
    linkedRelationship: null,
    candidates: [],
  };
  renderPanel();
  await waitFor(() =>
    expect(screen.getByRole('button', { name: 'Send Credentials' })).toBeEnabled()
  );
  expect(state.send).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: 'Send Credentials' }));
  await waitFor(() => expect(state.send).toHaveBeenCalledOnce());
});

it('requires an explicit parent choice when both existing parent accounts are available', async () => {
  state.workspace!.parentSibling = {
    ...state.workspace!.parentSibling!,
    isLinked: false,
    status: 'SelectParent',
    requiresSelection: true,
    linkedRelationship: null,
    candidates: [
      parent,
      { ...parent, relationship: 'mother', email: 'mother@example.com', userId: 'parent-2' },
    ],
  };
  renderPanel();
  await waitFor(() => expect(screen.getByLabelText('Account type')).toHaveValue('guardian'));
  expect(screen.getByLabelText('Parent')).toHaveValue('');
  expect(screen.queryByRole('button', { name: 'Link parent' })).not.toBeInTheDocument();
  await waitFor(() =>
    expect(state.parent).toHaveBeenLastCalledWith(
      expect.objectContaining({ blockedReason: expect.stringMatching(/Choose Father or Mother/) })
    )
  );
  fireEvent.change(screen.getByLabelText('Parent'), { target: { value: 'mother' } });
  await waitFor(() =>
    expect(state.parent).toHaveBeenLastCalledWith(
      expect.objectContaining({
        selection: {
          relationship: 'mother',
          expectedEmail: 'mother@example.com',
          expectedUserId: 'parent-2',
        },
      })
    )
  );
  expect(state.send).not.toHaveBeenCalled();
});
it('shows inline parent validation after an activation attempt and keeps the selector inside its form', async () => {
  state.workspace!.parentSibling = {
    ...state.workspace!.parentSibling!,
    isLinked: false,
    status: 'SelectParent',
    linkedRelationship: null,
    requiresSelection: true,
    candidates: [
      parent,
      { ...parent, relationship: 'mother', email: 'mother@example.com', userId: 'parent-2' },
    ],
  };
  render(
    <StudentOnboardingPortalAccounts student={student} canManage parentValidationAttempt={1} />
  );
  await screen.findByText('Choose Father or Mother before activating.');
  expect(screen.getByLabelText('Parent').closest('form')).toHaveAttribute(
    'aria-label',
    'Send credentials'
  );
});
it('shows a pending original account setup honestly before activation', async () => {
  state.workspace!.parentSibling = {
    ...state.workspace!.parentSibling!,
    isLinked: false,
    linkedRelationship: null,
    status: 'Available',
    candidates: [{ ...parent, setupStatus: 'Pending' }],
  };
  renderPanel();
  await screen.findByText('Original parent account setup is pending.');
  expect(screen.queryByText('Linked', { exact: true })).not.toBeInTheDocument();
  expect(state.send).not.toHaveBeenCalled();
});
it.each([
  { status: 'NotRequired' as const, canLink: true },
  { status: 'Available' as const, canLink: false },
])(
  'displays the sole saved parent and original setup status without granting linking for $status / $canLink',
  async ({ status, canLink }) => {
    state.workspace!.parentSibling = {
      ...state.workspace!.parentSibling!,
      isLinked: false,
      linkedRelationship: null,
      status,
      canLink,
      candidates: [{ ...parent, setupStatus: 'Pending' }],
    };
    renderPanel();
    await waitFor(() => expect(screen.getByLabelText(/Email/)).toHaveValue(parent.email));
    await screen.findByText('Original parent account setup is pending.');
    expect(state.parent.mock.lastCall?.[0].selection).toBeUndefined();
    expect(screen.queryByRole('button', { name: 'Send Credentials' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Link parent' })).not.toBeInTheDocument();
    expect(state.send).not.toHaveBeenCalled();
    expect(state.link).not.toHaveBeenCalled();
  }
);

it('does not guess a displayed parent or setup status when both candidates are present but linking is denied', async () => {
  state.workspace!.recipients.push({
    ...state.workspace!.recipients[0],
    relationship: 'mother',
    email: 'mother@example.com',
  });
  state.workspace!.parentSibling = {
    ...state.workspace!.parentSibling!,
    isLinked: false,
    linkedRelationship: null,
    status: 'SelectParent',
    canLink: false,
    candidates: [
      { ...parent, setupStatus: 'Pending' },
      {
        ...parent,
        relationship: 'mother',
        email: 'mother@example.com',
        userId: 'parent-2',
        setupStatus: 'Failed',
      },
    ],
  };
  renderPanel();
  await waitFor(() => expect(screen.getByLabelText('Parent')).toHaveValue(''));
  expect(screen.getByLabelText(/Email/)).toHaveValue('');
  expect(screen.queryByText('Original parent account setup is pending.')).not.toBeInTheDocument();
  expect(
    screen.queryByText('Original parent setup failed. Ask authorized staff to review it.')
  ).not.toBeInTheDocument();
  expect(state.parent.mock.lastCall?.[0].selection).toBeUndefined();
});
it('shows the permission reason instead of asking for an unavailable parent choice', async () => {
  state.workspace!.parentSibling = {
    ...state.workspace!.parentSibling!,
    isLinked: false,
    linkedRelationship: null,
    status: 'SelectParent',
    requiresSelection: true,
    canLink: false,
    blockedReason: 'Identity update permission is required.',
    candidates: [
      parent,
      { ...parent, relationship: 'mother', email: 'mother@example.com', userId: 'parent-2' },
    ],
  };
  render(
    <StudentOnboardingPortalAccounts student={student} canManage parentValidationAttempt={1} />
  );
  await waitFor(() => expect(screen.getByLabelText('Parent')).toBeDisabled());
  expect(screen.getByText('Identity update permission is required.')).toBeInTheDocument();
  expect(screen.queryByText('Choose Father or Mother before activating.')).not.toBeInTheDocument();
});
it('restores and locks the saved reviewed parent after access preparation needs recovery', async () => {
  state.workspace!.parentSibling = {
    ...state.workspace!.parentSibling!,
    isLinked: false,
    linkedRelationship: null,
    status: 'Available',
    selectedRelationship: 'mother',
    candidates: [
      parent,
      { ...parent, relationship: 'mother', email: 'mother@example.com', userId: 'parent-2' },
    ],
  };
  renderPanel();
  await waitFor(() => expect(screen.getByLabelText('Parent')).toHaveValue('mother'));
  expect(screen.getByLabelText('Parent')).toBeDisabled();
  await waitFor(() =>
    expect(state.parent).toHaveBeenLastCalledWith(
      expect.objectContaining({ selection: expect.objectContaining({ relationship: 'mother' }) })
    )
  );
});

it('gives an authorized-review next step when original setup cannot be retried', async () => {
  state.workspace!.parentSibling = {
    ...state.workspace!.parentSibling!,
    status: 'SetupFailed',
    canRetrySetup: false,
  };
  renderPanel();
  await screen.findByText('Original parent setup failed. Ask authorized staff to review it.');
  expect(screen.queryByRole('button', { name: 'Retry parent setup' })).not.toBeInTheDocument();
  expect(state.send).not.toHaveBeenCalled();
});
it('retries only the original parent setup with the current concurrency stamp', async () => {
  state.workspace!.parentSibling = {
    ...state.workspace!.parentSibling!,
    status: 'SetupFailed',
    canRetrySetup: true,
  };
  renderPanel();
  await screen.findByText('Original parent account setup failed.');
  fireEvent.click(screen.getByRole('button', { name: 'Retry parent setup' }));
  await waitFor(() =>
    expect(state.retry).toHaveBeenCalledWith({ id: 'case-1', concurrencyStamp: 'stamp-1' })
  );
  expect(state.send).not.toHaveBeenCalled();
});

it('does not emit activation-ready state from a previous case or during refresh', async () => {
  state.fetching = true;
  renderPanel();
  await waitFor(() =>
    expect(state.parent).toHaveBeenLastCalledWith({ caseId: 'case-1', loaded: false })
  );
});

it.each([3, 4])(
  'links a late available parent for an enrolled status %s without sending credentials',
  async (backendStatus) => {
    state.workspace!.parentSibling = {
      ...state.workspace!.parentSibling!,
      isLinked: false,
      linkedRelationship: null,
      status: 'Available',
    };
    renderPanel({ student: { ...student, backendStatus, studentEnrollmentId: 'enrollment-1' } });
    const link = await screen.findByRole('button', { name: 'Link parent' });
    fireEvent.click(link);
    await waitFor(() =>
      expect(state.link).toHaveBeenCalledWith({
        id: 'case-1',
        concurrencyStamp: 'stamp-1',
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

it('requires and focuses an explicit late parent choice before linking an enrolled child', async () => {
  state.workspace!.parentSibling = {
    ...state.workspace!.parentSibling!,
    isLinked: false,
    linkedRelationship: null,
    status: 'SelectParent',
    requiresSelection: true,
    candidates: [
      parent,
      { ...parent, relationship: 'mother', email: 'mother@example.com', userId: 'parent-2' },
    ],
  };
  renderPanel({ student: { ...student, studentEnrollmentId: 'enrollment-1' } });
  fireEvent.click(await screen.findByRole('button', { name: 'Link parent' }));
  await screen.findByText('Choose Father or Mother before linking.');
  expect(screen.getByLabelText('Parent')).toHaveFocus();
  expect(state.link).not.toHaveBeenCalled();
  fireEvent.change(screen.getByLabelText('Parent'), { target: { value: 'mother' } });
  fireEvent.click(screen.getByRole('button', { name: 'Link parent' }));
  await waitFor(() =>
    expect(state.link).toHaveBeenCalledWith(
      expect.objectContaining({
        siblingParentSelection: {
          relationship: 'mother',
          expectedEmail: 'mother@example.com',
          expectedUserId: 'parent-2',
        },
      })
    )
  );
  expect(state.send).not.toHaveBeenCalled();
});

it('does not offer late linking without parent-link permission', async () => {
  state.workspace!.parentSibling = {
    ...state.workspace!.parentSibling!,
    isLinked: false,
    linkedRelationship: null,
    status: 'Available',
    canLink: false,
    blockedReason: 'Ask authorized staff to link this parent.',
  };
  renderPanel({ student: { ...student, studentEnrollmentId: 'enrollment-1' } });
  await screen.findByText('Ask authorized staff to link this parent.');
  expect(screen.queryByRole('button', { name: 'Link parent' })).not.toBeInTheDocument();
  expect(state.link).not.toHaveBeenCalled();
});

it.each(['NotRequired', 'cancelled'])(
  'does not offer late parent linking for %s cases',
  async (condition) => {
    state.workspace!.parentSibling = {
      ...state.workspace!.parentSibling!,
      isLinked: false,
      linkedRelationship: null,
      status: condition === 'NotRequired' ? 'NotRequired' : 'Available',
    };
    renderPanel({
      student: {
        ...student,
        backendStatus: condition === 'cancelled' ? 5 : 4,
        studentEnrollmentId: 'enrollment-1',
      },
    });
    await screen.findByLabelText('Account type');
    expect(screen.queryByRole('button', { name: 'Link parent' })).not.toBeInTheDocument();
    expect(state.link).not.toHaveBeenCalled();
  }
);

it('keeps parent selection after a late-link failure and permits a safe retry', async () => {
  state.workspace!.parentSibling = {
    ...state.workspace!.parentSibling!,
    isLinked: false,
    linkedRelationship: null,
    status: 'Available',
  };
  state.link.mockImplementationOnce(() => ({
    unwrap: async () => {
      throw new Error('Connection lost');
    },
  }));
  renderPanel({ student: { ...student, studentEnrollmentId: 'enrollment-1' } });
  fireEvent.click(await screen.findByRole('button', { name: 'Link parent' }));
  await waitFor(() => expect(state.error).toHaveBeenCalled());
  expect(screen.getByLabelText(/Email/)).toHaveValue(parent.email);
  fireEvent.click(screen.getByRole('button', { name: 'Link parent' }));
  await waitFor(() => expect(state.link).toHaveBeenCalledTimes(2));
  expect(state.send).not.toHaveBeenCalled();
});

it('locks parent linking and reports busy while the request is pending', async () => {
  state.workspace!.parentSibling = {
    ...state.workspace!.parentSibling!,
    isLinked: false,
    linkedRelationship: null,
    status: 'Available',
  };
  state.linking = true;
  const onBusyChange = vi.fn();
  renderPanel({ student: { ...student, studentEnrollmentId: 'enrollment-1' }, onBusyChange });
  expect(await screen.findByRole('button', { name: 'Link parent' })).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Refresh' })).toBeDisabled();
  await waitFor(() => expect(onBusyChange).toHaveBeenCalledWith(true));
});
