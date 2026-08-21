import { fDateTime } from 'src/utils/format-time';

const EMPTY_VALUE = '—';

export function formatWorkflowDateTime(value?: string | null): string {
  const formatted = fDateTime(value);
  return formatted && formatted !== 'Invalid time value' ? formatted : EMPTY_VALUE;
}
