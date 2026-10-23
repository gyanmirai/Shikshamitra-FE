import { api } from 'src/redux/service';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { it, expect, afterEach, beforeEach } from 'vitest';
import { clearCachedAuthSession } from 'src/redux/session-cache';
import { createDocumentTestStore } from 'src/redux/student/admissions/document-test-fixture';

import { studentRollNumberBatchesApi } from './student-roll-number-batches-api';

let store: ReturnType<typeof createDocumentTestStore>;
const scope = { academicYearId: 'year-1', standardId: 'class-8', divisionId: 'division-a' };
const batch = {
  ...scope,
  id: 'batch-1',
  concurrencyStamp: 'stamp-1',
  totalCount: 83,
  items: [],
  status: 'Preview',
};
beforeEach(() => {
  clearCachedAuthSession();
  store = createDocumentTestStore();
  mswServer.use(http.get('*/api/auth/session', () => HttpResponse.json(null)));
});
afterEach(() => {
  store.dispatch(api.util.resetApiState());
  clearCachedAuthSession();
});

it('previews the full academic division without page IDs, searches or client-proposed numbers', async () => {
  let body: unknown;
  mswServer.use(
    http.post('*/api/students/roll-number-batches/preview', async ({ request }) => {
      body = await request.json();
      return HttpResponse.json({ data: batch });
    })
  );
  const result = await store
    .dispatch(
      studentRollNumberBatchesApi.endpoints.previewRollNumberBatch.initiate({
        ...scope,
        operation: 'assign-missing',
      })
    )
    .unwrap();
  expect(body).toEqual({ ...scope, operation: 'assign-missing' });
  expect(result.totalCount).toBe(83);
});

it('pages an immutable server batch without changing its cohort', async () => {
  let params: URLSearchParams | undefined;
  mswServer.use(
    http.get('*/api/students/roll-number-batches/batch-1', ({ request }) => {
      params = new URL(request.url).searchParams;
      return HttpResponse.json(batch);
    })
  );
  const query = store.dispatch(
    studentRollNumberBatchesApi.endpoints.getRollNumberBatch.initiate({
      id: batch.id,
      skipCount: 25,
      maxResultCount: 25,
    })
  );
  expect(await query.unwrap()).toEqual(batch);
  expect(params?.get('skipCount')).toBe('25');
  expect(params?.get('maxResultCount')).toBe('25');
  query.unsubscribe();
});

it('sends explicit current-page case IDs and keeps server policy evidence intact', async () => {
  const evidence = {
    ...batch,
    totalCount: 2,
    caseIds: ['page-1', 'page-2'],
    approvalRequired: true,
    approvalStages: [['Principal']],
    policyVersionId: 'published-policy-1',
  };
  let body: unknown;
  mswServer.use(
    http.post('*/api/students/roll-number-batches/preview', async ({ request }) => {
      body = await request.json();
      return HttpResponse.json({ data: evidence });
    })
  );
  const result = await store
    .dispatch(
      studentRollNumberBatchesApi.endpoints.previewRollNumberBatch.initiate({
        ...scope,
        operation: 'assign-missing',
        caseIds: ['page-1', 'page-2'],
      })
    )
    .unwrap();
  expect(body).toEqual({ ...scope, operation: 'assign-missing', caseIds: ['page-1', 'page-2'] });
  expect(result).toEqual(evidence);
});

it('sends the concurrency stamp, reason and stable idempotency key exactly once', async () => {
  let body: unknown;
  let requests = 0;
  mswServer.use(
    http.post('*/api/students/roll-number-batches/batch-1/submit', async ({ request }) => {
      requests += 1;
      body = await request.json();
      return HttpResponse.json({ error: { message: 'Generate a new preview.' } }, { status: 409 });
    })
  );
  await expect(
    store
      .dispatch(
        studentRollNumberBatchesApi.endpoints.submitRollNumberBatch.initiate({
          id: batch.id,
          concurrencyStamp: 'stamp-1',
          idempotencyKey: batch.id,
          reason: 'Reviewed names',
        })
      )
      .unwrap()
  ).rejects.toMatchObject({ status: 409 });
  expect(body).toEqual({
    concurrencyStamp: 'stamp-1',
    idempotencyKey: batch.id,
    reason: 'Reviewed names',
  });
  expect(requests).toBe(1);
});

it('keeps batch approval separate from applying approved roll numbers', async () => {
  let body: unknown;
  mswServer.use(
    http.post('*/api/students/roll-number-batches/batch-1/decision', async ({ request }) => {
      body = await request.json();
      return HttpResponse.json({ ...batch, status: 'Approved' });
    })
  );
  const result = await store
    .dispatch(
      studentRollNumberBatchesApi.endpoints.decideRollNumberBatch.initiate({
        id: batch.id,
        concurrencyStamp: 'stamp-1',
        approve: true,
        reason: 'Reviewed',
      })
    )
    .unwrap();
  expect(body).toEqual({ concurrencyStamp: 'stamp-1', approve: true, reason: 'Reviewed' });
  expect(result.status).toBe('Approved');
});
