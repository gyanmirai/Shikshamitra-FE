import type { IParams } from 'src/components/customizabaleTable/types';

import { useMemo } from 'react';

import { useReportingSearchParams } from './useReportingSearchParams';
import { reportTableCriteria, readReportTableState } from '../report-table-query';

export function useReportTableState(prefix = '') {
  const { query, updateQuery } = useReportingSearchParams();
  const state = useMemo(() => readReportTableState(query, prefix), [query, prefix]);
  const set = (key: string, value: string) =>
    updateQuery({ [`${prefix}${key}`]: value, page: '0' });
  return {
    query,
    updateQuery,
    ...state,
    criteria: reportTableCriteria(state.searchTerm, state.filters, state.sorts),
    onSearchInputChange: (value: string) => set('search', value),
    onSortChange: (sorts: IParams['sorts']) => set('sorts', JSON.stringify(sorts)),
    onFiltersChange: (filters: IParams['filters']) =>
      set(
        'filters',
        JSON.stringify(
          filters.map(({ column, type, value, valueType, label, displayValue }) => ({
            column,
            type,
            value,
            valueType,
            label: typeof label === 'string' ? label : column,
            displayValue:
              typeof displayValue === 'string'
                ? displayValue
                : typeof value === 'boolean'
                  ? value
                    ? 'Yes'
                    : 'No'
                  : undefined,
          }))
        )
      ),
    onClearCriteria: () =>
      updateQuery({ [`${prefix}search`]: '', [`${prefix}filters`]: '', page: '0' }),
  };
}
