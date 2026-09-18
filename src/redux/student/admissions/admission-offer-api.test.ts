import { api } from 'src/redux/service';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { it, vi, expect, afterEach, beforeEach } from 'vitest';
import { clearCachedAuthSession } from 'src/redux/session-cache';

import { admissionOfferApi } from './admission-offer-api';
import { createDocumentTestStore } from './document-test-fixture';

vi.hoisted(() => { process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000'; });
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

it('uses scoped Offer routes and keeps route identifiers out of command bodies', async () => {
  const base = '*/api/student/enrollment/admissions/offers';
  const requests: { path: string; body: Record<string, unknown> }[] = [];
  const response = { data: { applicationId: 'app-1', stageId: 'stage-1', offerStageEnabled: true,
    isActive: true, status: 'issued', versionNumber: 1, extensionCount: 0, reissueCount: 0,
    concurrencyStamp: 'next', events: [], blockers: [], canIssue: false, canAccept: true,
    canDecline: true, canExtend: true, canWithdraw: true, canReissue: false, canComplete: false } };
  const capture = async ({ request }: { request: Request }) => {
    requests.push({ path: new URL(request.url).pathname.split('/offers/')[1],
      body: (await request.json()) as Record<string, unknown> });
    return HttpResponse.json(response);
  };
  mswServer.use(
    http.get(`${base}/applications/app-1/stages/stage-1`, () => HttpResponse.json(response)),
    http.post(`${base}/applications/app-1/stages/stage-1/issue`, capture),
    http.post(`${base}/applications/app-1/stages/stage-1/respond`, capture),
    http.post(`${base}/applications/app-1/stages/stage-1/extend`, capture),
    http.post(`${base}/applications/app-1/stages/stage-1/withdraw`, capture),
    http.post(`${base}/applications/app-1/stages/stage-1/reissue`, capture)
  );
  const { endpoints } = admissionOfferApi;
  const key = { applicationId: 'app-1', stageId: 'stage-1' };
  const query = store.dispatch(endpoints.getAdmissionOfferStage.initiate(key));
  expect((await query.unwrap()).status).toBe('issued');
  query.unsubscribe();
  const common = { ...key, concurrencyStamp: 'current', idempotencyKey: 'operation-1' };
  await store.dispatch(endpoints.issueAdmissionStageOffer.initiate(common)).unwrap();
  await store.dispatch(endpoints.respondAdmissionOffer.initiate({ ...common, accepted: true,
    confirmTermsAccepted: true, confirmConditionsSatisfied: true })).unwrap();
  await store.dispatch(endpoints.extendAdmissionOffer.initiate({ ...common,
    expiresAt: '2026-10-01T00:00:00Z' })).unwrap();
  await store.dispatch(endpoints.withdrawAdmissionOffer.initiate({ ...common, reason: 'Capacity change' })).unwrap();
  await store.dispatch(endpoints.reissueAdmissionOffer.initiate(common)).unwrap();
  expect(requests.map((item) => item.path)).toEqual([
    'applications/app-1/stages/stage-1/issue',
    'applications/app-1/stages/stage-1/respond',
    'applications/app-1/stages/stage-1/extend',
    'applications/app-1/stages/stage-1/withdraw',
    'applications/app-1/stages/stage-1/reissue',
  ]);
  expect(requests.every((item) => !('applicationId' in item.body) && !('stageId' in item.body))).toBe(true);
});
