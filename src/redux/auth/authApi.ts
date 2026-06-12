import { api } from 'src/redux/service';

export interface SendPasswordResetCodeInput {
  email: string;
  appName: string;
}

export interface VerifyPasswordResetTokenInput {
  userId: string;
  resetToken: string;
}

export interface ResetPasswordInput {
  userId: string;
  resetToken: string;
  password?: string;
}

export const authApi = api.injectEndpoints({
  endpoints: (builder) => ({
    sendPasswordResetCode: builder.mutation<
      void,
      { body: SendPasswordResetCodeInput; tenantId?: string }
    >({
      query: ({ body, tenantId }) => ({
        url: `/account/send-password-reset-code`,
        method: 'POST',
        body,
        headers: tenantId ? { __tenant: tenantId } : undefined,
      }),
    }),
    verifyPasswordResetToken: builder.mutation<
      boolean,
      { body: VerifyPasswordResetTokenInput; tenantId?: string }
    >({
      query: ({ body, tenantId }) => ({
        url: `/account/verify-password-reset-token`,
        method: 'POST',
        body,
        headers: tenantId ? { __tenant: tenantId } : undefined,
      }),
    }),
    resetPassword: builder.mutation<void, { body: ResetPasswordInput; tenantId?: string }>({
      query: ({ body, tenantId }) => ({
        url: `/account/reset-password`,
        method: 'POST',
        body,
        headers: tenantId ? { __tenant: tenantId } : undefined,
      }),
    }),
  }),
});

export const {
  useSendPasswordResetCodeMutation,
  useVerifyPasswordResetTokenMutation,
  useResetPasswordMutation,
} = authApi;
