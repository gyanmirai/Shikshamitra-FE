import { parseApiProblemDetail } from 'src/utils/api-problem-details';

import type { FinancePrerequisiteKey } from '../../components/financePrerequisites';

interface RefundPrerequisiteQuery {
  currentData?: { totalRefundable: number; feeHeads: { months: { refundable: number }[] }[] };
  error?: unknown;
  isLoading?: boolean;
  isFetching?: boolean;
  isUninitialized?: boolean;
  isError?: boolean;
}

/** Eligibility owns policy resolution and settled balances; never infer them from a lookup failure. */
export function getRefundPrerequisite(
  query: RefundPrerequisiteQuery
): FinancePrerequisiteKey | undefined {
  if (query.isLoading || query.isFetching || query.isUninitialized) return undefined;
  if (query.error) {
    const { errorCode } = parseApiProblemDetail(query.error);
    if (errorCode === 'Finance:FeeRefund:010010') return 'refund-policy-assignment';
    if (errorCode === 'Finance:FeeRefund:010025') return 'receipt-verification';
    return undefined;
  }
  if (query.isError || !query.currentData) return undefined;
  if (
    query.currentData.totalRefundable <= 0 ||
    !query.currentData.feeHeads.some((head) => head.months.some((month) => month.refundable > 0))
  )
    return 'paid-receipt';
  return undefined;
}
