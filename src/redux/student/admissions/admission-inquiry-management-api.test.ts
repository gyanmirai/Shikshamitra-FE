import { api } from 'src/redux/service';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { it, vi, expect, afterEach, beforeEach } from 'vitest';
import { clearCachedAuthSession } from 'src/redux/session-cache';

import { createDocumentTestStore } from './document-test-fixture';
import { admissionInquiryManagementApi } from './admission-inquiry-management-api';

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

it('uses the nested inquiry management routes and keeps identifiers out of command bodies', async () => {
  const root = '*/api/student/enrollment/admissions/inquiries/inquiry-1/management';
  const requests: { path: string; body: unknown }[] = [];
  mswServer.use(
    http.get(root, () =>
      HttpResponse.json({
        data: { inquiryId: 'inquiry-1', managed: true, blockers: [], followUps: [] },
      })
    ),
    http.post(`${root}/*`, async ({ request }) => {
      requests.push({
        path: new URL(request.url).pathname.split('/management/')[1],
        body: await request.json(),
      });
      return HttpResponse.json({
        data: { inquiryId: 'inquiry-1', managed: true, blockers: [], followUps: [] },
      });
    })
  );
  const { endpoints } = admissionInquiryManagementApi;
  await store.dispatch(endpoints.getAdmissionInquiryManagement.initiate('inquiry-1')).unwrap();
  await store
    .dispatch(
      endpoints.recordAdmissionInquiryContact.initiate({
        inquiryId: 'inquiry-1',
        concurrencyStamp: 'stamp',
        channel: 'PHONE',
        direction: 'OUTBOUND',
        outcome: 'CONNECTED',
        note: 'Called guardian',
      })
    )
    .unwrap();
  await store
    .dispatch(
      endpoints.scheduleAdmissionInquiryFollowUp.initiate({
        inquiryId: 'inquiry-1',
        concurrencyStamp: 'stamp',
        scheduledAt: '2026-09-12T05:30:00.000Z',
        purpose: 'Campus visit',
      })
    )
    .unwrap();
  await store
    .dispatch(
      endpoints.completeAdmissionInquiryFollowUp.initiate({
        inquiryId: 'inquiry-1',
        followUpId: 'follow-1',
        concurrencyStamp: 'stamp',
        followUpConcurrencyStamp: 'follow-stamp',
        note: 'Visited',
      })
    )
    .unwrap();
  await store
    .dispatch(
      endpoints.qualifyAdmissionInquiry.initiate({
        inquiryId: 'inquiry-1',
        concurrencyStamp: 'stamp',
        outcome: 0,
        reason: 'Eligible',
        answers: [{ code: 'AGE', passed: true }],
      })
    )
    .unwrap();
  expect(requests).toEqual([
    {
      path: 'contact',
      body: {
        concurrencyStamp: 'stamp',
        channel: 'PHONE',
        direction: 'OUTBOUND',
        outcome: 'CONNECTED',
        note: 'Called guardian',
      },
    },
    {
      path: 'follow-ups',
      body: {
        concurrencyStamp: 'stamp',
        scheduledAt: '2026-09-12T05:30:00.000Z',
        purpose: 'Campus visit',
      },
    },
    {
      path: 'follow-ups/follow-1/complete',
      body: {
        concurrencyStamp: 'stamp',
        followUpConcurrencyStamp: 'follow-stamp',
        note: 'Visited',
      },
    },
    {
      path: 'qualification',
      body: {
        concurrencyStamp: 'stamp',
        outcome: 0,
        reason: 'Eligible',
        answers: [{ code: 'AGE', passed: true }],
      },
    },
  ]);
});
