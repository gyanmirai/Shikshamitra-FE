import { act, renderHook } from '@testing-library/react';
import { it, vi, expect, describe, beforeEach } from 'vitest';

import { useLoginForm } from './use-login-form';

const { signIn, toastError } = vi.hoisted(() => ({ signIn: vi.fn(), toastError: vi.fn() }));
vi.mock('next-auth/react', () => ({ signIn }));
vi.mock('src/components/toast', () => ({ shikshaMitraToast: { error: toastError } }));

describe('school sign in', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.history.replaceState({}, '', '/login');
    signIn.mockResolvedValue({ error: undefined });
  });

  it('prefills the email school code without submitting credentials', () => {
    window.history.replaceState({}, '', '/login?organization=School%20%26%20One');
    const { result } = renderHook(() => useLoginForm());
    expect(result.current.formik.values.organization).toBe('School & One');
    expect(result.current.formik.values.email).toBe('');
    expect(result.current.formik.values.password).toBe('');
    expect(signIn).not.toHaveBeenCalled();
  });

  it('allows clearing the school prefill and restores the link context on revisit', async () => {
    window.history.replaceState({}, '', '/login?organization=DDVS');
    const first = renderHook(() => useLoginForm());
    await act(async () => {
      await first.result.current.formik.setFieldValue('organization', 'OTHER-SCHOOL');
    });
    expect(first.result.current.formik.values.organization).toBe('OTHER-SCHOOL');
    await act(async () => {
      await first.result.current.formik.setFieldValue('organization', '');
    });
    expect(first.result.current.formik.values.organization).toBe('');
    first.unmount();
    const revisit = renderHook(() => useLoginForm());
    expect(revisit.result.current.formik.values.organization).toBe('DDVS');
    expect(signIn).not.toHaveBeenCalled();
  });

  it.each(['', '   '])(
    'submits credentials with an optional school code %j',
    async (organization) => {
      const { result } = renderHook(() => useLoginForm());
      await act(async () => {
        await result.current.formik.setValues({
          organization,
          email: 'teacher',
          password: 'secret',
        });
      });
      await act(async () => {
        await result.current.formik.submitForm();
      });
      expect(result.current.formik.errors.organization).toBeUndefined();
      expect(signIn).toHaveBeenCalledWith('credentials', {
        organizationName: '',
        email: 'teacher',
        password: 'secret',
        redirect: false,
      });
      expect(toastError).not.toHaveBeenCalled();
    }
  );

  it('validates every empty required field on submit', async () => {
    const { result } = renderHook(() => useLoginForm());
    await act(async () => {
      await result.current.formik.submitForm();
    });
    expect(result.current.formik.errors).toEqual({
      email: 'Email or Username is required',
      password: 'Password is required',
    });
    expect(signIn).not.toHaveBeenCalled();
  });

  it('normalizes school and username without modifying the password', async () => {
    const { result } = renderHook(() => useLoginForm());
    await act(async () => {
      await result.current.formik.setValues({
        organization: ' SCHOOL ',
        email: ' teacher ',
        password: ' secret ',
      });
    });
    await act(async () => {
      await result.current.formik.submitForm();
    });
    expect(signIn).toHaveBeenCalledWith('credentials', {
      organizationName: 'SCHOOL',
      email: 'teacher',
      password: ' secret ',
      redirect: false,
    });
  });

  it.each([
    ['invalid_school_code', 'School code was not found. Please check it and try again.'],
    ['invalid_credentials', 'Invalid email, username, or password.'],
    [
      'authentication_unavailable',
      'The authentication service is unavailable. Please try again shortly.',
    ],
    ['tenant-inactive', 'This school is inactive. Contact the platform administrator.'],
  ])('shows the specific error %s and preserves inputs', async (code, message) => {
    signIn.mockResolvedValue({ error: 'CredentialsSignin', code });
    const { result } = renderHook(() => useLoginForm());
    const values = { organization: 'SCHOOL', email: 'teacher', password: 'secret' };
    await act(async () => {
      await result.current.formik.setValues(values);
    });
    await act(async () => {
      await result.current.formik.submitForm();
    });
    expect(toastError).toHaveBeenCalledWith({ message });
    if (code === 'invalid_school_code')
      expect(result.current.formik.errors.organization).toBe(message);
    else if (code === 'tenant-inactive') expect(result.current.tenantInactive).toBe(true);
    else expect(result.current.errorMessage).toBe(message);
    expect(result.current.formik.values).toEqual(values);
    expect(result.current.formik.isSubmitting).toBe(false);
  });
});
