import type { FinanceExternalSource, FinanceExternalReceivable } from './finance-external.types';

export const FinanceOperatorOptionKind = {
  chargeCategory: 0,
  collectionPolicyVersion: 1,
  refundPolicyVersion: 2,
} as const;

export type FinanceOperatorOptionKindValue =
  (typeof FinanceOperatorOptionKind)[keyof typeof FinanceOperatorOptionKind];

export type FinanceOperatorPage<T> = { totalCount: number; items: T[] };
export type FinanceOperatorOptionsInput = {
  source: FinanceExternalSource;
  optionKind: FinanceOperatorOptionKindValue;
  page?: number;
  pageSize?: number;
  search?: string;
};
export type FinanceOperatorOption = {
  id: string;
  name: string;
  policyId: string | null;
  versionNumber: number | null;
  isSelectable: boolean;
  blockedReason: string | null;
};
export type FinanceOperatorContext = {
  source: FinanceExternalSource;
  receivable: FinanceExternalReceivable;
  revision: string;
  settlementPolicyBindingId: string | null;
  collectionPolicyVersionId: string | null;
  refundPolicyVersionId: string | null;
  canExecute: boolean;
  issues: string[];
};
export type FinanceOperatorHistoryInput = {
  source: FinanceExternalSource;
  page?: number;
  pageSize?: number;
};
export type FinanceOperatorHistory = {
  id: string;
  operation: string;
  recordedAt: string;
  actorName: string | null;
  resultKind: string | null;
  resultId: string | null;
  canOpenResult: boolean;
};
