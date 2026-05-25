import dayjs from 'dayjs';

import { fDateTime } from './format-time';

const DATE_TIME_FORMAT = 'DD MMM YYYY, hh:mm A';
const ISO_DATE_TIME_PATTERN = /^\d{4}-\d{2}-\d{2}(T|\s)/;

export function formatHrAuditDateTime(value?: string | null, displayValue?: string | null) {
  return displayValue || fDateTime(value, DATE_TIME_FORMAT) || '-';
}

export function toHrAuditLabel(value?: string | null) {
  if (!value) return '-';
  return value
    .replace(/_/g, ' ')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (match) => match.toUpperCase());
}

export function parseHrAuditContext(contextJson?: string | null): Record<string, unknown> | null {
  if (!contextJson) return null;
  try {
    const parsed = JSON.parse(contextJson);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}

export function formatHrAuditValue(value: unknown, maxLength = 120): string {
  if (value == null || value === '') return '-';

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed || trimmed === 'null' || trimmed === 'undefined') return '-';

    if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
      try {
        return formatHrAuditValue(JSON.parse(trimmed), maxLength);
      } catch {
        return truncate(trimmed, maxLength);
      }
    }

    const parsedDate = dayjs(trimmed);
    if (parsedDate.isValid() && ISO_DATE_TIME_PATTERN.test(trimmed)) {
      return parsedDate.format(DATE_TIME_FORMAT);
    }

    return truncate(trimmed, maxLength);
  }

  if (Array.isArray(value)) {
    const rendered = value.map((item) => formatHrAuditValue(item, maxLength)).join(', ');
    return truncate(rendered, maxLength) || '-';
  }

  if (typeof value === 'object') {
    try {
      return truncate(JSON.stringify(value), maxLength);
    } catch {
      return '-';
    }
  }

  return truncate(String(value), maxLength);
}

function truncate(value: string, maxLength: number) {
  return value.length > maxLength ? `${value.slice(0, maxLength)}...` : value;
}
