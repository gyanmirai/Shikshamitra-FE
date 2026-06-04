import _ from 'lodash';
import dayjs from 'dayjs';
import { useMemo, useCallback } from 'react';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';

import { parseFormattedNumber } from '../utils';

import type { IData, IColumn, IParams } from '../types';

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

interface UseTableDataProps {
  data: IData[];
  config: IParams;
  columns: IColumn[];
  serverSideFilter?: boolean;
  serverSideSort?: boolean;
  serverSidePagination?: boolean;
  serverSideSearch?: boolean;
  isPagination?: boolean;
}

export const useTableData = ({
  data,
  config,
  columns,
  serverSideFilter = false,
  serverSideSort = false,
  serverSidePagination = false,
  serverSideSearch = false,
  isPagination = true,
}: UseTableDataProps) => {
  const { filters, searchTerm, columnVisibility, sorts, page, rowsPerPage } = config;

  /**
   * Memoization Justification:
   * Complex filtering logic that should only run when filters or row data change.
   */
  const applyFilter = useCallback(
    (row: IData) => {
      const filtersByColumn = _.groupBy(filters, 'column');

      return Object.values(filtersByColumn).every((columnFilters) =>
        columnFilters.some((filter) => {
          const value = _.get(row, filter.column, '');
          const isNumericValue =
            value !== null && value !== undefined && value !== '' && !Number.isNaN(Number(value));
          const valueAsNumber = isNumericValue ? Number(value) : NaN;

          const isFilterNumeric =
            filter.value !== null &&
            filter.value !== undefined &&
            filter.value !== '' &&
            !Number.isNaN(Number(filter.value));
          const filterValueAsNumber = isFilterNumeric ? Number(filter.value) : NaN;

          const isDateType = filter.valueType === 'date';
          const isFormattedNumber = filter.valueType === 'formattedNumber';

          if (isDateType) {
            if (!value) return false;
            const parsedVal = dayjs(value).isValid() ? dayjs(value) : dayjs(value, 'DD-MM-YYYY');
            const parsedFilterVal = dayjs(filter.value, 'DD-MM-YYYY');
            switch (filter.type) {
              case 'equals':
                return parsedVal.isSame(parsedFilterVal, 'day');

              case 'after':
                return parsedVal.isSameOrAfter(parsedFilterVal, 'day');
              case 'before':
                return parsedVal.isSameOrBefore(parsedFilterVal, 'day');
              default:
                return false;
            }
          }
          if (isFormattedNumber) {
            const parsedValue = parseFormattedNumber(value);
            const parsedFilterValue = parseFormattedNumber(filter.value as string);

            switch (filter.type) {
              case 'equals':
                return parsedValue === parsedFilterValue;
              case 'greaterThan':
                return parsedValue > parsedFilterValue;
              case 'lessThan':
                return parsedValue < parsedFilterValue;
              default:
                return false;
            }
          } else {
            const safeValue = (value ?? '').toString().toLowerCase();
            const safeFilterValue = (filter.value ?? '').toString().toLowerCase();
            switch (filter.type) {
              case 'contains':
                return safeValue.includes(safeFilterValue);
              case 'equals':
                return safeValue === safeFilterValue;
              case 'startsWith':
                return safeValue.startsWith(safeFilterValue);
              case 'endsWith':
                return safeValue.endsWith(safeFilterValue);
              case 'greaterThan':
                return valueAsNumber > filterValueAsNumber;
              case 'lessThan':
                return valueAsNumber < filterValueAsNumber;
              case 'between':
                return (
                  valueAsNumber >= (filter?.value as any)?.min &&
                  valueAsNumber <= (filter?.value as any)?.max
                );
              default:
                return true;
            }
          }
        })
      );
    },
    [filters]
  );

  const filteredData = useMemo(() => {
    if (serverSideFilter) {
      return data;
    }
    return data.filter((row) => {
      const searchMatch =
        serverSideSearch ||
        searchTerm === '' ||
        columns.some((col) => {
          if (!columnVisibility[col.id]) return false;
          const val = _.get(row, col.id);
          return (
            val !== null &&
            val !== undefined &&
            val.toString().toLowerCase().includes(searchTerm.toLowerCase())
          );
        });

      return searchMatch && applyFilter(row);
    });
  }, [
    serverSideFilter,
    serverSideSearch,
    data,
    applyFilter,
    columnVisibility,
    columns,
    searchTerm,
  ]);

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
          case 'date': {
            if (!value) return 0;
            const parsedVal = dayjs(value).isValid() ? dayjs(value) : dayjs(value, 'DD-MM-YYYY');
            return parsedVal.isValid() ? parsedVal.valueOf() : 0;
          }
          case 'formattedNumber':
            return parseFormattedNumber(value);
          default:
            return value;
        }
      }),
      sorts.map((i) => i.direction)
    );
  }, [serverSideSort, filteredData, sorts, columns]);

  const paginatedData = useMemo(
    () =>
      serverSidePagination || !isPagination
        ? sortedData
        : sortedData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [serverSidePagination, isPagination, sortedData, page, rowsPerPage]
  );

  return { filteredData, sortedData, paginatedData };
};
