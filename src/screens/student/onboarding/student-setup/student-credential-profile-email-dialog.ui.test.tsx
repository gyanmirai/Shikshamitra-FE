import type { StudentCredentialsRecipient } from 'src/redux/student/onboarding/student-onboarding-types';

import { vi, it, expect, beforeEach } from 'vitest';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

import StudentCredentialProfileEmailDialog from './student-credential-profile-email-dialog';

const state = vi.hoisted(() => ({
  save: vi.fn(),
  close: vi.fn(),
  success: vi.fn(),
  error: vi.fn(),
  busy: false,
}));
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock('react-redux', () => ({
  useDispatch: () => vi.fn(),
  useSelector: (select: any) => select({ confirmPopup: { isChanges: false } }),
}));
vi.mock('src/components/iconify', () => ({ Iconify: () => <span aria-hidden /> }));
vi.mock('src/components/toast', () => ({
  shikshaMitraToast: { success: state.success, error: state.error },
}));
vi.mock('src/redux/student/onboarding/student-onboarding-api', () => ({
  useUpdateStudentCredentialsEmailMutation: () => [state.save, { isLoading: state.busy }],
}));

const student: StudentCredentialsRecipient = {
  accountType: 'student',
  relationship: 'self',
  name: 'Jay',
  email: null,
  canSend: false,
  canEditEmail: true,
  emailEditToken: 'profile-token',
};
const renderDialog = (recipient = student) =>
  render(
    <ThemeProvider theme={createTheme()}>
      <StudentCredentialProfileEmailDialog
        caseId="case-1"
        caseLabel="Jay"
        concurrencyStamp="case-stamp"
        recipient={recipient}
        onClose={state.close}
      />
    </ThemeProvider>
  );
beforeEach(() => {
  vi.clearAllMocks();
  state.busy = false;
});

it('saves a missing Student email once without sending credentials automatically', async () => {
  state.save.mockReturnValue({
    unwrap: async () => ({ recipients: [{ ...student, email: 'jay@example.test' }] }),
  });
  renderDialog();
  fireEvent.change(screen.getByRole('textbox', { name: /^Email/ }), {
    target: { value: 'jay@example.test' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
  await waitFor(() => expect(state.close).toHaveBeenCalledOnce());
  expect(state.save).toHaveBeenCalledExactlyOnceWith({
    id: 'case-1',
    accountType: 'student',
    relationship: 'self',
    expectedEmail: null,
    email: 'jay@example.test',
    concurrencyStamp: 'case-stamp',
    confirmSharedParent: false,
    emailEditToken: 'profile-token',
  });
  expect(state.success).toHaveBeenCalledWith({
    message: 'Email saved.',
  });
});

it('validates email before submitting and retains the draft on server failure', async () => {
  state.save.mockReturnValue({
    unwrap: async () => {
      throw new Error('offline');
    },
  });
  renderDialog();
  const email = screen.getByRole('textbox', { name: /^Email/ });
  fireEvent.change(email, { target: { value: 'invalid' } });
  fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
  expect(await screen.findByText('Enter a valid email, such as name@example.com.')).toBeVisible();
  expect(state.save).not.toHaveBeenCalled();
  fireEvent.change(email, { target: { value: 'jay@example.test' } });
  fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
  await waitFor(() => expect(state.error).toHaveBeenCalledOnce());
  expect(state.error).toHaveBeenCalledWith({
    message: 'Email could not be saved. Refresh App Login and try again.',
  });
  expect(email).toHaveValue('jay@example.test');
  expect(state.close).not.toHaveBeenCalled();
});

it('requires confirmation for a shared parent and requests verification instead of immediate login replacement', async () => {
  const parent: StudentCredentialsRecipient = {
    ...student,
    accountType: 'guardian',
    relationship: 'father',
    email: 'old@example.test',
    hasLinkedAccount: true,
    linkedStudentCount: 2,
  };
  state.save.mockReturnValue({
    unwrap: async () => ({
      recipients: [{ ...parent, pendingEmail: 'new@example.test', emailChangeStatus: 'Pending' }],
    }),
  });
  renderDialog(parent);
  fireEvent.change(screen.getByRole('textbox', { name: /^Email/ }), {
    target: { value: 'new@example.test' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
  expect(await screen.findByText('Confirm the shared parent email change.')).toBeVisible();
  expect(state.save).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('checkbox', { name: /all 2 linked children/ }));
  fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
  await waitFor(() => expect(state.save).toHaveBeenCalledOnce());
  expect(state.save.mock.calls[0][0]).toMatchObject({
    confirmSharedParent: true,
    relationship: 'father',
  });
  expect(state.success).toHaveBeenCalledWith({
    message: 'Verify the new email before the login changes.',
  });
});

it('locks fields and Cancel during save', () => {
  state.busy = true;
  renderDialog();
  expect(screen.getByRole('textbox', { name: /^Email/ })).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled();
});
it('identifies the linked account being edited without changing its current login', () => {
  renderDialog({
    ...student,
    accountType: 'guardian',
    relationship: 'father',
    name: 'Raj Patel',
    email: 'current@example.test',
    hasLinkedAccount: true,
  });
  expect(screen.getByText('Raj Patel · Father')).toBeVisible();
  expect(screen.getByText('Current login: current@example.test')).toBeVisible();
  expect(screen.getByText('Password and sibling access stay unchanged.')).toBeVisible();
  expect(state.save).not.toHaveBeenCalled();
});

it('keeps email editing unavailable when the recipient cannot edit', () => {
  renderDialog({ ...student, canEditEmail: false });
  expect(screen.getByRole('textbox', { name: /^Email/ })).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled();
  expect(state.save).not.toHaveBeenCalled();
});

it('keeps a dirty email when cancellation is declined', async () => {
  renderDialog();
  fireEvent.change(screen.getByRole('textbox', { name: /^Email/ }), {
    target: { value: 'unsaved@example.test' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
  fireEvent.click(await screen.findByRole('button', { name: 'Keep editing' }));
  expect(screen.getByRole('textbox', { name: /^Email/ })).toHaveValue('unsaved@example.test');
  expect(state.close).not.toHaveBeenCalled();
});

it('cancels pending verification without changing the saved email or sending credentials', async () => {
  state.save.mockReturnValue({ unwrap: async () => ({ recipients: [student] }) });
  renderDialog({
    ...student,
    email: 'current@example.test',
    hasLinkedAccount: true,
    pendingEmail: 'wrong@example.test',
  });
  fireEvent.click(screen.getByRole('button', { name: 'Cancel change' }));
  await waitFor(() => expect(state.close).toHaveBeenCalledOnce());
  expect(state.save).toHaveBeenCalledExactlyOnceWith({
    id: 'case-1',
    accountType: 'student',
    relationship: 'self',
    expectedEmail: 'current@example.test',
    email: '',
    concurrencyStamp: 'case-stamp',
    emailEditToken: 'profile-token',
    cancelPendingChange: true,
    confirmSharedParent: false,
  });
});

it('labels and saves the actual Guardian profile rather than Mother', async () => {
  const guardian: StudentCredentialsRecipient = {
    ...student,
    accountType: 'guardian',
    relationship: 'guardian',
    name: 'Meera',
  };
  state.save.mockReturnValue({
    unwrap: async () => ({ recipients: [{ ...guardian, email: 'meera@example.test' }] }),
  });
  renderDialog(guardian);
  expect(screen.getByText('Meera · Guardian')).toBeVisible();
  expect(screen.getByText('Student: Jay')).toBeVisible();
  expect(screen.queryByText(/Mother/)).not.toBeInTheDocument();
  fireEvent.change(screen.getByRole('textbox', { name: /^Email/ }), {
    target: { value: 'meera@example.test' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
  await waitFor(() => expect(state.save).toHaveBeenCalledOnce());
  expect(state.save.mock.calls[0][0]).toMatchObject({
    relationship: 'guardian',
    expectedEmail: null,
    email: 'meera@example.test',
  });
});

it('updates a linked Guardian through owner verification with its own current email and token', async () => {
  const guardian: StudentCredentialsRecipient = {
    ...student,
    accountType: 'guardian',
    relationship: 'guardian',
    name: 'Meera',
    email: 'old-aunt@example.test',
    hasLinkedAccount: true,
  };
  state.save.mockReturnValue({
    unwrap: async () => ({
      recipients: [
        { ...guardian, pendingEmail: 'new-aunt@example.test', emailChangeStatus: 'Pending' },
      ],
    }),
  });
  renderDialog(guardian);
  fireEvent.change(screen.getByRole('textbox', { name: /^Email/ }), {
    target: { value: 'new-aunt@example.test' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
  await waitFor(() => expect(state.save).toHaveBeenCalledOnce());
  expect(state.save.mock.calls[0][0]).toMatchObject({
    relationship: 'guardian',
    expectedEmail: 'old-aunt@example.test',
    email: 'new-aunt@example.test',
    emailEditToken: 'profile-token',
  });
  expect(state.success).toHaveBeenCalledWith({
    message: 'Verify the new email before the login changes.',
  });
});

it('shows duplicate-login business validation at the email field and preserves the draft', async () => {
  state.save.mockReturnValue({
    unwrap: async () => {
      throw Object.assign(new Error('Request rejected'), {
        status: 400,
        data: {
          code: 'Students.Onboarding.PortalAccountInvalid',
          detail: 'One or more business rules were violated.',
          data: {
            Reason: 'This email already belongs to another app login. Use a different email.',
          },
        },
      });
    },
  });
  renderDialog();
  fireEvent.change(screen.getByRole('textbox', { name: /^Email/ }), {
    target: { value: 'duplicate@example.test' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
  expect(
    await screen.findByText(
      'This email already belongs to another app login. Use a different email.'
    )
  ).toBeVisible();
  expect(screen.getByRole('textbox', { name: /^Email/ })).toHaveAttribute('aria-invalid', 'true');
  expect(state.close).not.toHaveBeenCalled();
});

it.each([
  'Student and adult app logins need different saved email addresses.',
  'This email is already used by a conflicting, inactive or restricted account. Existing accounts cannot be merged or repurposed through a profile email change.',
])('keeps the saved-email collision at the field: %s', async (reason) => {
  state.save.mockReturnValue({
    unwrap: async () => {
      throw Object.assign(new Error('Request rejected'), { status: 400, data: { detail: reason } });
    },
  });
  renderDialog();
  fireEvent.change(screen.getByRole('textbox', { name: /^Email/ }), {
    target: { value: 'duplicate@example.test' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
  await waitFor(() =>
    expect(screen.getByRole('textbox', { name: /^Email/ })).toHaveAttribute('aria-invalid', 'true')
  );
  expect(state.error).not.toHaveBeenCalled();
  expect(state.close).not.toHaveBeenCalled();
});
