import type { StudentDirectoryOptions } from 'src/redux/student/records/student-records-types';

export type DirectoryAcademicScope = {
  board: string;
  medium: string;
  classes: string[];
  divisions: string[];
  ready: boolean;
};

const ids = (raw: string | null) => [...new Set((raw ?? '').split(',').filter(Boolean))];

export function directoryScope(
  params: URLSearchParams,
  options?: StudentDirectoryOptions
): DirectoryAcademicScope {
  const board =
    options?.boards.find((item) => item.id === params.get('board'))?.id ??
    options?.boards[0]?.id ??
    '';
  const mediums = options?.mediums.filter((item) => item.parentId === board) ?? [];
  const medium =
    mediums.find((item) => item.id === params.get('medium'))?.id ?? mediums[0]?.id ?? '';
  const standards = options?.standards.filter((item) => item.parentId === medium) ?? [];
  const classes = ids(params.get('class')).filter((id) => standards.some((item) => item.id === id));
  const divisions = ids(params.get('division')).filter((id) =>
    options?.divisions.some(
      (item) =>
        item.id === id &&
        standards.some((standard) => standard.id === item.parentId) &&
        (!classes.length || classes.includes(item.parentId ?? ''))
    )
  );
  const validRequestedScope =
    (!params.get('board') || params.get('board') === board) &&
    (!params.get('medium') || params.get('medium') === medium) &&
    classes.length === ids(params.get('class')).length &&
    divisions.length === ids(params.get('division')).length;
  return {
    board,
    medium,
    classes,
    divisions,
    ready: Boolean(board && medium && validRequestedScope),
  };
}

export function directoryBulkScopeReady(scope: DirectoryAcademicScope, population: string) {
  return (
    scope.ready &&
    population === 'Active' &&
    scope.classes.length === 1 &&
    scope.divisions.length === 1
  );
}
