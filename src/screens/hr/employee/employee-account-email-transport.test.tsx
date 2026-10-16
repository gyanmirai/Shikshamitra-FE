import type { EmployeeAccountEmail, ChangeEmployeeAccountEmail } from 'src/redux/hr/employee-account-email-api';

import { Provider } from 'react-redux';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { configureStore } from '@reduxjs/toolkit';
import { it, vi, expect, afterAll, afterEach } from 'vitest';
import { employeeAccountEmailApi } from 'src/redux/hr/employee-account-email-api';
import { act, render, screen, cleanup, waitFor, fireEvent } from '@testing-library/react';

import { EmployeeAccountEmailDialog } from './employee-account-email-action';

const originalApiUrl = vi.hoisted(() => {
  const original = process.env.NEXT_PUBLIC_API_URL;
  process.env.NEXT_PUBLIC_API_URL = 'http://account-email-transport.test';
  return original;
});
vi.mock('src/redux/session-cache', () => ({
  getCachedAuthSession: async () => ({ accessToken: 'synthetic-test-token' }),
  clearCachedAuthSession: vi.fn(),
  getAuthSessionCacheRevision: () => 0,
  isAuthSessionCacheCurrent: () => true,
}));
vi.mock('src/routes/hooks', () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock('src/hooks/use-unsaved-navigation', () => ({
  useUnsavedNavigation: () => ({ requestNavigation: (proceed: () => void) => proceed(), confirmation: null }),
}));

const origin = 'http://account-email-transport.test/api';
const employeeId = 'synthetic-employee';
const before: EmployeeAccountEmail = {
  userId: 'synthetic-account', employeeEmail: 'old@example.test', accountEmail: 'old@example.test',
  userName: 'old@example.test', concurrencyToken: 'account-version-1',
};
const reason = 'HR verified the corrected account address';
const connectionMessage = 'The request could not be confirmed. Check your connection and try again.';
const parsingMessage = 'The server response could not be read. Try again.';
const stores: ReturnType<typeof makeStore>[] = [];

function makeStore() {
  return configureStore({
    reducer: {
      [employeeAccountEmailApi.reducerPath]: employeeAccountEmailApi.reducer,
      confirmPopup: () => ({ isChanges: false }),
    },
    middleware: (defaults) => defaults().concat(employeeAccountEmailApi.middleware),
  });
}

afterEach(async () => {
  cleanup();
  await act(async () => { stores.forEach((store) => store.dispatch(employeeAccountEmailApi.util.resetApiState())); });
  stores.length = 0;
});
afterAll(() => {
  if (originalApiUrl === undefined) delete process.env.NEXT_PUBLIC_API_URL;
  else process.env.NEXT_PUBLIC_API_URL = originalApiUrl;
});

it.each([
  ['FETCH_ERROR', false], ['FETCH_ERROR', true],
  ['PARSING_ERROR', false], ['PARSING_ERROR', true],
] as const)('keeps the committed-but-unacknowledged %s draft/key, with background refresh=%s, and retries without another write', async (failure, refresh) => {
  const store = makeStore();
  stores.push(store);
  let server = { ...before };
  let commits = 0;
  const requests: ChangeEmployeeAccountEmail[] = [];
  const acknowledged = new Map<string, ChangeEmployeeAccountEmail>();
  const onClose = vi.fn();
  mswServer.use(
    http.get(`${origin}/employees/${employeeId}/account-email`, () => HttpResponse.json(server)),
    http.put(`${origin}/employees/${employeeId}/account-email`, async ({ request }) => {
      expect(request.headers.get('authorization')).toBe('Bearer synthetic-test-token');
      const body = await request.json() as ChangeEmployeeAccountEmail;
      requests.push(body);
      const previous = acknowledged.get(body.idempotencyKey);
      if (previous) {
        // Model the existing server replay precedence, before stale-token rejection.
        expect(body).toEqual(previous);
        return HttpResponse.json(server);
      }
      expect(body.concurrencyToken).toBe(server.concurrencyToken);
      expect(body.idempotencyKey).toMatch(/^[a-f0-9-]{36}$/i);
      commits += 1;
      acknowledged.set(body.idempotencyKey, body);
      server = { ...server, employeeEmail: body.email, accountEmail: body.email,
        userName: body.email, concurrencyToken: 'account-version-2' };
      // Response failure happens AFTER the fixture has committed the requested change.
      return failure === 'FETCH_ERROR' ? HttpResponse.error()
        : new HttpResponse('{interrupted-json', { status: 200, headers: { 'Content-Type': 'application/json' } });
    }),
  );
  render(<Provider store={store}><EmployeeAccountEmailDialog employeeId={employeeId} onClose={onClose} /></Provider>);
  expect(await screen.findByLabelText('New email')).toHaveValue(before.accountEmail);
  await act(async () => {
    fireEvent.change(screen.getByLabelText('New email'), { target: { value: 'new@example.test' } });
    fireEvent.change(screen.getByLabelText('Reason'), { target: { value: reason } });
    fireEvent.click(screen.getByLabelText('HR verified this address with the employee'));
  });
  fireEvent.click(screen.getByRole('button', { name: 'Change email' }));
  await waitFor(() => expect(commits).toBe(1));
  await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent(
    failure === 'FETCH_ERROR' ? connectionMessage : parsingMessage,
  ));
  expect(server.accountEmail).toBe('new@example.test');
  expect(onClose).not.toHaveBeenCalled();
  expect(screen.getByRole('alert')).not.toHaveTextContent(/could not be changed|TypeError|SyntaxError|interrupted-json/);
  if (refresh) {
    await act(async () => {
      await store.dispatch(employeeAccountEmailApi.endpoints.getEmployeeAccountEmail.initiate(employeeId,
        { forceRefetch: true, subscribe: false })).unwrap();
    });
    expect(employeeAccountEmailApi.endpoints.getEmployeeAccountEmail.select(employeeId)(store.getState()).data?.accountEmail)
      .toBe(server.accountEmail);
  }
  expect(screen.getByLabelText('Current account email')).toHaveValue(before.accountEmail);
  expect(screen.getByLabelText('New email')).toHaveValue('new@example.test');
  expect(screen.getByLabelText('Reason')).toHaveValue(reason);
  expect(screen.getByLabelText('HR verified this address with the employee')).toBeChecked();
  expect(screen.getByRole('button', { name: 'Change email' })).toBeEnabled();
  fireEvent.click(screen.getByRole('button', { name: 'Change email' }));
  await waitFor(() => expect(onClose).toHaveBeenCalledOnce());
  expect(requests).toHaveLength(2);
  expect(requests[1]).toEqual(requests[0]);
  expect(commits).toBe(1);
  expect(requests[1].concurrencyToken).toBe(before.concurrencyToken);
});
