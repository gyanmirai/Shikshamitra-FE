import type { IParams } from 'src/components/customizabaleTable/types';

import { normalizeConcessionFilters } from './concession/concessionTableQuery';

export const policyTableFilterArgs = (filters: IParams['filters']) => {
  const byColumn = Object.fromEntries(
    normalizeConcessionFilters(filters).map((filter) => [filter.column, filter])
  );
  const name = byColumn.policyName;
  const grace = byColumn.gracePeriodDays;
  const graceRange = grace?.type === 'between' ? grace.value : null;
  const ruleCount = byColumn.feeHeadRules;
  const ruleCountRange = ruleCount?.type === 'between' ? ruleCount.value : null;
  const updated = byColumn.updatedAt;
  const dateParts = /^([0-9]{2})-([0-9]{2})-([0-9]{4})$/.exec(String(updated?.value ?? ''));
  const selectedDay = dateParts
    ? new Date(Number(dateParts[3]), Number(dateParts[2]) - 1, Number(dateParts[1]))
    : null;
  const followingDay = dateParts
    ? new Date(Number(dateParts[3]), Number(dateParts[2]) - 1, Number(dateParts[1]) + 1)
    : null;

  return {
    policyNameFilter: name ? String(name.value) : undefined,
    policyNameOperator: name?.type,
    updatedAtOperator: updated?.type,
    updatedAt: selectedDay?.toISOString(),
    updatedAtEnd: followingDay?.toISOString(),
    enableLateFee: byColumn.enableLateFee
      ? String(byColumn.enableLateFee.value) === 'true'
      : undefined,
    lateFeeType: byColumn.lateFeeType?.value as string | undefined,
    graceDaysOperator: grace?.type,
    graceDaysValue: grace ? Number(graceRange ? graceRange.min : grace.value) : undefined,
    graceDaysMax: graceRange ? Number(graceRange.max) : undefined,
    ruleCountOperator: ruleCount?.type,
    ruleCountValue: ruleCount
      ? Number(ruleCountRange ? ruleCountRange.min : ruleCount.value)
      : undefined,
    ruleCountMax: ruleCountRange ? Number(ruleCountRange.max) : undefined,
    allowOnlineCollection: byColumn.allowOnlineCollection
      ? String(byColumn.allowOnlineCollection.value) === 'true'
      : undefined,
    amountMode: byColumn.amountMode?.value as string | undefined,
    feeHeadScope: byColumn.feeHeadScope?.value as string | undefined,
    allowedPayoutMethod: byColumn.allowedPayoutMethods?.value as string | undefined,
    allowPartialRefund: byColumn.allowPartialRefund
      ? String(byColumn.allowPartialRefund.value) === 'true'
      : undefined,
  };
};
