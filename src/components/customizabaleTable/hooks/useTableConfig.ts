import { useState, useCallback } from 'react';

import type { IParams, IColumn } from '../types';

interface UseTableConfigProps {
  columns: IColumn[];
  defaultRowsPerPage?: number;
  defaultSearchTerm?: string;
}

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
    setTableConfig((prev) => {
      const newSortConfig = [...prev.sorts];
      const configIndex = newSortConfig.findIndex((item) => item.column === column);

      if (configIndex > -1) {
        if (newSortConfig[configIndex].direction === 'asc') {
          newSortConfig[configIndex].direction = 'desc';
          newSortConfig[configIndex].originalId = originalId;
        } else {
          newSortConfig.splice(configIndex, 1);
        }
      } else {
        newSortConfig.push({ column, direction: 'asc', originalId });
      }
      return { ...prev, sorts: newSortConfig };
    });
  }, []);

  return {
    tableConfig,
    setTableConfig,
    handleChangeParams,
    handleSort,
  };
};
