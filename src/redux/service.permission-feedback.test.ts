import { toast } from 'sonner';
import { configureStore } from '@reduxjs/toolkit';
import { signOut, getSession } from 'next-auth/react';
import { it, vi, expect, afterEach, beforeEach } from 'vitest';

import { api } from './service';
import { clearCachedAuthSession } from './session-cache';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
});
vi.mock('next-auth/react', () => ({ getSession: vi.fn(), signOut: vi.fn() }));
vi.mock('sonner', () => ({ toast: { error: vi.fn() } }));

const probeApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getPayrollPolicies: builder.query<unknown, { method?: string; blob?: boolean }>({
      query: ({ method = 'GET', blob }) => ({
        url: '/hr/payroll/policies',
        method,
        ...(blob ? { responseHandler: (response: Response) => response.blob() } : {}),
      }),
    }),
    unknownPermissionProbe: builder.query<unknown, void>({
      query: () => '/unknown/private-record-id?email=private@example.test',
    }),
  }),
});

const message =
  'Your account cannot view payroll policies. Ask your administrator to review your permissions and assigned data access, then try again.';
const generic = "You don't have permission to access this resource.";
const createStore = () =>
  configureStore({
    reducer: { [api.reducerPath]: api.reducer },
    middleware: (defaults) => defaults().concat(api.middleware),
  });
let store: ReturnType<typeof createStore>;

beforeEach(() => {
  vi.clearAllMocks();
  clearCachedAuthSession();
  vi.mocked(getSession).mockResolvedValue({
    accessToken: 'synthetic-token',
    expires: '2099-01-01',
  } as Awaited<ReturnType<typeof getSession>>);
  store = createStore();
});
afterEach(() => {
  store.dispatch(api.util.resetApiState());
  clearCachedAuthSession();
  vi.unstubAllGlobals();
});

const respond = (status: number, body: unknown) => {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue(
      new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })
    )
  );
};

it.each(['GET', 'POST'])('adds reviewed operation context to a %s request without inferring a grant', async (method) => {
  respond(403, { detail: generic, traceId: 'synthetic-trace' });
  const { error } = await store.dispatch(probeApi.endpoints.getPayrollPolicies.initiate({ method }));
  expect(error).toMatchObject({
    status: 403,
    data: { detail: message, message, traceId: 'synthetic-trace' },
  });
  expect(signOut).not.toHaveBeenCalled();
  expect(toast.error).not.toHaveBeenCalled();
});

it('normalizes ABP message readers while preserving the original code and metadata', async () => {
  respond(403, {
    error: { code: 'Volo.Authorization:010002', message: generic, data: { supportKey: 'kept' } },
  });
  const { error } = await store.dispatch(probeApi.endpoints.getPayrollPolicies.initiate({}));
  expect(error).toMatchObject({
    status: 403,
    data: {
      detail: message,
      message,
      error: {
        code: 'Volo.Authorization:010002',
        message,
        data: { supportKey: 'kept' },
      },
    },
  });
});

it('keeps an HTML403 a permission failure without exposing proxy content', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('<html>internal/private-path</html>', { status: 403 })));
  const { error } = await store.dispatch(probeApi.endpoints.getPayrollPolicies.initiate({}));
  expect(error).toMatchObject({ status: 403, data: { detail: message } });
  expect(JSON.stringify(error)).not.toContain('private-path');
});

it('reads403 JSON returned through a download blob handler', async () => {
  respond(403, { detail: generic });
  const { error } = await store.dispatch(probeApi.endpoints.getPayrollPolicies.initiate({ blob: true }));
  expect(error).toMatchObject({ status: 403, data: { detail: message } });
});

it('preserves a specific scope denial returned through a download handler', async () => {
  const body = { errorCode: 'UserScope:AccessDenied', detail: 'This document is outside your assigned classes.' };
  respond(403, body);
  const { error } = await store.dispatch(probeApi.endpoints.getPayrollPolicies.initiate({ blob: true }));
  expect(error).toEqual({ status: 403, data: body });
});

it('preserves the Add Staff policy-specific code and missing grant metadata', async () => {
  const body = {
    errorCode: 'HR:Employee:010043',
    detail: 'Policy access is required to add staff.',
    data: { missingPermissions: ['HR.Policies.Assign'] },
  };
  respond(403, body);
  const { error } = await store.dispatch(probeApi.endpoints.getPayrollPolicies.initiate({}));
  expect(error).toEqual({ status: 403, data: body });
});

it.each([400, 409, 503])('does not rewrite nonpermission status %s', async (status) => {
  const body = { detail: 'Existing domain guidance.', errorCode: 'Domain:Specific' };
  respond(status, body);
  const { error } = await store.dispatch(probeApi.endpoints.getPayrollPolicies.initiate({}));
  expect(error).toEqual({ status, data: body });
});

it('uses an honest unknown-operation fallback without reflecting IDs or query strings', async () => {
  respond(403, null);
  const { error } = await store.dispatch(probeApi.endpoints.unknownPermissionProbe.initiate());
  expect(error).toMatchObject({
    status: 403,
    data: { detail: 'Your account cannot complete this action. Ask your administrator to review your permissions and assigned data access, then try again.' },
  });
  expect(JSON.stringify(error)).not.toContain('private');
});
