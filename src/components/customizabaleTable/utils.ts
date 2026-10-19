import type { Dayjs } from 'dayjs';

import _ from 'lodash';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

import type { IData, IColumn } from './types';

dayjs.extend(customParseFormat);

export const parseFormattedNumber = (val: string | number | null | Dayjs): number => {
  if (typeof val === 'number') return val;
  if (!val) return 0;
  if (val instanceof Object) return parseFloat(val.format('DD'));

  // Remove $ symbol, commas, spaces, and then parse to float
  return parseFloat((val as string).replace(/[^0-9.-]+/g, ''));
};

const DATE_TIME_FORMATS = [
  'YYYY-MM-DDTHH:mm:ssZ',
  'YYYY-MM-DDTHH:mm:ss.SSSZ',
  'YYYY-MM-DDTHH:mm:ss',
  'YYYY-MM-DDTHH:mm',
  'YYYY-MM-DD HH:mm:ss',
  'YYYY-MM-DD HH:mm',
  'YYYY/MM/DD HH:mm:ss',
  'YYYY/MM/DD HH:mm',
  'DD-MM-YYYY HH:mm:ss',
  'DD-MM-YYYY HH:mm',
  'DD/MM/YYYY HH:mm:ss',
  'DD/MM/YYYY HH:mm',
  'DD-MM-YYYY hh:mm A',
  'DD/MM/YYYY hh:mm A',
  'YYYY-MM-DD hh:mm A',
  'YYYY/MM/DD hh:mm A',
  'YYYY-MM-DD [at] hh:mm A',
  'DD-MM-YYYY [at] hh:mm A',
  'DD/MM/YYYY [at] hh:mm A',
  'DD MMM YYYY h:mm a',
  'DD MMM YYYY hh:mm A',
];

const DATE_FORMATS = ['YYYY-MM-DD', 'YYYY/MM/DD', 'DD-MM-YYYY', 'DD/MM/YYYY', 'DD MMM YYYY'];

export const parseTableDate = (value: unknown): Dayjs | null => {
  if (value === null || value === undefined || value === '') return null;

  if (dayjs.isDayjs(value)) {
    return value.isValid() ? value : null;
  }

  if (value instanceof Date) {
    const parsedDate = dayjs(value);
    return parsedDate.isValid() ? parsedDate : null;
  }

  if (typeof value === 'number') {
    const parsedDate = dayjs(value);
    return parsedDate.isValid() ? parsedDate : null;
  }

  const stringValue = String(value).trim();
  if (!stringValue) return null;

  if (/^\d{10}$|^\d{13}$/.test(stringValue)) {
    const parsedTimestamp = dayjs(
      Number(stringValue.length === 10 ? `${stringValue}000` : stringValue)
    );
    if (parsedTimestamp.isValid()) return parsedTimestamp;
  }

  const parsedFormatted = dayjs(stringValue, [...DATE_TIME_FORMATS, ...DATE_FORMATS], true);
  if (parsedFormatted.isValid()) return parsedFormatted;

  const parsedNative = dayjs(stringValue);
  return parsedNative.isValid() ? parsedNative : null;
};

export function extractTextFromReactNode(node: any): string {
  if (node === null || node === undefined) {
    return '';
  }

  // Handle primitives
  if (typeof node === 'string' || typeof node === 'number' || typeof node === 'boolean') {
    return String(node).trim();
  }

  // Handle arrays of nodes
  if (Array.isArray(node)) {
    return node
      .map(extractTextFromReactNode)
      .filter((str) => str !== '')
      .join(' ')
      .trim();
  }

  // Handle React elements
  if (typeof node === 'object') {
    // If it has children, recurse into children
    if (node.props && node.props.children !== undefined) {
      return extractTextFromReactNode(node.props.children);
    }

    // Check for common label/value/text props if children are not present
    if (node.props) {
      if (typeof node.props.label === 'string' || typeof node.props.label === 'number') {
        return String(node.props.label).trim();
      }
      if (typeof node.props.value === 'string' || typeof node.props.value === 'number') {
        return String(node.props.value).trim();
      }
      if (typeof node.props.text === 'string' || typeof node.props.text === 'number') {
        return String(node.props.text).trim();
      }
    }

    // Check if it's a Date object
    if (node instanceof Date) {
      return node.toString();
    }
  }

  return '';
}

/**
 * Resolves the text a user actually sees for a column/row pair.
 * Falls back to the raw value when the column has no render function
 * or when rendering throws, so filtering/search always has something to match against.
 */
export function getColumnDisplayText(row: IData, column: IColumn | undefined): string {
  const rawValue = column ? _.get(row, column.id) : undefined;

  if (column?.render) {
    try {
      const rendered = column.render(rawValue, row);
      const text = extractTextFromReactNode(rendered);
      if (text !== '') return text;
    } catch {
      // fall through to raw value below
    }
  }

  if (rawValue === null || rawValue === undefined) return '';
  return String(rawValue);
}

export const getExportableColumns = (
  columns: readonly IColumn[],
  columnVisibility: Record<string, boolean>
): IColumn[] =>
  columns.filter((column) => {
    const normalizedId = column.id?.toLowerCase();
    const normalizedLabel =
      typeof column.label === 'string' ? column.label.toLowerCase() : undefined;
    const isActionColumn =
      normalizedId === 'action' ||
      normalizedId === 'actions' ||
      normalizedId === 'select' ||
      normalizedId === 'checkbox' ||
      normalizedLabel === 'action' ||
      normalizedLabel === 'actions';

    return (
      Boolean(columnVisibility[column.id]) &&
      (column.excludeFromExport === false || !isActionColumn) &&
      !column.excludeFromExport
    );
  });
