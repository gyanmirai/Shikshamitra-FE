import type { IParams } from 'src/components/customizabaleTable/types';

import { parseTableDate } from 'src/components/customizabaleTable/utils';

import type { ReportHistoryParams } from './types';

const text = new Set(['reportType', 'format', 'status', 'fileName']);
const dates = new Set(['creationTime', 'completedAt', 'expiresAt']);
const textOperators = new Set(['contains', 'equals', 'startsWith', 'endsWith']);
const dateOperators = new Set(['equals', 'after', 'before']);

export function reportHistoryCriteria(
  search: string,
  sorts: IParams['sorts'],
  filters: IParams['filters'],
  timeZone: string
): Omit<ReportHistoryParams, 'skipCount' | 'maxResultCount'> {
  return {
    filter: search || undefined,
    sorting: sorts.length
      ? sorts.map((sort) => `${sort.column} ${sort.direction}`).join(',')
      : undefined,
    columnFilters: filters.length ? JSON.stringify(reportHistoryFilters(filters)) : undefined,
    timeZone,
  };
}

export function reportHistoryFilters(filters: IParams['filters']) {
  if (filters.length > 10) throw new Error('Use at most 10 report history filters.');
  return filters.map(({ column, type, value }) => {
    if (dates.has(column)) {
      const date = parseTableDate(value);
      if (!dateOperators.has(type) || !date)
        throw new Error('Choose a valid report history date and operator.');
      return { column, type, value: date.startOf('minute').toISOString() };
    }
    if (
      !text.has(column) ||
      !textOperators.has(type) ||
      typeof value !== 'string' ||
      value.length > 200
    )
      throw new Error('Use a supported report history text filter with at most 200 characters.');
    return { column, type, value };
  });
}
