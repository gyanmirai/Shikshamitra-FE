import type { Dayjs } from 'dayjs';

import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

/** Preserve picker objects, including incomplete edits, instead of cloning invalid values. */
export const parseCollectionPaymentDate = (value: unknown): Dayjs | null => {
  if (value === null || value === undefined || value === '') return null;
  if (dayjs.isDayjs(value)) return value;
  if (typeof value !== 'string') return dayjs('');
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) return dayjs(value, 'DD/MM/YYYY', true);
  const civilDate = value.match(/^(\d{4}-\d{2}-\d{2})(?:$|T)/)?.[1];
  if (!civilDate || !dayjs(civilDate, 'YYYY-MM-DD', true).isValid()) return dayjs('');
  return dayjs(value);
};

export const getCollectionPaymentDateError = (
  value: unknown,
  label: string,
  required = true,
  today = dayjs().startOf('day')
): string | undefined => {
  const date = parseCollectionPaymentDate(value);
  if (!date) return required ? `${label} is required` : undefined;
  if (!date.isValid()) return `Enter a complete, valid ${label.toLowerCase()} in DD/MM/YYYY format`;
  if (date.isBefore(today, 'day')) return `${label} cannot be before ${today.format('DD/MM/YYYY')}`;
  return undefined;
};
