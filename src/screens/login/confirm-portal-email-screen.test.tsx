import { it, vi, expect, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

import { ConfirmPortalEmailForm } from './confirm-portal-email-screen';

const state = vi.hoisted(() => ({
  params: new URLSearchParams(),
  confirm: vi.fn(),
  loading: false,
}));
vi.mock('next/navigation', () => ({ useSearchParams: () => state.params }));
vi.mock('src/redux/student/onboarding/student-onboarding-api', () => ({
  useConfirmStudentPortalEmailMutation: () => [state.confirm, { isLoading: state.loading }],
}));
vi.mock('./components/auth-back-link', () => ({
  AuthBackLink: () => <a href="/login">Back to login</a>,
}));
vi.mock('./components/auth-layout', () => ({ AuthLayout: ({ children }: any) => children }));
vi.mock('./components/auth-card', () => ({
  AuthCard: ({ title, description, children }: any) => (
    <section>
      <h2>{title}</h2>
      <p>{description}</p>
      {children}
    </section>
  ),
}));
vi.mock('./components/auth-submit-button', () => ({
  AuthSubmitButton: ({ children, loading, ...props }: any) => (
    <button type="button" {...props}>
      {children}
    </button>
  ),
}));

const tenantId = '11111111-1111-1111-1111-111111111111';
const userId = '22222222-2222-2222-2222-222222222222';
const requestId = '33333333-3333-3333-3333-333333333333';
beforeEach(() => {
  vi.clearAllMocks();
  state.loading = false;
  state.params = new URLSearchParams({
    tenantId,
    userId,
    requestId,
    token: 'test-verification-token',
  });
});

it('does not change the email merely by opening the verification page', () => {
  render(<ConfirmPortalEmailForm />);
  expect(state.confirm).not.toHaveBeenCalled();
  expect(screen.getByRole('button', { name: 'Confirm email change' })).toBeEnabled();
});

it('confirms the exact school/request after an explicit click without asking for a new password', async () => {
  state.confirm.mockReturnValue({ unwrap: async () => undefined });
  render(<ConfirmPortalEmailForm />);
  fireEvent.click(screen.getByRole('button', { name: 'Confirm email change' }));
  await waitFor(() => expect(screen.getByText('Login email updated')).toBeVisible());
  expect(state.confirm).toHaveBeenCalledExactlyOnceWith({
    tenantId,
    userId,
    requestId,
    token: 'test-verification-token',
  });
  expect(screen.queryByLabelText(/password/i)).not.toBeInTheDocument();
});

it('rejects an incomplete link without making a request', () => {
  state.params.delete('tenantId');
  render(<ConfirmPortalEmailForm />);
  expect(screen.getByRole('button', { name: 'Confirm email change' })).toBeDisabled();
  expect(state.confirm).not.toHaveBeenCalled();
});

it('retains an actionable safe error on verification failure', async () => {
  state.confirm.mockReturnValue({
    unwrap: async () => {
      throw new Error('expired');
    },
  });
  render(<ConfirmPortalEmailForm />);
  fireEvent.click(screen.getByRole('button', { name: 'Confirm email change' }));
  expect(await screen.findByRole('alert')).toHaveTextContent(
    'Ask your school to request a new verification email.'
  );
});
