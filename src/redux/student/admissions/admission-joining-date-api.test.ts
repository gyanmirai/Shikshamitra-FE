import { api } from 'src/redux/service';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { it, vi, expect, afterEach, beforeEach } from 'vitest';
import { clearCachedAuthSession } from 'src/redux/session-cache';

import { createDocumentTestStore } from './document-test-fixture';
import { admissionJoiningDateApi } from './admission-joining-date-api';

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

it('previews a date through Admissions without saving or preparing fees, then saves with concurrency', async () => {
  const base = '*/api/student/enrollment/admissions/applications/app-1/joining-date';
  const requests: { method: string; body: unknown }[] = [];
  const state = {
    joiningDate: '2026-06-01',
    concurrencyStamp: 'stamp-1',
    canEdit: true,
    isLocked: false,
    lockReason: null,
    academicYearStartDate: '2026-06-01',
    academicYearEndDate: '2027-05-31',
  };
  let reads = 0;
  mswServer.use(
    http.get(base, () => {
      reads += 1;
      return HttpResponse.json({ data: state });
    }),
    http.post(`${base}/preview`, async ({ request }) => {
      requests.push({ method: 'POST', body: await request.json() });
      return HttpResponse.json({ data: { totalAmount: 9973, proration: null } });
    }),
    http.put(base, async ({ request }) => {
      requests.push({ method: 'PUT', body: await request.json() });
      return HttpResponse.json({
        data: { ...state, joiningDate: '2026-06-02', concurrencyStamp: 'stamp-2' },
      });
    })
  );
  const { endpoints } = admissionJoiningDateApi;
  const read = store.dispatch(endpoints.getAdmissionJoiningDate.initiate('app-1'));
  expect((await read.unwrap()).concurrencyStamp).toBe('stamp-1');
  const preview = store.dispatch(
    endpoints.previewAdmissionJoiningDate.initiate({
      applicationId: 'app-1',
      joiningDate: '2026-06-02',
      variableFeeHeads: [],
    })
  );
  expect((await preview.unwrap()).totalAmount).toBe(9973);
  expect(reads).toBe(1);
  expect(requests).toEqual([
    { method: 'POST', body: { joiningDate: '2026-06-02', variableFeeHeads: [] } },
  ]);
  const saved = await store
    .dispatch(
      endpoints.saveAdmissionJoiningDate.initiate({
        applicationId: 'app-1',
        joiningDate: '2026-06-02',
        concurrencyStamp: 'stamp-1',
      })
    )
    .unwrap();
  expect(saved.concurrencyStamp).toBe('stamp-2');
  expect(requests[1]).toEqual({
    method: 'PUT',
    body: { joiningDate: '2026-06-02', concurrencyStamp: 'stamp-1' },
  });
  preview.unsubscribe();
  read.unsubscribe();
});
