import _ from 'lodash';
import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';

import {
  parseTableDate,
  getColumnDisplayText,
  parseFormattedNumber,
  extractTextFromReactNode,
} from '../utils';

import type { IData, IColumn, IParams } from '../types';

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
export const matchesTableRowFilters = (
  row: IData,
  filters: IParams['filters'],
  columns: IColumn[]
) => {
  const filtersByColumn = _.groupBy(filters, 'column');

  return Object.values(filtersByColumn).every((columnFilters) =>
    columnFilters.some((filter) => {
      const column = columns.find((col) => col.id === filter.column);
      const rawValue = _.get(row, filter.column, '');
      const value = column?.filterValue ? column.filterValue(rawValue, row) : rawValue;
      const isDateType = filter.valueType === 'date';
      const isDateTimeType = filter.valueType === 'dateTime';
      const isEnumType = filter.valueType === 'enum';
      const isFormattedNumber = filter.valueType === 'formattedNumber';
      const isNumber = filter.valueType === 'number';

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
      if (isFormattedNumber || isNumber) {
        // Numeric criteria compare domain numbers, independently of rendered currency,
        // percent signs or version prefixes. Missing amounts never mean zero.
        if (value === null || value === undefined || value === '') return false;
        const parse = (input: unknown) =>
          isFormattedNumber ? parseFormattedNumber(input as string) : Number(input);
        const parsedValue = parse(value);
        if (!Number.isFinite(parsedValue)) return false;
        if (filter.type === 'between') {
          const min = parse(filter.value?.min);
          const max = parse(filter.value?.max);
          return (
            Number.isFinite(min) &&
            Number.isFinite(max) &&
            min <= max &&
            parsedValue >= min &&
            parsedValue <= max
          );
        }
        const parsedFilterValue = parse(filter.value);
        if (!Number.isFinite(parsedFilterValue)) return false;

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
        const formattedTimeNoZero = isISO && d.isValid() ? d.format('h:mm A').toLowerCase() : '';

        // Compare against what the user actually sees (the rendered cell text),
        // falling back to the raw value when there's no render function.
        const displayValue = column?.filterValue
          ? extractTextFromReactNode(value)
          : getColumnDisplayText(row, column);
        const safeValue = (displayValue || (value ?? '')).toString().toLowerCase();
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
          default:
            return true;
        }
      }
    })
  );
};
