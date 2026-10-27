import type { IParams } from 'src/components/customizabaleTable/types';

import { readQueueColumnFilters } from '../admission-queue-column-filters';

export const APPLICATION_SORT_COLUMNS = [
  'applicantName',
  'applicationNumber',
  'standardName',
  'contactPhone',
  'decisionEnteredAt',
  'lastSavedAt',
  'status',
];

const REMOVED_FILTERS = [
  'stage',
  'currentStageSearch',
  'counsellor',
  'queue',
  'assignedCounsellorId',
];

export function readAdmissionApplicationsState(params: Pick<URLSearchParams, 'get'>) {
  const page = Number(params.get('page'));
  const size = Number(params.get('size'));
  const sort = params.get('sort');
  const sorts: IParams['sorts'] =
    sort && APPLICATION_SORT_COLUMNS.includes(sort)
      ? [{ column: sort, direction: params.get('direction') === 'desc' ? 'desc' : 'asc' }]
      : [];
  return {
    filters: readQueueColumnFilters(params.get('filters') ?? '', 'applications'),
    search: params.get('search') ?? '',
    page: Number.isSafeInteger(page) && page > 0 ? page - 1 : 0,
    rowsPerPage: [10, 25, 100].includes(size) ? size : 25,
    sorts,
    status:
      /^\d+$/.test(params.get('status') ?? '') && Number(params.get('status')) <= 11
        ? Number(params.get('status'))
        : undefined,
  };
}

export function admissionApplicationsUrl(
  pathname: string,
  params: URLSearchParams,
  changes: Record<string, string | undefined> = {},
  resetPage = true
) {
  const next = new URLSearchParams(params);
  REMOVED_FILTERS.forEach((key) => next.delete(key));
  Object.entries(changes).forEach(([key, value]) => {
    if (value) next.set(key, value);
    else next.delete(key);
  });
  if (resetPage) next.delete('page');
  const query = next.toString();
  return query ? `${pathname}?${query}` : pathname;
}
