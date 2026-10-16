import type { ReactNode } from 'react';

import { Provider } from 'react-redux';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { configureStore } from '@reduxjs/toolkit';
import { payslipApi } from 'src/redux/hr/payslip-api';
import { shikshaMitraToast } from 'src/components/toast';
import { it, vi, expect, afterAll, afterEach } from 'vitest';
import { act, render, screen, within, cleanup, waitFor, fireEvent } from '@testing-library/react';

import PaySlipGenerationScreen from './salarySlipGenerate';

const previousApiUrl = vi.hoisted(() => {
  const original = process.env.NEXT_PUBLIC_API_URL;
  process.env.NEXT_PUBLIC_API_URL = 'http://payslip-send.test';
  return original;
});
vi.mock('src/redux/session-cache', () => ({
  getCachedAuthSession: async () => ({ accessToken: 'synthetic-test-token' }),
  clearCachedAuthSession: vi.fn(),
  getAuthSessionCacheRevision: () => 0,
  isAuthSessionCacheCurrent: () => true,
}));
vi.mock('src/utils/permissions', () => ({ hasGrantedPermission: () => true }));
vi.mock('src/components/toast', () => ({ shikshaMitraToast: { success: vi.fn(), error: vi.fn() } }));
vi.mock('src/components/custom-breadcrumbs', () => ({ CustomBreadcrumbs: () => null }));
vi.mock('@mui/x-date-pickers', () => ({ DatePicker: () => null }));
vi.mock('src/components/paginated-search-select', () => ({
  PaginatedSearchSelect: ({ onChange }: { onChange: (event: null, value: { id: string; label: string }) => void }) => <>
    <button type="button" onClick={() => onChange(null, { id: 'a', label: 'Employee A' })}>Select A</button>
    <button type="button" onClick={() => onChange(null, { id: 'b', label: 'Employee B' })}>Select B</button>
  </>,
}));
vi.mock('src/components/confirm-dialog', () => ({
  ConfirmDialog: ({ open, title, content, action }: { open: boolean; title: string; content: ReactNode; action: ReactNode }) =>
    open ? <div role="dialog" aria-label={title}>{content}{action}</div> : null,
}));
vi.mock('./payslip-settings-form', () => ({ default: () => null }));
vi.mock('./payslip-correction-dialog', () => ({ default: () => null }));
vi.mock('./payslip-document-action-dialog', () => ({ default: () => null }));
vi.mock('../../employee/employee-account-email-action', () => ({ default: () => null }));
vi.mock('./use-payslip-actions', () => ({ usePayslipActions: () => ({ pdfUrl: null, isLoading: false, error: null }) }));

const origin = 'http://payslip-send.test/api';
type Request = { documentId: string; idempotencyKey: string };
const stores: ReturnType<typeof makeStore>[] = [];
function makeStore() {
  return configureStore({ reducer: {
    [payslipApi.reducerPath]: payslipApi.reducer,
    auth: () => ({ permissions: {} }),
    globalState: () => ({ currentYear: { id: 'synthetic-year' } }),
  }, middleware: (defaults) => defaults().concat(payslipApi.middleware) });
}
const attempt = (input: Request, status: string) => ({
  id: `attempt-${input.idempotencyKey}`, documentId: input.documentId, idempotencyKey: input.idempotencyKey,
  revision: 1, recipient: `${input.documentId}@test.shikshamitra.local`, status,
  errorCategory: status === 'FAILED' ? 'RECIPIENT_CHANGED' : null, automatic: false,
  requestedAt: '2026-10-06T11:00:00Z', requestedBy: null, requestedByDisplayName: null,
  startedAt: null, completedAt: null,
});
function mount(history: Record<string, ReturnType<typeof attempt>[]> = {}) {
  mswServer.use(
    http.get(`${origin}/payroll/salary-slips`, () => HttpResponse.json(null)),
    http.get(`${origin}/payroll/payslip-documents`, ({ request }) => {
      const employeeId = new URL(request.url).searchParams.get('employeeId');
      return HttpResponse.json([{ id: `document-${employeeId}`, salarySlipId: `slip-${employeeId}`,
        revision: 1, isCurrent: true, paymentStatus: 'Finalized', recipientEmail: `${employeeId}@test.shikshamitra.local`,
        issuedAt: '2026-10-06T11:00:00Z' }]);
    }),
    http.get(`${origin}/payroll/payslip-deliveries`, ({ request }) => {
      const employeeId = new URL(request.url).searchParams.get('salarySlipId')!.replace('slip-', '');
      return HttpResponse.json(history[`document-${employeeId}`] ?? []);
    }),
  );
  const store = makeStore();
  stores.push(store);
  render(<Provider store={store}><PaySlipGenerationScreen /></Provider>);
}
async function select(employee: string, label = 'Send') {
  fireEvent.click(screen.getByRole('button', { name: `Select ${employee}` }));
  await waitFor(() => expect(screen.getByRole('button', { name: label })).toBeEnabled());
}
afterEach(async () => {
  cleanup();
  await act(async () => { stores.forEach((store) => store.dispatch(payslipApi.util.resetApiState())); });
  stores.length = 0;
  vi.clearAllMocks();
});
afterAll(() => {
  if (previousApiUrl === undefined) delete process.env.NEXT_PUBLIC_API_URL;
  else process.env.NEXT_PUBLIC_API_URL = previousApiUrl;
});

it('uses a new explicit resend key once history confirms a send whose response was lost', async () => {
  const requests: Request[] = [];
  const history: Record<string, ReturnType<typeof attempt>[]> = {};
  mswServer.use(http.post(`${origin}/payroll/payslip-deliveries`, async ({ request }) => {
    expect(request.headers.get('authorization')).toBe('Bearer synthetic-test-token');
    const input = await request.json() as Request;
    requests.push(input);
    history[input.documentId] = [attempt(input, 'PROVIDER_ACCEPTED')];
    return requests.length === 1 ? HttpResponse.error() : HttpResponse.json(attempt(input, 'QUEUED'));
  }));
  mount(history);
  await select('A');
  fireEvent.click(screen.getByRole('button', { name: 'Send' }));
  await waitFor(() => expect(shikshaMitraToast.error).toHaveBeenCalled());
  await select('B');
  await select('A', 'Resend');
  fireEvent.click(screen.getByRole('button', { name: 'Resend' }));
  fireEvent.click(within(screen.getByRole('dialog', { name: 'Resend payslip?' })).getByRole('button', { name: 'Resend' }));
  await waitFor(() => expect(requests).toHaveLength(2));
  expect(requests[1].idempotencyKey).not.toBe(requests[0].idempotencyKey);
  expect(requests[1].documentId).toBe(requests[0].documentId);
});

it('keeps independent unconfirmed retry keys across interrupted and repeated employee selections', async () => {
  const requests: Request[] = [];
  let releaseFirst!: () => void;
  const firstResponse = new Promise<void>((resolve) => { releaseFirst = resolve; });
  mswServer.use(http.post(`${origin}/payroll/payslip-deliveries`, async ({ request }) => {
    const input = await request.json() as Request;
    requests.push(input);
    const index = requests.length;
    if (index === 1) await firstResponse;
    return index <= 2 ? HttpResponse.error() : HttpResponse.json(attempt(input, 'QUEUED'));
  }));
  mount();
  await select('A');
  fireEvent.click(screen.getByRole('button', { name: 'Send' }));
  await waitFor(() => expect(requests).toHaveLength(1));
  fireEvent.click(screen.getByRole('button', { name: 'Select B' }));
  releaseFirst();
  await waitFor(() => expect(shikshaMitraToast.error).toHaveBeenCalledTimes(1));
  await select('B');
  fireEvent.click(screen.getByRole('button', { name: 'Send' }));
  await waitFor(() => expect(shikshaMitraToast.error).toHaveBeenCalledTimes(2));
  await select('A');
  fireEvent.click(screen.getByRole('button', { name: 'Send' }));
  await waitFor(() => expect(requests).toHaveLength(3));
  expect(requests[2]).toEqual(requests[0]);
  await waitFor(() => expect(shikshaMitraToast.success).toHaveBeenCalled());
  await select('B');
  fireEvent.click(screen.getByRole('button', { name: 'Send' }));
  await waitFor(() => expect(requests).toHaveLength(4));
  expect(requests[3]).toEqual(requests[1]);
});

it('shows a plain unconfirmed-request message for a failed send transport', async () => {
  mswServer.use(http.post(`${origin}/payroll/payslip-deliveries`, () => HttpResponse.error()));
  mount();
  await select('A');
  fireEvent.click(screen.getByRole('button', { name: 'Send' }));
  await waitFor(() => expect(shikshaMitraToast.error).toHaveBeenCalledWith({
    message: 'The request could not be confirmed. Check your connection and try again.',
  }));
});

it.each([
  ['FAILED', 'error', 'This delivery attempt failed. Review delivery history before resending.'],
  ['UNCERTAIN', 'error', 'The send outcome is unknown. Confirm receipt before resending.'],
  ['PROVIDER_ACCEPTED', 'success', 'This payslip request was already accepted by the email provider.'],
] as const)('reports an acknowledged %s attempt accurately instead of claiming a new queue', async (status, toast, message) => {
  mswServer.use(http.post(`${origin}/payroll/payslip-deliveries`, async ({ request }) =>
    HttpResponse.json(attempt(await request.json() as Request, status))));
  mount();
  await select('A');
  fireEvent.click(screen.getByRole('button', { name: 'Send' }));
  await waitFor(() => expect(shikshaMitraToast[toast]).toHaveBeenCalledWith({ message }));
  expect(shikshaMitraToast.success).not.toHaveBeenCalledWith({ message: 'Payslip queued for email.' });
});

it.each(['empty', 'other-document', 'other-key'])('retains the request identity after an unconfirmed %s response', async (failure) => {
  const requests: Request[] = [];
  mswServer.use(http.post(`${origin}/payroll/payslip-deliveries`, async ({ request }) => {
    const input = await request.json() as Request;
    requests.push(input);
    const result = attempt(input, 'QUEUED');
    return HttpResponse.json(requests.length > 1 ? result : failure === 'empty' ? {} : {
      ...result, documentId: failure === 'other-document' ? 'another-document' : input.documentId,
      idempotencyKey: failure === 'other-key' ? 'another-request' : input.idempotencyKey,
    });
  }));
  mount();
  await select('A');
  fireEvent.click(screen.getByRole('button', { name: 'Send' }));
  await waitFor(() => expect(shikshaMitraToast.error).toHaveBeenCalledWith({
    message: 'The server response could not be confirmed. Check delivery history and try again.',
  }));
  await waitFor(() => expect(screen.getByRole('button', { name: 'Send' })).toBeEnabled());
  fireEvent.click(screen.getByRole('button', { name: 'Send' }));
  await waitFor(() => expect(requests).toHaveLength(2));
  expect(requests[1]).toEqual(requests[0]);
});
