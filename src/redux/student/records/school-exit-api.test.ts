import { api } from 'src/redux/service';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { it, vi, expect, afterEach, beforeEach } from 'vitest';
import { clearCachedAuthSession } from 'src/redux/session-cache';
import { createDocumentTestStore } from 'src/redux/student/admissions/document-test-fixture';
import { studentRecordTransitionsApi } from './student-record-transitions-api';
vi.hoisted(() => { process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000'; });
let store: ReturnType<typeof createDocumentTestStore>;
beforeEach(() => {
 clearCachedAuthSession(); store = createDocumentTestStore();
 mswServer.use(http.get('*/api/auth/session', () => HttpResponse.json({ accessToken: 'test-token' })));
});
afterEach(() => { store.dispatch(api.util.resetApiState()); clearCachedAuthSession(); });
it('passes exact exit scope and scenario to summary and unwraps the records envelope', async () => {
 const result = { studentId: 'student', academicYearId: 'year', canSubmit: false, fees: { status: 'Restricted', outstandingAmount: null } };
 mswServer.use(http.get('*/api/students/records/transitions/school-exit-summary', ({ request }) => {
  const url = new URL(request.url);
  expect(Object.fromEntries(url.searchParams)).toEqual({ studentId: 'student', academicYearId: 'year', outcome: 'Withdraw', effectiveDate: '2026-10-28T00:00:00.000Z' });
  return HttpResponse.json({ data: result });
 }));
 expect(await store.dispatch(studentRecordTransitionsApi.endpoints.getSchoolExitSummary.initiate({ studentId: 'student', academicYearId: 'year', outcome: 'Withdraw', effectiveDate: '2026-10-28T00:00:00.000Z' })).unwrap()).toEqual(result);
});
it('sends mandatory outstanding evidence separately from existing remarks on approval', async () => {
 mswServer.use(http.post('*/api/students/records/transitions/transition/approve', async ({ request }) => {
  expect(await request.json()).toEqual({ concurrencyStamp: 'stamp', remarks: 'Reviewed', outstandingReason: 'Fees will be followed up.' });
  return HttpResponse.json({ data: { id: 'transition', status: 'Approved' } });
 }));
 const result = await store.dispatch(studentRecordTransitionsApi.endpoints.decideStudentRecordTransition.initiate({ id: 'transition', command: 'approve', concurrencyStamp: 'stamp', remarks: 'Reviewed', outstandingReason: 'Fees will be followed up.' })).unwrap();
 expect(result.status).toBe('Approved');
});
