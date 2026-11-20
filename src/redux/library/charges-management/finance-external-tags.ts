import { receiptType, financeModuleType, reconciliationType } from 'src/redux/tagTypes';

import { libraryChargeMutationTags } from '../library-cache-tags';

import type { FinanceExternalSource } from './finance-external.types';

export const financeSourceTag = (source: FinanceExternalSource) => ({
  type: financeModuleType.charges,
  id: source.sourceId,
});

export const financeExternalChanged = (
  _result: unknown,
  error: unknown,
  input: { source: FinanceExternalSource }
) =>
  error
    ? []
    : [
        ...libraryChargeMutationTags,
        financeSourceTag(input.source),
        financeModuleType.charges,
        financeModuleType.feeCollection,
        financeModuleType.feeRefund,
        financeModuleType.cashManagement,
        financeModuleType.incomeTracking,
        financeModuleType.financeAudit,
        receiptType.receipt,
        reconciliationType.reconciliation,
      ];
