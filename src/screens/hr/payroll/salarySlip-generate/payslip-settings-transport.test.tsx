import type { PayslipSettings } from 'src/redux/hr/payslip-api';

import { Provider } from 'react-redux';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { configureStore } from '@reduxjs/toolkit';
import { payslipApi } from 'src/redux/hr/payslip-api';
import { it, vi, expect, afterAll, afterEach } from 'vitest';
import { act, render, screen, cleanup, waitFor, fireEvent } from '@testing-library/react';

import PayslipSettingsForm from './payslip-settings-form';

const originalApiUrl = vi.hoisted(() => {
  const original = process.env.NEXT_PUBLIC_API_URL;
  process.env.NEXT_PUBLIC_API_URL = 'http://payslip-settings-transport.test';
  return original;
});
vi.mock('src/redux/session-cache', () => ({
  getCachedAuthSession: async () => ({ accessToken: 'synthetic-test-token' }),
  clearCachedAuthSession: vi.fn(),
  getAuthSessionCacheRevision: () => 0,
  isAuthSessionCacheCurrent: () => true,
}));
vi.mock('src/components/toast', () => ({ shikshaMitraToast: { success: vi.fn() } }));
vi.mock('src/routes/hooks', () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock('src/hooks/use-unsaved-navigation', () => ({
  useUnsavedNavigation: () => ({ requestNavigation: (proceed: () => void) => proceed(), confirmation: null }),
}));

const url = 'http://payslip-settings-transport.test/api/payroll/payslip-settings';
const before: PayslipSettings = {
  schoolName: 'Original synthetic school', schoolAddress: 'Synthetic Test Road',
  automaticEmail: false, concurrencyStamp: 'settings-version-1', idempotencyKey: 'previous-request',
};
const stores: ReturnType<typeof makeStore>[] = [];
function makeStore() {
  return configureStore({
    reducer: { [payslipApi.reducerPath]: payslipApi.reducer },
    middleware: (defaults) => defaults().concat(payslipApi.middleware),
  });
}

afterEach(async () => {
  cleanup();
  await act(async () => { stores.forEach((store) => store.dispatch(payslipApi.util.resetApiState())); });
  stores.length = 0;
});
afterAll(() => {
  if (originalApiUrl === undefined) delete process.env.NEXT_PUBLIC_API_URL;
  else process.env.NEXT_PUBLIC_API_URL = originalApiUrl;
});

it.each([
  ['FETCH_ERROR', false], ['FETCH_ERROR', true],
  ['PARSING_ERROR', false], ['PARSING_ERROR', true],
] as const)('preserves committed settings and the %s request for acknowledgement, with dirty refresh=%s', async (failure, refresh) => {
  const store = makeStore();
  stores.push(store);
  let persisted = { ...before };
  let commits = 0;
  let accepted: PayslipSettings | undefined;
  const requests: PayslipSettings[] = [];
  mswServer.use(
    http.get(url, () => HttpResponse.json(persisted)),
    http.put(url, async ({ request }) => {
      expect(request.headers.get('authorization')).toBe('Bearer synthetic-test-token');
      const body = await request.json() as PayslipSettings;
      requests.push(body);
      if (accepted?.idempotencyKey === body.idempotencyKey) {
        // Match the existing server's replay-before-stale-token precedence.
        expect(body).toEqual(accepted);
        return HttpResponse.json(persisted);
      }
      expect(body.concurrencyStamp).toBe(persisted.concurrencyStamp);
      expect(body.idempotencyKey).toMatch(/^[a-f0-9-]{36}$/i);
      commits += 1;
      accepted = body;
      persisted = { ...body, concurrencyStamp: 'settings-version-2' };
      return failure === 'FETCH_ERROR' ? HttpResponse.error()
        : new HttpResponse('{interrupted-json', { status: 200, headers: { 'Content-Type': 'application/json' } });
    }),
  );
  render(<Provider store={store}><PayslipSettingsForm canEdit /></Provider>);
  expect(await screen.findByLabelText('School name')).toHaveValue(before.schoolName);
  fireEvent.change(screen.getByLabelText('School name'), { target: { value: 'Saved synthetic school' } });
  fireEvent.change(screen.getByLabelText('School address'), { target: { value: 'Saved Synthetic Road' } });
  fireEvent.click(screen.getByRole('button', { name: 'Save' }));
  await waitFor(() => expect(commits).toBe(1));
  const message = failure === 'FETCH_ERROR'
    ? 'The request could not be confirmed. Check your connection and try again.'
    : 'The server response could not be read. Try again.';
  await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent(message));
  expect(screen.getByRole('alert')).not.toHaveTextContent(/could not be saved|TypeError|SyntaxError|interrupted-json/);
  expect(persisted.schoolName).toBe('Saved synthetic school');
  if (refresh) {
    await act(async () => {
      await store.dispatch(payslipApi.endpoints.getPayslipSettings.initiate(undefined,
        { forceRefetch: true, subscribe: false })).unwrap();
    });
    expect(payslipApi.endpoints.getPayslipSettings.select()(store.getState()).data?.concurrencyStamp)
      .toBe('settings-version-2');
  }
  expect(screen.getByLabelText('School name')).toHaveValue('Saved synthetic school');
  expect(screen.getByLabelText('School address')).toHaveValue('Saved Synthetic Road');
  expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled();
  fireEvent.click(screen.getByRole('button', { name: 'Save' }));
  await waitFor(() => expect(requests).toHaveLength(2));
  await waitFor(() => expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled());
  expect(requests[1]).toEqual(requests[0]);
  expect(requests[1].concurrencyStamp).toBe(before.concurrencyStamp);
  expect(commits).toBe(1);
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
});
