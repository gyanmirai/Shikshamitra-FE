import type {
  StudentDashboardScope,
  StudentDashboardFilterOptions,
} from 'src/redux/student/dashboard/student-module-dashboard-types';

import type { DirectoryFilters } from '../records/student-directory-filter-fields';

export const emptyDashboardFilters: DirectoryFilters = {
  board: '',
  medium: '',
  class: '',
  division: '',
};

export function dashboardFiltersFromUrl(
  params: Pick<URLSearchParams, 'get'>,
  year: string
): DirectoryFilters {
  if (params.get('year') && params.get('year') !== year) return emptyDashboardFilters;
  return {
    board: params.get('board') ?? '',
    medium: params.get('medium') ?? '',
    class: params.get('class') ?? '',
    division: params.get('division') ?? '',
  };
}

export function validDashboardFilters(
  filters: DirectoryFilters,
  options: StudentDashboardFilterOptions
) {
  const medium = options.mediums.find((item) => item.id === filters.medium);
  const standard = options.standards.find((item) => item.id === filters.class);
  const division = options.divisions.find((item) => item.id === filters.division);
  const classMedium = options.mediums.find((item) => item.id === standard?.parentId);
  return (
    (!filters.board || options.boards.some((item) => item.id === filters.board)) &&
    (!filters.medium || Boolean(medium && (!filters.board || medium.parentId === filters.board))) &&
    (!filters.class ||
      Boolean(
        standard &&
        (!filters.medium || standard.parentId === filters.medium) &&
        (!filters.board || classMedium?.parentId === filters.board)
      )) &&
    (!filters.division || Boolean(filters.class && division?.parentId === filters.class))
  );
}

export function dashboardApiScope(filters: DirectoryFilters): StudentDashboardScope {
  return {
    boardId: filters.board || undefined,
    mediumId: filters.medium || undefined,
    standardId: filters.class || undefined,
    divisionId: filters.division || undefined,
  };
}

// Invalid URL values remain in the URL for the warning/recovery state, but must not
// become out-of-range MUI values or be mistaken for a confirmed API scope.
export function dashboardDisplayFilters(
  filters: DirectoryFilters,
  options: StudentDashboardFilterOptions
): DirectoryFilters {
  const board = options.boards.some((item) => item.id === filters.board) ? filters.board : '';
  const medium =
    options.mediums.find(
      (item) => item.id === filters.medium && (!board || item.parentId === board)
    )?.id ?? '';
  const standard =
    options.standards.find(
      (item) =>
        item.id === filters.class &&
        (!medium || item.parentId === medium) &&
        (!board ||
          options.mediums.some(
            (itemMedium) => itemMedium.id === item.parentId && itemMedium.parentId === board
          ))
    )?.id ?? '';
  const division = standard
    ? (options.divisions.find((item) => item.id === filters.division && item.parentId === standard)
        ?.id ?? '')
    : '';
  return { board, medium, class: standard, division };
}
