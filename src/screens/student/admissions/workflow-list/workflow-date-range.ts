import { parseDateOnly } from 'src/utils/date-only';

/** Convert local calendar dates to the workflow API's inclusive UTC bounds. */
export function workflowCreatedRange(from: string, to: string) {
  const start = parseDateOnly(from);
  const end = parseDateOnly(to);
  if (
    (from && start?.format('YYYY-MM-DD') !== from) ||
    (to && end?.format('YYYY-MM-DD') !== to) ||
    (start && end && start.isAfter(end, 'day'))
  )
    return undefined;

  const lastMillisecond = end?.add(1, 'day').startOf('day').subtract(1, 'millisecond');
  return {
    createdFrom: start?.startOf('day').toISOString(),
    // .NET DateTime accepts seven fractional digits. Include timestamps within the last millisecond.
    createdTo: lastMillisecond?.toISOString().replace(/\.999Z$/, '.9999999Z'),
  };
}
