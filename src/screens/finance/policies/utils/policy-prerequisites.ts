import { isFinancePrerequisiteMissing } from '../../components/financePrerequisites';

import type { FinancePrerequisite } from '../../components/financePrerequisites';

interface Lookup<T> {
  currentData?: T;
  isLoading?: boolean;
  isFetching?: boolean;
  isError?: boolean;
  isUninitialized?: boolean;
}
interface Routing {
  expenseCategories?: readonly unknown[];
  incomeCategories?: readonly unknown[];
  bankAccounts?: readonly unknown[];
}
type Heads = Lookup<readonly unknown[]>;
type RoutingLookup = Lookup<Routing>;

// A saved selection is historical evidence, even when it leaves today's active lookup.
export function refundPolicyPrerequisites(
  values: {
    status: string;
    feeHeadScope: string;
    applicableFeeHeadIds: string[];
    allowedPayoutMethods: string[];
    expenseCategoryId?: string | null;
    defaultPayingBankAccountId?: string | null;
  },
  heads: Heads,
  routing: RoutingLookup
): FinancePrerequisite[] {
  const requirements: FinancePrerequisite[] = [];
  if (
    isFinancePrerequisiteMissing({
      ...heads,
      options: heads.currentData,
      required: !values.applicableFeeHeadIds.length,
    })
  )
    requirements.push({ key: 'fee-head' });
  if (
    isFinancePrerequisiteMissing({
      ...routing,
      options: routing.currentData?.expenseCategories,
      required: values.status === 'Active' && !values.expenseCategoryId,
    })
  )
    requirements.push({ key: 'expense-category' });
  if (
    isFinancePrerequisiteMissing({
      ...routing,
      options: routing.currentData?.bankAccounts,
      required:
        values.status === 'Active' &&
        values.allowedPayoutMethods.some((method) => method !== 'Cash') &&
        !values.defaultPayingBankAccountId,
    })
  )
    requirements.push({ key: 'bank-account' });
  return requirements;
}

export function prorationPolicyPrerequisites(
  rules: readonly { feeHeadId: string }[],
  heads: Heads
): FinancePrerequisite[] {
  return isFinancePrerequisiteMissing({
    ...heads,
    options: heads.currentData,
    required: !rules.length,
  })
    ? [{ key: 'fee-head' }]
    : [];
}

export function collectionPolicyPrerequisites(
  values: {
    status: string;
    enableLateFee: boolean;
    lateFeeApplyOnFeeHeads: string[];
    lateFeeIncomeCategoryId?: string | null;
  },
  heads: Heads,
  routing: RoutingLookup
): FinancePrerequisite[] {
  const requirements: FinancePrerequisite[] = [];
  if (
    isFinancePrerequisiteMissing({
      ...heads,
      options: heads.currentData,
      required: values.enableLateFee && !values.lateFeeApplyOnFeeHeads.length,
    })
  )
    requirements.push({ key: 'fee-head' });
  if (
    isFinancePrerequisiteMissing({
      ...routing,
      options: routing.currentData?.incomeCategories,
      required:
        values.enableLateFee && values.status === 'Active' && !values.lateFeeIncomeCategoryId,
    })
  )
    requirements.push({ key: 'income-category' });
  return requirements;
}
