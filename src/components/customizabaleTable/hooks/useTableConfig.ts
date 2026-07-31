import { useState, useCallback } from 'react';

import type { IParams, IColumn } from '../types';

interface UseTableConfigProps {
  columns: IColumn[];
  defaultRowsPerPage?: number;
  defaultSearchTerm?: string;
}

export const getNextTableSorts = (
  sorts: IParams['sorts'],
  column: string,
  originalId?: string
): IParams['sorts'] => {
  const nextSorts = sorts.map((sort) => ({ ...sort }));
  const sortIndex = nextSorts.findIndex((sort) => sort.column === column);

  if (sortIndex < 0) {
    return [...nextSorts, { column, direction: 'asc', originalId }];
  }

  if (nextSorts[sortIndex].direction === 'asc') {
    nextSorts[sortIndex] = { column, direction: 'desc', originalId };
    return nextSorts;
  }

  nextSorts.splice(sortIndex, 1);
  return nextSorts;
};

export const getNextSingleTableSort = (
  sorts: IParams['sorts'],
  column: string,
  originalId?: string
): IParams['sorts'] => {
  const currentSort = sorts.find((sort) => sort.column === column);
  if (!currentSort) return [{ column, direction: 'asc', originalId }];
  if (currentSort.direction === 'asc') return [{ column, direction: 'desc', originalId }];
  return [{ column, direction: 'asc', originalId }];
};

export const reconcileColumnVisibility = (columns: IColumn[], current: Record<string, boolean>) =>
  columns.reduce<Record<string, boolean>>(
    (acc, column) => ({
      ...acc,
      [column.id]: current[column.id] ?? !column.defaultHidden,
    }),
    {}
  );

export const useTableConfig = ({
  columns,
  defaultRowsPerPage = 10,
  defaultSearchTerm = '',
}: UseTableConfigProps) => {
  const [tableConfig, setTableConfig] = useState<IParams>({
    page: 0,
    rowsPerPage: defaultRowsPerPage,
    searchTerm: defaultSearchTerm,
    filterColumn: '',
    filterType: 'contains',
    dense: true,
    columnSearchTerm: '',
    filters: [],
    sorts: [],
    dateFilter: null,
    dateRangeFilter: { start: null, end: null },
    filterValue: '',
    columnVisibility: columns.reduce(
      (acc, column) => ({ ...acc, [column.id]: !column.defaultHidden }),
      {} as Record<string, boolean>
    ),
  });

  const handleChangeParams = useCallback((param: Partial<IParams>) => {
    setTableConfig((prev) => ({ ...prev, ...param }));
  }, []);

  /**
   * Memoization Justification:
   * Prevents re-creation of this function on every render,
   * necessary for dependent effects or callbacks in child components.
   */
  const handleSort = useCallback((column: string, originalId?: string) => {
    setTableConfig((prev) => ({
      ...prev,
      sorts: getNextTableSorts(prev.sorts, column, originalId),
    }));
  }, []);

  return {
    tableConfig,
    setTableConfig,
    handleChangeParams,
    handleSort,
  };
};
