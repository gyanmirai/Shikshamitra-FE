import _ from 'lodash';
import { useMemo } from 'react';

import { matchesTableRowSearch } from './table-row-search';
import { matchesTableRowFilters } from './table-row-filter';
import { parseTableDate, parseFormattedNumber } from '../utils';

import type { IData, IColumn, IParams } from '../types';

interface UseTableDataProps {
  data: IData[];
  config: IParams;
  columns: IColumn[];
  serverSideSearch?: boolean;
  serverSideFilter?: boolean;
  serverSideSort?: boolean;
  serverSidePagination?: boolean;
  searchableFields?: string[];
}

export const useTableData = ({
  data,
  config,
  columns,
  serverSideSearch = false,
  serverSideFilter = false,
  serverSideSort = false,
  serverSidePagination = false,
  searchableFields,
}: UseTableDataProps) => {
  const { filters, searchTerm, columnVisibility, sorts, page, rowsPerPage } = config;

  // Keep expensive row matching stable while unrelated table controls update.
  const filteredData = useMemo(() => {
    if (serverSideFilter) return data;
    const lowerSearchTerm = searchTerm.toLowerCase();
    return data.filter(
      (row) =>
        (serverSideSearch ||
          matchesTableRowSearch(
            row,
            columns,
            columnVisibility,
            lowerSearchTerm,
            searchableFields
          )) &&
        matchesTableRowFilters(row, filters, columns)
    );
  }, [
    serverSideFilter,
    serverSideSearch,
    data,
    filters,
    columnVisibility,
    columns,
    searchTerm,
    searchableFields,
  ]);

  // Sorting a result page is independent of search and column matching.
  const sortedData = useMemo(() => {
    if (serverSideSort) return filteredData;

    return _.orderBy(
      filteredData,
      sorts.map((sort) => (row) => {
        const column = columns.find((col) => col.id === sort.column);
        const value = _.get(row, sort.column);

        switch (column?.filterType) {
          case 'number':
            return Number(value);
          case 'date':
          case 'dateTime':
            return parseTableDate(value)?.valueOf() ?? 0;
          case 'formattedNumber':
            return parseFormattedNumber(value);
          default:
            return value;
        }
      }),
      sorts.map((i) => i.direction)
    );
  }, [serverSideSort, filteredData, sorts, columns]);

  // Preserve the derived page reference while unrelated controls update.
  const paginatedData = useMemo(
    () =>
      serverSidePagination
        ? sortedData
        : sortedData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [serverSidePagination, sortedData, page, rowsPerPage]
  );

  return { filteredData, sortedData, paginatedData };
};
