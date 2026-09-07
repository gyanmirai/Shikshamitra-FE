import _ from 'lodash';
import dayjs from 'dayjs';
import { useMemo, useCallback } from 'react';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';

import { parseTableDate, getColumnDisplayText, parseFormattedNumber } from '../utils';

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
}

export const useTableData = ({
  data,
  config,
  columns,
  serverSideFilter = false,
  serverSideSort = false,
  serverSidePagination = false,
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
          const column = columns.find((col) => col.id === filter.column);
          const valueAsNumber = !Number.isNaN(Number(value)) ? Number(value) : value; // fixed isNumber check
          const filterValueAsNumber = !Number.isNaN(Number(filter.value))
            ? Number(filter.value)
            : filter.value;
          const isDateType = filter.valueType === 'date';
          const isDateTimeType = filter.valueType === 'dateTime';
          const isEnumType = filter.valueType === 'enum';
          const isFormattedNumber = filter.valueType === 'formattedNumber';

          // Enum options represent raw domain values. A rendered enum cell may show a label
          // such as "Published", but it must still match the selected option value (for example 1).
          if (isEnumType) {
            return String(value) === String(filter.value);
          }

          if (isDateType || isDateTimeType) {
            const rowDate = parseTableDate(value);
            const filterDate = parseTableDate(filter.value);
            const compareUnit = isDateTimeType ? 'minute' : 'day';

            if (!rowDate || !filterDate) return false;

            switch (filter.type) {
              case 'equals':
                return rowDate.isSame(filterDate, compareUnit);

              case 'after':
                return rowDate.isSameOrAfter(filterDate, compareUnit);
              case 'before':
                return rowDate.isSameOrBefore(filterDate, compareUnit);
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
            const d = dayjs(value);
            const isISO =
              typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value);
            const formattedDate = isISO && d.isValid() ? d.format('DD-MM-YYYY').toLowerCase() : '';
            const formattedTime = isISO && d.isValid() ? d.format('hh:mm A').toLowerCase() : '';
            const formattedTimeNoZero =
              isISO && d.isValid() ? d.format('h:mm A').toLowerCase() : '';

            // Compare against what the user actually sees (the rendered cell text),
            // falling back to the raw value when there's no render function.
            const displayValue = getColumnDisplayText(row, column);
            const safeValue = (displayValue || value || '').toString().toLowerCase();
            const safeFilterValue = (filter.value ?? '').toString().toLowerCase();
            switch (filter.type) {
              case 'contains':
                return (
                  safeValue.includes(safeFilterValue) ||
                  formattedDate.includes(safeFilterValue) ||
                  formattedTime.includes(safeFilterValue) ||
                  formattedTimeNoZero.includes(safeFilterValue)
                );
              case 'equals':
                return (
                  safeValue === safeFilterValue ||
                  formattedDate === safeFilterValue ||
                  formattedTime === safeFilterValue ||
                  formattedTimeNoZero === safeFilterValue
                );
              case 'startsWith':
                return (
                  safeValue.startsWith(safeFilterValue) ||
                  formattedDate.startsWith(safeFilterValue) ||
                  formattedTime.startsWith(safeFilterValue) ||
                  formattedTimeNoZero.startsWith(safeFilterValue)
                );
              case 'endsWith':
                return (
                  safeValue.endsWith(safeFilterValue) ||
                  formattedDate.endsWith(safeFilterValue) ||
                  formattedTime.endsWith(safeFilterValue) ||
                  formattedTimeNoZero.endsWith(safeFilterValue)
                );
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
    [filters, columns]
  );

  const filteredData = useMemo(() => {
    if (serverSideFilter) {
      return data;
    }
    const lowerSearchTerm = searchTerm.toLowerCase();
    return data.filter((row) => {
      const searchMatch = columns.some((column) => {
        if (!columnVisibility[column.id]) return false;

        // Match against the rendered cell text first (what the user actually sees),
        // then fall back to raw-value/date-formatted matching for coverage.
        const displayText = getColumnDisplayText(row, column).toLowerCase();
        if (displayText.includes(lowerSearchTerm)) return true;

        const rawVal = _.get(row, column.id);
        if (rawVal === undefined || rawVal === null) return false;

        const rawValStr = rawVal.toString().toLowerCase();
        const d = dayjs(rawVal);
        const isISO =
          typeof rawVal === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(rawVal);
        if (isISO && d.isValid()) {
          return (
            rawValStr.includes(lowerSearchTerm) ||
            d.format('DD-MM-YYYY').toLowerCase().includes(lowerSearchTerm) ||
            d.format('hh:mm A').toLowerCase().includes(lowerSearchTerm) ||
            d.format('h:mm A').toLowerCase().includes(lowerSearchTerm)
          );
        }
        return rawValStr.includes(lowerSearchTerm);
      });

      return searchMatch && applyFilter(row);
    });
  }, [serverSideFilter, data, applyFilter, columnVisibility, columns, searchTerm]);

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

  const paginatedData = useMemo(
    () =>
      serverSidePagination
        ? sortedData
        : sortedData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [serverSidePagination, sortedData, page, rowsPerPage]
  );

  return { filteredData, sortedData, paginatedData };
};
