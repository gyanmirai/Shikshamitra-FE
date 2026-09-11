import { api } from 'src/redux/service';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { it, vi, expect, afterEach, beforeEach } from 'vitest';
import { clearCachedAuthSession } from 'src/redux/session-cache';

import { admissionPaymentApi } from './admission-payment-api';
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

it('uses scoped Payment routes and keeps route identifiers out of command bodies', async () => {
  const base = '*/api/student/enrollment/admissions/payments';
  const requests: { path: string; body: Record<string, unknown> }[] = [];
  const response = { data: { applicationId: 'app-1', stageId: 'stage-1',
    paymentStageEnabled: true, isActive: true, requiredAmount: 500, settledAmount: 0,
    pendingAmount: 0, outstandingAmount: 500, currency: 'INR', status: 'unpaid',
    concurrencyStamp: 'next', transactions: [], blockers: [], canRecord: true,
    canStartOnlinePayment: false, canVerify: false, canWaive: true, canReverse: false,
    canComplete: false } };
  const capture = async ({ request }: { request: Request }) => {
    requests.push({ path: new URL(request.url).pathname.split('/payments/')[1],
      body: (await request.json()) as Record<string, unknown> });
    return HttpResponse.json(response);
  };
  mswServer.use(
    http.get(`${base  }/applications/app-1/stages/stage-1`, () => HttpResponse.json(response)),
    http.post(`${base  }/applications/app-1/stages/stage-1/transactions`, capture),
    http.post(`${base  }/applications/app-1/stages/stage-1/waive`, capture),
    http.post(`${base  }/transactions/transaction-1/review`, capture),
    http.post(`${base  }/transactions/transaction-1/reverse`, capture)
  );
  const { endpoints } = admissionPaymentApi;
  const key = { applicationId: 'app-1', stageId: 'stage-1' };
  const query = store.dispatch(endpoints.getAdmissionPaymentStage.initiate(key));
  expect((await query.unwrap()).currency).toBe('INR');
  query.unsubscribe();
  await store.dispatch(endpoints.recordAdmissionPayment.initiate({ ...key, amount: 500, method: 'upi',
    externalReference: 'UPI-1', concurrencyStamp: 'a', idempotencyKey: 'record-1' })).unwrap();
  await store.dispatch(endpoints.waiveAdmissionPayment.initiate({ ...key, reason: 'Approved',
    concurrencyStamp: 'b', idempotencyKey: 'waive-1' })).unwrap();
  await store.dispatch(endpoints.reviewAdmissionPayment.initiate({ transactionId: 'transaction-1',
    approved: true, concurrencyStamp: 'c', transactionConcurrencyStamp: 'tx-c',
    idempotencyKey: 'verify-1' })).unwrap();
  await store.dispatch(endpoints.reverseAdmissionPayment.initiate({ transactionId: 'transaction-1',
    reason: 'Bank reversal', concurrencyStamp: 'd', transactionConcurrencyStamp: 'tx-d',
    idempotencyKey: 'reverse-1' })).unwrap();
  expect(requests.map((item) => item.path)).toEqual([
    'applications/app-1/stages/stage-1/transactions',
    'applications/app-1/stages/stage-1/waive',
    'transactions/transaction-1/review',
    'transactions/transaction-1/reverse',
  ]);
  expect(requests.every((item) => !('applicationId' in item.body) && !('stageId' in item.body)
    && !('transactionId' in item.body))).toBe(true);
});
