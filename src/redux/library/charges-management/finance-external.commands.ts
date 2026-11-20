import type { FinanceExternalSource } from './finance-external.types';

export type PostFinanceExternalReceivable = {
  source: FinanceExternalSource;
  financeChargeCategoryId: string;
  collectionPolicyVersionId?: string | null;
  refundPolicyVersionId?: string | null;
  idempotencyKey: string;
};

export type FinanceExternalCommand = {
  source: FinanceExternalSource;
  revision: string;
  idempotencyKey: string;
};

export type BindFinanceExternalPolicy = FinanceExternalCommand & {
  collectionPolicyVersionId: string;
  refundPolicyVersionId?: string | null;
  reason: string;
};

export type ApproveFinanceExternalReceivable = FinanceExternalCommand & { reason: string };

export type CollectFinanceExternalReceivable = FinanceExternalCommand & {
  schoolReceiptDate: string;
  notes?: string | null;
  payments: {
    paymentMethod: number;
    amount: number | string;
    bankAccountId?: string | null;
    details?: Record<string, unknown> | null;
  }[];
};

export type RequestFinanceExternalWaiver = FinanceExternalCommand & {
  amount: number | string;
  reason: string;
};

export type DecideFinanceExternalWaiver = FinanceExternalCommand & {
  waiverRequestId: string;
  reason: string;
};

export type ReverseFinanceExternalWaiver = FinanceExternalCommand & {
  waiverApplicationId: string;
  amount: number | string;
  reason: string;
};
