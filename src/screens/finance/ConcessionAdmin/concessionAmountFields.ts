import { ConcessionStatusType } from 'src/enums/concession-status-type';

import type { IConcessionRequestItem } from './type';

export function concessionAmountFields(item: IConcessionRequestItem) {
  const requested = item.totalRequestedAmount ?? item.totalAmount;
  const hasApproval = [
    ConcessionStatusType.Approved,
    ConcessionStatusType.PartiallyReversed,
    ConcessionStatusType.Reversed,
  ].includes(item.status);
  const fields: Array<{ label: string; amount: number }> = [];

  if (!hasApproval || requested !== item.totalApprovedAmount) {
    fields.push({ label: 'Requested amount', amount: requested });
  }
  if (hasApproval) {
    fields.push({ label: 'Approved amount', amount: item.totalApprovedAmount });
    if (item.totalReversedAmount > 0) {
      fields.push(
        { label: 'Reversed amount', amount: item.totalReversedAmount },
        { label: 'Net approved amount', amount: item.netApprovedAmount }
      );
    }
  }
  return fields;
}
