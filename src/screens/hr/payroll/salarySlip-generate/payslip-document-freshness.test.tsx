import type { PayslipDocument } from 'src/redux/hr/payslip-api';

import dayjs from 'dayjs';
import { Provider } from 'react-redux';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { configureStore } from '@reduxjs/toolkit';
import { payslipApi } from 'src/redux/hr/payslip-api';
import { hrPermissions } from 'src/constants/hr-menus';
import { runPayrollApi } from 'src/redux/runPayroll/runPayrollApi';
import { it, vi, expect, afterAll, afterEach, beforeEach } from 'vitest';
import { act, render, screen, within, waitFor, cleanup, fireEvent } from '@testing-library/react';

import PaySlipGenerationScreen from './salarySlipGenerate';

const originalApiUrl = vi.hoisted(() => {
  const original = process.env.NEXT_PUBLIC_API_URL;
  process.env.NEXT_PUBLIC_API_URL = 'http://payslip-document.test';
  return original;
});
const loadPreview = vi.hoisted(() => vi.fn());
vi.mock('src/redux/session-cache', () => ({
  getCachedAuthSession: async () => ({ accessToken: 'synthetic-test-token' }),
  clearCachedAuthSession: vi.fn(),
  getAuthSessionCacheRevision: () => 0,
  isAuthSessionCacheCurrent: () => true,
}));
vi.mock('src/routes/hooks', () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock('@mui/icons-material', () => ({ ExpandMore: () => null }));
vi.mock('src/components/toast', () => ({ shikshaMitraToast: { success: vi.fn(), error: vi.fn() } }));
vi.mock('src/components/custom-breadcrumbs', () => ({ CustomBreadcrumbs: () => null }));
vi.mock('@mui/x-date-pickers', () => ({ DatePicker: () => null }));
vi.mock('src/redux/hr/employeeApi', async (importOriginal) => ({
  ...await importOriginal<typeof import('src/redux/hr/employeeApi')>(),
  useLazyGetEmployeeOptionsQuery: () => [vi.fn()],
}));
vi.mock('src/components/paginated-search-select', () => ({
  PaginatedSearchSelect: ({ onChange }: { onChange: (event: null, value: { id: string; label: string }) => void }) =>
    <>
      <button type="button" onClick={() => onChange(null, { id: '11111111-1111-1111-1111-111111111111', label: 'Synthetic employee' })}>Select employee</button>
      <button type="button" onClick={() => onChange(null, { id: '66666666-6666-6666-6666-666666666666', label: 'Another synthetic employee' })}>Select another employee</button>
    </>,
}));
vi.mock('src/redux/runPayroll/runPayrollApi', async (importOriginal) => ({
  ...await importOriginal<typeof import('src/redux/runPayroll/runPayrollApi')>(),
  useLazyGetEmployeeSalarySlipPreviewPdfQuery: () => [loadPreview],
}));
vi.mock('next/dynamic', () => ({ default: () => () => null }));
vi.mock('./payslip-settings-form', () => ({ default: () => null }));
vi.mock('./payslip-settlement-controls', () => ({ default: () => null }));
vi.mock('src/components/customDialog', () => ({
  default: ({ title, children }: { title: string; children: React.ReactNode }) => <div role="dialog" aria-label={title}>{children}</div>,
  DialogScrollContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
vi.mock('src/components/confirm-dialog', () => ({ ConfirmDialog: ({ open, title, action, content, onClose, cancelTitle }: {
  open: boolean; title: string; action: React.ReactNode; content?: React.ReactNode; onClose: () => void; cancelTitle?: string;
}) => open ? <div role="dialog" aria-label={title}>{content}{action}<button type="button" onClick={onClose}>{cancelTitle ?? 'Cancel'}</button></div> : null }));

const first: PayslipDocument = {
  id: '22222222-2222-2222-2222-222222222222', salarySlipId: '33333333-3333-3333-3333-333333333333',
  revision: 1, issuedAt: '2026-10-03T08:00:00Z', issuedBy: 'synthetic-hr', sha256: 'stored-artifact-hash',
  isCurrent: true, replacesDocumentId: null, replacementReason: null, recipientEmail: 'synthetic@example.test',
  paymentStatus: 'Finalized', paidAt: null, paymentReference: null,
};
const replacement: PayslipDocument = { ...first, id: '44444444-4444-4444-4444-444444444444', revision: 2,
  replacesDocumentId: first.id, replacementReason: 'Correct recorded details' };
const selection = { employeeId: '11111111-1111-1111-1111-111111111111', monthYear: dayjs().format('YYYY-MM') };
const secondSelection = { ...selection, employeeId: '66666666-6666-6666-6666-666666666666' };
const second: PayslipDocument = { ...first, id: '77777777-7777-7777-7777-777777777777',
  salarySlipId: '88888888-8888-8888-8888-888888888888', recipientEmail: 'second-person@example.test' };
const permissionNames = [
  `${hrPermissions.payroll.generateSalarySlip}.View`, `${hrPermissions.payroll.generateSalarySlip}.Add`,
  `${hrPermissions.payroll.runPayroll}.View`, `${hrPermissions.payroll.runPayroll}.Add`,
  hrPermissions.payroll.runPayrollAdjustments, hrPermissions.payroll.runPayrollLock,
];
function makeStore() {
  return configureStore({ reducer: {
    [payslipApi.reducerPath]: payslipApi.reducer,
    auth: (state: { permissions: { name: string; isGranted: boolean }[] } | undefined, action: { type: string }) => {
      const current = state ?? { permissions: permissionNames.map((name) => ({ name, isGranted: true })) };
      const revoked = action.type === 'test/revoke-edit' ? `${hrPermissions.payroll.generateSalarySlip}.Add`
        : action.type === 'test/revoke-view' ? `${hrPermissions.payroll.generateSalarySlip}.View` : null;
      return revoked ? { permissions: current.permissions.map((grant) => grant.name === revoked ? { ...grant, isGranted: false } : grant) } : current;
    },
  // Match the application store's checks for the existing Blob response contract.
  }, middleware: (defaults) => defaults({ immutableCheck: false, serializableCheck: false }).concat(payslipApi.middleware) });
}
const stores: ReturnType<typeof makeStore>[] = [];
const createObjectURL = vi.fn(() => 'blob:stored-issued-artifact');
const revokeObjectURL = vi.fn();
beforeEach(() => {
  loadPreview.mockClear();
  createObjectURL.mockClear(); revokeObjectURL.mockClear();
  vi.stubGlobal('URL', class extends URL {
    static createObjectURL = createObjectURL;

    static revokeObjectURL = revokeObjectURL;
  });
});
afterEach(async () => {
  cleanup();
  await act(async () => { stores.forEach((store) => store.dispatch(payslipApi.util.resetApiState())); });
  stores.length = 0;
  vi.unstubAllGlobals();
});
afterAll(() => {
  if (originalApiUrl === undefined) delete process.env.NEXT_PUBLIC_API_URL;
  else process.env.NEXT_PUBLIC_API_URL = originalApiUrl;
});

function fixture(requestedByDisplayName: string | null = 'Synthetic HR', requestedBy: string | null = '99999999-9999-9999-9999-999999999999') {
  const store = makeStore(); stores.push(store);
  expect(runPayrollApi.reducer).toBe(payslipApi.reducer);
  expect(runPayrollApi.middleware).toBe(payslipApi.middleware);
  const summarySelector = runPayrollApi.endpoints.getEmployeeSalarySlip.select(selection);
  // The injected endpoint sets share one reducer at runtime but carry separate static definitions.
  const summary = () => summarySelector(store.getState() as ReturnType<typeof store.getState> & Parameters<typeof summarySelector>[0]);
  let reads = 0;
  let pdfReads = 0;
  let current = first;
  let writes = 0;
  let failRead: number | null = null;
  let holdRead = false;
  let release!: () => void;
  let pending = Promise.resolve();
  let secondHistoryReads = 0;
  let failSecondHistory = false;
  let holdSecondHistory = false;
  let releaseSecondHistory = () => {};
  let pendingSecondHistory = Promise.resolve();
  let firstHistoryReads = 0;
  let firstHistoryFailure: number | null = null;
  let summaryReads = 0;
  let summaryFailure: number | null = null;
  mswServer.use(
    http.get('http://payslip-document.test/api/payroll/salary-slips', ({ request }) => {
      expect(request.headers.get('authorization')).toBe('Bearer synthetic-test-token');
      const params = new URL(request.url).searchParams;
      if (params.get('employeeId') === selection.employeeId) {
        summaryReads += 1;
        if (summaryFailure) return HttpResponse.json({ detail: 'Synthetic summary failure' }, { status: summaryFailure });
      }
      return HttpResponse.json({ employeeId: params.get('employeeId'), monthYear: params.get('monthYear'), status: 'Finalized' });
    }),
    // The real PDF endpoint/hook runs; byte content/rendering is separate acceptance evidence.
    http.get('http://payslip-document.test/api/payroll/payslip-documents/:id/pdf', () => {
      pdfReads += 1;
      return new HttpResponse('%PDF-synthetic-stored-artifact', { headers: { 'Content-Type': 'application/pdf' } });
    }),
    http.get('http://payslip-document.test/api/payroll/payslip-documents', async ({ request }) => {
      expect(request.headers.get('authorization')).toBe('Bearer synthetic-test-token');
      if (new URL(request.url).searchParams.get('employeeId') === secondSelection.employeeId) return HttpResponse.json([second]);
      const response = current.id === first.id ? [first] : [replacement, { ...first, isCurrent: false }];
      reads += 1;
      if (holdRead) await pending;
      if (failRead) return HttpResponse.json({ detail: 'Synthetic read failure' }, { status: failRead });
      return HttpResponse.json(response);
    }),
    http.get('http://payslip-document.test/api/payroll/payslip-deliveries', async ({ request }) => {
      expect(request.headers.get('authorization')).toBe('Bearer synthetic-test-token');
      const slipId = new URL(request.url).searchParams.get('salarySlipId');
      expect([first.salarySlipId, second.salarySlipId]).toContain(slipId);
      const document = slipId === second.salarySlipId ? second : first;
      if (document === second) {
        secondHistoryReads += 1;
        if (holdSecondHistory) await pendingSecondHistory;
        if (failSecondHistory) return HttpResponse.json({ detail: 'Synthetic history failure' }, { status: 503 });
      } else {
        firstHistoryReads += 1;
        if (firstHistoryFailure) return HttpResponse.json({ detail: 'Synthetic history denial' }, { status: firstHistoryFailure });
      }
      return HttpResponse.json([
        { id: `attempt-${document.id}`, documentId: document.id, revision: 1, status: 'PROVIDER_ACCEPTED', recipient: document.recipientEmail,
          requestedAt: document.issuedAt, requestedBy, requestedByDisplayName, startedAt: document.issuedAt, completedAt: document.issuedAt, automatic: false, errorCategory: null },
      ]);
    }),
    http.get('http://payslip-document.test/api/payroll/payslip-corrections', () => HttpResponse.json([
      { id: '55555555-5555-5555-5555-555555555555', sourceDocumentId: first.id, sourceMonth: selection.monthYear,
        reason: 'Correct attendance', status: 'DRAFT', concurrencyStamp: 'correction-version-1',
        attendance: [{ date: `${selection.monthYear}-01`, status: 0, timeIn: null, timeOut: null }],
        originalEarnings: 10000, originalDeductions: 75, originalNetPay: 9925, originalEmployerCost: 10325,
        candidate: null, reviewedBy: null, reviewedAt: null, resultDocumentId: null, settlementMonth: null },
    ])),
    http.post('http://payslip-document.test/api/payroll/payslip-documents/replace-facts', async ({ request }) => {
      const body = await request.json() as { documentId: string };
      expect(body.documentId).toBe(current.id);
      writes += 1;
      return HttpResponse.json(replacement);
    }),
    http.post('http://payslip-document.test/api/payroll/payslip-deliveries', () => { writes += 1; return HttpResponse.json({}); }),
  );
  render(<Provider store={store}><PaySlipGenerationScreen /></Provider>);
  return {
    store, reads: () => reads, writes: () => writes,
    hold: () => { holdRead = true; pending = new Promise<void>((resolve) => { release = resolve; }); },
    fail: (status = 503) => { failRead = status; release(); },
    recover: (changed = false) => { holdRead = false; failRead = null; current = changed ? replacement : first; },
    release: () => release(),
    pdfReads: () => pdfReads,
    secondHistoryReads: () => secondHistoryReads,
    firstHistoryReads: () => firstHistoryReads,
    failFirstHistory: (status: number | null) => { firstHistoryFailure = status; },
    refreshHistory: () => store.dispatch(payslipApi.endpoints.getPayslipDeliveries.initiate(first.salarySlipId, { forceRefetch: true, subscribe: false })),
    summaryReads: () => summaryReads,
    summary,
    failSummary: (status: number | null) => { summaryFailure = status; },
    refreshSummary: () => store.dispatch(runPayrollApi.endpoints.getEmployeeSalarySlip.initiate(selection, { forceRefetch: true, subscribe: false })),
    holdSecondHistory: () => { holdSecondHistory = true; pendingSecondHistory = new Promise<void>((resolve) => { releaseSecondHistory = resolve; }); },
    releaseSecondHistory: (fail = false) => { holdSecondHistory = false; failSecondHistory = fail; releaseSecondHistory(); },
    refresh: () => store.dispatch(payslipApi.endpoints.getPayslipDocuments.initiate(selection, { forceRefetch: true, subscribe: false })),
  };
}
async function selectEmployee() {
  fireEvent.click(screen.getByRole('button', { name: 'Select employee' }));
  await waitFor(() => expect(screen.getByRole('button', { name: 'Resend' })).toBeEnabled());
  await waitFor(() => expect(screen.getByRole('button', { name: 'Download' })).toBeEnabled());
}
async function openDeliveryHistory() {
  const toggle = await screen.findByRole('button', { name: 'Delivery history' });
  if (toggle.getAttribute('aria-expanded') !== 'true') fireEvent.click(toggle);
}

it.each([
  { name: 'Synthetic HR', id: '99999999-9999-9999-9999-999999999999', label: 'Synthetic HR' },
  { name: null, id: '99999999-9999-9999-9999-999999999999', label: 'Unavailable' },
  { name: null, id: null, label: 'Not recorded' },
])('shows the delivery requester without inventing a missing identity ($label)', async ({ name, id, label }) => {
  const f = fixture(name, id);
  await selectEmployee();
  await openDeliveryHistory();
  expect(await screen.findByText(new RegExp(`Requested by: ${label}`))).toBeVisible();
  if (id) expect(screen.queryByText(new RegExp(id))).not.toBeInTheDocument();
  expect(f.writes()).toBe(0);
});

it.each([false, true])('isolates real cached histories across repeated/interrupted selections; late response fails=%s', async (failed) => {
  const f = fixture();
  f.holdSecondHistory();
  const firstHistory = `Revision 1 · Accepted by email provider · ${first.recipientEmail}`;
  const secondHistory = `Revision 1 · Accepted by email provider · ${second.recipientEmail}`;
  try {
    await selectEmployee();
    await openDeliveryHistory();
    expect(await screen.findByText(firstHistory)).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: 'Select another employee' }));
    await openDeliveryHistory();
    expect(await screen.findByLabelText('Loading delivery history')).toBeVisible();
    expect(f.secondHistoryReads()).toBe(1);
    expect(screen.queryByText(new RegExp(first.recipientEmail!))).not.toBeInTheDocument();
    const retainedFirst = payslipApi.endpoints.getPayslipDeliveries.select(first.salarySlipId)(f.store.getState());
    expect(retainedFirst.data?.[0].recipient).toBe(first.recipientEmail);

    fireEvent.click(screen.getByRole('button', { name: 'Select employee' }));
    await openDeliveryHistory();
    expect(await screen.findByText(firstHistory)).toBeVisible();
    await act(async () => { f.releaseSecondHistory(failed); });
    await waitFor(() => {
      const late = payslipApi.endpoints.getPayslipDeliveries.select(second.salarySlipId)(f.store.getState());
      expect(failed ? late.isError : late.isSuccess).toBe(true);
    });
    expect(screen.getByText(firstHistory)).toBeInTheDocument();
    expect(screen.queryByText(new RegExp(second.recipientEmail!))).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Select another employee' }));
    await openDeliveryHistory();
    if (failed) {
      // An errored cache is fetched again on resubscribe, still for B only.
      const error = await screen.findByText('History could not be loaded.');
      expect(error).toBeVisible();
      expect(screen.queryByText(new RegExp(first.recipientEmail!))).not.toBeInTheDocument();
      f.releaseSecondHistory();
      fireEvent.click(within(error.closest('[role="alert"]') as HTMLElement).getByRole('button', { name: 'Retry' }));
    }
    expect(await screen.findByText(secondHistory)).toBeVisible();
    expect(screen.queryByText(new RegExp(first.recipientEmail!))).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Select employee' }));
    await openDeliveryHistory();
    expect(await screen.findByText(firstHistory)).toBeVisible();
    expect(screen.queryByText(new RegExp(second.recipientEmail!))).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Select another employee' }));
    await openDeliveryHistory();
    expect(await screen.findByText(secondHistory)).toBeVisible();
    expect(screen.queryByText(new RegExp(first.recipientEmail!))).not.toBeInTheDocument();
    expect(f.writes()).toBe(0);
  } finally {
    // Do not leave an intercepted request alive when an assertion fails.
    f.releaseSecondHistory();
  }
});

it('keeps the loaded immutable artifact during pending and failed metadata refreshes', async () => {
  const f = fixture(); await selectEmployee();
  expect(f.pdfReads()).toBe(1);
  f.hold();
  let refresh!: ReturnType<typeof f.refresh>;
  act(() => { refresh = f.refresh(); });
  await waitFor(() => expect(f.reads()).toBe(2));
  expect(screen.getByRole('button', { name: 'Download' })).toBeEnabled();
  await act(async () => { f.fail(); await refresh; });
  expect(screen.getByRole('button', { name: 'Download' })).toBeEnabled();
  expect(f.pdfReads()).toBe(1);
  expect(createObjectURL).toHaveBeenCalledTimes(1);
  expect(revokeObjectURL).not.toHaveBeenCalled();
  expect(loadPreview).not.toHaveBeenCalled();
});

it('hides protected cached content after a scope denial and until Retry succeeds', async () => {
  const f = fixture(); await selectEmployee();
  fireEvent.click(screen.getByRole('button', { name: 'Replace document details' }));
  fireEvent.change(screen.getByRole('textbox', { name: 'Correction reason' }), { target: { value: 'Protected source reason' } });
  f.hold();
  let refresh!: ReturnType<typeof f.refresh>;
  act(() => { refresh = f.refresh(); });
  await waitFor(() => expect(f.reads()).toBe(2));
  await act(async () => { f.fail(403); await refresh; });
  const cached = payslipApi.endpoints.getPayslipDocuments.select(selection)(f.store.getState());
  expect(cached.error).toMatchObject({ status: 403 });
  expect(cached.data?.[0].id).toBe(first.id);
  expect(screen.getByRole('button', { name: 'Download' })).toBeDisabled();
  expect(revokeObjectURL).toHaveBeenCalledWith('blob:stored-issued-artifact');
  expect(screen.queryByRole('dialog', { name: 'Replace document details' })).not.toBeInTheDocument();
  expect(screen.queryByText(/synthetic@example.test/)).not.toBeInTheDocument();
  expect(screen.queryByText(/Requested by:/)).not.toBeInTheDocument();
  f.recover(); f.hold();
  fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
  await waitFor(() => expect(f.reads()).toBe(3));
  expect(screen.getByRole('button', { name: 'Download' })).toBeDisabled();
  expect(screen.queryByRole('dialog', { name: 'Replace document details' })).not.toBeInTheDocument();
  await act(async () => { f.recover(); f.release(); });
  await waitFor(() => expect(screen.getByRole('button', { name: 'Download' })).toBeEnabled());
  expect(f.writes()).toBe(0);
});

it('hides retained payroll content when the salary summary discovers a scope denial first', async () => {
  const f = fixture(); await selectEmployee();
  await openDeliveryHistory();
  expect(await screen.findByText(/Requested by: Synthetic HR/)).toBeVisible();
  const documentBefore = payslipApi.endpoints.getPayslipDocuments.select(selection)(f.store.getState());
  fireEvent.click(screen.getByRole('button', { name: 'Correct payroll' }));
  await screen.findByRole('combobox', { name: /^01 / });
  f.failSummary(403);
  await act(async () => { await f.refreshSummary(); });
  const summary = f.summary();
  expect(summary.error).toMatchObject({ status: 403 });
  expect(summary.data?.employeeId).toBe(selection.employeeId);
  expect(payslipApi.endpoints.getPayslipDocuments.select(selection)(f.store.getState()).requestId).toBe(documentBefore.requestId);
  expect(screen.queryByText(/Requested by:/)).not.toBeInTheDocument();
  expect(screen.queryByText(/synthetic@example.test/)).not.toBeInTheDocument();
  expect(screen.queryByRole('dialog', { name: 'Correct payroll' })).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Download' })).toBeDisabled();
  expect(revokeObjectURL).toHaveBeenCalledWith('blob:stored-issued-artifact');
  expect(screen.getByText('You do not have access to this payslip.')).toBeVisible();
  f.failSummary(null); f.hold();
  fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
  await waitFor(() => expect(f.reads()).toBe(2));
  expect(screen.queryByText(/Requested by:/)).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Download' })).toBeDisabled();
  await act(async () => { f.recover(); f.release(); });
  await waitFor(() => expect(screen.getByRole('button', { name: 'Resend' })).toBeEnabled());
  await openDeliveryHistory();
  expect(await screen.findByText(/Requested by: Synthetic HR/)).toBeVisible();
  expect(f.summaryReads()).toBe(3);
  expect(f.writes()).toBe(0);
});

it('retains a salary-summary denial across employee switches and failed document retries', async () => {
  const f = fixture(); await selectEmployee();
  f.failSummary(403);
  await act(async () => { await f.refreshSummary(); });
  expect(screen.getByText('You do not have access to this payslip.')).toBeVisible();
  f.hold();
  try {
    fireEvent.click(screen.getByRole('button', { name: 'Select another employee' }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Resend' })).toBeEnabled());
    await waitFor(() => expect(screen.getByRole('button', { name: 'Download' })).toBeEnabled());
    expect(screen.queryByText('You do not have access to this payslip.')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Select employee' }));
    await waitFor(() => expect(f.reads()).toBe(2));
    expect(screen.getByRole('button', { name: 'Download' })).toBeDisabled();
    expect(screen.queryByText(/synthetic@example.test/)).not.toBeInTheDocument();
    await act(async () => { f.fail(503); });
    await waitFor(() => expect(payslipApi.endpoints.getPayslipDocuments.select(selection)(f.store.getState()).error).toMatchObject({ status: 503 }));
    expect(screen.getByRole('button', { name: 'Download' })).toBeDisabled();
    f.recover(); f.hold(); f.failSummary(null);
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    await waitFor(() => expect(f.reads()).toBe(3));
    await waitFor(() => expect(f.summary().isSuccess).toBe(true));
    expect(screen.queryByText(/synthetic@example.test/)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Download' })).toBeDisabled();
    await act(async () => { f.recover(); f.release(); });
    await waitFor(() => expect(screen.getByRole('button', { name: 'Resend' })).toBeEnabled());
    await openDeliveryHistory();
    expect(await screen.findByText(/Requested by: Synthetic HR/)).toBeVisible();
    expect(f.writes()).toBe(0);
  } finally { f.recover(); f.release(); }
});

it('preserves the authorized artifact during an ordinary salary-summary outage', async () => {
  const f = fixture(); await selectEmployee();
  f.failSummary(503);
  await act(async () => { await f.refreshSummary(); });
  expect(f.summary().error).toMatchObject({ status: 503 });
  expect(screen.getByText('The payslip could not be loaded.')).toBeVisible();
  expect(screen.getByRole('button', { name: 'Download' })).toBeEnabled();
  expect(screen.getByRole('button', { name: 'Correct payroll' })).toBeEnabled();
  expect(f.pdfReads()).toBe(1);
  expect(revokeObjectURL).not.toHaveBeenCalled();
  f.failSummary(null);
  fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
  await waitFor(() => expect(f.summary().isSuccess).toBe(true));
  await waitFor(() => expect(screen.getByRole('button', { name: 'Resend' })).toBeEnabled());
  expect(f.pdfReads()).toBe(1);
  expect(f.writes()).toBe(0);
});

it('hides retained payroll content when delivery polling discovers a scope denial first', async () => {
  const f = fixture(); await selectEmployee();
  await openDeliveryHistory();
  expect(await screen.findByText(/Requested by: Synthetic HR/)).toBeVisible();
  const documentBefore = payslipApi.endpoints.getPayslipDocuments.select(selection)(f.store.getState());
  fireEvent.click(screen.getByRole('button', { name: 'Correct payroll' }));
  await screen.findByRole('combobox', { name: /^01 / });
  f.failFirstHistory(403);
  await act(async () => { await f.refreshHistory(); });
  const history = payslipApi.endpoints.getPayslipDeliveries.select(first.salarySlipId)(f.store.getState());
  expect(history.error).toMatchObject({ status: 403 });
  expect(history.data?.[0].recipient).toBe(first.recipientEmail);
  // The document endpoint has not polled, so its success is older than the denial.
  expect(payslipApi.endpoints.getPayslipDocuments.select(selection)(f.store.getState()).requestId).toBe(documentBefore.requestId);
  expect(screen.queryByText(/Requested by:/)).not.toBeInTheDocument();
  expect(screen.queryByText(/synthetic@example.test/)).not.toBeInTheDocument();
  expect(screen.queryByRole('dialog', { name: 'Correct payroll' })).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Download' })).toBeDisabled();
  expect(revokeObjectURL).toHaveBeenCalledWith('blob:stored-issued-artifact');
  expect(screen.getByText('You do not have access to this payslip.')).toBeVisible();
  f.failFirstHistory(null); f.hold();
  fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
  await waitFor(() => expect(f.reads()).toBe(2));
  expect(screen.queryByText(/Requested by:/)).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Download' })).toBeDisabled();
  await act(async () => { f.recover(); f.release(); });
  await waitFor(() => expect(screen.getByRole('button', { name: 'Download' })).toBeEnabled());
  await openDeliveryHistory();
  expect(await screen.findByText(/Requested by: Synthetic HR/)).toBeVisible();
  await waitFor(() => {
    expect(f.firstHistoryReads()).toBeGreaterThanOrEqual(3);
    expect(payslipApi.endpoints.getPayslipDeliveries.select(first.salarySlipId)(f.store.getState()).isSuccess).toBe(true);
  });
  expect(f.writes()).toBe(0);
});

it('retains a history denial across interrupted selections and failed authorization retries', async () => {
  const f = fixture(); await selectEmployee();
  f.failFirstHistory(403);
  await act(async () => { await f.refreshHistory(); });
  expect(screen.getByText('You do not have access to this payslip.')).toBeVisible();
  f.hold();
  try {
    fireEvent.click(screen.getByRole('button', { name: 'Select another employee' }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Resend' })).toBeEnabled());
    expect(screen.queryByText('You do not have access to this payslip.')).not.toBeInTheDocument();
    await waitFor(() => expect(screen.getByRole('button', { name: 'Download' })).toBeEnabled());
    fireEvent.click(screen.getByRole('button', { name: 'Select employee' }));
    await waitFor(() => expect(f.reads()).toBe(2));
    expect(screen.getByRole('button', { name: 'Download' })).toBeDisabled();
    expect(screen.queryByText(/synthetic@example.test/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Requested by:/)).not.toBeInTheDocument();
    await act(async () => { f.fail(503); });
    await waitFor(() => expect(payslipApi.endpoints.getPayslipDocuments.select(selection)(f.store.getState()).error).toMatchObject({ status: 503 }));
    await screen.findByText('You do not have access to this payslip.');
    expect(screen.getByRole('button', { name: 'Download' })).toBeDisabled();
    f.recover(); f.hold();
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    await waitFor(() => expect(f.reads()).toBe(3));
    expect(screen.getByRole('button', { name: 'Download' })).toBeDisabled();
    await act(async () => { f.fail(403); });
    await waitFor(() => expect(payslipApi.endpoints.getPayslipDocuments.select(selection)(f.store.getState()).error).toMatchObject({ status: 403 }));
    await screen.findByText('You do not have access to this payslip.');
    expect(screen.queryByText(/synthetic@example.test/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Requested by:/)).not.toBeInTheDocument();
    f.failFirstHistory(null); f.recover();
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    await waitFor(() => expect(f.reads()).toBe(4));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Resend' })).toBeEnabled());
    await openDeliveryHistory();
    expect(await screen.findByText(/Requested by: Synthetic HR/)).toBeVisible();
    expect(f.writes()).toBe(0);
  } finally {
    f.recover(); f.release();
  }
});

it('preserves the authorized artifact during a recoverable history outage without allowing a duplicate send', async () => {
  const f = fixture(); await selectEmployee();
  await openDeliveryHistory();
  f.failFirstHistory(503);
  await act(async () => { await f.refreshHistory(); });
  const error = await screen.findByText('History could not be loaded.');
  expect(error).toBeVisible();
  expect(screen.getByRole('button', { name: 'Download' })).toBeEnabled();
  expect(screen.getByRole('button', { name: 'Resend' })).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Correct payroll' })).toBeEnabled();
  expect(screen.getByText(/Requested by: Synthetic HR/)).toBeVisible();
  expect(f.pdfReads()).toBe(1);
  expect(revokeObjectURL).not.toHaveBeenCalled();
  f.failFirstHistory(null);
  fireEvent.click(within(error.closest('[role="alert"]') as HTMLElement).getByRole('button', { name: 'Retry' }));
  await waitFor(() => expect(screen.getByRole('button', { name: 'Resend' })).toBeEnabled());
  expect(f.firstHistoryReads()).toBe(3);
  expect(f.pdfReads()).toBe(1);
  expect(f.writes()).toBe(0);
});

it.each([false, true])('retains a document-details draft through failed refresh; source replaced=$changed', async (changed) => {
  const f = fixture(); await selectEmployee();
  fireEvent.click(screen.getByRole('button', { name: 'Replace document details' }));
  const reason = 'Correct the recorded employee details';
  fireEvent.change(screen.getByRole('textbox', { name: 'Correction reason' }), { target: { value: reason } });
  f.hold();
  let refresh!: ReturnType<typeof f.refresh>;
  act(() => { refresh = f.refresh(); });
  await waitFor(() => expect(f.reads()).toBe(2));
  expect(screen.getByRole('button', { name: 'Issue replacement' })).toBeDisabled();
  await act(async () => { f.fail(); await refresh; });
  expect(screen.getByRole('textbox', { name: 'Correction reason' })).toHaveValue(reason);
  expect(screen.getByRole('button', { name: 'Issue replacement' })).toBeDisabled();
  expect(screen.queryByText(/Revision 1 · Current/)).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Download' })).toBeEnabled();
  expect(f.writes()).toBe(0);
  f.recover(changed);
  fireEvent.click(within(screen.getByRole('dialog', { name: 'Replace document details' })).getByRole('button', { name: 'Retry' }));
  await waitFor(() => expect(payslipApi.endpoints.getPayslipDocuments.select(selection)(f.store.getState()).isSuccess).toBe(true));
  expect(screen.getByRole('textbox', { name: 'Correction reason' })).toHaveValue(reason);
  if (changed) {
    expect(screen.getByRole('button', { name: 'Issue replacement' })).toBeDisabled();
    expect(screen.getByRole('dialog', { name: 'Replace document details' })).toHaveTextContent('This revision is no longer current.');
  } else {
    expect(screen.getByRole('button', { name: 'Issue replacement' })).toBeEnabled();
    fireEvent.click(screen.getByRole('button', { name: 'Issue replacement' }));
    await waitFor(() => expect(f.writes()).toBe(1));
  }
});

it('prevents a previously opened resend after a failed document refresh or edit revocation', async () => {
  const f = fixture(); await selectEmployee();
  fireEvent.click(screen.getByRole('button', { name: 'Resend' }));
  const dialog = screen.getByRole('dialog', { name: 'Resend payslip?' });
  f.hold();
  let refresh!: ReturnType<typeof f.refresh>;
  act(() => { refresh = f.refresh(); });
  await waitFor(() => expect(f.reads()).toBe(2));
  expect(within(dialog).getByRole('button', { name: 'Resend' })).toBeDisabled();
  await act(async () => { f.fail(); await refresh; });
  expect(within(dialog).getByRole('button', { name: 'Resend' })).toBeDisabled();
  f.recover();
  fireEvent.click(within(dialog).getByRole('button', { name: 'Retry' }));
  await waitFor(() => expect(within(dialog).getByRole('button', { name: 'Resend' })).toBeEnabled());
  act(() => { f.store.dispatch({ type: 'test/revoke-edit' }); });
  expect(within(dialog).getByRole('button', { name: 'Resend' })).toBeDisabled();
  expect(f.writes()).toBe(0);
});

it('retains correction attendance without allowing stale actions, and hides it after View revocation', async () => {
  const f = fixture(); await selectEmployee();
  fireEvent.click(screen.getByRole('button', { name: 'Correct payroll' }));
  fireEvent.mouseDown(await screen.findByRole('combobox', { name: /^01 / }));
  fireEvent.click(screen.getByRole('option', { name: 'Full-day leave' }));
  f.hold();
  let refresh!: ReturnType<typeof f.refresh>;
  act(() => { refresh = f.refresh(); });
  await waitFor(() => expect(f.reads()).toBe(2));
  expect(screen.getByRole('button', { name: 'Recalculate' })).toBeDisabled();
  await act(async () => { f.fail(); await refresh; });
  expect(screen.getByRole('combobox', { name: /^01 / })).toHaveTextContent('Full-day leave');
  expect(screen.getByRole('button', { name: 'Recalculate' })).toBeDisabled();
  f.recover();
  fireEvent.click(within(screen.getByRole('dialog', { name: 'Correct payroll' })).getByRole('button', { name: 'Retry' }));
  await waitFor(() => expect(screen.getByRole('button', { name: 'Recalculate' })).toBeEnabled());
  expect(screen.getByRole('combobox', { name: /^01 / })).toHaveTextContent('Full-day leave');
  expect(screen.getByRole('button', { name: 'Recalculate' })).toBeEnabled();
  act(() => { f.store.dispatch({ type: 'test/revoke-view' }); });
  expect(screen.queryByRole('dialog', { name: 'Correct payroll' })).not.toBeInTheDocument();
  expect(screen.getByText('You do not have access to payslips.')).toBeInTheDocument();
});

it('does not treat a failed warm-cache metadata read as current document authority', async () => {
  const f = fixture(); await selectEmployee();
  f.hold();
  let refresh!: ReturnType<typeof f.refresh>;
  act(() => { refresh = f.refresh(); });
  await waitFor(() => expect(f.reads()).toBe(2));
  await act(async () => { f.fail(); await refresh; });
  const query = payslipApi.endpoints.getPayslipDocuments.select(selection)(f.store.getState());
  expect(query.isError).toBe(true);
  expect(query.data?.[0].id).toBe(first.id);
  expect(screen.getByRole('button', { name: 'Record payment' })).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Replace document details' })).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Correct payroll' })).toBeDisabled();
  expect(screen.queryByText(/Revision 1 · Current/)).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Download' })).toBeEnabled();
});

it('keeps an unsaved document-details reason when another request replaces the source revision', async () => {
  const f = fixture(); await selectEmployee();
  fireEvent.click(screen.getByRole('button', { name: 'Replace document details' }));
  const reason = 'A draft for the previous source revision';
  fireEvent.change(screen.getByRole('textbox', { name: 'Correction reason' }), { target: { value: reason } });
  f.recover(true);
  await act(async () => { await f.refresh(); });
  expect(screen.getByRole('textbox', { name: 'Correction reason' })).toHaveValue(reason);
  expect(screen.getByRole('button', { name: 'Issue replacement' })).toBeDisabled();
  expect(screen.getByRole('dialog', { name: 'Replace document details' })).toHaveTextContent('This revision is no longer current.');
  expect(f.writes()).toBe(0);
});

it('removes already opened protected correction content when View is revoked', async () => {
  const f = fixture(); await selectEmployee();
  fireEvent.click(screen.getByRole('button', { name: 'Correct payroll' }));
  await screen.findByRole('combobox', { name: /^01 / });
  act(() => { f.store.dispatch({ type: 'test/revoke-view' }); });
  expect(screen.queryByRole('dialog', { name: 'Correct payroll' })).not.toBeInTheDocument();
  expect(screen.queryByRole('combobox', { name: /^01 / })).not.toBeInTheDocument();
  expect(screen.getByText('You do not have access to payslips.')).toBeInTheDocument();
});
