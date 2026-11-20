import React from 'react';
import { Provider } from 'react-redux';
import { api } from 'src/redux/service';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { configureStore } from '@reduxjs/toolkit';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { hasGrantedPermission } from 'src/utils/permissions';
import globalReducer from 'src/redux/globalState/globalSlice';
import { it, vi, expect, afterEach, beforeEach } from 'vitest';
import { clearCachedAuthSession } from 'src/redux/session-cache';
import confirmReducer from 'src/redux/confirmPopup/confirmPopupSlice';
import { render, screen, cleanup, waitFor } from '@testing-library/react';
import { defaultSettings } from 'src/components/settings/config-settings';
import authReducer, { setUser, setPermissions } from 'src/redux/auth/authSlice';
import ReceiptPreviewDialog from 'src/screens/finance/InvoiceAndReceipt/Components/ReceiptManagement/Components/ReceiptPreviewDialog';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://receipt.test';
});
// Session transport fixture only: the shared base query still resolves the session,
// attaches its real Bearer header and dispatches through the actual RTK endpoints.
vi.mock('next-auth/react', () => ({
  getSession: async () => ({ accessToken: 'receipt-reader-token' }),
  signOut: vi.fn(),
}));
// Only the browser PDF canvas is replaced. ReceiptPreviewDialog, shared detail fields,
// formatters, Redux/auth state, RTK hooks and authenticated PDF transport stay real.
vi.mock('src/components/preview-document/pdf-preview', () => ({
  default: ({ url }: { url: string }) => (
    <div aria-label="Receipt document preview" data-url={url} />
  ),
}));

const receiptId = 'c1e173b3-d22f-49d6-8ee2-72e3d50f78a1';
const employeeId = '5c68d95f-73ba-4207-a337-71e6396ffec7';
const studentId = 'b47c0662-ef17-4818-a363-0d848a872143';
const receiptView = 'Finance.Fees.InvoiceReceipt.View';
const baseUrl = 'http://receipt.test/api';
const originalCreateUrl = Object.getOwnPropertyDescriptor(URL, 'createObjectURL');
const originalRevokeUrl = Object.getOwnPropertyDescriptor(URL, 'revokeObjectURL');
const activeStores: { dispatch: (action: ReturnType<typeof api.util.resetApiState>) => unknown }[] =
  [];

beforeEach(() => {
  clearCachedAuthSession();
  Object.defineProperty(URL, 'createObjectURL', {
    configurable: true,
    value: vi.fn(() => 'blob:receipt-snapshot'),
  });
  Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, value: vi.fn() });
});
afterEach(() => {
  cleanup();
  activeStores.splice(0).forEach((store) => store.dispatch(api.util.resetApiState()));
  clearCachedAuthSession();
  if (originalCreateUrl) Object.defineProperty(URL, 'createObjectURL', originalCreateUrl);
  else Reflect.deleteProperty(URL, 'createObjectURL');
  if (originalRevokeUrl) Object.defineProperty(URL, 'revokeObjectURL', originalRevokeUrl);
  else Reflect.deleteProperty(URL, 'revokeObjectURL');
});

// Exact current FeeReceiptDetailDto JSON names. No current charge balance is supplied.
function employeeReceipt(provisional: boolean) {
  return {
    id: receiptId,
    receiptNumber: provisional ? 'PCH-2026-000084' : 'FCH-2026-000084',
    receiptKind: provisional ? 3 : 4,
    receiptKindLabel: provisional ? 'Provisional Receipt (Charge)' : 'Receipt (Charge)',
    receiptScope: 2,
    verificationStatus: provisional ? 1 : 0,
    employeeId,
    payerName: 'Maya José',
    payerCode: 'STAFF-0042',
    studentId: null,
    financeFeeAccountId: null,
    studentName: '',
    grNo: null,
    rollNo: null,
    className: null,
    division: null,
    boardId: null,
    educationMediumId: null,
    boardName: null,
    mediumName: null,
    academicYearId: '268cd088-b405-4325-8749-365e6778ab33',
    academicYearName: '2026–2027',
    academicYearStartDate: null,
    academicYearEndDate: null,
    receiptDate: '2026-11-17',
    creationTime: '2026-11-17T08:23:41.1234567Z',
    totalPaidAmount: 40.25,
    feePaidAmount: 0,
    chargePaidAmount: 40.25,
    currency: 'INR',
    settlementSnapshot: {
      originalAmount: 100.75,
      submittedAmount: 40.25,
      settledAmount: provisional ? 0 : 40.25,
      pendingVerificationAmount: provisional ? 40.25 : 0,
      financialOutstandingAmount: provisional ? 100.75 : 60.5,
      collectibleAmount: 60.5,
      netWaivedAmount: 0,
    },
    paymentMethodLabel: provisional ? 'UPI' : 'Cash',
    paymentInstruments: [],
    linkedProvisionalReceiptId: null,
    linkedProvisionalReceiptNumber: null,
    linkedFinalReceiptId: null,
    linkedFinalReceiptNumber: null,
    siblingReceiptNumber: null,
    feeCollectionTransactionId: '1d13118a-edcb-469b-96e7-07cdfdcac66b',
    hasPdf: true,
    pdfFileName: provisional ? 'PCH-2026-000084.pdf' : 'FCH-2026-000084.pdf',
    remarks: 'Saved collection evidence.',
    paidFeeHeads: [],
    allocationDetails: [],
  };
}

function mountReceipt(payload: Record<string, unknown>) {
  const requests: { path: string; authorization: string | null }[] = [];
  const unrelated: string[] = [];
  mswServer.use(
    http.get(`${baseUrl}/v1/fee-receipts/${receiptId}`, ({ request }) => {
      requests.push({
        path: new URL(request.url).pathname,
        authorization: request.headers.get('authorization'),
      });
      return HttpResponse.json(payload);
    }),
    http.get(`${baseUrl}/v1/fee-receipts/${receiptId}/pdf`, ({ request }) => {
      requests.push({
        path: new URL(request.url).pathname,
        authorization: request.headers.get('authorization'),
      });
      return new HttpResponse('%PDF-1.7\n% test document transport only', {
        headers: { 'Content-Type': 'application/pdf' },
      });
    }),
    http.all(`${baseUrl}/*`, ({ request }) => {
      unrelated.push(`${request.method} ${new URL(request.url).pathname}`);
      return HttpResponse.json(
        { detail: 'Only saved receipt detail and its PDF are authorized in this fixture.' },
        { status: 403 }
      );
    })
  );
  const store = configureStore({
    reducer: {
      auth: authReducer,
      globalState: globalReducer,
      confirmPopup: confirmReducer,
      [api.reducerPath]: api.reducer,
    },
    middleware: (defaults) => defaults({ serializableCheck: false }).concat(api.middleware),
  });
  activeStores.push(store);
  store.dispatch(
    setUser({
      id: '26d4efc0-07a3-48f4-a40c-896905e23f51',
      tenantId: '6328216a-70aa-4c86-90a8-375c6328967f',
    })
  );
  store.dispatch(setPermissions([{ name: receiptView, isGranted: true }]));
  expect(hasGrantedPermission(store.getState().auth.permissions, receiptView)).toBe(true);
  render(
    <Provider store={store}>
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <ReceiptPreviewDialog receiptId={receiptId} onClose={vi.fn<() => void>()} />
      </ThemeProvider>
    </Provider>
  );
  return { requests, unrelated };
}

// Shared DetailField renders the saved value beside its exact label. Read the
// value alone, so a correct number elsewhere cannot satisfy the wrong money label.
function fieldValue(label: RegExp) {
  const value = screen.getByText(label).nextElementSibling;
  expect(value).toBeInstanceOf(HTMLElement);
  return value as HTMLElement;
}
function expectMoney(label: RegExp, amount: string) {
  screen.getAllByText(label).forEach((fieldLabel) => {
    const value = fieldLabel.nextElementSibling;
    expect(value).toBeInstanceOf(HTMLElement);
    expect(value?.textContent?.replace(/\s/g, '')).toMatch(
      new RegExp(`^(?:₹|INR)${amount.replace('.', '\\.')}$`)
    );
  });
}
function expectCivilReceiptDate() {
  expect(fieldValue(/^Receipt date$/i)).toHaveTextContent(/^17 Nov 2026$/);
  expect(fieldValue(/^Receipt date$/i)).not.toHaveTextContent(
    /\d{1,2}:\d{2}|\b(?:am|pm|UTC|GMT)\b/i
  );
}
async function expectSavedReceiptTransport(scenario: ReturnType<typeof mountReceipt>) {
  await screen.findByLabelText('Receipt document preview');
  await waitFor(() =>
    expect(scenario.requests).toEqual(
      expect.arrayContaining([
        { path: `/api/v1/fee-receipts/${receiptId}`, authorization: 'Bearer receipt-reader-token' },
        {
          path: `/api/v1/fee-receipts/${receiptId}/pdf`,
          authorization: 'Bearer receipt-reader-token',
        },
      ])
    )
  );
  expect(scenario.unrelated).toEqual([]);
}

it('shows a final Employee cash receipt with its real payer identity, exact paise and a civil receipt date', async () => {
  const scenario = mountReceipt(employeeReceipt(false));
  await screen.findByText('Maya José');
  expect(screen.getByText('STAFF-0042')).toBeVisible();
  expect(screen.queryByText(/^Student (?:name|information)$/i)).not.toBeInTheDocument();
  expectMoney(/^(?:Amount paid|Settled amount|Amount settled)$/i, '40.25');
  expectCivilReceiptDate();
  await expectSavedReceiptTransport(scenario);
});

it('shows provisional Employee bank evidence as submitted and reserved with zero settled, preserving the seven saved amounts', async () => {
  const scenario = mountReceipt(employeeReceipt(true));
  await screen.findByText('Maya José');
  expect(screen.getByText('STAFF-0042')).toBeVisible();
  expectMoney(/^Original(?: assessment)? amount$/i, '100.75');
  expectMoney(/^Submitted amount$/i, '40.25');
  expectMoney(/^Settled amount$/i, '0.00');
  expectMoney(/^Pending verification(?: amount)?$/i, '40.25');
  expectMoney(/^Financial outstanding(?: amount)?$/i, '100.75');
  expectMoney(/^Collectible amount$/i, '60.50');
  expectMoney(/^Net waived amount$/i, '0.00');
  expect(screen.queryByText(/^Amount paid$/i)).not.toBeInTheDocument();
  expect(screen.queryByText(/^Student (?:name|information)$/i)).not.toBeInTheDocument();
  expectCivilReceiptDate();
  await expectSavedReceiptTransport(scenario);
});

it('preserves legacy Student receipt facts when currency and settlement evidence are absent without inventing a zero balance', async () => {
  const legacy = {
    ...employeeReceipt(false),
    receiptKind: 1,
    receiptKindLabel: 'Receipt (Fee)',
    receiptScope: 1,
    employeeId: null,
    payerName: null,
    payerCode: null,
    studentId,
    studentName: 'Aarav Patel',
    grNo: 1042,
    rollNo: '12',
    className: 'Class 6',
    division: 'A',
    boardName: 'State Board',
    mediumName: 'Gujarati',
    totalPaidAmount: 100,
    feePaidAmount: 100,
    chargePaidAmount: 0,
    currency: null,
    settlementSnapshot: null,
    receiptNumber: 'FF-2026-000084',
    pdfFileName: 'FF-2026-000084.pdf',
  };
  const scenario = mountReceipt(legacy);
  await screen.findByText('Aarav Patel');
  expect(fieldValue(/^Student name$/i)).toHaveTextContent('Aarav Patel');
  expect(fieldValue(/^GR number$/i)).toHaveTextContent('1042');
  expect(fieldValue(/^Class \/ division$/i)).toHaveTextContent('Class 6 / A');
  expect(fieldValue(/^Roll number$/i)).toHaveTextContent('12');
  expect(fieldValue(/^Board$/i)).toHaveTextContent('State Board');
  expect(fieldValue(/^Medium$/i)).toHaveTextContent('Gujarati');
  expect(fieldValue(/^Amount paid$/i)).toHaveTextContent(/100/);
  [
    /^Original(?: assessment)? amount$/i,
    /^Submitted amount$/i,
    /^Settled amount$/i,
    /^Pending verification(?: amount)?$/i,
    /^Financial outstanding(?: amount)?$/i,
    /^Collectible amount$/i,
    /^Net waived amount$/i,
  ].forEach((label) => {
    expect(screen.queryByText(label)).not.toBeInTheDocument();
  });
  await expectSavedReceiptTransport(scenario);
});
