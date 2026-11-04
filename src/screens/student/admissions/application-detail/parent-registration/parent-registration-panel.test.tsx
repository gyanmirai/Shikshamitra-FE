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
  useGetParentRegistrationQuery: () => ({
    currentData: state.context,
    isError: state.failed,
    refetch: vi.fn(),
  }),
  useSendParentRegistrationMutation: () => [state.send, {}],
  useChangeParentRegistrationEmailMutation: () => [state.changeEmail, {}],
  useRevokeParentRegistrationMutation: () => [state.revoke, {}],
  useTakeoverParentRegistrationMutation: () => [vi.fn(), {}],
  useRequestParentRegistrationCorrectionsMutation: () => [state.corrections, {}],
  useApplyParentRegistrationMutation: () => [state.apply, {}],
  useRetryParentRegistrationDeliveryMutation: () => [state.retryDelivery, {}],
}));
const savedContact = { ...state.context.recipients[0] };

beforeEach(() => {
  vi.clearAllMocks();
  state.failed = false;
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
  expect(screen.getByText('Awaiting parent')).toBeVisible();
  expect(screen.getAllByText(/Mother · Saved Mother/)).toHaveLength(1);
  expect(screen.getByText('Email sent')).toBeVisible();
  expect(screen.getByRole('button', { name: 'Email delivery information' })).toBeVisible();
  expect(
    screen.queryByText('Accepted by the email sender. Inbox delivery is not confirmed.')
  ).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Resend registration link' })).toBeEnabled();
});

it('keeps every saved adult editable and identifies the invitation recipient without duplicating it', () => {
  installInvitation();
  state.context.recipients.push({
    ...state.context.recipients[0],
    relationship: 'father',
    relationshipLabel: 'Father',
    fullName: 'Saved Father',
    email: 'father@example.test',
  });
  render(<ParentRegistrationPanel applicationId="app" canView canManage currentValues={{}} />);
  expect(screen.getByText('Link recipient')).toBeVisible();
  expect(screen.getByText('saved@example.test')).toBeVisible();
  expect(screen.getByText('father@example.test')).toBeVisible();
  expect(screen.getAllByRole('button', { name: 'Change email' })).toHaveLength(2);
  expect(screen.getAllByText(/Mother · Saved Mother/)).toHaveLength(1);
});

it('keeps failed delivery guidance visible and preserves the single retry action', () => {
  installInvitation('Failed');
  state.context.canRetryDelivery = true;
  state.context.request.deliveryError = 'The email sender rejected this invitation.';
  render(<ParentRegistrationPanel applicationId="app" canView canManage currentValues={{}} />);
  expect(screen.getByText('The email sender rejected this invitation.')).toBeVisible();
  expect(screen.getByRole('button', { name: 'Retry delivery' })).toBeEnabled();
  expect(
    screen.queryByRole('button', { name: 'Resend registration link' })
  ).not.toBeInTheDocument();
});

it('preserves the historical invitation recipient when the saved contact has changed', () => {
  installInvitation();
  state.context.recipients = [
    { ...state.context.recipients[0], fullName: 'Current Mother', email: 'current@example.test' },
  ];
  render(
    <ParentRegistrationPanel applicationId="app" canView canManage={false} currentValues={{}} />
  );
  expect(screen.getByText('current@example.test')).toBeVisible();
  expect(
    screen.getByText(/Link recipient: Mother · Saved Mother · saved@example.test/)
  ).toBeVisible();
  expect(screen.queryByRole('button', { name: 'Change email' })).not.toBeInTheDocument();
  expect(
    screen.queryByRole('button', { name: 'Resend registration link' })
  ).not.toBeInTheDocument();
});

it('explains the missing parent contact without inventing a send capability', () => {
  state.context.recipients = [];
  state.context.canSend = false;
  render(<ParentRegistrationPanel applicationId="app" canView canManage currentValues={{}} />);
  expect(screen.getByText(/No parent contact is available/)).toBeVisible();
  expect(screen.queryByRole('button', { name: 'Send registration link' })).not.toBeInTheDocument();
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
      name: mode === 'email' ? 'Change email' : 'Request parent documents',
    })
  );
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
  expect(screen.queryByRole('button', { name: 'Send registration link' })).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Retry delivery' })).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Change email' })).toBeEnabled();
});
it('prioritizes retry and keeps resend and access maintenance in the shared overflow menu', () => {
  state.context.canRetryDelivery = true;
  state.context.canRevoke = true;
  state.context.canTakeover = true;
  render(<ParentRegistrationPanel applicationId="app" canView canManage currentValues={{}} />);
  expect(screen.getByRole('button', { name: 'Retry delivery' })).toBeEnabled();
  expect(
    screen.queryByRole('button', { name: 'Resend registration link' })
  ).not.toBeInTheDocument();
  expect(screen.queryByRole('menuitem', { name: 'Revoke link' })).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'More parent registration actions' }));
  expect(screen.getByRole('menuitem', { name: 'Send a new link' })).toBeVisible();
  expect(screen.getByRole('menuitem', { name: 'Revoke link' })).toBeVisible();
  expect(screen.getByRole('menuitem', { name: 'Take over' })).toBeVisible();
});
it('sends only the saved recipient and retains the command key on uncertain retry', async () => {
  state.failed = false;
  state.send.mockReturnValue({
    unwrap: async () => {
      throw Object.assign(new Error('Network unavailable'), { status: 'FETCH_ERROR' });
    },
  });
  render(<ParentRegistrationPanel applicationId="app" canView canManage currentValues={{}} />);
  fireEvent.click(screen.getByRole('button', { name: 'Send registration link' }));
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
});
it('keeps an optional status failure scoped to parent controls', () => {
  state.failed = true;
  render(<ParentRegistrationPanel applicationId="app" canView canManage currentValues={{}} />);
  expect(state.toastError).toHaveBeenCalled();
  expect(screen.queryByText(/Parent registration status is unavailable/)).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Retry status' })).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Send registration link' })).not.toBeInTheDocument();
});
it('shows the saved parent email without offering answer-correction requests in Registration', () => {
  render(<ParentRegistrationPanel applicationId="app" canView canManage currentValues={{}} />);
  expect(screen.getByText('saved@example.test')).toBeVisible();
  expect(screen.queryByRole('button', { name: 'Request corrections' })).not.toBeInTheDocument();
  expect(screen.queryByText('Documents to replace')).not.toBeInTheDocument();
});
it('saves an authorized parent email explicitly without sending an invitation', async () => {
  state.context.recipients = [{ ...state.context.recipients[0], canChangeEmail: true }];
  state.changeEmail.mockReturnValue({ unwrap: async () => state.context });
  render(<ParentRegistrationPanel applicationId="app" canView canManage currentValues={{}} />);
  fireEvent.click(screen.getByRole('button', { name: 'Change email' }));
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
  fireEvent.click(screen.getByRole('button', { name: 'Change email' }));
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

it('honors email capability and saved-form prerequisite', () => {
  state.context.recipients = [{ ...state.context.recipients[0], canChangeEmail: false }];
  const { rerender } = render(
    <ParentRegistrationPanel applicationId="app" canView canManage currentValues={{}} />
  );
  expect(screen.queryByRole('button', { name: 'Change email' })).not.toBeInTheDocument();
  state.context.recipients = [{ ...state.context.recipients[0], canChangeEmail: true }];
  rerender(
    <ParentRegistrationPanel applicationId="app" canView canManage dirty currentValues={{}} />
  );
  expect(screen.getByRole('button', { name: 'Change email' })).toBeDisabled();
});

it('retains changed email and locks a conflicting save without sending', async () => {
  state.context.recipients = [{ ...state.context.recipients[0], canChangeEmail: true }];
  state.changeEmail.mockReturnValue({
    unwrap: async () => {
      throw Object.assign(new Error('The application changed.'), { status: 409 });
    },
  });
  render(<ParentRegistrationPanel applicationId="app" canView canManage currentValues={{}} />);
  fireEvent.click(screen.getByRole('button', { name: 'Change email' }));
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
  fireEvent.click(screen.getByRole('button', { name: 'Review parent corrections' }));
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
