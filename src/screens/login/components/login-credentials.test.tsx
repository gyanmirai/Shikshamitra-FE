import { it, vi, expect, describe } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

import { useLoginForm } from '../hooks/use-login-form';
import { LoginCredentials } from './login-credentials';

const { signIn } = vi.hoisted(() => ({ signIn: vi.fn() }));
vi.mock('next-auth/react', () => ({ signIn }));
vi.mock('src/components/toast', () => ({ shikshaMitraToast: { error: vi.fn() } }));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));

function CredentialsForm() {
  const { formik, hostLogin, toggleHostLogin } = useLoginForm();
  return (
    <form onSubmit={formik.handleSubmit} noValidate>
      <LoginCredentials formik={formik} hostLogin={hostLogin} />
      <button type="submit">Sign in</button>
      <button type="button" onClick={toggleHostLogin}>
        Switch login mode
      </button>
    </form>
  );
}

describe('sign-in required fields', () => {
  it('keeps exact accessible field names and shows the missing school error inline', async () => {
    render(<CredentialsForm />);
    const school = screen.getByLabelText('School code', { exact: true });
    expect(school).toBeRequired();
    expect(screen.getByLabelText('Email or username', { exact: true })).toBeRequired();
    expect(screen.getByLabelText('Password', { exact: true })).toBeRequired();
    fireEvent.click(screen.getByRole('button', { name: /^Sign in$/ }));
    await waitFor(() => expect(screen.getByText('School Code is required')).toBeVisible());
    expect(school).toHaveAttribute('aria-invalid', 'true');
    expect(school).toHaveAccessibleDescription('School Code is required');
    expect(signIn).not.toHaveBeenCalled();
  });

  it('omits the school field only in the explicit host mode', () => {
    render(<CredentialsForm />);
    fireEvent.click(screen.getByRole('button', { name: 'Switch login mode' }));
    expect(screen.queryByLabelText('School code', { exact: true })).not.toBeInTheDocument();
    expect(screen.getByLabelText('Email or username', { exact: true })).toBeRequired();
    expect(screen.getByLabelText('Password', { exact: true })).toBeRequired();
  });
});
