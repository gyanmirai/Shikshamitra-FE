import { Provider } from 'react-redux';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { configureStore } from '@reduxjs/toolkit';
import { payslipApi } from 'src/redux/hr/payslip-api';
import { it, vi, expect, afterAll, afterEach } from 'vitest';
import { act, render, screen, waitFor, cleanup, fireEvent } from '@testing-library/react';

import PayslipSettingsForm from './payslip-settings-form';

const originalApiUrl = vi.hoisted(() => {
  const original = process.env.NEXT_PUBLIC_API_URL;
  process.env.NEXT_PUBLIC_API_URL = 'http://payslip-settings.test';
  return original;
});
const fixture = { schoolName: 'Original school', schoolAddress: 'Synthetic address', automaticEmail: false,
  concurrencyStamp: 'version-1', idempotencyKey: 'request-1' };

vi.mock('src/redux/session-cache', () => ({ getCachedAuthSession: async () => ({ accessToken: 'synthetic-test-token' }), clearCachedAuthSession: vi.fn() }));
vi.mock('src/components/toast', () => ({ shikshaMitraToast: { success: vi.fn() } }));
vi.mock('src/routes/hooks', () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock('src/hooks/use-unsaved-navigation', () => ({ useUnsavedNavigation: () => ({ requestNavigation: (proceed: () => void) => proceed(), confirmation: null }) }));

const stores: ReturnType<typeof makeStore>[] = [];
function makeStore() {
  return configureStore({ reducer: { [payslipApi.reducerPath]: payslipApi.reducer },
    middleware: (defaults) => defaults().concat(payslipApi.middleware) });
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

it.each([false, true])('keeps an acknowledged save after a late earlier GET and a subsequent failed refresh=%s', async (failFreshRead) => {
  const store = makeStore(); stores.push(store);
  let server = { ...fixture };
  let reads = 0;
  let writes = 0;
  let releaseOldRead!: () => void;
  const oldRead = new Promise<void>((resolve) => { releaseOldRead = resolve; });
  let releaseFreshRead!: () => void;
  const freshRead = new Promise<void>((resolve) => { releaseFreshRead = resolve; });
  mswServer.use(
    http.get('http://payslip-settings.test/api/payroll/payslip-settings', async () => {
      reads += 1;
      const response = { ...server };
      if (reads === 2) await oldRead;
      if (reads === 3) {
        await freshRead;
        if (failFreshRead) return HttpResponse.json({ detail: 'Synthetic refresh failure' }, { status: 503 });
      }
      return HttpResponse.json(response);
    }),
    http.put('http://payslip-settings.test/api/payroll/payslip-settings', async ({ request }) => {
      expect(request.headers.get('authorization')).toBe('Bearer synthetic-test-token');
      const submitted = await request.json() as typeof fixture;
      // Match the backend optimistic-concurrency requirement for every write.
      expect(submitted.concurrencyStamp).toBe(server.concurrencyStamp);
      writes += 1;
      server = { ...submitted, concurrencyStamp: `version-${writes + 1}` };
      return HttpResponse.json(server);
    }),
  );
  render(<Provider store={store}><PayslipSettingsForm canEdit /></Provider>);
  expect(await screen.findByLabelText('School name')).toHaveValue('Original school');
  fireEvent.change(screen.getByLabelText('School name'), { target: { value: 'First saved school' } });
  fireEvent.click(screen.getByRole('button', { name: 'Save' }));
  await waitFor(() => expect(writes).toBe(1));
  await waitFor(() => expect(reads).toBe(2));
  await waitFor(() => expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled());
  // The first write starts a background GET of v2 while the cache still contains v1.
  // A second valid v2 write can finish before that GET reaches the client.
  fireEvent.change(screen.getByLabelText('School name'), { target: { value: 'Saved school' } });
  fireEvent.click(screen.getByRole('button', { name: 'Save' }));
  await waitFor(() => expect(writes).toBe(2));
  await waitFor(() => expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled());
  expect(screen.getByLabelText('School name')).toHaveValue('Saved school');
  await act(async () => { releaseOldRead(); });
  await waitFor(() => expect(reads).toBe(3));
  await waitFor(() => expect(payslipApi.endpoints.getPayslipSettings.select()(store.getState()).data?.concurrencyStamp).toBe('version-2'));
  await act(async () => {});
  expect(screen.getByLabelText('School name')).toHaveValue('Saved school');
  await act(async () => { releaseFreshRead(); });
  if (failFreshRead) {
    expect(await screen.findByRole('alert')).toHaveTextContent('Settings could not be refreshed. Your changes have been kept.');
    expect(screen.getByLabelText('School name')).toHaveValue('Saved school');
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
  } else {
    await waitFor(() => expect(payslipApi.endpoints.getPayslipSettings.select()(store.getState()).data?.concurrencyStamp).toBe('version-3'));
  }
  // A later completed refresh must still update a clean form normally.
  server = { ...server, schoolName: 'Subsequent server value', concurrencyStamp: 'version-4' };
  if (failFreshRead) fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
  else await act(async () => { await store.dispatch(payslipApi.endpoints.getPayslipSettings.initiate(undefined, { forceRefetch: true })); });
  await waitFor(() => expect(screen.getByLabelText('School name')).toHaveValue('Subsequent server value'));
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
});
