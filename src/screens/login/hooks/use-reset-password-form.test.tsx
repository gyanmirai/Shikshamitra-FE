import { it, vi, expect, describe, beforeEach } from 'vitest';
import { act, waitFor, renderHook } from '@testing-library/react';

import { useResetPasswordForm } from './use-reset-password-form';

const mocks = vi.hoisted(() => ({
  verify: vi.fn(),
  reset: vi.fn(),
  verifyResult: vi.fn(),
  resetResult: vi.fn(),
  router: { push: vi.fn() },
  params: new URLSearchParams(),
  success: vi.fn(),
}));
vi.mock('next/navigation', () => ({
  useRouter: () => mocks.router,
  useSearchParams: () => mocks.params,
}));
vi.mock('src/components/toast', () => ({ shikshaMitraToast: { success: mocks.success } }));
vi.mock('src/redux/auth/authApi', () => ({
  useVerifyPasswordResetTokenMutation: () => [mocks.verify, {}],
  useResetPasswordMutation: () => [mocks.reset, {}],
}));
vi.mock('src/redux/customQueryAndMutation', () => ({
  default: ({ currentQueryAndMutation }: { currentQueryAndMutation: () => unknown }) =>
    currentQueryAndMutation(),
}));
const password = 'Secure123!';

describe('password reset', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.params = new URLSearchParams('userId=user-1&resetToken=reset-token&tenantId=school-1');
    mocks.verifyResult.mockResolvedValue(true);
    mocks.resetResult.mockResolvedValue(undefined);
    mocks.verify.mockReturnValue({ unwrap: mocks.verifyResult });
    mocks.reset.mockReturnValue({ unwrap: mocks.resetResult });
  });

  it('rejects a missing link without making an API request', async () => {
    mocks.params = new URLSearchParams();
    const { result } = renderHook(() => useResetPasswordForm());
    await waitFor(() => expect(result.current.tokenChecked).toBe(true));
    expect(result.current.isValidToken).toBe(false);
    expect(mocks.verify).not.toHaveBeenCalled();
    expect(mocks.reset).not.toHaveBeenCalled();
  });

  it.each(['tenantId', '__tenant', 'tenant'])(
    'preserves the %s query alias and token alias',
    async (alias) => {
      mocks.params = new URLSearchParams(`userId=user-1&token=reset-token&${alias}=school-1`);
      const { result } = renderHook(() => useResetPasswordForm());
      await waitFor(() => expect(result.current.isValidToken).toBe(true));
      expect(mocks.verify).toHaveBeenCalledWith({
        body: { userId: 'user-1', resetToken: 'reset-token' },
        tenantId: 'school-1',
      });
    }
  );

  it('keeps expired links out of the password form', async () => {
    mocks.verifyResult.mockResolvedValue(false);
    const { result } = renderHook(() => useResetPasswordForm());
    await waitFor(() => expect(result.current.tokenChecked).toBe(true));
    expect(result.current.isValidToken).toBe(false);
  });

  it('enforces password policy and confirmation before resetting', async () => {
    const { result } = renderHook(() => useResetPasswordForm());
    await waitFor(() => expect(result.current.isValidToken).toBe(true));
    await act(async () => {
      await result.current.formik.setValues({ password: 'weak', confirmPassword: 'other' });
    });
    await act(async () => {
      await result.current.formik.submitForm();
    });
    expect(result.current.formik.errors.password).toBeTruthy();
    expect(result.current.formik.errors.confirmPassword).toBe('Passwords must match');
    expect(mocks.reset).not.toHaveBeenCalled();
  });

  it('sends the original reset payload, clears secrets, and redirects after success', async () => {
    const { result } = renderHook(() => useResetPasswordForm());
    await waitFor(() => expect(result.current.isValidToken).toBe(true));
    await act(async () => {
      await result.current.formik.setValues({ password, confirmPassword: password });
    });
    await act(async () => {
      await result.current.formik.submitForm();
    });
    expect(mocks.reset).toHaveBeenCalledWith({
      body: { userId: 'user-1', resetToken: 'reset-token', password },
      tenantId: 'school-1',
    });
    expect(result.current.complete).toBe(true);
    expect(result.current.formik.values.password).toBe('');
    await waitFor(() => expect(mocks.router.push).toHaveBeenCalledWith('/login'), {
      timeout: 3000,
    });
  });

  it('preserves values and permits retry after reset failure', async () => {
    mocks.resetResult.mockRejectedValueOnce(new Error('offline'));
    const { result } = renderHook(() => useResetPasswordForm());
    await waitFor(() => expect(result.current.isValidToken).toBe(true));
    await act(async () => {
      await result.current.formik.setValues({ password, confirmPassword: password });
    });
    await act(async () => {
      await result.current.formik.submitForm();
    });
    expect(result.current.complete).toBe(false);
    expect(result.current.errorMessage).toContain('Please try again');
    expect(result.current.formik.values.password).toBe(password);
    expect(result.current.formik.isSubmitting).toBe(false);
    expect(mocks.router.push).not.toHaveBeenCalled();
  });
});
