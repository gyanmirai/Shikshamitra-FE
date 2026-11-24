import { it, vi, expect } from 'vitest';

import './admission-parent-registration-api';

const endpoints = vi.hoisted(() => ({}) as Record<string, any>);
vi.mock('src/redux/service', () => ({
  api: {
    injectEndpoints: (input: any) => {
      Object.assign(
        endpoints,
        input.endpoints({ query: (value: any) => value, mutation: (value: any) => value })
      );
      return {};
    },
  },
}));

it('uses the saved recipient command and unwraps staff Result without exposing a token', () => {
  expect(
    endpoints.sendParentRegistration.query({
      applicationId: 'app',
      input: {
        recipientRelationship: 'mother',
        concurrencyStamp: 'snapshot',
        idempotencyKey: 'retry',
      },
    })
  ).toEqual({
    url: '/student/enrollment/admissions/applications/app/parent-registration/send',
    method: 'POST',
    body: {
      recipientRelationship: 'mother',
      concurrencyStamp: 'snapshot',
      idempotencyKey: 'retry',
    },
  });
  expect(
    endpoints.getParentRegistration.transformResponse({
      data: { applicationId: 'app', request: null },
    })
  ).toEqual({ applicationId: 'app', request: null });
});

it('loads the scoped email history only through its read-only endpoint', () => {
  expect(endpoints.getParentRegistrationEmailHistory.query('app')).toEqual({
    url: '/student/enrollment/admissions/applications/app/parent-registration/email-history',
  });
  expect(endpoints.getParentRegistrationEmailHistory.transformResponse({ data: [] })).toEqual([]);
});

it('reactivates a specific grant without putting a private URL in staff context', () => {
  const input = {
    requestId: 'grant',
    validityDays: 12,
    concurrencyStamp: 'snapshot',
    idempotencyKey: 'retry',
  };
  const endpoint = endpoints.reactivateParentRegistration;
  expect(endpoint.query({ applicationId: 'app', input })).toEqual({
    url: '/student/enrollment/admissions/applications/app/parent-registration/reactivate',
    method: 'POST',
    body: input,
  });
  const context = { applicationId: 'app', canReactivate: false, request: { id: 'grant' } };
  expect(endpoint.transformResponse({ data: context })).toEqual(context);
  expect(endpoint.invalidatesTags(context, undefined)).toEqual(
    endpoints.sendParentRegistration.invalidatesTags(context, undefined)
  );
  expect(endpoint.invalidatesTags(undefined, { status: 409 })).toEqual([]);
});

it('copies the private URL without returning it in the mutation data', async () => {
  const link = `https://school.example/admission-registration#token=${'a'.repeat(64)}`;
  const writeText = vi.fn().mockResolvedValue(undefined);
  vi.stubGlobal('navigator', { clipboard: { writeText } });
  try {
    const input = { requestId: 'grant', concurrencyStamp: 'snapshot', idempotencyKey: 'retry' };
    const baseQuery = vi.fn().mockResolvedValue({ data: { data: link } });
    const { signal } = new AbortController();
    const endpoint = endpoints.copyParentRegistrationLink;

    await expect(
      endpoint.queryFn({ applicationId: 'app', input }, { signal }, {}, baseQuery)
    ).resolves.toEqual({ data: { copied: true } });
    expect(baseQuery).toHaveBeenCalledExactlyOnceWith({
      url: '/student/enrollment/admissions/applications/app/parent-registration/copy-link',
      method: 'POST',
      body: input,
      cache: 'no-store',
    });
    expect(writeText).toHaveBeenCalledExactlyOnceWith(link);
    writeText.mockRejectedValueOnce(new Error('Clipboard denied'));
    await expect(
      endpoint.queryFn({ applicationId: 'app', input }, { signal }, {}, baseQuery)
    ).resolves.toEqual({ data: { copied: false } });
    writeText.mockClear();
    const aborted = AbortSignal.abort();
    await expect(
      endpoint.queryFn({ applicationId: 'app', input }, { signal: aborted }, {}, baseQuery)
    ).resolves.toEqual({ data: { copied: false } });
    expect(writeText).not.toHaveBeenCalled();
  } finally {
    vi.unstubAllGlobals();
  }
});

it('saves parent email with optimistic contact identity and invalidates staff application caches', () => {
  const input = {
    recipientRelationship: 'mother',
    email: 'new@example.test',
    expectedEmail: 'saved@example.test',
    concurrencyStamp: 'snapshot',
    idempotencyKey: 'retry',
  };
  expect(endpoints.changeParentRegistrationEmail.query({ applicationId: 'app', input })).toEqual({
    url: '/student/enrollment/admissions/applications/app/parent-registration/email',
    method: 'POST',
    body: input,
  });
  expect(endpoints.changeParentRegistrationEmail.invalidatesTags({}, undefined)).toEqual(
    endpoints.sendParentRegistration.invalidatesTags({}, undefined)
  );
  expect(
    endpoints.changeParentRegistrationEmail.invalidatesTags(undefined, { status: 409 })
  ).toEqual([]);
});
