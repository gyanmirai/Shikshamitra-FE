import type { IColumn, IParams } from 'src/components/customizabaleTable/types';

const normalizeSortField = (value: string) => value.trim().toLowerCase();

export function parseEnrollmentTableSorts(
  sorting: string | null | undefined,
  columns: readonly IColumn[]
): IParams['sorts'] {
  if (!sorting?.trim()) return [];

  return sorting
    .split(',')
    .flatMap((clause) => {
      const match = clause.trim().match(/^(.+?)\s+(asc|desc)$/i);
      if (!match) return [];

      const requestedField = normalizeSortField(match[1]);
      const column = columns.find(
        (candidate) =>
          normalizeSortField(candidate.originalId || candidate.id) === requestedField ||
          normalizeSortField(candidate.id) === requestedField
      );
      if (!column) return [];

      return [
        {
          column: column.id,
          direction: match[2].toLowerCase() as 'asc' | 'desc',
          originalId: column.originalId,
        },
      ];
    })
    .slice(0, 1);
}

export function serializeEnrollmentTableSort(sorts: IParams['sorts']) {
  const sort = sorts[0];
  return sort ? `${sort.originalId || sort.column} ${sort.direction}` : '';
}
