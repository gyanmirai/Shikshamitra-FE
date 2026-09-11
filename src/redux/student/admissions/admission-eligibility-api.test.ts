import { api } from 'src/redux/service';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { waitFor } from '@testing-library/react';
import { it, vi, expect, afterEach, beforeEach } from 'vitest';
import { clearCachedAuthSession } from 'src/redux/session-cache';

import { createDocumentTestStore } from './document-test-fixture';
import { admissionEligibilityApi } from './admission-eligibility-api';
import {
  eligibilityKey,
  eligibilityPath,
  eligibilitySummary,
  eligibilityEvaluation,
} from './eligibility-test-fixture';

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

it('records an explicit evaluation and refreshes the current summary and subscribed history', async () => {
  let evaluated = false;
  let body: unknown;
  mswServer.use(
    http.get(eligibilityPath, () =>
      HttpResponse.json({
        data: {
          ...eligibilitySummary,
          latestEvaluation: evaluated ? eligibilityEvaluation : null,
        },
      })
    ),
    http.get(`${eligibilityPath}/history`, () =>
      HttpResponse.json(evaluated ? [eligibilityEvaluation] : [])
    ),
    http.post(`${eligibilityPath}/evaluate`, async ({ request }) => {
      body = await request.json();
      evaluated = true;
      return HttpResponse.json({ ...eligibilitySummary, latestEvaluation: eligibilityEvaluation });
    })
  );
  const { endpoints } = admissionEligibilityApi;
  await store.dispatch(endpoints.getApplicationEligibility.initiate(eligibilityKey)).unwrap();
  await store.dispatch(endpoints.getEligibilityHistory.initiate(eligibilityKey)).unwrap();
  expect(evaluated).toBe(false);
  await store
    .dispatch(
      endpoints.evaluateAdmissionEligibility.initiate({
        ...eligibilityKey,
        concurrencyStamp: 'application-stamp',
      })
    )
    .unwrap();
  expect(body).toEqual({ concurrencyStamp: 'application-stamp' });
  await waitFor(() => {
    expect(
      endpoints.getApplicationEligibility.select(eligibilityKey)(store.getState()).data
        ?.latestEvaluation?.id
    ).toBe('evaluation-1');
    expect(
      endpoints.getEligibilityHistory.select(eligibilityKey)(store.getState()).data
    ).toHaveLength(1);
  });
});

it('uses scoped evaluation and exception routes with the application stamp and recorded reasons', async () => {
  const requests: { path: string; body: unknown }[] = [];
  mswServer.use(
    http.post(`${eligibilityPath}/*`, async ({ request }) => {
      requests.push({
        path: new URL(request.url).pathname.split('/stages/eligibility-1/')[1],
        body: await request.json(),
      });
      return HttpResponse.json({ data: eligibilitySummary });
    })
  );
  const { endpoints } = admissionEligibilityApi;
  const command = {
    ...eligibilityKey,
    concurrencyStamp: 'application-stamp',
    reason: 'Recorded reason',
  };
  await store
    .dispatch(
      endpoints.requestEligibilityException.initiate({ ...command, evaluationId: 'evaluation-1' })
    )
    .unwrap();
  await store
    .dispatch(
      endpoints.reviewEligibilityException.initiate({
        ...command,
        exceptionId: 'exception-1',
        decision: 'approved',
      })
    )
    .unwrap();
  expect(requests).toEqual([
    {
      path: 'evaluations/evaluation-1/exceptions',
      body: { concurrencyStamp: 'application-stamp', reason: 'Recorded reason' },
    },
    {
      path: 'exceptions/exception-1/review',
      body: {
        concurrencyStamp: 'application-stamp',
        reason: 'Recorded reason',
        decision: 'approved',
      },
    },
  ]);
});
