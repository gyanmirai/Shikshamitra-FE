const millisecondsPerDay = 24 * 60 * 60 * 1_000;

const parseIsoDate = (value: string) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return undefined;

  const [, year, month, day] = match;
  const timestamp = Date.UTC(Number(year), Number(month) - 1, Number(day));
  const normalized = new Date(timestamp).toISOString().slice(0, 10);
  return normalized === value ? timestamp : undefined;
};

export const isValidAdmissionReportDate = (value: string) => parseIsoDate(value) !== undefined;

export type AdmissionReportDateRangeError = 'invalid-date' | 'invalid-order' | 'too-large';

export function getAdmissionReportDateRangeError(
  from: string,
  to: string
): AdmissionReportDateRangeError | undefined {
  if (!from || !to) return undefined;

  const fromTimestamp = parseIsoDate(from);
  const toTimestamp = parseIsoDate(to);
  if (fromTimestamp === undefined || toTimestamp === undefined) return 'invalid-date';
  if (fromTimestamp > toTimestamp) return 'invalid-order';

  return (toTimestamp - fromTimestamp) / millisecondsPerDay > 366 ? 'too-large' : undefined;
}
