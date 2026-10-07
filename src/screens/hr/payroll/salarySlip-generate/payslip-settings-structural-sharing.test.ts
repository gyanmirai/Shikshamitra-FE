import { it, expect } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import { createApi } from '@reduxjs/toolkit/query';

it('retains the settings reference for identical network refreshes and changes it for different server evidence', async () => {
  let server = { schoolName: 'Synthetic school', schoolAddress: 'Synthetic address', automaticEmail: false,
    concurrencyStamp: 'version-1', idempotencyKey: 'request-1' };
  const api = createApi({ reducerPath: 'settingsReferenceProbe', baseQuery: async () => ({ data: { ...server } }),
    endpoints: (builder) => ({ settings: builder.query<typeof server, void>({ query: () => '/payroll/payslip-settings' }) }) });
  const store = configureStore({ reducer: { [api.reducerPath]: api.reducer }, middleware: (defaults) => defaults().concat(api.middleware) });
  const first = store.dispatch(api.endpoints.settings.initiate());
  await first.unwrap();
  const initial = api.endpoints.settings.select()(store.getState()).data;
  const refreshed = store.dispatch(api.endpoints.settings.initiate(undefined, { forceRefetch: true }));
  await refreshed.unwrap();
  expect(api.endpoints.settings.select()(store.getState()).data).toBe(initial);
  server = { ...server, schoolName: 'Changed school', concurrencyStamp: 'version-2' };
  const changed = store.dispatch(api.endpoints.settings.initiate(undefined, { forceRefetch: true }));
  await changed.unwrap();
  expect(api.endpoints.settings.select()(store.getState()).data).not.toBe(initial);
  first.unsubscribe(); refreshed.unsubscribe(); changed.unsubscribe();
  store.dispatch(api.util.resetApiState());
});
