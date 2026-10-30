import { it, vi, expect, describe, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

import { LoginForm } from './login-form';
import { useLoginForm } from '../hooks/use-login-form';
import { LoginCredentials } from './login-credentials';

const { signIn } = vi.hoisted(() => ({ signIn: vi.fn() }));
vi.mock('next-auth/react', () => ({ signIn }));
vi.mock('src/components/toast', () => ({ shikshaMitraToast: { error: vi.fn() } }));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));

function CredentialsForm() {
  const { formik } = useLoginForm();
  return (
    <form onSubmit={formik.handleSubmit} noValidate>
      <LoginCredentials formik={formik} />
      <button type="submit">Sign in</button>
    </form>
  );
}

describe('sign-in required fields', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    signIn.mockResolvedValue({ error: undefined });
  });

  it('keeps school code optional while validating the required credentials', async () => {
    render(<CredentialsForm />);
    const school = screen.getByLabelText('School code', { exact: true });
    expect(school).not.toBeRequired();
    expect(screen.getByLabelText('Email or username', { exact: true })).toBeRequired();
    expect(screen.getByLabelText('Password', { exact: true })).toBeRequired();
    fireEvent.click(screen.getByRole('button', { name: /^Sign in$/ }));
    await waitFor(() => expect(screen.getByText('Email or Username is required')).toBeVisible());
    expect(screen.getByText('Password is required')).toBeVisible();
    expect(school).toHaveAttribute('aria-invalid', 'false');
    expect(screen.queryByText('School Code is required')).not.toBeInTheDocument();
    expect(signIn).not.toHaveBeenCalled();
  });

  it('submits the login form without a school code or administrator mode button', async () => {
    render(<LoginForm />);
    expect(
      screen.queryByRole('button', { name: 'Platform administrator sign in' })
    ).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Email or username', { exact: true }), {
      target: { value: 'host-admin' },
    });
    fireEvent.change(screen.getByLabelText('Password', { exact: true }), {
      target: { value: 'secret' },
    });
    fireEvent.click(screen.getByRole('button', { name: /^Sign in$/ }));
    await waitFor(() =>
      expect(signIn).toHaveBeenCalledWith('credentials', {
        organizationName: '',
        email: 'host-admin',
        password: 'secret',
        redirect: false,
      })
    );
  });
});
