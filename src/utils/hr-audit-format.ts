import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import relativeTime from 'dayjs/plugin/relativeTime';

import { fDateTime } from './format-time';

dayjs.extend(relativeTime);
dayjs.extend(utc);

const DATE_TIME_FORMAT = 'DD MMM YYYY, hh:mm A';
const ISO_DATE_TIME_PATTERN = /^\d{4}-\d{2}-\d{2}(T|\s)/;
const COMPACT_ISO_DATE_TIME_PATTERN = /^\d{8}T\d{2}:\d{2}:\d{2}/;
const GUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function formatHrAuditDateTime(value?: string | null, displayValue?: string | null) {
  if (displayValue) return displayValue;
  if (!value) return '-';

  const parsedDate = parseDbDateTime(value);
  if (parsedDate?.isValid()) return parsedDate.format(DATE_TIME_FORMAT);

  const fallback = fDateTime(value, DATE_TIME_FORMAT);
  return fallback && fallback !== 'Invalid time value' ? fallback : '-';
}

export function formatHrAuditRelativeTime(value?: string | null) {
  if (!value) return '-';

  const parsedDate = parseDbDateTime(value);
  if (parsedDate?.isValid()) return parsedDate.fromNow();

  const fallback = dayjs(value);
  return fallback.isValid() ? fallback.fromNow() : '-';
}

export function toHrAuditLabel(value?: string | null) {
  if (!value) return '-';
  return value
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .replace(/_/g, ' ')
    .replace(/-/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w+\b/g, (word) => {
      const upper = word.toUpperCase();
      if (['ID', 'IP', 'URL', 'GR', 'API', 'JSON', 'UTC'].includes(upper)) return upper;
      return `${word.charAt(0).toUpperCase()}${word.slice(1).toLowerCase()}`;
    });
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
  return formatAuditValue(value, maxLength, 0);
}

function formatAuditValue(value: unknown, maxLength: number, depth: number): string {
  if (value == null || value === '') return '-';

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed || trimmed === 'null' || trimmed === 'undefined') return '-';
    if (GUID_PATTERN.test(trimmed)) return 'Unknown reference';

    if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
      try {
        return formatAuditValue(JSON.parse(trimmed), maxLength, depth);
      } catch {
        return truncate(trimmed, maxLength);
      }
    }

    const parsedDate = parseDbDateTime(trimmed);
    if (parsedDate?.isValid()) {
      return parsedDate.format(DATE_TIME_FORMAT);
    }

    return truncate(trimmed, maxLength);
  }

  if (Array.isArray(value)) {
    const visibleItems = value.slice(0, 4);
    const rendered = visibleItems
      .map((item) => formatAuditValue(item, maxLength, depth + 1))
      .join(', ');
    const suffix = value.length > visibleItems.length ? '...' : '';
    return truncate(`${rendered}${suffix}`, maxLength) || '-';
  }

  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>);
    if (!entries.length) return '-';
    if (depth > 1) {
      return hasDisplayableScalar(entries) ? summarizeObject(entries, maxLength, 1) : 'Changed';
    }

    return summarizeObject(entries, maxLength, depth);
  }

  return truncate(String(value), maxLength);
}

function isDbDateTime(value: string) {
  return ISO_DATE_TIME_PATTERN.test(value) || COMPACT_ISO_DATE_TIME_PATTERN.test(value);
}

function parseDbDateTime(value: string) {
  if (!isDbDateTime(value)) return null;
  return dayjs.utc(normalizeDbDateTime(value));
}

function normalizeDbDateTime(value: string) {
  return value.replace(
    /^(\d{4})(\d{2})(\d{2})T/,
    (_match, year, month, day) => `${year}-${month}-${day}T`
  );
}

function summarizeObject(entries: Array<[string, unknown]>, maxLength: number, depth = 0) {
  const visibleEntries = entries
    .filter(([, item]) => depth === 0 || isDisplayableNestedValue(item))
    .slice(0, depth === 0 ? 4 : 3);

  if (!visibleEntries.length) return 'Changed';

  const rendered = visibleEntries
    .map(([key, item]) => `${toHrAuditLabel(key)}: ${formatAuditValue(item, maxLength, depth + 1)}`)
    .join(', ');
  const suffix = entries.length > visibleEntries.length ? '...' : '';
  return truncate(`${rendered}${suffix}`, maxLength) || '-';
}

function hasDisplayableScalar(entries: Array<[string, unknown]>) {
  return entries.some(([, item]) => isDisplayableNestedValue(item));
}

function isDisplayableNestedValue(value: unknown) {
  return value == null || typeof value !== 'object' || Array.isArray(value);
}

function truncate(value: string, maxLength: number) {
  return value.length > maxLength ? `${value.slice(0, maxLength)}...` : value;
}
