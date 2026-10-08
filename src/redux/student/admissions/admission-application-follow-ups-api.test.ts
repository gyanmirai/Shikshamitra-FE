import { api } from 'src/redux/service';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { studentAdmissionsCrmType } from 'src/redux/tagTypes';
import { it, vi, expect, afterEach, beforeEach } from 'vitest';
import { clearCachedAuthSession } from 'src/redux/session-cache';

import { createDocumentTestStore } from './document-test-fixture';
import { admissionApplicationFollowUpsApi } from './admission-application-follow-ups-api';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
});
let store: ReturnType<typeof createDocumentTestStore>;
beforeEach(() => {
  clearCachedAuthSession();
  store = createDocumentTestStore();
  mswServer.use(http.get('*/api/auth/session', () => HttpResponse.json(null)));
});
afterEach(() => {
  store.dispatch(api.util.resetApiState());
  clearCachedAuthSession();
});

it('uses application-scoped follow-up routes, stamps, envelope normalization, and refresh tags', async () => {
  const root = '*/api/student/enrollment/admissions/applications/application-1/follow-ups';
  const requests: { path: string; body: unknown }[] = [];
  const response = {
    inquiryId: 'inquiry-1',
    canManageFollowUps: false,
    followUps: [],
    concurrencyStamp: 'next',
  };
  const capture = async ({ request }: { request: Request }) => {
    requests.push({ path: new URL(request.url).pathname, body: await request.json() });
    return HttpResponse.json(response);
  };
  mswServer.use(
    http.get(root, () => HttpResponse.json({ data: response })),
    http.post(root, capture),
    http.post(`${root}/follow-up-1/complete`, capture),
    http.post(`${root}/follow-up-1/cancel`, capture)
  );
  const { endpoints } = admissionApplicationFollowUpsApi;
  const query = store.dispatch(
    endpoints.getAdmissionApplicationFollowUps.initiate('application-1')
  );
  expect(await query.unwrap()).toEqual(response);
  const provided = api.util.selectInvalidatedBy(store.getState(), [
    studentAdmissionsCrmType.admissionApplication,
  ]);
  expect(provided.some((entry) => entry.endpointName === 'getAdmissionApplicationFollowUps')).toBe(
    true
  );
  query.unsubscribe();
  const common = { applicationId: 'application-1', concurrencyStamp: 'inquiry-stamp' };
  await store
    .dispatch(
      endpoints.scheduleAdmissionApplicationFollowUp.initiate({
        ...common,
        scheduledAt: '2026-10-08T10:00:00+05:30',
        purpose: 'Call parent',
      })
    )
    .unwrap();
  const finish = {
    ...common,
    followUpId: 'follow-up-1',
    followUpConcurrencyStamp: 'follow-up-stamp',
    note: 'Confirmed',
  };
  await store.dispatch(endpoints.completeAdmissionApplicationFollowUp.initiate(finish)).unwrap();
  await store.dispatch(endpoints.cancelAdmissionApplicationFollowUp.initiate(finish)).unwrap();
  expect(requests).toEqual([
    {
      path: '/api/student/enrollment/admissions/applications/application-1/follow-ups',
      body: {
        concurrencyStamp: 'inquiry-stamp',
        scheduledAt: '2026-10-08T10:00:00+05:30',
        purpose: 'Call parent',
      },
    },
    {
      path: '/api/student/enrollment/admissions/applications/application-1/follow-ups/follow-up-1/complete',
      body: {
        concurrencyStamp: 'inquiry-stamp',
        followUpConcurrencyStamp: 'follow-up-stamp',
        note: 'Confirmed',
      },
    },
    {
      path: '/api/student/enrollment/admissions/applications/application-1/follow-ups/follow-up-1/cancel',
      body: {
        concurrencyStamp: 'inquiry-stamp',
        followUpConcurrencyStamp: 'follow-up-stamp',
        note: 'Confirmed',
      },
    },
  ]);
});
