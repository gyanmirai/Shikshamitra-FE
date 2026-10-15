import { it, vi, expect, describe, beforeEach } from 'vitest';
import { act, waitFor, renderHook } from '@testing-library/react';

import { useForgotPasswordForm } from './use-forgot-password-form';

const { send, unwrap } = vi.hoisted(() => ({ send: vi.fn(), unwrap: vi.fn() }));
vi.mock('src/redux/auth/authApi', () => ({
  useSendPasswordResetCodeMutation: () => [send, {}],
}));
vi.mock('src/redux/customQueryAndMutation', () => ({
  default: ({ currentQueryAndMutation }: { currentQueryAndMutation: () => unknown }) =>
    currentQueryAndMutation(),
}));

describe('password reset link request', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    unwrap.mockResolvedValue(undefined);
    send.mockReturnValue({ unwrap });
  });

  it('validates school and email before sending any request', async () => {
    const { result } = renderHook(() => useForgotPasswordForm());
    await act(async () => {
      await result.current.formik.submitForm();
    });
    expect(send).not.toHaveBeenCalled();
    expect(result.current.formik.errors).toEqual({
      organization: 'School code is required',
      email: 'Email is required',
    });
    await act(async () => {
      await result.current.formik.setValues({ organization: 'SCHOOL', email: 'invalid' });
    });
    await act(async () => {
      await result.current.formik.submitForm();
    });
    expect(send).not.toHaveBeenCalled();
    expect(result.current.formik.errors.email).toBe('Invalid email address');
  });

  it('keeps the tenant header input and app name, then shows the neutral success state', async () => {
    const { result } = renderHook(() => useForgotPasswordForm());
    await act(async () => {
      await result.current.formik.setValues({
        organization: 'SCHOOL',
        email: 'teacher@example.com',
      });
    });
    await act(async () => {
      await result.current.formik.submitForm();
    });
    expect(send).toHaveBeenCalledWith({
      body: { email: 'teacher@example.com', appName: 'shikshamitra-nextjs' },
      tenantId: 'SCHOOL',
    });
    await waitFor(() => expect(result.current.sent).toBe(true));
    expect(result.current.formik.isSubmitting).toBe(false);
  });

  it('keeps the entered values and releases submission after a failed request', async () => {
    unwrap.mockRejectedValueOnce(new Error('offline'));
    const { result } = renderHook(() => useForgotPasswordForm());
    const values = { organization: 'SCHOOL', email: 'teacher@example.com' };
    await act(async () => {
      await result.current.formik.setValues(values);
    });
    await act(async () => {
      await result.current.formik.submitForm();
    });
    expect(result.current.sent).toBe(false);
    expect(result.current.errorMessage).toContain('Please try again');
    expect(result.current.formik.values).toEqual(values);
    expect(result.current.formik.isSubmitting).toBe(false);
  });
});
