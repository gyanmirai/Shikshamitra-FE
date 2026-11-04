import { act, renderHook } from '@testing-library/react';
import { it, vi, expect, describe, beforeEach } from 'vitest';

import { useLoginForm } from './use-login-form';

const { signIn } = vi.hoisted(() => ({ signIn: vi.fn() }));
vi.mock('next-auth/react', () => ({ signIn }));
vi.mock('src/components/toast', () => ({ shikshaMitraToast: { error: vi.fn() } }));

describe('confirmed sign-in reaction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.history.replaceState({}, '', '/login');
  });

  it.each([
    undefined,
    { ok: false, error: 'CredentialsSignin', code: 'invalid_credentials' },
    { ok: false },
    { error: undefined },
  ])('never celebrates an unconfirmed response %j', async (response) => {
    signIn.mockResolvedValue(response);
    const { result } = renderHook(() => useLoginForm());
    await act(async () => {
      await result.current.formik.setValues({
        organization: '',
        email: 'teacher',
        password: 'secret',
      });
    });
    await act(async () => {
      await result.current.formik.submitForm();
    });
    expect(result.current.loginSucceeded).toBe(false);
  });

  it('celebrates only after success and resets when another request fails', async () => {
    signIn.mockResolvedValueOnce({ ok: true, error: undefined });
    const { result } = renderHook(() => useLoginForm());
    expect(result.current.loginSucceeded).toBe(false);
    await act(async () => {
      await result.current.formik.setValues({
        organization: '',
        email: 'teacher',
        password: 'secret',
      });
    });
    await act(async () => {
      await result.current.formik.submitForm();
    });
    expect(result.current.loginSucceeded).toBe(true);
    signIn.mockRejectedValueOnce(new Error('Network unavailable'));
    await act(async () => {
      await result.current.formik.submitForm();
    });
    expect(result.current.loginSucceeded).toBe(false);
    expect(result.current.errorMessage).toBe('Unable to sign in. Please try again.');
  });
});
