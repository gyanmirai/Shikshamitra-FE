import { fDateTime } from 'src/utils/format-time';

const EMPTY_VALUE = '—';

export function formatWorkflowDateTime(value?: string | null): string {
  const normalized = value && !/(?:Z|[+-]\d{2}:\d{2})$/i.test(value) ? `${value}Z` : value;
  const formatted = fDateTime(normalized);
  return formatted && formatted !== 'Invalid time value' ? formatted : EMPTY_VALUE;
}
