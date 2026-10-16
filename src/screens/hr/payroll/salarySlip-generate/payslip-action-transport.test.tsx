import type { ReactElement } from 'react';
import type { PayslipDocument, PayslipCorrection } from 'src/redux/hr/payslip-api';

import { Provider } from 'react-redux';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { configureStore } from '@reduxjs/toolkit';
import { payslipApi } from 'src/redux/hr/payslip-api';
import { it, vi, expect, afterAll, afterEach } from 'vitest';
import { act, render, screen, cleanup, waitFor, fireEvent } from '@testing-library/react';

import PayslipCorrectionDialog from './payslip-correction-dialog';
import PayslipSettlementControls from './payslip-settlement-controls';
import PayslipDocumentActionDialog from './payslip-document-action-dialog';

const originalApiUrl = vi.hoisted(() => {
  const original = process.env.NEXT_PUBLIC_API_URL;
  process.env.NEXT_PUBLIC_API_URL = 'http://payslip-transport.test';
  return original;
});
vi.mock('src/redux/session-cache', () => ({
  getCachedAuthSession: async () => ({ accessToken: 'synthetic-test-token' }),
  clearCachedAuthSession: vi.fn(),
  getAuthSessionCacheRevision: () => 0,
  isAuthSessionCacheCurrent: () => true,
}));
vi.mock('src/routes/hooks', () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock('src/hooks/use-unsaved-navigation', () => ({
  useUnsavedNavigation: () => ({ requestNavigation: (proceed: () => void) => proceed(), confirmation: null }),
}));

const origin = 'http://payslip-transport.test/api';
const connectionMessage = 'The request could not be confirmed. Check your connection and try again.';
const responseMessage = 'The server response could not be read. Try again.';
const document = { id: 'issued-document', revision: 1, paymentStatus: 'Finalized' } as PayslipDocument;
const correction = { id: 'paid-correction', sourceMonth: '2026-10', concurrencyStamp: 'version-1', status: 'REVIEWED' } as PayslipCorrection;
const stores: ReturnType<typeof makeStore>[] = [];
function makeStore() {
  return configureStore({
    reducer: {
      [payslipApi.reducerPath]: payslipApi.reducer,
      confirmPopup: () => ({ isChanges: false }),
      globalState: () => ({ currentYear: { id: 'test-year' } }),
    },
    middleware: (defaults) => defaults().concat(payslipApi.middleware),
  });
}
function renderWithStore(view: ReactElement) {
  const store = makeStore();
  stores.push(store);
  return render(<Provider store={store}>{view}</Provider>);
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

it.each(['payment', 'replace'] as const)('keeps the %s draft and request identity after an actual fetch failure, then retries', async (mode) => {
  const requests: Record<string, unknown>[] = [];
  const onClose = vi.fn();
  const endpoint = mode === 'payment' ? 'payment' : 'replace-facts';
  mswServer.use(http.post(`${origin}/payroll/payslip-documents/${endpoint}`, async ({ request }) => {
    expect(request.headers.get('authorization')).toBe('Bearer synthetic-test-token');
    requests.push(await request.json() as Record<string, unknown>);
    return requests.length === 1 ? HttpResponse.error() : HttpResponse.json({ id: 'replacement' });
  }));
  renderWithStore(<PayslipDocumentActionDialog document={document} mode={mode}
    disabledReason={null} onClose={onClose} />);
  const label = mode === 'payment' ? 'Payment reference' : 'Correction reason';
  const action = mode === 'payment' ? 'Record payment' : 'Issue replacement';
  const draft = mode === 'payment' ? 'Synthetic bank reference' : 'Correct the recorded bank details';
  fireEvent.change(screen.getByLabelText(label), { target: { value: draft } });
  if (mode === 'payment') fireEvent.change(screen.getByLabelText('Payment date and time'), { target: { value: '2026-01-01T10:00' } });
  fireEvent.click(screen.getByRole('button', { name: action }));
  await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent(connectionMessage));
  expect(screen.getByLabelText(label)).toHaveValue(draft);
  expect(screen.getByRole('alert')).not.toHaveTextContent(/TypeError|Failed to fetch/);
  expect(onClose).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: action }));
  await waitFor(() => expect(onClose).toHaveBeenCalledOnce());
  expect(requests).toHaveLength(2);
  expect(requests[1]).toEqual(requests[0]);
});

it('keeps a correction reason and request identity when the server returns unreadable JSON', async () => {
  const requests: Record<string, unknown>[] = [];
  mswServer.use(
    http.get(`${origin}/payroll/payslip-corrections`, () => HttpResponse.json([])),
    http.post(`${origin}/payroll/payslip-corrections`, async ({ request }) => {
      requests.push(await request.json() as Record<string, unknown>);
      if (requests.length === 1) return new HttpResponse('not valid JSON', { headers: { 'Content-Type': 'application/json' } });
      return HttpResponse.json({ ...correction, status: 'DRAFT', reason: 'Correct recorded attendance', attendance: [] });
    }),
  );
  renderWithStore(<PayslipCorrectionDialog document={document} canEdit canReview canApply onClose={vi.fn()} />);
  const reason = await screen.findByLabelText('Correction reason');
  fireEvent.change(reason, { target: { value: 'Correct recorded attendance' } });
  fireEvent.click(screen.getByRole('button', { name: 'Start correction' }));
  await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent(responseMessage));
  expect(reason).toHaveValue('Correct recorded attendance');
  expect(screen.getByRole('alert')).not.toHaveTextContent(/SyntaxError|Unexpected token|not valid JSON/);
  fireEvent.click(screen.getByRole('button', { name: 'Start correction' }));
  await screen.findByRole('button', { name: 'Recalculate' });
  expect(requests).toHaveLength(2);
  expect(requests[1]).toEqual(requests[0]);
});

it('retains the selected settlement month after a failed fetch and retries the same target', async () => {
  const requests: Record<string, unknown>[] = [];
  mswServer.use(
    http.post(`${origin}/payroll/run/previews`, async ({ request }) => {
      requests.push(await request.json() as Record<string, unknown>);
      return requests.length === 1 ? HttpResponse.error() : HttpResponse.json({ id: 'target-run' });
    }),
    http.get(`${origin}/payroll/run/previews/target-run`, () => HttpResponse.json({ id: 'target-run', status: 'SUCCEEDED', isCurrent: true })),
  );
  renderWithStore(<PayslipSettlementControls correction={correction} disabled={false}
    onSettled={vi.fn()} onBusy={vi.fn()} onDirty={vi.fn()} />);
  fireEvent.change(screen.getByLabelText('Settlement month'), { target: { value: '2026-12' } });
  fireEvent.click(screen.getByRole('button', { name: 'Calculate target payroll' }));
  await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent(connectionMessage));
  expect(screen.getByLabelText('Settlement month')).toHaveValue('2026-12');
  expect(screen.getByRole('button', { name: 'Apply settlement' })).toBeDisabled();
  fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
  await waitFor(() => expect(screen.getByRole('button', { name: 'Apply settlement' })).toBeEnabled());
  expect(requests).toHaveLength(2);
  expect(requests[1]).toEqual({ month: '2026-12', academicYearId: 'test-year', refresh: false });
  expect(requests[1]).toEqual(requests[0]);
});

it('keeps the reviewed settlement target after a failed apply and explicitly retries without new money fields', async () => {
  const requests: Record<string, unknown>[] = [];
  const onSettled = vi.fn();
  mswServer.use(
    http.post(`${origin}/payroll/run/previews`, () => HttpResponse.json({ id: 'target-run' })),
    http.get(`${origin}/payroll/run/previews/target-run`, () => HttpResponse.json({ id: 'target-run', status: 'SUCCEEDED', isCurrent: true })),
    http.post(`${origin}/payroll/payslip-corrections/paid-correction/settle`, async ({ request }) => {
      requests.push(await request.json() as Record<string, unknown>);
      return requests.length === 1 ? HttpResponse.error() : HttpResponse.json({ ...correction, status: 'APPLIED' });
    }),
  );
  renderWithStore(<PayslipSettlementControls correction={correction} disabled={false}
    onSettled={onSettled} onBusy={vi.fn()} onDirty={vi.fn()} />);
  fireEvent.click(screen.getByRole('button', { name: 'Calculate target payroll' }));
  await waitFor(() => expect(screen.getByRole('button', { name: 'Apply settlement' })).toBeEnabled());
  fireEvent.click(screen.getByRole('button', { name: 'Apply settlement' }));
  await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent(connectionMessage));
  expect(onSettled).not.toHaveBeenCalled();
  expect(requests).toHaveLength(1);
  expect(screen.getByLabelText('Settlement month')).toHaveValue('2026-11');
  fireEvent.click(screen.getByRole('button', { name: 'Apply settlement' }));
  await waitFor(() => expect(onSettled).toHaveBeenCalledOnce());
  expect(requests).toHaveLength(2);
  expect(requests[1]).toEqual(requests[0]);
  expect(requests[0]).toStrictEqual({ concurrencyStamp: 'version-1', targetMonth: '2026-11', previewRunId: 'target-run' });
});

it('retains the backend blocking explanation rather than replacing it with a transport message', async () => {
  const onClose = vi.fn();
  mswServer.use(http.post(`${origin}/payroll/payslip-documents/replace-facts`, () => HttpResponse.json({
    error: { message: 'The document changed. Refresh it before issuing a replacement.' },
  }, { status: 400 })));
  renderWithStore(<PayslipDocumentActionDialog document={document} mode="replace"
    disabledReason={null} onClose={onClose} />);
  fireEvent.change(screen.getByLabelText('Correction reason'), { target: { value: 'Correct recorded bank details' } });
  fireEvent.click(screen.getByRole('button', { name: 'Issue replacement' }));
  await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('The document changed. Refresh it before issuing a replacement.'));
  expect(screen.getByRole('alert')).not.toHaveTextContent(connectionMessage);
  expect(screen.getByLabelText('Correction reason')).toHaveValue('Correct recorded bank details');
  expect(onClose).not.toHaveBeenCalled();
});
