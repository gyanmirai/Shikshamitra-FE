import { api } from 'src/redux/service';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { it, vi, expect, afterEach, beforeEach } from 'vitest';
import { clearCachedAuthSession } from 'src/redux/session-cache';

import { admissionSeatApi } from './admission-seat-api';
import { createDocumentTestStore } from './document-test-fixture';

vi.hoisted(() => { process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000'; });
let store: ReturnType<typeof createDocumentTestStore>;
beforeEach(() => { clearCachedAuthSession(); store = createDocumentTestStore();
  mswServer.use(http.get('*/api/auth/session', () => HttpResponse.json(null))); });
afterEach(() => { store.dispatch(api.util.resetApiState()); clearCachedAuthSession(); });

it('uses scoped Seat routes and keeps identifiers out of command bodies', async () => {
  const base = '*/api/student/enrollment/admissions/seats';
  const requests: { method: string; path: string; body: Record<string, unknown> }[] = [];
  const response = { data: { applicationId: 'app-1', admissionOfferingId: 'offering-1', stageId: 'stage-1',
    seatStageEnabled: true, isActive: true, status: 'reserved', capacity: 40, reservedCount: 1,
    confirmedCount: 0, remainingCapacity: 39, isOverCapacity: false, renewalCount: 0,
    concurrencyStamp: 'next', events: [], blockers: [], canReserve: false, canConfirm: true,
    canRenew: true, canRelease: true, canJoinWaitlist: false, canManageCapacity: true, canComplete: false } };
  const capture = async ({ request }: { request: Request }) => { requests.push({ method: request.method,
    path: new URL(request.url).pathname.split('/seats/')[1], body: (await request.json()) as Record<string, unknown> });
    return HttpResponse.json(response); };
  mswServer.use(http.get(`${base}/applications/app-1/stages/stage-1`, () => HttpResponse.json(response)),
    http.post(`${base}/applications/app-1/stages/stage-1/reserve`, capture),
    http.post(`${base}/applications/app-1/stages/stage-1/confirm`, capture),
    http.post(`${base}/applications/app-1/stages/stage-1/renew`, capture),
    http.post(`${base}/applications/app-1/stages/stage-1/release`, capture),
    http.post(`${base}/applications/app-1/stages/stage-1/waitlist`, capture),
    http.put(`${base}/applications/app-1/stages/stage-1/capacity`, capture));
  const { endpoints } = admissionSeatApi;
  const key = { applicationId: 'app-1', stageId: 'stage-1' };
  const query = store.dispatch(endpoints.getAdmissionSeatStage.initiate(key));
  expect((await query.unwrap()).remainingCapacity).toBe(39); query.unsubscribe();
  const common = { ...key, concurrencyStamp: 'current', reservationConcurrencyStamp: 'reservation', idempotencyKey: 'operation-1' };
  await store.dispatch(endpoints.reserveAdmissionSeat.initiate({ ...common, joinWaitlistWhenFull: true, overrideCapacity: false })).unwrap();
  await store.dispatch(endpoints.confirmAdmissionSeat.initiate(common)).unwrap();
  await store.dispatch(endpoints.renewAdmissionSeat.initiate({ ...common, expiresAt: '2026-10-01T00:00:00Z' })).unwrap();
  await store.dispatch(endpoints.releaseAdmissionSeat.initiate(common)).unwrap();
  await store.dispatch(endpoints.waitlistAdmissionSeat.initiate(common)).unwrap();
  await store.dispatch(endpoints.updateAdmissionSeatCapacity.initiate({ ...key, capacity: 50,
    allowBelowOccupied: false, reason: 'Approved intake change', concurrencyStamp: 'current',
    poolConcurrencyStamp: 'pool', idempotencyKey: 'capacity-1' })).unwrap();
  expect(requests.map((item) => `${item.method} ${item.path}`)).toEqual([
    'POST applications/app-1/stages/stage-1/reserve', 'POST applications/app-1/stages/stage-1/confirm',
    'POST applications/app-1/stages/stage-1/renew', 'POST applications/app-1/stages/stage-1/release',
    'POST applications/app-1/stages/stage-1/waitlist', 'PUT applications/app-1/stages/stage-1/capacity']);
  expect(requests.every((item) => !('applicationId' in item.body) && !('stageId' in item.body))).toBe(true);
});
