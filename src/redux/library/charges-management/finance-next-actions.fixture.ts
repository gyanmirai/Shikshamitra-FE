import { expect } from 'vitest';

import { receivable } from './finance-external.fixture';
import { libraryFinanceApi } from './finance-external-api';

export const nextRoot = 'http://library.test/api/finance/external-receivables';
export const nextSource = {
  kind: 1 as const,
  sourceId: '6b3dd3b8-4590-4471-b927-71c874d31bda',
  sourceVersion: ' exact opaque +/=?%& source version ',
};
export const nextSourceQuery = {
  kind: '1',
  sourceId: nextSource.sourceId,
  sourceVersion: nextSource.sourceVersion,
};
export const nextRevision = 'a'.repeat(64);
export const nextIds = {
  employee: '5c68d95f-73ba-4207-a337-71e6396ffec7',
  year: '268cd088-b405-4325-8749-365e6778ab33',
  charge: '84389bba-b5ab-4687-adfb-dee55b78d148',
  chargeRequest: '3515b098-0950-407a-9d78-519616f4969f',
  sourceLink: '29e44f71-c3dc-459d-8151-7e337618f375',
  collectionVersion: 'b749dcac-2848-4b72-9658-4ba6d43c147a',
  refundVersion: '700d0698-c8de-44dc-9ad1-f47703810c37',
  refundPolicy: '823c0417-f2e5-4660-a139-b6cb12ac9b2d',
  receipt: 'c1e173b3-d22f-49d6-8ee2-72e3d50f78a1',
  allocation: 'b9b48711-87ef-4f79-9893-6ce8d0a90da6',
  refundRequest: 'bf6abe28-f49c-4adb-8fa2-7de1c8dc4cc6',
  waiverRequest: '3ea271f8-ab80-48a3-918d-dd65d9109022',
  waiverApplication: '3e75bddb-8ea7-4215-8316-c08677a3b67b',
};
export const nextReceivable = {
  ...receivable,
  source: nextSource,
  financeChargeId: nextIds.charge,
  financeChargeRequestId: nextIds.chargeRequest,
  academicYearId: nextIds.year,
  payer: {
    kind: 2 as const,
    employeeId: nextIds.employee,
    studentId: null,
    displayName: 'Maya José',
  },
  acceptedPaymentAmount: 40.25,
  settledPaymentAmount: 40.25,
  pendingVerificationAmount: 0,
  financialOutstandingAmount: 60.5,
  outstandingAmount: 60.5,
  approvalStatus: 1,
  settlementBlockedReason: 'Finance collection is unavailable for this receivable.',
};
export const nextRefundForm = {
  receivable: nextReceivable,
  revision: nextRevision,
  refundPolicyVersionId: nextIds.refundVersion,
  allowedPayoutMethods: ['Cash', 'UPI'],
  canRequest: true,
  setupIssues: [],
  sources: [
    {
      sourceAllocationId: nextIds.allocation,
      sourceReceiptId: nextIds.receipt,
      receiptNumber: 'FCH-2026-000084',
      schoolReceiptDate: '2026-11-17',
      paidAmount: 40.25,
      committedAmount: 0,
      availableAmount: 40.25,
    },
  ],
};
export const nextRefundSelection = {
  source: nextSource,
  revision: nextRevision,
  originalReceiptId: nextIds.receipt,
  method: 'UPI',
  lines: [
    { sourceAllocationId: nextIds.allocation, sourceReceiptId: nextIds.receipt, amount: '15.25' },
  ],
};
export const nextRefundCommand = {
  ...nextRefundSelection,
  idempotencyKey: 'same-external-refund-intent-20261117',
  reason: 'Refund the reviewed part of the actual settled recovery payment.',
};
export const nextRefundPreview = {
  studentFeeStructureId: null,
  refundPolicyId: nextIds.refundPolicy,
  refundPolicyVersionId: nextIds.refundVersion,
  refundPolicyName: 'Explicit source refund',
  settledPaidAmount: 40.25,
  priorProcessedRefund: 0,
  activeReservation: 0,
  requestedAmount: 15.25,
  deductionAmount: 0,
  capAdjustment: 4.875,
  maximumAllowedAmount: 15,
  isAllowed: true,
  reasons: [],
};
export const nextRefundRequest = {
  id: nextIds.refundRequest,
  concurrencyStamp: 'actual-refund-row-version',
  studentId: null,
  employeeId: nextIds.employee,
  payerName: 'Maya José',
  financeFeeAccountId: null,
  financeExternalSourceLinkId: nextIds.sourceLink,
  academicYearId: nextIds.year,
  workflowVersion: 1,
  status: 0,
  voucherNumber: 'RF-2026-000042',
  currency: 'INR',
  totalAmount: 15.25,
  calculatedAmount: 15,
  approvedAmount: 0,
  processedAmount: 0,
  reversedAmount: 0,
  studentFeeStructureId: null,
  refundPolicyId: nextIds.refundPolicy,
  refundPolicyVersionId: nextIds.refundVersion,
  originalReceiptId: nextIds.receipt,
  originalReceiptNumber: 'FCH-2026-000084',
  refundMethod: 'UPI',
  allowedPayoutMethods: ['Cash', 'UPI'],
  reason: nextRefundCommand.reason,
  availableActions: [],
  settlements: [],
  lines: [
    {
      sourceAllocationId: nextIds.allocation,
      sourceReceiptId: nextIds.receipt,
      chargeId: nextIds.charge,
      amount: 15.25,
      calculatedAmount: 15,
      approvedAmount: 0,
      processedAmount: 0,
      reversedAmount: 0,
      settledPaidAmount: 40.25,
    },
  ],
};

export function nextWaiverContext(action: number) {
  const applied = action === 3;
  return {
    source: nextSource,
    receivable: applied
      ? {
          ...nextReceivable,
          waivedAmount: 6.05,
          outstandingAmount: 54.45,
          financialOutstandingAmount: 54.45,
        }
      : nextReceivable,
    revision: applied ? 'b'.repeat(64) : nextRevision,
    collectionPolicyVersionId: nextIds.collectionVersion,
    waiverEnabled: true,
    requiresApproval: true,
    canExecute: true,
    issues: [],
    requests: {
      totalCount: action === 0 ? 0 : 1,
      items:
        action === 0
          ? []
          : [
              {
                requestId: nextIds.waiverRequest,
                applicationId: applied ? nextIds.waiverApplication : null,
                state: applied ? 1 : 0,
                requestedAmount: 10.1,
                appliedAmount: applied ? 10.1 : 0,
                reversedAmount: applied ? 4.05 : 0,
                reversibleAmount: applied ? 6.05 : 0,
                reason: 'Requested school assistance.',
                canAct: true,
                issues: [],
              },
            ],
    },
  };
}

// Same explicit missing-endpoint boundary used by the active operator client suite.
// It avoids a TypeScript missing-property failure before the behavioral RED can run.
export function requireNextEndpoint(name: string) {
  const endpoint = (
    libraryFinanceApi.endpoints as unknown as Record<
      string,
      {
        initiate(input: unknown): any;
        select(input: unknown): (state: unknown) => { data?: unknown };
      }
    >
  )[name];
  expect(endpoint, `The owning typed Finance client must expose ${name}`).toBeDefined();
  return endpoint;
}
