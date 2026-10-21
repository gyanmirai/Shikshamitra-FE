import type { HrReportField } from 'src/redux/hr/hrReportsApi';
import type { ReportTableCriteria } from 'src/redux/hr/hrReportingWorkspaceApi';
import type { IParams, IColumn } from 'src/components/customizabaleTable/types';

export function reportTableCriteria(
  search: string,
  filters: IParams['filters'],
  sorts: IParams['sorts']
): ReportTableCriteria {
  return {
    search,
    filters: filters.map(({ column, type, value }) => ({ column, type, value })),
    sorts: sorts.map(({ column, direction }) => ({ column, direction })),
  };
}

export function readReportTableState(query: Pick<URLSearchParams, 'get'>, prefix = '') {
  function readArray(key: string): unknown[] {
    try {
      const serialized = query.get(`${prefix}${key}`) || '[]';
      if (serialized.length > 32768) return [];
      const value = JSON.parse(serialized);
      return Array.isArray(value) ? value : [];
    } catch {
      return [];
    }
  }
  const filters = readArray('filters')
    .filter(
      (value: any) =>
        value &&
        typeof value.column === 'string' &&
        typeof value.type === 'string' &&
        typeof value.valueType === 'string' &&
        (['string', 'number', 'boolean'].includes(typeof value.value) ||
          (value.type === 'between' &&
            value.value &&
            ['string', 'number'].includes(typeof value.value.min) &&
            ['string', 'number'].includes(typeof value.value.max)))
    )
    .map((filter: any) => ({
      column: filter.column,
      type: filter.type,
      value: filter.value,
      valueType: filter.valueType,
      label: typeof filter.label === 'string' ? filter.label : filter.column,
      displayValue: typeof filter.displayValue === 'string' ? filter.displayValue : undefined,
    })) as IParams['filters'];
  const sorts = readArray('sorts').filter(
    (value: any) =>
      value && typeof value.column === 'string' && ['asc', 'desc'].includes(value.direction)
  ) as IParams['sorts'];
  return { searchTerm: query.get(`${prefix}search`) || '', filters, sorts };
}

export function reportFieldColumn(
  field: HrReportField
): Pick<IColumn, 'filterType' | 'valueType' | 'enumOptions'> {
  const { type } = field;
  return {
    valueType: (type === 'string' ? 'text' : type) as IColumn['valueType'],
    filterType:
      type === 'number' || type === 'money'
        ? 'number'
        : type === 'datetime'
          ? 'dateTime'
          : type === 'date'
            ? 'date'
            : type === 'boolean' || field.options?.length
              ? 'enum'
              : 'string',
    enumOptions:
      type === 'boolean'
        ? [
            { label: 'Yes', value: true },
            { label: 'No', value: false },
          ]
        : field.options?.map((option) => ({ label: option.label, value: option.id })),
  };
}
