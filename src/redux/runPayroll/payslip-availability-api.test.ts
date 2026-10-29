import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { waitFor } from '@testing-library/react';
import { it, vi, expect, afterAll } from 'vitest';
import { payslipApi } from 'src/redux/hr/payslip-api';
import { combineSlices, configureStore } from '@reduxjs/toolkit';

import { runPayrollApi } from './runPayrollApi';
import { payslipAvailabilityApi } from './payslip-availability-api';

const originalApiUrl = vi.hoisted(() => {
  const previous = process.env.NEXT_PUBLIC_API_URL;
  process.env.NEXT_PUBLIC_API_URL = 'http://payroll-availability.test';
  return previous;
});
vi.mock('src/redux/session-cache', () => ({
  getCachedAuthSession: async () => ({ accessToken: 'synthetic-token' }),
  clearCachedAuthSession: vi.fn(),
  getAuthSessionCacheRevision: () => 0,
  isAuthSessionCacheCurrent: () => true,
}));
afterAll(() => {
  if (originalApiUrl === undefined) delete process.env.NEXT_PUBLIC_API_URL;
  else process.env.NEXT_PUBLIC_API_URL = originalApiUrl;
});

it('refreshes active availability, issued documents and salary summary after locking payroll', async () => {
  let locked = false;
  const reads = { availability: 0, documents: 0, summary: 0 };
  const args = { employeeId: 'synthetic-staff', monthYear: '2026-10' };
  const origin = 'http://payroll-availability.test/api/payroll';
  mswServer.use(
    http.get(`${origin}/salary-slips/availability`, ({ request }) => {
      const params = new URL(request.url).searchParams;
      expect(params.get('employeeId')).toBe(args.employeeId);
      expect(params.get('monthYear')).toBe(args.monthYear);
      expect(params.get('academicYearId')).toBe('synthetic-year');
      reads.availability += 1;
      return HttpResponse.json({
        ...args,
        status: locked ? 'AVAILABLE' : 'PENDING',
        canViewPayslip: locked,
      });
    }),
    http.get(`${origin}/payslip-documents`, () => {
      reads.documents += 1;
      return HttpResponse.json(locked ? [{ id: 'issued-document', isCurrent: true }] : []);
    }),
    http.get(`${origin}/salary-slips`, () => {
      reads.summary += 1;
      return HttpResponse.json({ ...args, status: locked ? 'Finalized' : 'Reviewed' });
    }),
    http.post(`${origin}/run`, async ({ request }) => {
      expect(await request.json()).toEqual({
        month: '2026-10',
        academicYearId: 'synthetic-year',
        employeeIds: [args.employeeId],
        previewRunId: 'current-preview',
      });
      locked = true;
      return HttpResponse.json({ succeededCount: 1 });
    })
  );
  const store = configureStore({
    // These injections share one runtime API reducer; combine their endpoint types for selectors.
    reducer: combineSlices(runPayrollApi, payslipApi, payslipAvailabilityApi),
    middleware: (defaults) => defaults().concat(runPayrollApi.middleware),
  });
  const availability = store.dispatch(
    payslipAvailabilityApi.endpoints.getPayslipAvailability.initiate({
      ...args,
      academicYearId: 'synthetic-year',
    })
  );
  const documents = store.dispatch(payslipApi.endpoints.getPayslipDocuments.initiate(args));
  const summary = store.dispatch(runPayrollApi.endpoints.getEmployeeSalarySlip.initiate(args));
  try {
    await Promise.all([availability.unwrap(), documents.unwrap(), summary.unwrap()]);
    await store
      .dispatch(
        runPayrollApi.endpoints.generateAndLockPayroll.initiate({
          month: '2026-10',
          academicYearId: 'synthetic-year',
          employeeIds: [args.employeeId],
          previewRunId: 'current-preview',
        })
      )
      .unwrap();
    await waitFor(() => {
      expect(reads).toEqual({ availability: 2, documents: 2, summary: 2 });
      expect(
        payslipAvailabilityApi.endpoints.getPayslipAvailability.select({
          ...args,
          academicYearId: 'synthetic-year',
        })(store.getState()).data?.status
      ).toBe('AVAILABLE');
      expect(payslipApi.endpoints.getPayslipDocuments.select(args)(store.getState()).data).toEqual([
        { id: 'issued-document', isCurrent: true },
      ]);
    });
  } finally {
    availability.unsubscribe();
    documents.unsubscribe();
    summary.unsubscribe();
    store.dispatch(runPayrollApi.util.resetApiState());
  }
});
