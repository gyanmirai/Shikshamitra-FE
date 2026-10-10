import type { IParams } from 'src/components/customizabaleTable/types';

export const APPLICATION_SORT_COLUMNS = [
  'applicantName',
  'applicationNumber',
  'standardName',
  'contactPhone',
  'assignedCounsellorName',
  'decisionEnteredAt',
  'lastSavedAt',
  'status',
];

const REMOVED_FILTERS = [
  'status',
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
    search: params.get('search') ?? '',
    page: Number.isSafeInteger(page) && page > 0 ? page - 1 : 0,
    rowsPerPage: [10, 25, 100].includes(size) ? size : 25,
    sorts,
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
