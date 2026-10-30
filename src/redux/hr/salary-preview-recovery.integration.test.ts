import type { HrRecoveryEvent } from 'src/screens/hr/recovery/hr-recovery-events';

import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { configureStore } from '@reduxjs/toolkit';
import { it, vi, expect, afterAll } from 'vitest';
import { HR_RECOVERY_EVENT } from 'src/screens/hr/recovery/hr-recovery-events';
import { takeInlineSalaryPreviewRecovery, claimInlineSalaryPreviewRecovery } from 'src/screens/hr/recovery/inline-salary-preview-recovery';

import { salaryTemplateApi } from './salary-template-api';
import { hrRecoveryMiddleware } from './hr-recovery-middleware';

import type { PreviewSalaryTemplateRequest } from './salary-template-api';

const originalApiUrl = vi.hoisted(() => {
  const previous = process.env.NEXT_PUBLIC_API_URL;
  process.env.NEXT_PUBLIC_API_URL = 'http://salary-preview-recovery.test';
  return previous;
});
vi.mock('src/redux/session-cache', () => ({
  getCachedAuthSession: async () => ({ accessToken: 'synthetic-token' }),
  clearCachedAuthSession: vi.fn(), getAuthSessionCacheRevision: () => 0,
  isAuthSessionCacheCurrent: () => true,
}));
afterAll(() => {
  if (originalApiUrl === undefined) delete process.env.NEXT_PUBLIC_API_URL;
  else process.env.NEXT_PUBLIC_API_URL = originalApiUrl;
});

it.each(['owned', 'unowned', 'fields', 'access', 'network', 'unknown', 'aborted'])(
  'preserves real RTK request ownership and fallback for %s', async (scenario) => {
    window.history.replaceState(null, '', '/hr/payroll/setting/salary-templates');
    const route = window.location.pathname + window.location.search;
    const observed: HrRecoveryEvent[] = [];
    const receive = (event: Event) => observed.push((event as CustomEvent<HrRecoveryEvent>).detail);
    window.addEventListener(HR_RECOVERY_EVENT, receive);
    mswServer.use(http.post('http://salary-preview-recovery.test/api/payroll/salary-templates/preview', () =>
      scenario === 'network' ? HttpResponse.error() : HttpResponse.json({
        errorCode: scenario === 'unknown' ? 'HR:UnrecognizedPreviewError' : 'HR:Payroll:SalaryTemplateAllocationMismatch',
        data: { gross: '5000', allocated: '3000', difference: '2000' },
        ...(scenario === 'fields' ? { errors: { rules: ['Choose an earning basis.'] } } : {}),
      }, { status: scenario === 'access' ? 403 : 400 })));
    const store = configureStore({
      reducer: { api: salaryTemplateApi.reducer, auth: () => ({ user: { sub: 'synthetic-user', tenantid: 'synthetic-school' } }) },
      middleware: (defaults) => defaults().concat(hrRecoveryMiddleware, salaryTemplateApi.middleware),
    });
    const input: PreviewSalaryTemplateRequest = {
      rules: [], salaryBasis: 'GROSS', monthlyAmount: 5000,
      effectiveMonth: '2026-10-01T00:00:00.000Z', pfApplicable: false,
    };
    const request = store.dispatch(salaryTemplateApi.endpoints.previewSalaryTemplate.initiate(input));
    const release = scenario === 'unowned' ? () => {} : claimInlineSalaryPreviewRecovery(request.requestId);
    try {
      if (scenario === 'aborted') request.abort();
      await expect(request.unwrap()).rejects.toBeDefined();
      if (scenario === 'owned' || scenario === 'aborted') expect(observed).toHaveLength(0);
      else {
        expect(observed).toHaveLength(1);
        expect(observed[0].requestId).toBe(request.requestId);
        if (scenario === 'fields') expect(observed[0].failure?.fields).toContainEqual({
          name: 'Earning rules', message: 'Choose an earning basis.',
        });
      }
    } finally {
      release();
      expect(takeInlineSalaryPreviewRecovery(request.requestId, route)).toBe(false);
      window.removeEventListener(HR_RECOVERY_EVENT, receive);
      request.reset();
      store.dispatch(salaryTemplateApi.util.resetApiState());
    }
  }
);
