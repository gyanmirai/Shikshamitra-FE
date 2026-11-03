import userEvent from '@testing-library/user-event';
import { it, vi, expect, describe, beforeEach } from 'vitest';
import { act, render, screen, waitFor } from '@testing-library/react';

import { LoginForm } from './login-form';
import { useLoginForm } from '../hooks/use-login-form';
import { useLoginCompanion } from '../hooks/use-login-companion';

const { signIn } = vi.hoisted(() => ({ signIn: vi.fn() }));
vi.mock('next-auth/react', () => ({ signIn }));
vi.mock('src/components/toast', () => ({ shikshaMitraToast: { error: vi.fn() } }));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));

function SignInWithCompanion() {
  const form = useLoginForm();
  const companion = useLoginCompanion({
    isSubmitting: form.formik.isSubmitting,
    loginSucceeded: form.loginSucceeded,
  });
  return (
    <>
      <LoginForm form={form} onPasswordFocusChange={companion.onPasswordFocusChange} />
      <output aria-label="Companion reaction">{companion.state}</output>
    </>
  );
}

describe('sign-in companion interactions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.history.replaceState({}, '', '/login');
  });

  it('keeps eyes covered through password entry and keyboard access to the reveal control', async () => {
    const user = userEvent.setup();
    render(<SignInWithCompanion />);
    const reaction = screen.getByLabelText('Companion reaction');
    const password = screen.getByLabelText('Password', { exact: true });
    await user.click(password);
    expect(reaction).toHaveTextContent('password');
    await user.type(password, 'secret');
    await user.tab();
    expect(screen.getByRole('button', { name: 'Show password' })).toHaveFocus();
    expect(reaction).toHaveTextContent('password');
    await user.keyboard('{Enter}');
    expect(password).toHaveAttribute('type', 'text');
    expect(password).toHaveValue('secret');
    expect(reaction).toHaveTextContent('password');
    await user.tab();
    expect(screen.getByRole('link', { name: 'Forgot password?' })).toHaveFocus();
    expect(reaction).toHaveTextContent('helper');
    expect(signIn).not.toHaveBeenCalled();
  });

  it('shows signing in only during submission and returns to helper after a failed request', async () => {
    const user = userEvent.setup();
    let finishRequest!: (value: { ok: boolean; error: string; code: string }) => void;
    signIn.mockReturnValue(
      new Promise((resolve) => {
        finishRequest = resolve;
      })
    );
    render(<SignInWithCompanion />);
    await user.type(screen.getByLabelText('Email or username', { exact: true }), 'teacher');
    await user.type(screen.getByLabelText('Password', { exact: true }), 'secret');
    await user.click(screen.getByRole('button', { name: /^Sign in$/ }));
    await waitFor(() => expect(signIn).toHaveBeenCalledTimes(1));
    expect(screen.getByLabelText('Companion reaction')).toHaveTextContent('signing-in');
    expect(screen.getByRole('button', { name: 'Signing in...' })).toBeDisabled();
    await act(async () => {
      finishRequest({ ok: false, error: 'CredentialsSignin', code: 'invalid_credentials' });
    });
    expect(screen.getByLabelText('Companion reaction')).toHaveTextContent('helper');
    expect(screen.getByRole('alert')).toHaveTextContent('Invalid email, username, or password.');
    expect(screen.getByLabelText('Password', { exact: true })).toHaveValue('secret');
  });

  it('covers its eyes when the password is revealed while another field still has focus', async () => {
    const user = userEvent.setup();
    render(<SignInWithCompanion />);
    const email = screen.getByLabelText('Email or username', { exact: true });
    await user.click(email);
    await user.click(screen.getByRole('button', { name: 'Show password' }));
    expect(screen.getByLabelText('Password', { exact: true })).toHaveAttribute('type', 'text');
    expect(screen.getByLabelText('Companion reaction')).toHaveTextContent('password');
    await user.click(email);
    expect(screen.getByLabelText('Companion reaction')).toHaveTextContent('helper');
  });
});
