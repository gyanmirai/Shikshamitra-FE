import type { IParams } from 'src/components/customizabaleTable/types';

const queryColumns = ['name', 'version', 'sectionCount'];

export function normalizeAdmissionFormFilters(filters: IParams['filters']): IParams['filters'] {
  const latestStatus = filters.findLast((filter) => filter.column === 'status');
  return filters.filter(
    (filter) =>
      queryColumns.includes(filter.column) ||
      (filter.column === 'status' && filter === latestStatus)
  );
}

export function serializeAdmissionFormColumnFilters(
  filters: IParams['filters']
): string | undefined {
  const criteria = filters
    .filter(({ column }) => queryColumns.includes(column))
    .map(({ column, type, value, valueType }) => ({
      column,
      type,
      value:
        valueType === 'number'
          ? type === 'between'
            ? { min: Number(value.min), max: Number(value.max) }
            : Number(value)
          : value,
      valueType,
    }));
  return criteria.length ? JSON.stringify(criteria) : undefined;
}
