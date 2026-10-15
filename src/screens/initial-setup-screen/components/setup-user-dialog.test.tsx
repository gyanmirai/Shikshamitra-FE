import { vi, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

import SetupUserDialog from './setup-user-dialog';

const mocks = vi.hoisted(() => ({
  create: vi.fn(),
  close: vi.fn(),
  toast: vi.fn(),
  success: vi.fn(),
}));
vi.mock('react-redux', () => ({ useSelector: () => false }));
vi.mock('src/redux/role/roleApi', () => ({ useGetRolesQuery: () => ({}) }));
vi.mock('src/redux/host-tenants/host-tenant-api', () => ({
  useGetTenantPasswordPolicyQuery: () => ({
    data: {
      requiredLength: 8,
      requiredUniqueChars: 1,
      requireLowercase: true,
      requireUppercase: true,
      requireDigit: true,
      requireNonAlphanumeric: true,
    },
  }),
}));
vi.mock('src/components/toast', () => ({
  shikshaMitraToast: { error: mocks.toast, success: mocks.success },
}));
vi.mock('src/components/customDialog', () => ({
  default: ({ children }: React.PropsWithChildren) => <div role="dialog">{children}</div>,
  DialogScrollContent: ({ children }: React.PropsWithChildren) => children,
}));
vi.mock('src/components/form-section-card', () => ({
  FormSectionCard: ({ children }: React.PropsWithChildren) => children,
}));

beforeEach(() => {
  vi.clearAllMocks();
});
const fill = (name: string, value: string) =>
  fireEvent.change(screen.getByLabelText(new RegExp(name)), { target: { value } });
const openValid = () => {
  render(<SetupUserDialog onCreate={mocks.create} onClose={mocks.close} />);
  fill('User name', 'teacher.one');
  fill('Email', 'teacher@example.test');
  fill('Initial password', 'Staff-Password-29!');
};

it('shows all inline errors on submit and focuses the first invalid field without creating a user', async () => {
  render(<SetupUserDialog onCreate={mocks.create} onClose={mocks.close} />);
  fill('User name', 'ab');
  fill('Email', 'testuser');
  fill('Initial password', '12345');
  fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
  await screen.findByText('Please enter a valid email address (e.g., name@school.com).');
  await waitFor(() => expect(screen.getByLabelText(/User name/)).toHaveFocus());
  expect(screen.getByLabelText(/Initial password/)).toHaveAttribute('aria-invalid', 'true');
  expect(screen.getByText(/Use at least 8 characters; Include a lowercase/)).toBeVisible();
  expect(mocks.create).not.toHaveBeenCalled();
});

it('validates on blur and clears corrected client errors while typing', async () => {
  render(<SetupUserDialog onCreate={mocks.create} onClose={mocks.close} />);
  fill('Email', 'testuser');
  fireEvent.blur(screen.getByLabelText(/Email/));
  await screen.findByText('Please enter a valid email address (e.g., name@school.com).');
  fill('Email', 'teacher@example.test');
  await waitFor(() =>
    expect(screen.getByLabelText(/Email/)).toHaveAttribute('aria-invalid', 'false')
  );
});

it('retains duplicate field errors when editing another field and succeeds after correction', async () => {
  mocks.create
    .mockRejectedValueOnce({ status: 409, data: { errorCode: 'Volo.Abp.Identity:DuplicateEmail' } })
    .mockResolvedValueOnce(undefined);
  openValid();
  fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
  await screen.findByText('Email Already In Use');
  await waitFor(() => expect(screen.getByLabelText(/Email/)).toHaveFocus());
  expect(mocks.toast).toHaveBeenCalledWith({
    message: expect.stringContaining('already registered'),
  });
  fill('User name', 'teacher.two');
  await waitFor(() =>
    expect(screen.getByLabelText(/Email/)).toHaveAttribute('aria-invalid', 'true')
  );
  fill('Email', 'another@example.test');
  fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
  await waitFor(() => expect(mocks.close).toHaveBeenCalledOnce());
  expect(mocks.create).toHaveBeenLastCalledWith(
    expect.objectContaining({ email: 'another@example.test', userName: 'teacher.two' })
  );
});

it('disables submission and cancellation until the request completes', async () => {
  let finish: () => void = () => {};
  mocks.create.mockImplementation(
    () =>
      new Promise<void>((resolve) => {
        finish = resolve;
      })
  );
  openValid();
  fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
  const submit = await screen.findByRole('button', { name: 'Submitting...' });
  expect(submit).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
  expect(screen.getByLabelText(/Email/)).toBeDisabled();
  fireEvent.click(submit);
  expect(mocks.create).toHaveBeenCalledOnce();
  finish();
  await waitFor(() => expect(mocks.close).toHaveBeenCalledOnce());
});
