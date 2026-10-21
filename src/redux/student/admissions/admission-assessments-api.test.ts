import { api } from 'src/redux/service';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { waitFor } from '@testing-library/react';
import { it, vi, expect, afterEach, beforeEach } from 'vitest';
import { clearCachedAuthSession } from 'src/redux/session-cache';

import { admissionAssessmentsApi } from './admission-assessments-api';
import { admissionAssessmentSessionsApi } from './admission-assessment-sessions-api';
import {
  stageKey,
  stagePath,
  sessionKey,
  assessmentPath,
  sessionResponse,
  assessmentResponse,
  createAssessmentTestStore,
} from './assessment-test-fixture';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
});
let store: ReturnType<typeof createAssessmentTestStore>;
beforeEach(() => {
  clearCachedAuthSession();
  store = createAssessmentTestStore();
  mswServer.use(http.get('*/api/auth/session', () => HttpResponse.json(null)));
});
afterEach(() => {
  store.dispatch(api.util.resetApiState());
  clearCachedAuthSession();
});

it('books with the stage concurrency stamp and refreshes live stage evidence and session capacity', async () => {
  let booked = false;
  let submitted: unknown;
  mswServer.use(
    http.get(stagePath, () =>
      HttpResponse.json({ data: { ...assessmentResponse, canBook: !booked } })
    ),
    http.get(`${assessmentPath}/sessions`, () =>
      HttpResponse.json([{ ...sessionResponse, bookedCount: booked ? 1 : 0 }])
    ),
    http.post(`${stagePath}/attempts`, async ({ request }) => {
      submitted = await request.json();
      booked = true;
      return HttpResponse.json({ data: { ...assessmentResponse, canBook: false } });
    })
  );
  await store
    .dispatch(admissionAssessmentsApi.endpoints.getApplicationAssessment.initiate(stageKey))
    .unwrap();
  await store
    .dispatch(admissionAssessmentSessionsApi.endpoints.getAssessmentSessions.initiate(sessionKey))
    .unwrap();
  const result = await store
    .dispatch(
      admissionAssessmentsApi.endpoints.bookAssessmentAttempt.initiate({
        ...stageKey,
        sessionId: 'session-1',
        concurrencyStamp: 'stage-stamp',
      })
    )
    .unwrap();
  expect(result.canBook).toBe(false);
  expect(submitted).toEqual({ sessionId: 'session-1', concurrencyStamp: 'stage-stamp' });
  await waitFor(() => {
    expect(
      admissionAssessmentsApi.endpoints.getApplicationAssessment.select(stageKey)(store.getState())
        .data?.canBook
    ).toBe(false);
    expect(
      admissionAssessmentSessionsApi.endpoints.getAssessmentSessions.select(sessionKey)(
        store.getState()
      ).data?.[0].bookedCount
    ).toBe(1);
  });
});

it('sends typed result/retake actions with attempt stamps and keeps routing ids outside request bodies', async () => {
  const requests: { path: string; method: string; body: unknown }[] = [];
  mswServer.use(
    http.all(`${assessmentPath}/attempts/attempt-1/:action`, async ({ request }) => {
      requests.push({
        path: new URL(request.url).pathname.split('/').at(-1) ?? '',
        method: request.method,
        body: await request.json(),
      });
      return HttpResponse.json(assessmentResponse);
    })
  );
  const base = { attemptId: 'attempt-1', concurrencyStamp: 'attempt-stamp', notes: 'Checked' };
  const { endpoints } = admissionAssessmentsApi;
  await store
    .dispatch(endpoints.recordAssessmentAttendance.initiate({ ...base, attendance: 'present' }))
    .unwrap();
  await store.dispatch(endpoints.recordAssessmentResult.initiate({ ...base, marks: 75 })).unwrap();
  await store.dispatch(endpoints.allowAssessmentRetake.initiate(base)).unwrap();
  await store.dispatch(endpoints.cancelAssessmentAttempt.initiate(base)).unwrap();
  const body = { concurrencyStamp: 'attempt-stamp', notes: 'Checked' };
  expect(requests).toEqual([
    { path: 'attendance', method: 'PUT', body: { ...body, attendance: 'present' } },
    { path: 'result', method: 'PUT', body: { ...body, marks: 75 } },
    { path: 'retake', method: 'POST', body },
    { path: 'cancel', method: 'POST', body },
  ]);
});

it('surfaces concurrency rejection and refreshes the assessment instead of accepting stale evidence', async () => {
  let stale = true;
  mswServer.use(
    http.get(stagePath, () =>
      HttpResponse.json({ ...assessmentResponse, concurrencyStamp: stale ? 'old' : 'latest' })
    ),
    http.put(`${assessmentPath}/attempts/attempt-1/result`, () => {
      stale = false;
      return HttpResponse.json(
        { error: { code: 'Admissions:Assessment:ConcurrencyConflict' } },
        { status: 409 }
      );
    })
  );
  await store
    .dispatch(admissionAssessmentsApi.endpoints.getApplicationAssessment.initiate(stageKey))
    .unwrap();
  await expect(
    store
      .dispatch(
        admissionAssessmentsApi.endpoints.recordAssessmentResult.initiate({
          attemptId: 'attempt-1',
          concurrencyStamp: 'old',
          marks: 80,
        })
      )
      .unwrap()
  ).rejects.toMatchObject({ status: 409 });
  await waitFor(() =>
    expect(
      admissionAssessmentsApi.endpoints.getApplicationAssessment.select(stageKey)(store.getState())
        .data?.concurrencyStamp
    ).toBe('latest')
  );
});

it('sends waiver reason and stage concurrency stamp to the authorized waiver endpoint', async () => {
  let submitted: unknown;
  mswServer.use(
    http.post(`${stagePath}/waive`, async ({ request }) => {
      submitted = await request.json();
      return HttpResponse.json({ ...assessmentResponse, canComplete: true, outcome: 'waived' });
    })
  );
  const result = await store
    .dispatch(
      admissionAssessmentsApi.endpoints.waiveApplicationAssessment.initiate({
        ...stageKey,
        reason: 'Transfer exception',
        concurrencyStamp: 'stage-stamp',
      })
    )
    .unwrap();
  expect(submitted).toEqual({ reason: 'Transfer exception', concurrencyStamp: 'stage-stamp' });
  expect(result.outcome).toBe('waived');
});

it('persists partial subject drafts separately from final subject results and invalidates stage evidence', async () => {
  const writes: { path: string; body: unknown }[] = [];
  let stamp = 'initial';
  mswServer.use(
    http.get(stagePath, () =>
      HttpResponse.json({
        ...assessmentResponse,
        concurrencyStamp: stamp,
        canComplete: stamp === 'submitted',
      })
    ),
    http.put(`${assessmentPath}/attempts/attempt-1/:action`, async ({ request, params }) => {
      const path = String(params.action);
      writes.push({ path, body: await request.json() });
      stamp = path === 'result-draft' ? 'draft' : 'submitted';
      return HttpResponse.json({
        ...assessmentResponse,
        concurrencyStamp: stamp,
        canComplete: stamp === 'submitted',
      });
    })
  );
  await store
    .dispatch(admissionAssessmentsApi.endpoints.getApplicationAssessment.initiate(stageKey))
    .unwrap();
  const base = { attemptId: 'attempt-1', concurrencyStamp: 'reviewed', notes: 'QA marks' };
  const draft = await store
    .dispatch(
      admissionAssessmentsApi.endpoints.saveAssessmentResultDraft.initiate({
        ...base,
        subjectScores: [
          { code: 'english', marks: 0 },
          { code: 'maths', marks: null },
        ],
      })
    )
    .unwrap();
  expect(draft.canComplete).toBe(false);
  await waitFor(() =>
    expect(
      admissionAssessmentsApi.endpoints.getApplicationAssessment.select(stageKey)(store.getState())
        .data?.concurrencyStamp
    ).toBe('draft')
  );
  await store
    .dispatch(
      admissionAssessmentsApi.endpoints.recordAssessmentResult.initiate({
        ...base,
        concurrencyStamp: 'draft',
        subjectScores: [
          { code: 'english', marks: 0 },
          { code: 'maths', marks: 49.25 },
        ],
      })
    )
    .unwrap();
  expect(writes).toEqual([
    {
      path: 'result-draft',
      body: {
        concurrencyStamp: 'reviewed',
        notes: 'QA marks',
        subjectScores: [
          { code: 'english', marks: 0 },
          { code: 'maths', marks: null },
        ],
      },
    },
    {
      path: 'result',
      body: {
        concurrencyStamp: 'draft',
        notes: 'QA marks',
        subjectScores: [
          { code: 'english', marks: 0 },
          { code: 'maths', marks: 49.25 },
        ],
      },
    },
  ]);
  await waitFor(() =>
    expect(
      admissionAssessmentsApi.endpoints.getApplicationAssessment.select(stageKey)(store.getState())
        .data?.canComplete
    ).toBe(true)
  );
});
