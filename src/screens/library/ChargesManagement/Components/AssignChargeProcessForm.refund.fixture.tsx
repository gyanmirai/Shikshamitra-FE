import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';

import {
  ids,
  source,
  revisions,
  financeRoot,
  libraryRoot,
  cashierScenario,
} from './AssignChargeProcessForm.finance.fixture';

export const refundIds = {
  allocation: '7c286381-5c72-43f6-8660-d49410c1db91',
  request: '94858fe6-d9d6-4bea-8f89-e883bc45a241',
  settlement: 'f9fe1e8c-634f-4b70-ab65-9de7fa269491',
  expense: '1d78eb64-f559-4ce5-a94f-accc097bc01e',
};
export const refundPermissions = {
  view: 'Finance.Fees.Refund.View',
  add: 'Finance.Fees.Refund.Add',
  approve: 'Finance.Fees.Refund.Approve',
  reject: 'Finance.Fees.Refund.Reject',
  process: 'Finance.Fees.Refund.Process',
  reverse: 'Finance.Fees.Refund.Reverse',
};

export function refundScenario(mode: 'request' | 'approve-cash' | 'payout-upi' | 'return-upi') {
  const common = cashierScenario('collect');
  const sourceQueries: Record<string, string>[] = [];
  const previewBodies: Record<string, unknown>[] = [];
  const requestBodies: Record<string, unknown>[] = [];
  const approvalBodies: Record<string, unknown>[] = [];
  const payoutBodies: Record<string, unknown>[] = [];
  const returnBodies: Record<string, unknown>[] = [];
  const routingQueries: Record<string, string>[] = [];
  const forbidden: string[] = [];
  let completed = mode === 'return-upi';
  const cash = mode === 'approve-cash' || mode === 'request';
  const receivable = {
    source,
    financeChargeId: ids.financeCharge,
    financeChargeRequestId: ids.financeRequest,
    academicYearId: ids.sourceYear,
    academicYearName: 'Recorded 2026–2027',
    payer: { kind: 2, employeeId: ids.employee, studentId: null, displayName: 'Maya José' },
    currency: 'INR',
    assessmentDate: '2026-11-17',
    dueDate: '2026-11-30',
    originalAmount: 100.75,
    acceptedPaymentAmount: 40.25,
    settledPaymentAmount: 40.25,
    pendingVerificationAmount: 0,
    waivedAmount: 0,
    refundedAmount: completed ? 15 : 0,
    financialOutstandingAmount: 60.5,
    outstandingAmount: 60.5,
    approvalStatus: 1,
    settlementAvailable: true,
    settlementBlockedReason: null,
  };
  const request = () => ({
    id: refundIds.request,
    concurrencyStamp: 'exact-refund-row-stamp',
    workflowVersion: 1,
    studentId: null,
    employeeId: ids.employee,
    financeFeeAccountId: null,
    financeExternalSourceLinkId: ids.sourceLink,
    payerName: 'Maya José',
    studentName: '',
    academicYearId: ids.sourceYear,
    academicYearName: 'Recorded 2026–2027',
    currency: 'INR',
    totalAmount: 15.25,
    calculatedAmount: 15,
    approvedAmount: mode === 'request' || (mode === 'approve-cash' && !completed) ? 0 : 15,
    processedAmount: completed ? 15 : 0,
    reversedAmount: returnBodies.length ? 15 : 0,
    status: returnBodies.length ? 8 : completed ? 7 : mode === 'payout-upi' ? 2 : 0,
    refundMethod: cash ? 'Cash' : 'UPI',
    allowedPayoutMethods: cash ? ['Cash'] : ['UPI'],
    refundPolicyVersionId: ids.refundVersion,
    refundPolicyId: ids.refundPolicy,
    voucherNumber: 'RF-2026-000032',
    originalReceiptId: ids.receipt,
    originalReceiptNumber: 'FCH-2026-000084',
    creationTime: '2026-11-17T08:00:00Z',
    availableActions:
      mode === 'request' || returnBodies.length
        ? []
        : completed
          ? cash
            ? []
            : ['returnPayout']
          : mode === 'approve-cash'
            ? ['approve']
            : ['recordPayout'],
    settlements: completed
      ? [
          {
            id: refundIds.settlement,
            method: cash ? 'Cash' : 'UPI',
            amount: 15,
            settlementDate: '2026-11-18T08:00:00+00:00',
            status: returnBodies.length ? 3 : 1,
            externalReference: 'UPI-•••8214',
          },
        ]
      : [],
    lines: [
      {
        id: '44890c54-280e-49e2-9e59-950356b1ad6b',
        chargeId: ids.financeCharge,
        sourceAllocationId: refundIds.allocation,
        sourceReceiptId: ids.receipt,
        amount: 15.25,
        calculatedAmount: 15,
        approvedAmount: mode === 'request' || (mode === 'approve-cash' && !completed) ? 0 : 15,
        processedAmount: completed ? 15 : 0,
        reversedAmount: returnBodies.length ? 15 : 0,
        feeHeadName: 'Reviewed Library damage',
      },
    ],
  });
  const deny = ({ request: req }: { request: Request }) => {
    forbidden.push(`${req.method} ${new URL(req.url).pathname}`);
    return HttpResponse.json(
      { detail: 'No unrelated settings, fee-assignment or collection authority.' },
      { status: 403 }
    );
  };
  mswServer.use(
    http.get(financeRoot, () => HttpResponse.json(receivable)),
    http.get(`${financeRoot}/refund-form`, ({ request: req }) => {
      sourceQueries.push(Object.fromEntries(new URL(req.url).searchParams));
      return HttpResponse.json({
        receivable,
        revision: revisions.settled,
        refundPolicyVersionId: ids.refundVersion,
        canRequest: true,
        setupIssues: [],
        allowedPayoutMethods: ['Cash'],
        sources: [
          {
            sourceAllocationId: refundIds.allocation,
            sourceReceiptId: ids.receipt,
            receiptNumber: 'FCH-2026-000084',
            schoolReceiptDate: '2026-11-17',
            paidAmount: 40.25,
            committedAmount: 0,
            availableAmount: 40.25,
          },
        ],
      });
    }),
    http.post(`${financeRoot}/refunds/preview`, async ({ request: req }) => {
      previewBodies.push((await req.json()) as Record<string, unknown>);
      return HttpResponse.json({
        studentFeeStructureId: null,
        refundPolicyVersionId: ids.refundVersion,
        refundPolicyId: ids.refundPolicy,
        refundPolicyName: 'Recorded source refund v4',
        settledPaidAmount: 40.25,
        priorProcessedRefund: 0,
        activeReservation: 0,
        requestedAmount: 15.25,
        deductionAmount: 0,
        capAdjustment: 0,
        maximumAllowedAmount: 15,
        isAllowed: true,
        reasons: [],
      });
    }),
    http.post(`${financeRoot}/refunds`, async ({ request: req }) => {
      requestBodies.push((await req.json()) as Record<string, unknown>);
      return HttpResponse.json(request());
    }),
    http.get(`${libraryRoot}/fee-refunds`, () =>
      HttpResponse.json({ totalCount: 1, items: [request()] })
    ),
    http.get(`${libraryRoot}/fee-refunds/${refundIds.request}`, () => HttpResponse.json(request())),
    http.get(`${libraryRoot}/finance-routing-options`, ({ request: req }) => {
      routingQueries.push(Object.fromEntries(new URL(req.url).searchParams));
      return HttpResponse.json({
        incomeCategories: [],
        expenseCategories: [{ id: refundIds.expense, label: 'Library refunds' }],
        bankAccounts: cash
          ? []
          : [
              {
                id: ids.receivingBank,
                bankName: 'State Bank of India',
                label: 'School recovery account • 8318',
                maskedAccountNumber: '••••8318',
              },
            ],
      });
    }),
    http.post(
      `${libraryRoot}/fee-refunds/${refundIds.request}/approve`,
      async ({ request: req }) => {
        approvalBodies.push((await req.json()) as Record<string, unknown>);
        completed = true;
        return HttpResponse.json(request());
      }
    ),
    http.post(
      `${libraryRoot}/fee-refunds/${refundIds.request}/payout`,
      async ({ request: req }) => {
        payoutBodies.push((await req.json()) as Record<string, unknown>);
        completed = true;
        return HttpResponse.json(request());
      }
    ),
    http.post(
      `${libraryRoot}/fee-refunds/${refundIds.request}/payout/return`,
      async ({ request: req }) => {
        returnBodies.push((await req.json()) as Record<string, unknown>);
        receivable.refundedAmount = 0;
        return HttpResponse.json(request());
      }
    ),
    http.post(`${libraryRoot}/fee-refunds/${refundIds.request}/process`, deny),
    http.post(`${libraryRoot}/fee-refunds/${refundIds.request}/reverse`, deny)
  );
  return {
    common,
    sourceQueries,
    previewBodies,
    requestBodies,
    approvalBodies,
    payoutBodies,
    returnBodies,
    routingQueries,
    forbidden,
  };
}
