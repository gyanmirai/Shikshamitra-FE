import type { FinanceExternalRefundRequest } from 'src/redux/library/charges-management/finance-corrections.types';

export type FinanceRefundRecord = FinanceExternalRefundRequest;
export type FinanceRefundAction = 'approve' | 'reject' | 'recordPayout' | 'returnPayout';
export type FinanceRefundDecision = { id: string; action: FinanceRefundAction };
export type FinanceRefundActionValues = {
  expenseCategoryId: string;
  bankAccountId: string;
  externalReference: string;
  paymentDate: string;
  reason: string;
  evidenceReference: string;
};
