import type { Dayjs } from 'dayjs';

import dayjs from 'dayjs';

type DateOnlyInput = string | Date | Dayjs | null | undefined;

const ISO_DATE_PART = /^(\d{4}-\d{2}-\d{2})/;

export function toDateOnly(value?: DateOnlyInput): string {
  if (!value) return '';

  if (typeof value === 'string') {
    const datePart = value.match(ISO_DATE_PART)?.[1];
    if (datePart) return datePart;
  }

  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.format('YYYY-MM-DD') : '';
}

export function parseDateOnly(value?: DateOnlyInput): Dayjs | null {
  const date = toDateOnly(value);
  if (!date) return null;
  const parsed = dayjs(date);
  return parsed.isValid() ? parsed : null;
}

export function formatDateOnly(value?: DateOnlyInput, format = 'DD-MM-YYYY'): string {
  const parsed = parseDateOnly(value);
  return parsed ? parsed.format(format) : '-';
}
