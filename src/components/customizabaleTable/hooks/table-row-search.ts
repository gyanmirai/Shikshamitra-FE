import _ from 'lodash';
import dayjs from 'dayjs';

import { getColumnDisplayText } from '../utils';

import type { IData, IColumn, IParams } from '../types';

export const matchesTableRowSearch = (
  row: IData,
  columns: IColumn[],
  columnVisibility: IParams['columnVisibility'],
  lowerSearchTerm: string
) =>
  columns.some((column) => {
    if (!columnVisibility[column.id]) return false;

    // Match against the rendered cell text first (what the user actually sees),
    // then fall back to raw-value/date-formatted matching for coverage.
    const displayText = getColumnDisplayText(row, column).toLowerCase();
    if (displayText.includes(lowerSearchTerm)) return true;

    const rawVal = _.get(row, column.id);
    if (rawVal === undefined || rawVal === null) return false;

    const rawValStr = rawVal.toString().toLowerCase();
    const d = dayjs(rawVal);
    const isISO = typeof rawVal === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(rawVal);
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
