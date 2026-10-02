import type { IParams } from 'src/components/customizabaleTable/types';

export type AttendanceTableQuery = Pick<
  IParams,
  'page' | 'rowsPerPage' | 'searchTerm' | 'sorts' | 'filters'
>;

export function readAttendanceTableQuery(query: string): AttendanceTableQuery {
  const params = new URLSearchParams(query);
  const page = Number(params.get('page'));
  const size = Number(params.get('size'));
  let sorts: IParams['sorts'] = [];
  try {
    const parsed: unknown = JSON.parse(params.get('sorts') || '[]');
    if (Array.isArray(parsed))
      sorts = parsed
        .filter(
          (item): item is IParams['sorts'][number] =>
            !!item &&
            typeof item === 'object' &&
            ['name', 'rollNo'].includes(item.column) &&
            ['asc', 'desc'].includes(item.direction)
        )
        .slice(0, 2);
  } catch {
    /* Invalid URL state falls back to the unsorted register. */
  }
  return {
    page: Number.isInteger(page) && page >= 0 ? page : 0,
    rowsPerPage: [10, 25, 50, 100].includes(size) ? size : 25,
    searchTerm: params.get('search') || '',
    sorts,
    filters: [],
  };
}

export function attendanceTableQueryUrl(path: string, query: string, state: AttendanceTableQuery) {
  const params = new URLSearchParams(query);
  params.set('page', String(state.page));
  params.set('size', String(state.rowsPerPage));
  if (state.searchTerm) params.set('search', state.searchTerm);
  else params.delete('search');
  if (state.sorts.length) params.set('sorts', JSON.stringify(state.sorts));
  else params.delete('sorts');
  return `${path}?${params.toString()}`;
}
