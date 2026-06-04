import { useState, useCallback } from 'react';

import type { IParams, IColumn } from '../types';

interface UseTableConfigProps {
  columns: IColumn[];
  defaultRowsPerPage?: number;
}

export const useTableConfig = ({ columns, defaultRowsPerPage = 10 }: UseTableConfigProps) => {
  const [tableConfig, setTableConfig] = useState<IParams>({
    page: 0,
    rowsPerPage: defaultRowsPerPage,
    searchTerm: '',
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
    setTableConfig((prev) => {
      const existingSort = prev.sorts.find((item) => item.column === column);
      let newSorts: IParams['sorts'] = [];

      if (existingSort) {
        if (existingSort.direction === 'asc') {
          newSorts = [{ column, direction: 'desc', originalId }];
        } else {
          newSorts = [];
        }
      } else {
        newSorts = [{ column, direction: 'asc', originalId }];
      }
      return { ...prev, sorts: newSorts };
    });
  }, []);

  return {
    tableConfig,
    setTableConfig,
    handleChangeParams,
    handleSort,
  };
};
