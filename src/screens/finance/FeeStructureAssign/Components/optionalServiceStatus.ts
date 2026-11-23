import type { AssignmentHead } from 'src/redux/finance/studentFeeAssignment';

import dayjs from 'dayjs';

export function optionalServiceStatus(head: AssignmentHead, hasHistoricalCancellation: boolean) {
  const latestPeriod = head.optionalServicePeriods?.at(-1);

  if (latestPeriod && !latestPeriod.cancellationEffectiveDate) {
    const today = dayjs();
    return {
      latestPeriod,
      stopped: false,
      label: today.isBefore(latestPeriod.startDate, 'day')
        ? 'Scheduled'
        : today.isAfter(latestPeriod.endDate, 'day')
          ? 'Ended'
          : 'Active',
    };
  }

  const stopped = Boolean(head.optionalServiceEndDate || latestPeriod || hasHistoricalCancellation);
  return {
    latestPeriod,
    stopped,
    label: head.optionalServiceEndDate ? 'Cancellation recorded' : stopped ? 'Service stopped' : '',
  };
}
