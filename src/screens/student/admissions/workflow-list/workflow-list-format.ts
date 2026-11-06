import { fDate, fDateTime } from 'src/utils/format-time';

import { ADMISSION_DATE_FORMAT, ADMISSION_DATE_TIME_FORMAT } from '../admission-date-formats';

const EMPTY_VALUE = '—';

const normalizeDateTime = (value?: string | null) =>
  value && !/(?:Z|[+-]\d{2}:\d{2})$/i.test(value) ? `${value}Z` : value;

export function formatWorkflowDateTime(value?: string | null): string {
  const formatted = fDateTime(normalizeDateTime(value), ADMISSION_DATE_TIME_FORMAT);
  return formatted && formatted !== 'Invalid time value' ? formatted : EMPTY_VALUE;
}

export function formatWorkflowListDate(value?: string | null): string {
  const formatted = fDate(normalizeDateTime(value), ADMISSION_DATE_FORMAT);
  return formatted && formatted !== 'Invalid time value' ? formatted : EMPTY_VALUE;
}
