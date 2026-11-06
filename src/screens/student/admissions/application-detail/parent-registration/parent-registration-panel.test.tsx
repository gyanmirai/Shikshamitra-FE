import { useState } from 'react';
import { it, vi, expect, afterEach, beforeEach } from 'vitest';
import { act, render, screen, waitFor, fireEvent } from '@testing-library/react';

import { ParentRegistrationPanel } from './parent-registration-panel';

const state = vi.hoisted(() => ({
  send: vi.fn(),
  corrections: vi.fn(),
  apply: vi.fn(),
  revoke: vi.fn(),
  changeEmail: vi.fn(),
  retryDelivery: vi.fn(),
  loadHistory: vi.fn(),
  history: [] as any[] | undefined,
  historyLoading: false,
  historyFetching: false,
  historyError: false,
  historyOptions: { skip: true },
  contextRead: vi.fn(),
  toastError: vi.fn(),
  push: vi.fn(),
  context: {
    applicationId: 'app',
    concurrencyStamp: 'initial',
    recipients: [
      {
        relationship: 'mother',
        relationshipLabel: 'Mother',
        fullName: 'Saved Mother',
        email: 'saved@example.test',
        isMainContact: true,
        canSend: true,
      },
    ],
    request: null,
    canSend: true,
    canRequestCorrections: true,
    canRequestDocumentCorrections: true,
    canRevoke: false,
    canTakeover: false,
    canApply: false,
    canRetryDelivery: false,
    blockedReason: null,
    availableFields: [
      { code: 'NAME', label: 'Student name', allowedRecipientRelationships: ['mother'] },
    ],
    availableDocuments: [],
  } as any,
  failed: false,
}));
vi.mock('src/components/iconify', () => ({ Iconify: () => <span /> }));
vi.mock('src/components/three-dots-actions', () => ({
  default: function MockThreeDotsActions({ actions, moreLabel }: any) {
    const [open, setOpen] = useState(false);
    return (
      <>
        <button type="button" onClick={() => setOpen(true)}>
          {moreLabel}
        </button>
        {open && actions({ popover: { onClose: () => setOpen(false) } })}
      </>
    );
  },
}));
vi.mock('src/components/toast', () => ({
  shikshaMitraToast: { error: state.toastError, success: vi.fn() },
}));
vi.mock('src/components/custom-select', () => ({
  default: ({ label, options, value, onChange, multiple, disabled, helperText }: any) => (
    <label htmlFor={label}>
      {label}
      <select
        id={label}
        aria-label={label}
        multiple={multiple}
        value={value}
        disabled={disabled}
        onChange={(event) =>
          onChange(
            multiple
              ? Array.from(event.target.selectedOptions).map((option) => option.value)
              : event.target.value
          )
        }
      >
        {options.map((option: any) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {helperText && <span>{helperText}</span>}
    </label>
  ),
}));
vi.mock('src/components/customDialog', () => ({
  default: ({ open, title, children, formProps }: any) =>
    open ? (
      <form role="dialog" noValidate onSubmit={formProps?.onSubmit}>
        {title}
        {children}
      </form>
    ) : null,
  DialogScrollContent: ({ children }: any) => <div>{children}</div>,
}));
vi.mock('src/routes/hooks', () => ({
  useRouter: () => ({ push: state.push }),
}));
vi.mock('src/redux/student/admissions/admission-parent-registration-api', () => ({
  useGetParentRegistrationQuery: (...args: unknown[]) => {
    state.contextRead(...args);
    return {
      currentData: state.context,
      isError: state.failed,
      refetch: vi.fn(),
    };
  },
  useSendParentRegistrationMutation: () => [state.send, {}],
  useChangeParentRegistrationEmailMutation: () => [state.changeEmail, {}],
  useRevokeParentRegistrationMutation: () => [state.revoke, {}],
  useTakeoverParentRegistrationMutation: () => [vi.fn(), {}],
  useRequestParentRegistrationCorrectionsMutation: () => [state.corrections, {}],
  useApplyParentRegistrationMutation: () => [state.apply, {}],
  useRetryParentRegistrationDeliveryMutation: () => [state.retryDelivery, {}],
  useGetParentRegistrationEmailHistoryQuery: (_applicationId: string, options: any) => {
    state.historyOptions = options;
    return {
      currentData: state.historyError ? undefined : state.history,
      isLoading: state.historyLoading,
      isFetching: state.historyFetching,
      isError: state.historyError,
      refetch: state.loadHistory,
    };
  },
}));
const savedContact = { ...state.context.recipients[0] };

beforeEach(() => {
  vi.clearAllMocks();
  state.failed = false;
  state.history = [];
  state.historyLoading = false;
  state.historyFetching = false;
  state.historyError = false;
  state.historyOptions = { skip: true };
  state.context = {
    ...state.context,
    concurrencyStamp: 'initial',
    recipients: [{ ...savedContact }],
    request: null,
    canSend: true,
    canApply: false,
    canRevoke: false,
    canTakeover: false,
    canRetryDelivery: false,
    emailDeliveryBlockedReason: null,
  };
});
afterEach(() => vi.unstubAllGlobals());

function installInvitation(deliveryStatus = 'Sent') {
  const contact = { ...savedContact, canChangeEmail: true };
  state.context = {
    ...state.context,
    recipients: [contact],
    blockedReason: null,
    request: {
      id: 'request',
      status: 'Invited',
      recipient: contact,
      expiresAt: '2026-11-11T12:00:00Z',
      deliveryStatus,
      deliveryError: null,
    },
  };
}

it('groups the invited contact once and keeps provider acceptance in optional help', () => {
  installInvitation();
  render(<ParentRegistrationPanel applicationId="app" canView canManage currentValues={{}} />);
  expect(screen.getByRole('button', { name: 'Send email' })).toBeEnabled();
  expect(screen.getByRole('button', { name: 'Email history' })).toBeVisible();
  expect(screen.queryByText('Parent Registration')).not.toBeInTheDocument();
  expect(screen.queryByText('saved@example.test')).not.toBeInTheDocument();
});

it('uses one existing context reader and one toolbar when placed in the applicant header', () => {
  installInvitation();
  const inline = render(
    <ParentRegistrationPanel applicationId="app" canView canManage currentValues={{}} />
  );
  const reads = state.contextRead.mock.calls.length;
  expect(reads).toBeGreaterThan(0);
  inline.unmount();
  state.contextRead.mockClear();
  render(
    <ParentRegistrationPanel
      placement="header"
      applicationId="app"
      canView
      canManage
      currentValues={{}}
    />
  );
  expect(state.contextRead).toHaveBeenCalledTimes(reads);
  expect(screen.getAllByRole('button', { name: 'Send email' })).toHaveLength(1);
  expect(screen.getAllByRole('button', { name: 'Email history' })).toHaveLength(1);
  expect(state.historyOptions.skip).toBe(true);
});

it.each(['view', 'manage', 'disabled', 'dirty'] as const)(
  'keeps the header toolbar within its existing %s boundary',
  (blocker) => {
    installInvitation();
    render(
      <ParentRegistrationPanel
        placement="header"
        applicationId="app"
        canView={blocker !== 'view'}
        canManage={blocker !== 'manage'}
        disabled={blocker === 'disabled'}
        dirty={blocker === 'dirty'}
        currentValues={{}}
      />
    );
    if (blocker === 'view' || blocker === 'manage') {
      expect(screen.queryByRole('button', { name: 'Send email' })).not.toBeInTheDocument();
    } else {
      expect(screen.getByRole('button', { name: 'Send email' })).toBeDisabled();
      fireEvent.click(screen.getByRole('button', { name: 'Send email' }));
    }
    if (blocker === 'view')
      expect(screen.queryByRole('button', { name: 'Email history' })).not.toBeInTheDocument();
    else expect(screen.getByRole('button', { name: 'Email history' })).toBeVisible();
    expect(state.send).not.toHaveBeenCalled();
    expect(state.changeEmail).not.toHaveBeenCalled();
  }
);

it.each(['inline', 'header'] as const)(
  'shows a send action without a registration card and opens recorded email history in a drawer (%s)',
  async (placement) => {
    installInvitation();
    state.history = [
      {
        registrationId: 'request',
        purpose: 'initial',
        linkStatus: 'Invited',
        recipientName: 'Saved Mother',
        recipientRelationship: 'mother',
        recipientRelationshipLabel: 'Mother',
        recipientEmail: 'saved@example.test',
        expiresAt: '2026-11-11T12:00:00Z',
        attempts: [
          {
            status: 'Sent',
            attemptNumber: 1,
            attemptedAt: '2026-11-04T12:00:00Z',
            destination: 'saved@example.test',
            safeMessage: null,
          },
        ],
      },
    ];
    render(
      <ParentRegistrationPanel
        placement={placement}
        applicationId="app"
        canView
        canManage
        currentValues={{}}
      />
    );

    expect(screen.queryByText('Parent Registration')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Send email' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Email history' })).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: 'Email history' }));
    expect(await screen.findByRole('dialog', { name: 'Email History' })).toBeVisible();
    expect(screen.getByText('saved@example.test')).toBeVisible();
    expect(
      screen.getByText('Accepted by the email sender. Inbox delivery is not confirmed.')
    ).toBeVisible();
    expect(state.historyOptions.skip).toBe(false);
  }
);

it('shows an accurate empty state when history has no recorded link attempts', () => {
  installInvitation('Pending');
  render(<ParentRegistrationPanel applicationId="app" canView canManage currentValues={{}} />);
  fireEvent.click(screen.getByRole('button', { name: 'Email history' }));
  expect(screen.getByText('No email history yet')).toBeVisible();
});

it('shows loading instead of empty history while reopening fetch has no current data', () => {
  installInvitation();
  state.history = undefined;
  state.historyFetching = true;
  const view = () => (
    <ParentRegistrationPanel
      placement="header"
      applicationId="app"
      canView
      canManage
      currentValues={{}}
    />
  );
  const { rerender } = render(view());
  fireEvent.click(screen.getByRole('button', { name: 'Email history' }));
  expect(screen.getByLabelText('Loading email history')).toBeVisible();
  expect(screen.queryByText('No email history yet')).not.toBeInTheDocument();

  state.historyFetching = false;
  state.history = [];
  rerender(view());
  expect(screen.queryByLabelText('Loading email history')).not.toBeInTheDocument();
  expect(screen.getByText('No email history yet')).toBeVisible();
});

it('keeps the history drawer recoverable when its read request fails', () => {
  installInvitation();
  state.historyError = true;
  render(<ParentRegistrationPanel applicationId="app" canView canManage currentValues={{}} />);
  fireEvent.click(screen.getByRole('button', { name: 'Email history' }));
  expect(screen.getByText('Email history could not be loaded.')).toBeVisible();
  fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
  expect(state.loadHistory).toHaveBeenCalledOnce();
});

it.each(['inline', 'header'] as const)(
  'keeps one update action and lets staff choose the saved adult inside the dialog (%s)',
  (placement) => {
    installInvitation();
    state.context.recipients.push({
      ...state.context.recipients[0],
      relationship: 'father',
      relationshipLabel: 'Father',
      fullName: 'Saved Father',
      email: 'father@example.test',
    });
    render(
      <ParentRegistrationPanel
        placement={placement}
        applicationId="app"
        canView
        canManage
        currentValues={{}}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: 'More parent registration actions' }));
    expect(screen.getByRole('menuitem', { name: 'Update link' })).toBeVisible();
    expect(screen.queryByText('saved@example.test')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('menuitem', { name: 'Update link' }));
    fireEvent.change(screen.getByRole('combobox', { name: 'Parent contact' }), {
      target: { value: 'father' },
    });
    expect(screen.getByRole('textbox', { name: 'Email' })).toHaveValue('father@example.test');
  }
);

it('keeps failed delivery guidance visible and preserves the single retry action', () => {
  installInvitation('Failed');
  state.context.canRetryDelivery = true;
  state.context.request.deliveryError = 'The email sender rejected this invitation.';
  render(<ParentRegistrationPanel applicationId="app" canView canManage currentValues={{}} />);
  expect(screen.getByText('The email sender rejected this invitation.')).toBeVisible();
  expect(screen.getByRole('button', { name: 'Send email' })).toBeEnabled();
  expect(
    screen.queryByRole('button', { name: 'Resend registration link' })
  ).not.toBeInTheDocument();
});

it.each(['inline', 'header'] as const)(
  'preserves the historical invitation recipient when the saved contact has changed (%s)',
  (placement) => {
    installInvitation();
    state.context.recipients = [
      { ...state.context.recipients[0], fullName: 'Current Mother', email: 'current@example.test' },
    ];
    render(
      <ParentRegistrationPanel
        placement={placement}
        applicationId="app"
        canView
        canManage={false}
        currentValues={{}}
      />
    );
    expect(screen.getByRole('button', { name: 'Email history' })).toBeVisible();
    expect(screen.queryByRole('button', { name: 'Change email' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Send email' })).not.toBeInTheDocument();
  }
);

it('explains the missing parent contact without inventing a send capability', () => {
  state.context.recipients = [];
  state.context.canSend = false;
  render(<ParentRegistrationPanel applicationId="app" canView canManage currentValues={{}} />);
  expect(screen.getByText(/Save a parent contact with an email address/)).toBeVisible();
  expect(screen.queryByRole('button', { name: 'Send email' })).not.toBeInTheDocument();
});

it.each(['email', 'documents'] as const)('guards browser Back while editing parent %s', (mode) => {
  state.context.recipients = [{ ...state.context.recipients[0], canChangeEmail: true }];
  state.context.availableDocuments = [
    { stageInstanceId: 'docs', code: 'BIRTH', name: 'Birth certificate' },
  ];
  const navigation = new EventTarget() as EventTarget & { traverseTo: ReturnType<typeof vi.fn> };
  navigation.traverseTo = vi.fn().mockReturnValue({ finished: Promise.resolve() });
  vi.stubGlobal('navigation', navigation);
  render(
    <ParentRegistrationPanel
      applicationId="app"
      canView
      canManage
      currentValues={{}}
      documentStageId={mode === 'documents' ? 'docs' : undefined}
    />
  );
  fireEvent.click(
    screen.getByRole('button', {
      name: mode === 'email' ? 'More parent registration actions' : 'Request parent documents',
    })
  );
  if (mode === 'email') fireEvent.click(screen.getByRole('menuitem', { name: 'Update link' }));
  const input = screen.getByRole('textbox', {
    name: mode === 'email' ? 'Email' : /Instructions for the parent/,
  });
  const entered = mode === 'email' ? 'unsaved@example.test' : 'Please upload a clearer copy.';
  fireEvent.change(input, { target: { value: entered } });
  const back = () => {
    const event = new Event('navigate', { cancelable: true });
    Object.assign(event, {
      navigationType: 'traverse',
      destination: { key: 'previous-entry', url: `${window.location.origin}/previous` },
    });
    act(() => {
      navigation.dispatchEvent(event);
    });
    return event;
  };
  expect(back().defaultPrevented).toBe(true);
  fireEvent.click(screen.getByRole('button', { name: 'Keep editing' }));
  expect(input).toHaveValue(entered);
  expect(navigation.traverseTo).not.toHaveBeenCalled();
  expect(back().defaultPrevented).toBe(true);
  fireEvent.click(screen.getByRole('button', { name: 'Discard changes' }));
  expect(navigation.traverseTo).toHaveBeenCalledExactlyOnceWith('previous-entry');
  expect(state.changeEmail).not.toHaveBeenCalled();
  expect(state.corrections).not.toHaveBeenCalled();
});
it('keeps email setup failure visible and blocks sending or retry without locking staff contact edits', () => {
  state.context.emailDeliveryBlockedReason = 'Enable an Email provider in Communication settings.';
  state.context.canRetryDelivery = true;
  state.context.recipients = [{ ...state.context.recipients[0], canChangeEmail: true }];
  render(<ParentRegistrationPanel applicationId="app" canView canManage currentValues={{}} />);
  expect(screen.getByText('Enable an Email provider in Communication settings.')).toBeVisible();
  expect(screen.getByRole('button', { name: 'Send email' })).toBeDisabled();
  fireEvent.click(screen.getByRole('button', { name: 'More parent registration actions' }));
  expect(screen.getByRole('menuitem', { name: 'Update link' })).toBeEnabled();
});
it('prioritizes retry and keeps resend and access maintenance in the shared overflow menu', () => {
  state.context.canRetryDelivery = true;
  state.context.canRevoke = true;
  state.context.canTakeover = true;
  render(<ParentRegistrationPanel applicationId="app" canView canManage currentValues={{}} />);
  expect(screen.getByRole('button', { name: 'Send email' })).toBeEnabled();
  expect(
    screen.queryByRole('button', { name: 'Resend registration link' })
  ).not.toBeInTheDocument();
  expect(screen.queryByRole('menuitem', { name: 'Revoke link' })).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'More parent registration actions' }));
  expect(screen.getByRole('menuitem', { name: 'Send a new link' })).toBeVisible();
  expect(screen.getByRole('menuitem', { name: 'Revoke link' })).toBeVisible();
  expect(screen.getByRole('menuitem', { name: 'Take over' })).toBeVisible();
});
it.each(['inline', 'header'] as const)(
  'sends only the saved recipient and retains the command key on uncertain retry (%s)',
  async (placement) => {
    state.failed = false;
    state.send.mockReturnValue({
      unwrap: async () => {
        throw Object.assign(new Error('Network unavailable'), { status: 'FETCH_ERROR' });
      },
    });
    render(
      <ParentRegistrationPanel
        placement={placement}
        applicationId="app"
        canView
        canManage
        currentValues={{}}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Send email' }));
    expect(screen.getByRole('textbox', { name: 'Email' })).toHaveValue('saved@example.test');
    expect(screen.getByRole('textbox', { name: 'Email' })).toHaveAttribute('readonly');
    fireEvent.click(screen.getByRole('button', { name: 'Send link' }));
    await waitFor(() => expect(state.send).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(state.toastError).toHaveBeenCalled());
    fireEvent.click(screen.getByRole('button', { name: 'Send link' }));
    await waitFor(() => expect(state.send).toHaveBeenCalledTimes(2));
    expect(state.send.mock.calls[1][0]).toEqual(state.send.mock.calls[0][0]);
    expect(state.send.mock.calls[0][0].input).toMatchObject({
      recipientRelationship: 'mother',
      concurrencyStamp: 'initial',
    });
    expect(state.send.mock.calls[0][0].input).not.toHaveProperty('email');
  }
);
it('keeps an optional status failure scoped to parent controls', () => {
  state.failed = true;
  render(<ParentRegistrationPanel applicationId="app" canView canManage currentValues={{}} />);
  expect(state.toastError).toHaveBeenCalled();
  expect(screen.queryByText(/Parent registration status is unavailable/)).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Retry status' })).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Send email' })).not.toBeInTheDocument();
});
it('shows the saved parent email without offering answer-correction requests in Registration', () => {
  render(<ParentRegistrationPanel applicationId="app" canView canManage currentValues={{}} />);
  expect(screen.getByRole('button', { name: 'Send email' })).toBeVisible();
  expect(screen.queryByText('saved@example.test')).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Request corrections' })).not.toBeInTheDocument();
  expect(screen.queryByText('Documents to replace')).not.toBeInTheDocument();
});
it('saves an authorized parent email explicitly without sending an invitation', async () => {
  state.context.recipients = [{ ...state.context.recipients[0], canChangeEmail: true }];
  state.changeEmail.mockReturnValue({ unwrap: async () => state.context });
  render(<ParentRegistrationPanel applicationId="app" canView canManage currentValues={{}} />);
  fireEvent.click(screen.getByRole('button', { name: 'More parent registration actions' }));
  fireEvent.click(screen.getByRole('menuitem', { name: 'Update link' }));
  fireEvent.change(screen.getByRole('textbox', { name: 'Email' }), {
    target: { value: 'changed@example.test' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
  await waitFor(() => expect(state.changeEmail).toHaveBeenCalledOnce());
  expect(state.changeEmail.mock.calls[0][0].input).toMatchObject({
    email: 'changed@example.test',
    expectedEmail: 'saved@example.test',
    recipientRelationship: 'mother',
    concurrencyStamp: 'initial',
  });
  expect(state.send).not.toHaveBeenCalled();
});
it('ignores unchanged email in the submit control and native form submission', async () => {
  state.context.recipients = [{ ...state.context.recipients[0], canChangeEmail: true }];
  state.changeEmail.mockReturnValue({ unwrap: async () => state.context });
  render(<ParentRegistrationPanel applicationId="app" canView canManage currentValues={{}} />);
  fireEvent.click(screen.getByRole('button', { name: 'More parent registration actions' }));
  fireEvent.click(screen.getByRole('menuitem', { name: 'Update link' }));
  const email = screen.getByRole('textbox', { name: 'Email' });
  const submit = screen.getByRole('button', { name: 'Submit' });
  expect(submit).toBeDisabled();
  fireEvent.change(email, { target: { value: '  SAVED@EXAMPLE.TEST  ' } });
  expect(submit).toBeDisabled();
  await act(async () => {
    fireEvent.submit(email.closest('form')!);
  });
  expect(state.changeEmail).not.toHaveBeenCalled();
  expect(state.send).not.toHaveBeenCalled();
  fireEvent.change(email, { target: { value: 'actually-new@example.test' } });
  expect(submit).toBeEnabled();
});

it.each(['inline', 'header'] as const)(
  'honors email capability and saved-form prerequisite (%s)',
  (placement) => {
    state.context.recipients = [{ ...state.context.recipients[0], canChangeEmail: false }];
    const { rerender } = render(
      <ParentRegistrationPanel
        placement={placement}
        applicationId="app"
        canView
        canManage
        currentValues={{}}
      />
    );
    expect(
      screen.queryByRole('button', { name: 'More parent registration actions' })
    ).not.toBeInTheDocument();
    state.context.recipients = [{ ...state.context.recipients[0], canChangeEmail: true }];
    rerender(
      <ParentRegistrationPanel
        placement={placement}
        applicationId="app"
        canView
        canManage
        dirty
        currentValues={{}}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: 'More parent registration actions' }));
    expect(screen.getByRole('menuitem', { name: 'Update link' })).toHaveAttribute(
      'aria-disabled',
      'true'
    );
  }
);

it('retains changed email and locks a conflicting save without sending', async () => {
  state.context.recipients = [{ ...state.context.recipients[0], canChangeEmail: true }];
  state.changeEmail.mockReturnValue({
    unwrap: async () => {
      throw Object.assign(new Error('The application changed.'), { status: 409 });
    },
  });
  render(<ParentRegistrationPanel applicationId="app" canView canManage currentValues={{}} />);
  fireEvent.click(screen.getByRole('button', { name: 'More parent registration actions' }));
  fireEvent.click(screen.getByRole('menuitem', { name: 'Update link' }));
  fireEvent.change(screen.getByRole('textbox', { name: 'Email' }), {
    target: { value: 'kept@example.test' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('The application changed.');
  expect(screen.getByRole('textbox', { name: 'Email' })).toHaveValue('kept@example.test');
  expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled();
  expect(state.send).not.toHaveBeenCalled();
});
it('requests only documents from the selected document stage', async () => {
  state.context.availableDocuments = [
    { stageInstanceId: 'docs', code: 'BIRTH', name: 'Birth certificate' },
    { stageInstanceId: 'other', code: 'ADDRESS', name: 'Address proof' },
  ];
  state.corrections.mockReturnValue({ unwrap: async () => state.context });
  render(
    <ParentRegistrationPanel
      applicationId="app"
      canView
      canManage
      currentValues={{}}
      documentStageId="docs"
    />
  );
  fireEvent.click(screen.getByRole('button', { name: 'Request parent documents' }));
  const submit = screen.getByRole('button', { name: 'Submit' });
  fireEvent.click(submit);
  await screen.findByText('Give a reason for these corrections.');
  expect(state.corrections).not.toHaveBeenCalled();
  expect(screen.queryByLabelText('Answers to correct')).not.toBeInTheDocument();
  expect(screen.queryByRole('option', { name: 'Address proof' })).not.toBeInTheDocument();
  const choice = screen.getByRole('listbox', { name: 'Documents to replace' }) as HTMLSelectElement;
  choice.options[0].selected = true;
  fireEvent.change(choice);
  fireEvent.change(screen.getByRole('textbox', { name: /Instructions for the parent/ }), {
    target: { value: 'Please correct the spelling.' },
  });
  fireEvent.click(submit);
  await waitFor(() => expect(state.corrections).toHaveBeenCalledOnce());
  expect(state.corrections.mock.calls[0][0].input).toMatchObject({
    recipientRelationship: 'mother',
    fieldCodes: [],
    documents: [{ stageInstanceId: 'docs', requirementCode: 'BIRTH' }],
    notes: 'Please correct the spelling.',
    concurrencyStamp: 'initial',
  });
});
it('explains blocked delivery beside the Documents-stage request action', () => {
  state.context.emailDeliveryBlockedReason = 'The configured Email provider is disabled.';
  state.context.availableDocuments = [
    { stageInstanceId: 'docs', code: 'BIRTH', name: 'Birth certificate' },
  ];
  render(
    <ParentRegistrationPanel
      applicationId="app"
      canView
      canManage
      currentValues={{}}
      documentStageId="docs"
    />
  );
  expect(screen.getByRole('status')).toHaveTextContent(
    'The configured Email provider is disabled.'
  );
  expect(screen.getByRole('button', { name: 'Request parent documents' })).toBeDisabled();
});
it('compares a proposal with current saved answers and applies only through the staff command', async () => {
  state.context = {
    ...state.context,
    canApply: true,
    request: {
      id: 'r',
      purpose: 'correction',
      status: 'ReadyForReview',
      recipient: state.context.recipients[0],
      expiresAt: '2026-11-11T12:00:00Z',
      deliveryStatus: 'Sent',
      proposedValues: [{ fieldCode: 'NAME', valueJson: '"Proposed name"' }],
      fieldCodes: ['NAME'],
      documents: [],
    },
  };
  state.apply.mockReturnValue({ unwrap: async () => state.context });
  render(
    <ParentRegistrationPanel
      applicationId="app"
      canView
      canManage
      currentValues={{ NAME: 'Current name' }}
    />
  );
  fireEvent.click(screen.getByRole('button', { name: 'More parent registration actions' }));
  fireEvent.click(screen.getByRole('menuitem', { name: 'Review parent corrections' }));
  expect(screen.getByText('Current: Current name')).toBeVisible();
  expect(screen.getByText('Proposed: Proposed name')).toBeVisible();
  fireEvent.change(screen.getByRole('textbox', { name: /Correction reason/ }), {
    target: { value: 'Verified parent correction.' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Apply corrections' }));
  await waitFor(() => expect(state.apply).toHaveBeenCalledOnce());
  expect(state.apply.mock.calls[0][0].input).toMatchObject({
    concurrencyStamp: 'initial',
    reason: 'Verified parent correction.',
  });
  expect(state.send).not.toHaveBeenCalled();
});

it('refreshes staff answers only when newly saved parent progress is observed', () => {
  const onProgressChange = vi.fn();
  const { rerender } = render(
    <ParentRegistrationPanel
      applicationId="app"
      canView
      canManage
      currentValues={{}}
      onProgressChange={onProgressChange}
    />
  );
  expect(onProgressChange).not.toHaveBeenCalled();
  state.context = {
    ...state.context,
    request: {
      id: 'request',
      status: 'InProgress',
      recipient: state.context.recipients[0],
      deliveryStatus: 'Sent',
      expiresAt: '2026-11-11T12:00:00Z',
      lastSavedAt: '2026-11-04T12:00:00Z',
    },
  };
  rerender(
    <ParentRegistrationPanel
      applicationId="app"
      canView
      canManage
      currentValues={{}}
      onProgressChange={onProgressChange}
    />
  );
  expect(onProgressChange).toHaveBeenCalledOnce();
  rerender(
    <ParentRegistrationPanel
      applicationId="app"
      canView
      canManage
      currentValues={{}}
      onProgressChange={onProgressChange}
    />
  );
  expect(onProgressChange).toHaveBeenCalledOnce();
});
