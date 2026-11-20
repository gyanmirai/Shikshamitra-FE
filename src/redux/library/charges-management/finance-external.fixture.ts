import { api } from 'src/redux/service';
import { configureStore } from '@reduxjs/toolkit';

import type { FinanceExternalSource, FinanceExternalReceivable } from './finance-external.types';
import type {
  PostFinanceExternalReceivable,
  CollectFinanceExternalReceivable,
} from './finance-external.commands';

export function financeTestStore() {
  return configureStore({
    reducer: { [api.reducerPath]: api.reducer },
    middleware: (defaults) => defaults().concat(api.middleware),
  });
}
export type FinanceTestStore = ReturnType<typeof financeTestStore>;
export const source: FinanceExternalSource = {
  kind: 1,
  sourceId: 'assessment-id',
  sourceVersion: 'server-version/+?=',
};
export const receivable: FinanceExternalReceivable = {
  source,
  financeChargeId: 'finance-charge-id',
  financeChargeRequestId: 'finance-request-id',
  academicYearId: 'assessment-year-id',
  payer: { kind: 2, employeeId: 'employee-id', studentId: null, displayName: 'Maya José' },
  currency: 'INR',
  assessmentDate: '2026-11-17',
  dueDate: '2026-11-30',
  originalAmount: 100.75,
  acceptedPaymentAmount: 0,
  settledPaymentAmount: 0,
  pendingVerificationAmount: 0,
  waivedAmount: 0,
  refundedAmount: 0,
  outstandingAmount: 0,
  approvalStatus: 0,
  settlementAvailable: false,
  settlementBlockedReason: 'Awaiting independent approval.',
};
export const command = {
  source,
  revision: 'actual-ledger-revision',
  idempotencyKey: 'reviewed-command-key',
};
export const postBody: PostFinanceExternalReceivable = {
  source,
  financeChargeCategoryId: 'finance-category-id',
  idempotencyKey: 'post-key',
};
export const collectBody: CollectFinanceExternalReceivable = {
  ...command,
  schoolReceiptDate: '2026-11-18',
  payments: [{ paymentMethod: 0, amount: 40.25 }],
};
export const form = {
  receivable,
  revision: command.revision,
  settlementPolicyBindingId: 'binding-id',
  collectionPolicyVersionId: 'collection-version-id',
  refundPolicyVersionId: null,
  paymentMethods: [0],
  canCollect: false,
  setupIssues: ['Awaiting independent approval.'],
};
export const collection = {
  collectionId: 'actual-collection-id',
  receiptId: 'actual-receipt-id',
  receiptNumber: 'FCH-2026-000001',
  receiptKind: 4,
  verificationStatus: 0,
  schoolReceiptDate: collectBody.schoolReceiptDate,
  acceptedAmount: 40.25,
  receivable: {
    ...receivable,
    approvalStatus: 1,
    acceptedPaymentAmount: 40.25,
    settledPaymentAmount: 40.25,
    outstandingAmount: 60.5,
  },
};
export const waiver = {
  requestId: 'waiver-request-id',
  applicationId: 'waiver-application-id',
  state: 1,
  requestedAmount: 10.1,
  appliedAmount: 10.1,
  reversedAmount: 0,
  receivable,
};
