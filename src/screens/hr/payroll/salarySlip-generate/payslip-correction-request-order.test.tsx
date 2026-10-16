import type { PayslipDocument, PayslipCorrection } from 'src/redux/hr/payslip-api';

import { Provider } from 'react-redux';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { configureStore } from '@reduxjs/toolkit';
import { payslipApi } from 'src/redux/hr/payslip-api';
import { it, vi, expect, afterAll, afterEach } from 'vitest';
import { act, render, screen, within, waitFor, cleanup, fireEvent } from '@testing-library/react';

import PayslipCorrectionDialog from './payslip-correction-dialog';

const originalApiUrl = vi.hoisted(() => {
  const original = process.env.NEXT_PUBLIC_API_URL;
  process.env.NEXT_PUBLIC_API_URL = 'http://payslip-correction.test';
  return original;
});
vi.mock('src/redux/session-cache', () => ({
  getCachedAuthSession: async () => ({ accessToken: 'synthetic-test-token' }),
  clearCachedAuthSession: vi.fn(),
  getAuthSessionCacheRevision: () => 0,
  isAuthSessionCacheCurrent: () => true,
}));
vi.mock('src/routes/hooks', () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock('src/hooks/use-unsaved-navigation', () => ({ useUnsavedNavigation: () => ({ requestNavigation: (proceed: () => void) => proceed(), confirmation: null }) }));
vi.mock('src/components/customDialog', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div role="dialog">{children}</div>,
  DialogScrollContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

const sourceDocument = { id: '33333333-3333-3333-3333-333333333333', revision: 1, paymentStatus: 'Finalized' } as PayslipDocument;
const initial: PayslipCorrection = {
  id: '44444444-4444-4444-4444-444444444444', sourceDocumentId: sourceDocument.id,
  sourceMonth: '2026-10', reason: 'Correct attendance', status: 'DRAFT', concurrencyStamp: 'version-1',
  attendance: Array.from({ length: 31 }, (_, index) => ({
    date: `2026-10-${String(index + 1).padStart(2, '0')}`, status: 0, timeIn: null, timeOut: null,
  })),
  originalEarnings: 10000, originalDeductions: 75, originalNetPay: 9925, originalEmployerCost: 10325,
  candidate: null, reviewedBy: null, reviewedAt: null, resultDocumentId: null, settlementMonth: null,
};
const stores: ReturnType<typeof makeStore>[] = [];
function makeStore() {
  return configureStore({ reducer: { [payslipApi.reducerPath]: payslipApi.reducer },
    middleware: (defaults) => defaults().concat(payslipApi.middleware) });
}
afterEach(async () => {
  cleanup();
  await act(async () => { stores.forEach((store) => store.dispatch(payslipApi.util.resetApiState())); });
  stores.length = 0;
});
afterAll(() => {
  if (originalApiUrl === undefined) delete process.env.NEXT_PUBLIC_API_URL;
  else process.env.NEXT_PUBLIC_API_URL = originalApiUrl;
});

it.each([
  { failFreshRead: false, readBeforeAcknowledgement: false },
  { failFreshRead: true, readBeforeAcknowledgement: false },
  { failFreshRead: false, readBeforeAcknowledgement: true },
  { failFreshRead: true, readBeforeAcknowledgement: true },
])('retains the acknowledged correction, refresh failure=$failFreshRead, earlier read before acknowledgement=$readBeforeAcknowledgement', async ({ failFreshRead, readBeforeAcknowledgement }) => {
  const store = makeStore(); stores.push(store);
  let server = { ...initial };
  let reads = 0;
  let calculations = 0;
  let reviews = 0;
  let releaseOldRead!: () => void;
  const oldRead = new Promise<void>((resolve) => { releaseOldRead = resolve; });
  let releaseFreshRead!: () => void;
  const freshRead = new Promise<void>((resolve) => { releaseFreshRead = resolve; });
  let releaseSecondWrite!: () => void;
  const secondWrite = new Promise<void>((resolve) => { releaseSecondWrite = resolve; });
  mswServer.use(
    http.get('http://payslip-correction.test/api/payroll/payslip-corrections', async () => {
      reads += 1;
      const response = structuredClone(server);
      if (reads === 2) await oldRead;
      if (reads === 3) {
        await freshRead;
        if (failFreshRead) return HttpResponse.json({ detail: 'Synthetic refresh failure' }, { status: 503 });
      }
      return HttpResponse.json([response]);
    }),
    http.post(`http://payslip-correction.test/api/payroll/payslip-corrections/${initial.id}/calculate`, async ({ request }) => {
      expect(request.headers.get('authorization')).toBe('Bearer synthetic-test-token');
      const body = await request.json() as { concurrencyStamp: string; attendance: PayslipCorrection['attendance'] };
      // Every write uses the acknowledged server version, just as the API enforces.
      expect(body.concurrencyStamp).toBe(server.concurrencyStamp);
      calculations += 1;
      const absent = body.attendance[0].status === 2;
      server = { ...server, status: 'CALCULATED', concurrencyStamp: `version-${calculations + 1}`, attendance: body.attendance,
        // Reconciled fixed response facts for the 22-day October fixture, not a client payroll calculator.
        candidate: { totalEarnings: absent ? 9545.45 : 10000, totalDeduction: absent ? 72 : 75,
          netPay: absent ? 9473.45 : 9925, employerCost: absent ? 9856.45 : 10325, payableDays: absent ? 21 : 22,
          issueCodes: [], earningComponents: [{ name: 'Basic Salary', amount: absent ? 5727.27 : 6000 },
            { name: 'Special Allowance', amount: absent ? 3818.18 : 4000 }],
          deductionComponents: [{ name: 'Employee ESI', amount: absent ? 72 : 75 }],
          employerContributions: [{ name: 'Employer ESI', amount: absent ? 311 : 325 }] } };
      if (calculations === 2 && readBeforeAcknowledgement) await secondWrite;
      return HttpResponse.json(server);
    }),
    http.post(`http://payslip-correction.test/api/payroll/payslip-corrections/${initial.id}/review`, async ({ request }) => {
      const body = await request.json() as { concurrencyStamp: string };
      expect(body.concurrencyStamp).toBe(server.concurrencyStamp);
      reviews += 1;
      server = { ...server, status: 'REVIEWED', concurrencyStamp: 'reviewed-version', reviewedBy: 'synthetic-reviewer', reviewedAt: '2026-10-05T00:00:00Z' };
      return HttpResponse.json(server);
    }),
  );
  const renderDialog = () => render(<Provider store={store}><PayslipCorrectionDialog document={sourceDocument} canEdit canReview canApply onClose={vi.fn()} /></Provider>);
  const view = renderDialog();
  await screen.findByRole('combobox', { name: /^01 Oct/ });
  fireEvent.mouseDown(screen.getByRole('combobox', { name: /^01 Oct/ }));
  fireEvent.click(screen.getByRole('option', { name: 'Full-day leave' }));
  fireEvent.click(screen.getByRole('button', { name: 'Recalculate' }));
  await waitFor(() => expect(calculations).toBe(1));
  await waitFor(() => expect(reads).toBe(2));
  await waitFor(() => expect(screen.getByRole('button', { name: 'Mark reviewed' })).toBeEnabled());
  // The v2 history GET is still in flight while a valid v2 calculation produces v3.
  fireEvent.mouseDown(screen.getByRole('combobox', { name: /^01 Oct/ }));
  fireEvent.click(screen.getByRole('option', { name: 'Present' }));
  fireEvent.click(screen.getByRole('button', { name: 'Recalculate' }));
  await waitFor(() => expect(calculations).toBe(2));
  if (readBeforeAcknowledgement) {
    await act(async () => { releaseOldRead(); });
    await waitFor(() => expect(payslipApi.endpoints.getPayslipCorrections.select(sourceDocument.id)(store.getState()).data?.[0].concurrencyStamp).toBe('version-2'));
    await act(async () => { releaseSecondWrite(); });
  }
  await waitFor(() => expect(screen.getByRole('button', { name: 'Mark reviewed' })).toBeEnabled());
  if (!readBeforeAcknowledgement) await act(async () => { releaseOldRead(); });
  await waitFor(() => expect(reads).toBe(3));
  await waitFor(() => expect(payslipApi.endpoints.getPayslipCorrections.select(sourceDocument.id)(store.getState()).data?.[0].concurrencyStamp).toBe('version-2'));
  await act(async () => {});
  expect(screen.getByRole('combobox', { name: /^01 Oct/ })).toHaveTextContent('Present');
  expect(within(screen.getByRole('table', { name: 'Correction comparison' })).getByRole('row', { name: 'Net pay ₹9,925 ₹9,925' })).toBeInTheDocument();
  await act(async () => { releaseFreshRead(); });
  if (failFreshRead) {
    expect(await screen.findByRole('alert')).toHaveTextContent('Correction history could not be refreshed.');
    expect(screen.getByRole('combobox', { name: /^01 Oct/ })).toHaveTextContent('Present');
    // Reopening loses component-local acknowledgement. A failed query's older cached
    // calculation must not become actionable or appear as a loaded comparison.
    view.unmount();
    renderDialog();
    await act(async () => {});
    expect(screen.getByRole('button', { name: 'Mark reviewed' })).toBeDisabled();
    expect(screen.queryByRole('table', { name: 'Correction comparison' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
  }
  await waitFor(() => expect(payslipApi.endpoints.getPayslipCorrections.select(sourceDocument.id)(store.getState()).data?.[0].concurrencyStamp).toBe('version-3'));
  fireEvent.click(screen.getByRole('button', { name: 'Mark reviewed' }));
  await waitFor(() => expect(reviews).toBe(1));
  expect(await screen.findByRole('button', { name: 'Reissue payslip' })).toBeEnabled();
  expect(server.concurrencyStamp).toBe('reviewed-version');
  // A later independent recalculation must still update the clean form and clear review.
  server = { ...server, status: 'CALCULATED', concurrencyStamp: 'later-version', reviewedAt: null, reviewedBy: null };
  await act(async () => { await store.dispatch(payslipApi.endpoints.getPayslipCorrections.initiate(sourceDocument.id, { forceRefetch: true })); });
  await waitFor(() => expect(screen.queryByRole('button', { name: 'Reissue payslip' })).not.toBeInTheDocument());
  expect(screen.getByRole('button', { name: 'Mark reviewed' })).toBeEnabled();
});
