import type { IParams } from 'src/components/customizabaleTable/types';

import { formatDateOnly } from 'src/utils/date-only';

const columnLabels: Record<string, string> = {
  name: 'Workflow',
  lastModificationTime: 'Last modified',
  publishedAt: 'Published at',
  offeringCount: 'Used by offerings',
  version: 'Version',
};

const validCount = (value: unknown) =>
  (typeof value === 'number' || (typeof value === 'string' && /^\d+$/.test(value))) &&
  Number.isInteger(Number(value)) &&
  Number(value) >= 0 &&
  Number(value) <= 2147483647;

const validDate = (value: unknown) => {
  if (typeof value !== 'string') return false;
  const date = /^(\d{2})-(\d{2})-(\d{4})$/.exec(value);
  const iso = date ? `${date[3]}-${date[2]}-${date[1]}` : value;
  return /^\d{4}-\d{2}-\d{2}$/.test(iso) && formatDateOnly(iso, 'YYYY-MM-DD') === iso;
};

const validFilter = (filter: IParams['filters'][number]) => {
  if (!filter || typeof filter !== 'object' || !Object.hasOwn(columnLabels, filter.column))
    return false;
  const { column, type, value, valueType } = filter;
  if (column === 'name')
    return (
      valueType === 'string' &&
      ['contains', 'equals', 'startsWith', 'endsWith'].includes(type) &&
      typeof value === 'string' &&
      value.trim().length > 0 &&
      value.length <= 150
    );
  if (column === 'lastModificationTime' || column === 'publishedAt')
    return valueType === 'date' && ['equals', 'after', 'before'].includes(type) && validDate(value);
  if (valueType !== 'number') return false;
  if (type === 'between')
    return (
      value &&
      typeof value === 'object' &&
      validCount(value.min) &&
      validCount(value.max) &&
      Number(value.min) <= Number(value.max)
    );
  return ['equals', 'greaterThan', 'lessThan'].includes(type) && validCount(value);
};

// Keep presentation-only labels out of the API and shareable URL contract.
export function serializeWorkflowColumnFilters(filters: IParams['filters']): string {
  const criteria = filters
    .filter(({ column }) => Object.hasOwn(columnLabels, column))
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
  return criteria.length ? JSON.stringify(criteria) : '';
}

export function workflowColumnFilters(serialized: string): IParams['filters'] {
  if (!serialized || serialized.length > 12000) return [];
  try {
    const parsed: unknown = JSON.parse(serialized);
    if (!Array.isArray(parsed) || parsed.length > 20) return [];
    return parsed.filter(validFilter).map(({ column, type, value, valueType }) => ({
      column,
      type,
      value,
      valueType,
      label: columnLabels[column],
    }));
  } catch {
    return [];
  }
}

// A timestamp's displayed calendar day belongs to the browser timezone. Carry each
// midnight offset independently so daylight-saving transitions keep their true length.
export function workflowColumnFiltersRequest(serialized: string): string {
  const filters = JSON.parse(
    serializeWorkflowColumnFilters(workflowColumnFilters(serialized)) || '[]'
  );
  return filters.length
    ? JSON.stringify(
        filters.map((filter: IParams['filters'][number]) => {
          if (filter.valueType !== 'date') return filter;
          const parts = /^(\d{2})-(\d{2})-(\d{4})$/.exec(filter.value);
          const iso = parts ? `${parts[3]}-${parts[2]}-${parts[1]}` : filter.value;
          const [year, month, day] = iso.split('-').map(Number);
          return {
            ...filter,
            startOffsetMinutes: new Date(year, month - 1, day).getTimezoneOffset(),
            endOffsetMinutes: new Date(year, month - 1, day + 1).getTimezoneOffset(),
          };
        })
      )
    : '';
}
