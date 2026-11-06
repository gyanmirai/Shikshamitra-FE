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
