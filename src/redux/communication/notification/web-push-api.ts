import { api } from 'src/redux/service';

export type WebPushPublicKey = {
  isConfigured: boolean;
  publicKey: string | null;
  vapidKeyVersion: string | null;
};

export type WebPushRegistration = {
  browserInstallationId: string;
  endpoint: string;
  keys: { p256dh: string; auth: string };
  vapidKeyVersion: string;
};

const route = '/communication/notifications/me/push';

export const webPushApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getWebPushKey: builder.query<WebPushPublicKey, string>({
      query: (owner) => ({ url: `${route}/public-key`, cache: 'no-store', expectedSessionOwner: owner, timeout: 5000 }),
    }),
    getWebPushSubscriptionStatus: builder.query<{ isEnabled: boolean }, { owner: string; id: string }>({
      query: ({ owner, id }) => ({
        url: `${route}/subscriptions/${encodeURIComponent(id)}`,
        cache: 'no-store',
        expectedSessionOwner: owner,
        timeout: 5000,
      }),
    }),
    registerWebPush: builder.mutation<{ id: string }, { owner: string; registration: WebPushRegistration }>({
      query: ({ owner, registration }) => ({
        url: `${route}/subscriptions`,
        method: 'POST',
        body: registration,
        expectedSessionOwner: owner,
        timeout: 8000,
      }),
    }),
    disableWebPush: builder.mutation<void, { owner: string; id: string }>({
      query: ({ owner, id }) => ({
        url: `${route}/subscriptions/${encodeURIComponent(id)}`,
        method: 'DELETE',
        expectedSessionOwner: owner,
        timeout: 3000,
      }),
    }),
  }),
});

export const {
  useGetWebPushKeyQuery,
  useRegisterWebPushMutation,
  useDisableWebPushMutation,
  useLazyGetWebPushSubscriptionStatusQuery,
} = webPushApi;
