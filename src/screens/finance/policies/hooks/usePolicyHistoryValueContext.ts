import { useMemo } from 'react';
import { useGetFeeHeadsQuery } from 'src/redux/feeHeadManage/feeHeadManageApi';
import { useGetFinanceRoutingOptionsQuery } from 'src/redux/finance/financeRoutingApi';

import type { IFinancePolicyRow } from '../types/finance-policy.types';

export function usePolicyHistoryValueContext(policy: IFinancePolicyRow | null, open: boolean) {
  const { academicYearId = '', policyType } = policy ?? {};
  const { currentData: feeHeads } = useGetFeeHeadsQuery(
    { academicYearId, page: 1, pageSize: 1000 },
    { skip: !open || !academicYearId || (policyType !== 'proration' && policyType !== 'refund') }
  );
  const { currentData: routing } = useGetFinanceRoutingOptionsQuery(
    { academicYearId, operation: policyType === 'refund' ? 'refund-policy' : 'collection-policy' },
    { skip: !open || !academicYearId || (policyType !== 'collection' && policyType !== 'refund') }
  );

  return useMemo(() => {
    const labelsById: Record<string, string> = {};
    if (policy?.id) labelsById[policy.id.toLowerCase()] = policy.policyName;
    if (policy?.academicYearId && policy.academicYearName)
      labelsById[policy.academicYearId.toLowerCase()] = policy.academicYearName;
    feeHeads?.items.forEach(({ id, name }) => {
      labelsById[id.toLowerCase()] = name;
    });
    if (routing) {
      for (const { id, label } of [
        ...routing.incomeCategories,
        ...routing.expenseCategories,
        ...routing.bankAccounts,
      ])
        labelsById[id.toLowerCase()] = label;
    }
    return { labelsById, policyType };
  }, [feeHeads, policy, policyType, routing]);
}
