import type { ComponentProps } from 'react';
import type { FinanceExternalReceivable } from 'src/redux/library/charges-management/finance-external.types';

import React from 'react';
import { vi } from 'vitest';
import { Provider } from 'react-redux';
import { api } from 'src/redux/service';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { render } from '@testing-library/react';
import { configureStore } from '@reduxjs/toolkit';
import { useBoolean } from 'src/hooks/use-boolean';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import CustomDialog from 'src/components/customDialog';
import confirmReducer from 'src/redux/confirmPopup/confirmPopupSlice';
import { LibraryChargeStatusType } from 'src/enums/library_charges_type';
import { defaultSettings } from 'src/components/settings/config-settings';
import authReducer, { setUser, setPermissions } from 'src/redux/auth/authSlice';
import globalReducer, { setCurrentYear } from 'src/redux/globalState/globalSlice';

import CollectChargesForm from './AssignChargeProcessForm';

export const libraryRoot = 'http://library.test/api';
export const financeRoot = `${libraryRoot}/finance/external-receivables`;
export const ids = {
  assessment: '6b3dd3b8-4590-4471-b927-71c874d31bda',
  employee: '5c68d95f-73ba-4207-a337-71e6396ffec7',
  sourceYear: '268cd088-b405-4325-8749-365e6778ab33',
  otherYear: '3cc0d054-5ce6-4310-94ba-4cd36c6f42c8',
  libraryCategory: 'b2469347-174e-4d65-af7e-c08d3bc39021',
  financeCategory: 'a5431f16-8f43-45f2-a93b-fb74b9edb176',
  collectionVersion: 'b749dcac-2848-4b72-9658-4ba6d43c147a',
  collectionPolicy: '2cd79ff6-c288-4776-8317-20975bf711ae',
  refundVersion: '700d0698-c8de-44dc-9ad1-f47703810c37',
  refundPolicy: '823c0417-f2e5-4660-a139-b6cb12ac9b2d',
  binding: '37f3cf8c-a39d-4cdf-b6b7-4f4fbcbba493',
  sourceLink: '29e44f71-c3dc-459d-8151-7e337618f375',
  financeRequest: '3515b098-0950-407a-9d78-519616f4969f',
  financeCharge: '84389bba-b5ab-4687-adfb-dee55b78d148',
  collection: '1d13118a-edcb-469b-96e7-07cdfdcac66b',
  receipt: 'c1e173b3-d22f-49d6-8ee2-72e3d50f78a1',
  receivingBank: '989782ef-b822-44b7-a3e3-62516d037b8a',
};
export const source = {
  kind: 1 as const,
  sourceId: ids.assessment,
  sourceVersion: ' exact fresh assessment version +/=%& ',
};
export const revisions = {
  binding: 'a'.repeat(64),
  approval: 'c'.repeat(64),
  collection: 'd'.repeat(64),
  settled: 'e'.repeat(64),
};
export const permissions = {
  source: 'Library.Charges.View',
  view: 'Finance.Fees.Charges.View',
  post: 'Finance.Fees.Charges.Add',
  bind: 'Finance.Fees.Charges.Update',
  approve: 'Finance.Fees.Charges.Approve',
  collectionView: 'Finance.Fees.FeeCollections.View',
  collect: 'Finance.Fees.FeeCollections.Add',
  receiptView: 'Finance.Fees.InvoiceReceipt.View',
};
export const staleRow: NonNullable<ComponentProps<typeof CollectChargesForm>['charge']> = {
  id: ids.assessment,
  memberId: ids.employee,
  memberName: 'Maya José',
  role: 'Employee',
  academicYearId: ids.sourceYear,
  sourceVersion: 'stale-table-version',
  financeSourceLinkId: null,
  chargeCategory: 'Reviewed damage',
  fineAmount: 100.75,
  reason: 'Reviewed historical damage assessment.',
  status: LibraryChargeStatusType.Pending,
  schoolChargeDate: '2026-11-17',
  schoolDueDate: '2026-11-30',
  chargeDateProvenance: 2,
  dueDateProvenance: 2,
  dueDate: '30/11/2026',
  paymentDetails: { paymentMethod: 'Cash', paymentAmount: 40.25, notes: '' },
};

export function mountChargeCashier(grants: string[], options: { guardBusy?: boolean } = {}) {
  const store = configureStore({
    reducer: {
      auth: authReducer,
      globalState: globalReducer,
      confirmPopup: confirmReducer,
      [api.reducerPath]: api.reducer,
    },
    middleware: (defaults) => defaults({ serializableCheck: false }).concat(api.middleware),
  });
  store.dispatch(
    setUser({
      id: '26d4efc0-07a3-48f4-a40c-896905e23f51',
      tenantId: '6328216a-70aa-4c86-90a8-375c6328967f',
    })
  );
  store.dispatch(setPermissions(grants.map((name) => ({ name, isGranted: true }))));
  store.dispatch(setCurrentYear({ id: ids.otherYear, name: '2025–2026' }));
  const onClose = vi.fn<ComponentProps<typeof CollectChargesForm>['onClose']>();
  function OwningDialog() {
    const open = useBoolean(true);
    const [busy, setBusy] = React.useState(false);
    return (
      <CustomDialog
        open={open.value}
        title="Library Finance"
        disableClose={Boolean(options.guardBusy && busy)}
        handleClose={() => onClose(null, false)}
      >
        <CollectChargesForm
          open={open}
          onClose={onClose}
          charge={staleRow}
          onBusyChange={options.guardBusy ? setBusy : undefined}
        />
      </CustomDialog>
    );
  }
  render(
    <Provider store={store}>
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <OwningDialog />
      </ThemeProvider>
    </Provider>
  );
  return { store, onClose };
}

export type CashierScenarioOptions = {
  paymentMethod?: 0 | 6;
  loseFirstCollectionResponse?: boolean;
  collectionResponseGate?: Promise<void>;
};

export function cashierScenario(
  mode: 'post' | 'review' | 'collect',
  options: CashierScenarioOptions = {}
) {
  let posted = mode !== 'post';
  let bound = mode === 'collect';
  let boundRefundVersion: string | null = bound ? ids.refundVersion : null;
  let approved = mode === 'collect';
  let collected = false;
  const seen: string[] = [];
  const forbidden: string[] = [];
  const postBodies: Record<string, unknown>[] = [];
  const bindBodies: Record<string, unknown>[] = [];
  const approvalBodies: Record<string, unknown>[] = [];
  const collectionBodies: Record<string, unknown>[] = [];
  const sourceQueries: Record<string, string>[] = [];
  const receiptDetailIds: string[] = [];
  const receiptPdfIds: string[] = [];
  const routingQueries: Record<string, string>[] = [];
  const moneyIntentKeys: string[] = [];
  const collectFormRevisions: string[] = [];
  const provisional = options.paymentMethod === 6;
  const collectionResult = () => ({
    collectionId: ids.collection,
    receiptId: ids.receipt,
    receiptNumber: provisional ? 'PCH-2026-000084' : 'FCH-2026-000084',
    receiptKind: provisional ? 3 : 4,
    verificationStatus: provisional ? 1 : 0,
    schoolReceiptDate: '2026-11-17',
    acceptedAmount: 40.25,
    receivable: receivable(),
  });
  const receivable = (): FinanceExternalReceivable => ({
    source,
    financeChargeId: ids.financeCharge,
    financeChargeRequestId: ids.financeRequest,
    academicYearId: ids.sourceYear,
    payer: { kind: 2, employeeId: ids.employee, studentId: null, displayName: 'Maya José' },
    currency: 'INR',
    assessmentDate: '2026-11-17',
    dueDate: '2026-11-30',
    originalAmount: 100.75,
    acceptedPaymentAmount: collected ? 40.25 : 0,
    settledPaymentAmount: collected && !provisional ? 40.25 : 0,
    pendingVerificationAmount: collected && provisional ? 40.25 : 0,
    waivedAmount: 0,
    refundedAmount: 0,
    ...(options.paymentMethod !== undefined || options.loseFirstCollectionResponse
      ? { financialOutstandingAmount: collected && !provisional ? 60.5 : 100.75 }
      : {}),
    outstandingAmount: approved ? (collected ? 60.5 : 100.75) : 0,
    approvalStatus: approved ? 1 : 0,
    settlementAvailable: false,
    settlementBlockedReason: 'Finance collection is unavailable for this receivable.',
  });
  const revision = () =>
    collected
      ? revisions.settled
      : approved
        ? revisions.collection
        : bound
          ? revisions.approval
          : revisions.binding;
  const form = () => ({
    receivable: {
      ...receivable(),
      settlementAvailable: approved && bound,
      settlementBlockedReason: approved && bound ? null : 'Awaiting independent approval.',
    },
    revision: revision(),
    settlementPolicyBindingId: bound ? ids.binding : null,
    collectionPolicyVersionId: bound ? ids.collectionVersion : null,
    refundPolicyVersionId: boundRefundVersion,
    paymentMethods: options.paymentMethod === undefined ? [0] : [options.paymentMethod],
    canCollect: approved && bound,
    setupIssues: approved && bound ? [] : ['Awaiting independent approval.'],
  });
  const readSource = (request: Request, label: string) => {
    seen.push(label);
    sourceQueries.push(Object.fromEntries(new URL(request.url).searchParams));
  };
  const denied = ({ request }: { request: Request }) => {
    forbidden.push(`${request.method} ${new URL(request.url).pathname}`);
    return HttpResponse.json(
      {
        errorCode: 'FORBIDDEN',
        detail: 'This action has no unrelated Student, assignment or settings authority.',
      },
      { status: 403 }
    );
  };
  mswServer.use(
    http.get(`${libraryRoot}/library/charges/${ids.assessment}`, () => {
      seen.push('assessment');
      return HttpResponse.json({
        id: ids.assessment,
        memberId: ids.employee,
        memberName: 'Maya José',
        role: 1,
        chargeCategoryId: ids.libraryCategory,
        chargeType: 'Reviewed damage',
        bookIssueId: null,
        amount: 100.75,
        academicYearId: ids.sourceYear,
        academicYearProvenance: 2,
        chargeDate: null,
        dueDate: null,
        schoolChargeDate: '2026-11-17',
        schoolDueDate: '2026-11-30',
        chargeDateProvenance: 2,
        dueDateProvenance: 2,
        currency: 'INR',
        sourceVersion: source.sourceVersion,
        financeSourceLinkId: posted ? ids.sourceLink : null,
        paymentStatus: 0,
        paidDate: null,
        remarks: 'Reviewed historical damage assessment.',
        createdAt: '2026-11-17T08:00:00Z',
      });
    }),
    http.put(`${libraryRoot}/library/charges/${ids.assessment}`, denied),
    http.get(/\/api\/(?:fee-collections|students|student-fee-assignments)(?:\/|$)/, denied),
    http.post(/\/api\/fee-collections(?:\/|$)/, denied),
    http.get(`${libraryRoot}/library/members/*`, denied),
    http.get(`${financeRoot}/operator/posting-options`, ({ request }) => {
      if (mode !== 'post') return denied({ request });
      readSource(request, 'posting-options');
      return HttpResponse.json({
        totalCount: 1,
        items: [
          {
            id: ids.financeCategory,
            name: 'Library recoveries',
            policyId: null,
            versionNumber: null,
            isSelectable: true,
            blockedReason: null,
          },
        ],
      });
    }),
    http.get(`${financeRoot}/operator/binding-options`, ({ request }) => {
      if (mode !== 'review') return denied({ request });
      readSource(request, 'binding-options');
      const refund = new URL(request.url).searchParams.get('optionKind') === '2';
      return HttpResponse.json({
        totalCount: 1,
        items: [
          {
            id: refund ? ids.refundVersion : ids.collectionVersion,
            name: refund ? 'Recorded refund rules v4' : 'Recorded collection rules v3',
            policyId: refund ? ids.refundPolicy : ids.collectionPolicy,
            versionNumber: refund ? 4 : 3,
            isSelectable: true,
            blockedReason: null,
          },
        ],
      });
    }),
    http.get(`${financeRoot}/operator/binding-context`, ({ request }) => {
      if (mode !== 'review') return denied({ request });
      readSource(request, 'binding-context');
      return HttpResponse.json({
        source,
        receivable: receivable(),
        revision: revision(),
        settlementPolicyBindingId: bound ? ids.binding : null,
        collectionPolicyVersionId: bound ? ids.collectionVersion : null,
        refundPolicyVersionId: boundRefundVersion,
        canExecute: !bound,
        issues: bound ? ['The settlement policy is already recorded.'] : [],
      });
    }),
    http.get(`${financeRoot}/operator/approval-context`, ({ request }) => {
      if (mode !== 'review') return denied({ request });
      readSource(request, 'approval-context');
      return HttpResponse.json({
        source,
        receivable: receivable(),
        revision: revision(),
        settlementPolicyBindingId: bound ? ids.binding : null,
        collectionPolicyVersionId: bound ? ids.collectionVersion : null,
        refundPolicyVersionId: boundRefundVersion,
        canExecute: !approved,
        issues: approved ? ['Only a pending assessment can be approved.'] : [],
      });
    }),
    http.get(`${financeRoot}/operator/history`, ({ request }) => {
      readSource(request, 'history');
      return HttpResponse.json({
        totalCount: posted ? 1 : 0,
        items: posted
          ? [
              {
                id: 'bced91c8-3fd3-4e47-a12d-69b8c0b88251',
                operation: 'Post',
                recordedAt: '2026-11-17T08:00:00+00:00',
                actorName: 'assessment.maker',
                resultKind: null,
                resultId: null,
                canOpenResult: false,
              },
            ]
          : [],
      });
    }),
    http.get(financeRoot, ({ request }) => {
      readSource(request, 'receivable');
      return HttpResponse.json(receivable());
    }),
    http.get(`${financeRoot}/collect-form`, ({ request }) => {
      if (mode !== 'collect') return denied({ request });
      readSource(request, 'collect-form');
      collectFormRevisions.push(revision());
      return HttpResponse.json(form());
    }),
    http.get(`${libraryRoot}/finance-routing-options`, ({ request }) => {
      if (mode !== 'collect') return denied({ request });
      seen.push('routing');
      routingQueries.push(Object.fromEntries(new URL(request.url).searchParams));
      return HttpResponse.json({
        incomeCategories: [],
        expenseCategories: [],
        bankAccounts: provisional
          ? [
              {
                id: ids.receivingBank,
                label: 'School recovery account • 8318',
                bankName: 'State Bank of India',
                maskedAccountNumber: '••••8318',
                accountHolderName: 'School recovery account',
              },
            ]
          : [],
      });
    }),
    http.post(financeRoot, async ({ request }) => {
      if (mode !== 'post') return denied({ request });
      postBodies.push((await request.json()) as Record<string, unknown>);
      posted = true;
      return HttpResponse.json(receivable());
    }),
    http.post(`${financeRoot}/settlement-policy`, async ({ request }) => {
      if (mode !== 'review') return denied({ request });
      const body = (await request.json()) as Record<string, unknown>;
      bindBodies.push(body);
      bound = true;
      boundRefundVersion =
        typeof body.refundPolicyVersionId === 'string' ? body.refundPolicyVersionId : null;
      return HttpResponse.json(form());
    }),
    http.post(`${financeRoot}/approve`, async ({ request }) => {
      if (mode !== 'review') return denied({ request });
      approvalBodies.push((await request.json()) as Record<string, unknown>);
      approved = true;
      return HttpResponse.json(receivable());
    }),
    http.post(`${financeRoot}/collections`, async ({ request }) => {
      if (mode !== 'collect') return denied({ request });
      const body = (await request.json()) as Record<string, unknown>;
      collectionBodies.push(body);
      if (options.loseFirstCollectionResponse && collected) {
        if (JSON.stringify(body) !== JSON.stringify(collectionBodies[0])) {
          return HttpResponse.json(
            { detail: 'A lost-result retry must preserve the complete accepted command.' },
            { status: 409 }
          );
        }
        return HttpResponse.json(collectionResult());
      }
      collected = true;
      if (typeof body.idempotencyKey === 'string') moneyIntentKeys.push(body.idempotencyKey);
      if (collectionBodies.length === 1) await options.collectionResponseGate;
      if (options.loseFirstCollectionResponse && collectionBodies.length === 1)
        return HttpResponse.error();
      return HttpResponse.json(collectionResult());
    }),
    http.get(`${libraryRoot}/v1/fee-receipts/:receiptId`, ({ params }) => {
      receiptDetailIds.push(String(params.receiptId));
      return HttpResponse.json({
        id: ids.receipt,
        receiptNumber: 'FCH-2026-000084',
        receiptKind: 4,
        receiptKindLabel: 'Receipt (Charge)',
        receiptScope: 2,
        verificationStatus: 0,
        employeeId: ids.employee,
        payerName: 'Maya José',
        studentId: null,
        financeFeeAccountId: null,
        studentName: '',
        academicYearId: ids.sourceYear,
        totalPaidAmount: 40.25,
        chargePaidAmount: 40.25,
        feePaidAmount: 0,
        receiptDate: '2026-11-17',
        feeCollectionTransactionId: ids.collection,
        paymentMethodLabel: 'Cash',
        linkedFinalReceiptId: null,
        linkedFinalReceiptNumber: null,
        linkedProvisionalReceiptId: null,
        linkedProvisionalReceiptNumber: null,
        siblingReceiptNumber: null,
        remarks: 'Actual partial payment.',
        hasPdf: true,
      });
    }),
    http.get(`${libraryRoot}/v1/fee-receipts/:receiptId/pdf`, ({ params }) => {
      receiptPdfIds.push(String(params.receiptId));
      return new HttpResponse('%PDF-1.7\n% mounted transport fixture only', {
        headers: { 'Content-Type': 'application/pdf' },
      });
    })
  );
  return {
    seen,
    forbidden,
    postBodies,
    bindBodies,
    approvalBodies,
    collectionBodies,
    sourceQueries,
    receiptDetailIds,
    receiptPdfIds,
    routingQueries,
    moneyIntentKeys,
    collectFormRevisions,
  };
}
