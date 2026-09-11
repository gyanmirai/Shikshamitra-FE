import { api } from 'src/redux/service';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { waitFor } from '@testing-library/react';
import { it, vi, expect, afterEach, beforeEach } from 'vitest';
import { clearCachedAuthSession } from 'src/redux/session-cache';

import { admissionReviewApi } from './admission-review-api';
import { createDocumentTestStore } from './document-test-fixture';
import { reviewKey, reviewPath, reviewRecord, reviewSummary } from './review-test-fixture';

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

it('submits supplied checklist and stamp, then refreshes subscribed review, history and queue', async () => {
  let submitted = false;
  let body: unknown;
  let queueReads = 0;
  const queueInput = { skipCount: 20, maxResultCount: 20, overdueOnly: true, assignedToMe: true };
  mswServer.use(
    http.get(reviewPath, () =>
      HttpResponse.json({
        data: { ...reviewSummary, latestRecord: submitted ? reviewRecord : null },
      })
    ),
    http.get(`${reviewPath}/history`, () => HttpResponse.json(submitted ? [reviewRecord] : [])),
    http.get('*/api/student/enrollment/admissions/reviews/queue', ({ request }) => {
      const params = new URL(request.url).searchParams;
      expect(Object.fromEntries(params)).toEqual({
        skipCount: '20',
        maxResultCount: '20',
        overdueOnly: 'true',
        assignedToMe: 'true',
      });
      queueReads += 1;
      return HttpResponse.json({ data: { items: [], totalCount: 0 } });
    }),
    http.post(`${reviewPath}/submit`, async ({ request }) => {
      body = await request.json();
      submitted = true;
      return HttpResponse.json({ data: { ...reviewSummary, latestRecord: reviewRecord } });
    })
  );
  const { endpoints } = admissionReviewApi;
  await store.dispatch(endpoints.getApplicationReview.initiate(reviewKey)).unwrap();
  await store.dispatch(endpoints.getAdmissionReviewHistory.initiate(reviewKey)).unwrap();
  await store.dispatch(endpoints.getAdmissionReviewQueue.initiate(queueInput)).unwrap();
  const input = {
    concurrencyStamp: 'application-stamp',
    notes: 'Notes',
    recommendation: 'approve' as const,
    reason: 'Confirmed',
    checklist: [{ code: 'IDENTITY', checked: true, notes: null }],
  };
  await store
    .dispatch(endpoints.submitAdmissionReview.initiate({ ...reviewKey, ...input }))
    .unwrap();
  expect(body).toEqual(input);
  await waitFor(() => {
    expect(
      endpoints.getApplicationReview.select(reviewKey)(store.getState()).data?.latestRecord?.id
    ).toBe('record-1');
    expect(
      endpoints.getAdmissionReviewHistory.select(reviewKey)(store.getState()).data
    ).toHaveLength(1);
    expect(queueReads).toBe(2);
  });
});

it('uses explicit draft, assignment and correction routes without sending key fields in the body', async () => {
  const requests: { path: string; body: unknown }[] = [];
  mswServer.use(
    http.post(`${reviewPath}/*`, async ({ request }) => {
      requests.push({
        path: new URL(request.url).pathname.split('/review-1/')[1],
        body: await request.json(),
      });
      return HttpResponse.json(reviewSummary);
    })
  );
  const { endpoints } = admissionReviewApi;
  const command = { ...reviewKey, concurrencyStamp: 'stamp' };
  await store
    .dispatch(
      endpoints.saveAdmissionReviewDraft.initiate({
        ...command,
        notes: 'Incomplete',
        recommendation: null,
        reason: null,
        checklist: [],
      })
    )
    .unwrap();
  await store
    .dispatch(
      endpoints.assignAdmissionReview.initiate({
        ...command,
        assignedReviewerId: 'reviewer-2',
        dueAt: null,
        reason: 'Covering leave',
      })
    )
    .unwrap();
  await store
    .dispatch(
      endpoints.requestAdmissionReviewCorrection.initiate({
        ...command,
        reason: 'Correct the birth date',
      })
    )
    .unwrap();
  expect(requests).toEqual([
    {
      path: 'draft',
      body: {
        concurrencyStamp: 'stamp',
        notes: 'Incomplete',
        recommendation: null,
        reason: null,
        checklist: [],
      },
    },
    {
      path: 'assignment',
      body: {
        concurrencyStamp: 'stamp',
        assignedReviewerId: 'reviewer-2',
        dueAt: null,
        reason: 'Covering leave',
      },
    },
    {
      path: 'request-correction',
      body: { concurrencyStamp: 'stamp', reason: 'Correct the birth date' },
    },
  ]);
});
