import { it, vi, expect, describe, afterEach, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

import { LoginForm } from './login-form';
import { useLoginForm } from '../hooks/use-login-form';
import { LoginCredentials } from './login-credentials';

const { signIn } = vi.hoisted(() => ({ signIn: vi.fn() }));
vi.mock('next-auth/react', () => ({ signIn }));
vi.mock('src/components/toast', () => ({ shikshaMitraToast: { error: vi.fn() } }));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));

function CredentialsForm() {
  const { formik, handleSchoolCodeChange } = useLoginForm();
  return (
    <form onSubmit={formik.handleSubmit} noValidate>
      <LoginCredentials formik={formik} handleSchoolCodeChange={handleSchoolCodeChange} />
      <button type="submit">Sign in</button>
    </form>
  );
}

function SignInForm() {
  const form = useLoginForm();
  return <LoginForm form={form} />;
}

describe('sign-in required fields', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.history.replaceState({}, '', '/login');
    const storage = new Map<string, string>();
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => storage.set(key, value),
      removeItem: (key: string) => storage.delete(key),
    });
    signIn.mockResolvedValue({ error: undefined });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('remembers, replaces, and clears the school code across visits before sign-in', () => {
    const schoolCode = () => screen.getByRole('textbox', { name: 'School code' });
    const firstVisit = render(<SignInForm />);
    fireEvent.change(schoolCode(), { target: { value: ' FIRST-SCHOOL ' } });
    fireEvent.change(screen.getByLabelText('Email or username'), { target: { value: 'teacher' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'secret' } });
    firstVisit.unmount();

    const nextVisit = render(<SignInForm />);
    expect(schoolCode()).toHaveValue('FIRST-SCHOOL');
    expect(screen.getByLabelText('Email or username')).toHaveValue('');
    expect(screen.getByLabelText('Password')).toHaveValue('');
    fireEvent.change(schoolCode(), { target: { value: 'SECOND-SCHOOL' } });
    nextVisit.unmount();

    const visitAfterEdit = render(<SignInForm />);
    expect(schoolCode()).toHaveValue('SECOND-SCHOOL');
    fireEvent.change(schoolCode(), { target: { value: '' } });
    visitAfterEdit.unmount();

    render(<SignInForm />);
    expect(schoolCode()).toHaveValue('');
    expect(signIn).not.toHaveBeenCalled();
  });

  it('shows the welcome-link code without replacing the remembered code', () => {
    const schoolCode = () => screen.getByRole('textbox', { name: 'School code' });
    const firstVisit = render(<SignInForm />);
    fireEvent.change(schoolCode(), { target: { value: 'REMEMBERED-SCHOOL' } });
    firstVisit.unmount();

    window.history.replaceState({}, '', '/login?organization=LINKED-SCHOOL');
    const linkedVisit = render(<SignInForm />);
    expect(schoolCode()).toHaveValue('LINKED-SCHOOL');
    linkedVisit.unmount();

    window.history.replaceState({}, '', '/login');
    render(<SignInForm />);
    expect(schoolCode()).toHaveValue('REMEMBERED-SCHOOL');
    expect(signIn).not.toHaveBeenCalled();
  });

  it('allows sign-in with a school code when browser storage is unavailable', async () => {
    vi.stubGlobal('localStorage', undefined);
    render(<SignInForm />);
    fireEvent.change(screen.getByLabelText('School code'), {
      target: { value: 'MANUAL-SCHOOL' },
    });
    fireEvent.change(screen.getByLabelText('Email or username'), { target: { value: 'teacher' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'secret' } });
    fireEvent.click(screen.getByRole('button', { name: /^Sign in$/ }));
    await waitFor(() =>
      expect(signIn).toHaveBeenCalledWith('credentials', {
        organizationName: 'MANUAL-SCHOOL',
        email: 'teacher',
        password: 'secret',
        redirect: false,
      })
    );
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
    render(<SignInForm />);
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
