import type { StockLocation } from 'src/redux/library/stock-verification-api';

const countStatuses: Record<number, string> = {
  1: 'Counting',
  2: 'In review',
  3: 'Finalized',
  4: 'Cancelled',
};
const copyStatuses: Record<number, string> = {
  0: 'Available',
  1: 'On loan',
  2: 'Reserved',
  3: 'Lost',
  4: 'Damaged',
  5: 'Under repair',
  6: 'Discarded',
  7: 'Classroom custody',
  8: 'In transit',
};
const findings: Record<number, string> = {
  1: 'Observed at expected shelf',
  2: 'Observed elsewhere',
  3: 'Observed location unconfirmed',
  4: 'Observed with a conflicting copy status',
  5: 'On loan',
  6: 'On hold',
  7: 'In repair',
  8: 'Recorded lost',
  9: 'Withdrawn',
  10: 'Not seen',
  11: 'Moved outside this count',
  12: 'Conflicting register records',
  13: 'Current copy unavailable',
  14: 'Outside the original count',
  15: 'Unknown accession',
  16: 'Classroom custody',
  17: 'In transit',
};

export const stockCountStatus = (value: number) => countStatuses[value] ?? 'Unavailable';
export const stockCopyStatus = (value: number) => copyStatuses[value] ?? 'Unavailable';
export const stockFinding = (value: number, receivedAfterOpening = false) =>
  receivedAfterOpening ? 'Receipt recorded after opening' : (findings[value] ?? 'Unavailable');

export const stockDecisionOutcomes = [
  { value: 1, label: 'Follow up' },
  { value: 2, label: 'Evidence verified' },
  { value: 3, label: 'Register correction needed' },
] as const;

export const stockDecisionLabel = (value: number) =>
  stockDecisionOutcomes.find((decision) => decision.value === value)?.label ?? 'Unavailable';

export const stockFindingSources = [
  {
    id: 1,
    label: 'Expected copies',
    empty: 'There were no expected copies when this count opened.',
  },
  {
    id: 2,
    label: 'Scans outside baseline',
    empty: 'There are no recognized scans outside the baseline.',
  },
  { id: 3, label: 'Unknown scans', empty: 'There are no unknown scans.' },
] as const;

export function stockLocationLabel(
  locations: readonly StockLocation[],
  sectionId: string | null,
  shelfId: string | null,
  fallback: string
) {
  if (!sectionId) return fallback;
  const section = locations.find((row) => row.id === sectionId);
  if (!section) return 'Unavailable location';
  if (!shelfId) return section.sectionName;
  const shelf = section.shelfDetails.find((row) => row.id === shelfId);
  return [section.sectionName, shelf?.shelfName ?? 'Unavailable shelf'].join(' / ');
}
