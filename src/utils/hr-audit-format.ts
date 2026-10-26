import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import relativeTime from 'dayjs/plugin/relativeTime';

import { fDateTime } from './format-time';

dayjs.extend(relativeTime);
dayjs.extend(utc);
dayjs.extend(timezone);

const DATE_TIME_FORMAT = 'DD MMM YYYY, hh:mm A';
const DATE_ONLY_FORMAT = 'DD MMM YYYY';
const INSTITUTION_TIME_ZONE = 'Asia/Kolkata';
const ISO_DATE_TIME_PATTERN = /^\d{4}-\d{2}-\d{2}(T|\s)/;
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const COMPACT_ISO_DATE_TIME_PATTERN = /^\d{8}T\d{2}:\d{2}:\d{2}/;
const COMPACT_ISO_DATE_PATTERN = /^\d{8}$/;
const GUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const EMBEDDED_GUID_PATTERN = /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi;
const REFERENCE_KEY_PATTERN = /(^id$|id$|uuid$|guid$)/i;
const BUSINESS_DATE_KEYS = new Set(['date', 'fromDate', 'toDate', 'effectiveFrom', 'effectiveTo']);
const BUSINESS_DATE_SEPARATOR_KEY_PATTERN = /(^date$|[_-]date$)/i;
const COUNT_KEY_PATTERN = /count$/i;
const AUDIT_VALUE_SEPARATOR = '; ';
const WEEKDAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

export type HrAuditRenderValue =
  | { kind: 'empty'; text: string }
  | { kind: 'scalar'; text: string }
  | { kind: 'date'; text: string }
  | { kind: 'reference'; text: string }
  | { kind: 'countSummary'; text: string; items: Array<{ label: string; value: string }> }
  | { kind: 'object'; text: string; entries: HrAuditRenderEntry[] }
  | { kind: 'list'; text: string; items: HrAuditRenderValue[] };

export type HrAuditRenderEntry = {
  key: string;
  label: string;
  value: HrAuditRenderValue;
};

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
  const knownLabel = getKnownAuditLabel(value);
  if (knownLabel) return knownLabel;

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

export function formatHrAuditValue(value: unknown, maxLength = 120, parentKey?: string): string {
  return formatAuditValue(value, maxLength, 0, parentKey);
}

export function toHrAuditRenderValue(value: unknown, parentKey?: string): HrAuditRenderValue {
  return buildAuditRenderValue(value, 0, parentKey);
}

/** Readable, redacted cell meaning shared by display, filtering, sorting and export. */
export function getHrAuditValueText(value: unknown, field?: string): string {
  return toHrAuditRenderValue(value, field).text;
}

export function formatHrAuditText(value?: string | null, maxLength = 180): string {
  if (!value) return '-';
  const trimmed = value.trim();
  if (!trimmed) return '-';

  if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
    return formatHrAuditValue(trimmed, maxLength);
  }

  return truncate(redactEmbeddedPayloads(redactEmbeddedReferences(trimmed)), maxLength);
}

export function formatHrAuditActor(value?: string | null, fallback = 'Unknown actor'): string {
  if (!value) return fallback;

  const formatted = formatHrAuditValue(value);
  return formatted === 'Unknown reference' || formatted === 'Linked record' ? fallback : formatted;
}

function formatAuditValue(
  value: unknown,
  maxLength: number,
  depth: number,
  parentKey?: string
): string {
  if (value == null || value === '') return '-';

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed || trimmed === 'null' || trimmed === 'undefined') return '-';
    if (GUID_PATTERN.test(trimmed))
      return isReferenceKey(parentKey) ? 'Linked record' : 'Unknown reference';

    if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
      try {
        return formatAuditValue(JSON.parse(trimmed), maxLength, depth, parentKey);
      } catch {
        const parsed = tryParseTruncatedJson(trimmed);
        if (parsed) {
          return formatAuditValue(parsed, maxLength, depth, parentKey);
        }
        return truncate(redactEmbeddedReferences(trimmed), maxLength);
      }
    }

    const businessDate = parseBusinessDate(trimmed, parentKey);
    if (businessDate?.isValid()) {
      return businessDate.format(DATE_ONLY_FORMAT);
    }

    const parsedDate = parseDbDateTime(trimmed);
    if (parsedDate?.isValid()) {
      return parsedDate.format(DATE_TIME_FORMAT);
    }

    return truncate(redactEmbeddedReferences(trimmed), maxLength);
  }

  if (Array.isArray(value)) {
    if (parentKey === 'customWeeklyOffs') {
      const days = value
        .map((item) => Number(item))
        .filter((day) => Number.isInteger(day) && day >= 0 && day < WEEKDAY_NAMES.length)
        .map((day) => WEEKDAY_NAMES[day]);
      return truncate(days.join(', '), maxLength) || '-';
    }

    const visibleItems = value.slice(0, 4);
    const separator = visibleItems.some((item) => item && typeof item === 'object')
      ? AUDIT_VALUE_SEPARATOR
      : ', ';
    const rendered = visibleItems
      .map((item) => formatAuditValue(item, maxLength, depth + 1, parentKey))
      .join(separator);
    const suffix = value.length > visibleItems.length ? '...' : '';
    return truncate(`${rendered}${suffix}`, maxLength) || '-';
  }

  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>);
    if (!entries.length) return '-';
    const countSummary = summarizeCountObject(entries, maxLength);
    if (countSummary) return countSummary;

    if (depth > 1) {
      return hasDisplayableScalar(entries) ? summarizeObject(entries, maxLength, 1) : 'Changed';
    }

    return summarizeObject(entries, maxLength, depth);
  }

  return truncate(String(value), maxLength);
}

export function tryParseTruncatedJson(str: string): unknown {
  const trimmed = str.trim();
  if (!trimmed.startsWith('[') && !trimmed.startsWith('{')) {
    return null;
  }

  try {
    return JSON.parse(trimmed);
  } catch (e) {
    if (trimmed.startsWith('[')) {
      const objects: unknown[] = [];
      let depth = 0;
      let startIdx = -1;
      let insideString = false;
      let escapeNext = false;

      for (let i = 0; i < trimmed.length; i += 1) {
        const char = trimmed[i];

        if (escapeNext) {
          escapeNext = false;
          // eslint-disable-next-line no-continue
          continue;
        }

        if (char === '\\') {
          escapeNext = true;
          // eslint-disable-next-line no-continue
          continue;
        }

        if (char === '"') {
          insideString = !insideString;
          // eslint-disable-next-line no-continue
          continue;
        }

        if (!insideString) {
          if (char === '{') {
            if (depth === 0) {
              startIdx = i;
            }
            depth += 1;
          } else if (char === '}') {
            depth -= 1;
            if (depth === 0 && startIdx !== -1) {
              const objStr = trimmed.slice(startIdx, i + 1);
              try {
                objects.push(JSON.parse(objStr));
              } catch {
                // Ignore invalid JSON chunks
              }
              startIdx = -1;
            }
          }
        }
      }

      if (objects.length > 0) {
        return objects;
      }
    }
  }
  return null;
}

function buildAuditRenderValue(
  value: unknown,
  depth: number,
  parentKey?: string
): HrAuditRenderValue {
  if (value == null || value === '') return { kind: 'empty', text: '-' };

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed || trimmed === 'null' || trimmed === 'undefined') {
      return { kind: 'empty', text: '-' };
    }

    if (GUID_PATTERN.test(trimmed)) {
      return {
        kind: 'reference',
        text: isReferenceKey(parentKey) ? 'Linked record' : 'Unknown reference',
      };
    }

    if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
      try {
        return buildAuditRenderValue(JSON.parse(trimmed), depth, parentKey);
      } catch {
        const parsed = tryParseTruncatedJson(trimmed);
        if (parsed) {
          return buildAuditRenderValue(parsed, depth, parentKey);
        }
        return { kind: 'scalar', text: redactEmbeddedReferences(trimmed) };
      }
    }

    const businessDate = parseBusinessDate(trimmed, parentKey);
    if (businessDate?.isValid()) {
      return { kind: 'date', text: businessDate.format(DATE_ONLY_FORMAT) };
    }

    const parsedDate = parseDbDateTime(trimmed);
    if (parsedDate?.isValid()) {
      return { kind: 'date', text: parsedDate.format(DATE_TIME_FORMAT) };
    }

    return { kind: 'scalar', text: redactEmbeddedReferences(trimmed) };
  }

  if (Array.isArray(value)) {
    if (!value.length) return { kind: 'empty', text: '-' };

    const items =
      parentKey === 'customWeeklyOffs'
        ? value
            .map((item) => Number(item))
            .filter((day) => Number.isInteger(day) && day >= 0 && day < WEEKDAY_NAMES.length)
            .map((day) => ({ kind: 'scalar', text: WEEKDAY_NAMES[day] }) as HrAuditRenderValue)
        : value.map((item) => buildAuditRenderValue(item, depth + 1, parentKey));
    return { kind: 'list', text: renderAuditValueText({ kind: 'list', text: '', items }), items };
  }

  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>);
    if (!entries.length) return { kind: 'empty', text: '-' };

    const countSummary = buildCountSummary(entries);
    if (countSummary) return countSummary;

    const renderEntries = entries.map(([key, item]) => ({
      key,
      label: toHrAuditLabel(key),
      value: buildAuditRenderValue(item, depth + 1, key),
    }));

    return {
      kind: 'object',
      text: renderAuditValueText({ kind: 'object', text: '', entries: renderEntries }),
      entries: renderEntries,
    };
  }

  return { kind: 'scalar', text: redactEmbeddedReferences(String(value)) };
}

function isDbDateTime(value: string) {
  return ISO_DATE_TIME_PATTERN.test(value) || COMPACT_ISO_DATE_TIME_PATTERN.test(value);
}

function isBusinessDateKey(key?: string) {
  return Boolean(
    key &&
    (BUSINESS_DATE_KEYS.has(key) ||
      key.endsWith('Date') ||
      BUSINESS_DATE_SEPARATOR_KEY_PATTERN.test(key))
  );
}

function isBusinessDateValue(value: string) {
  return (
    ISO_DATE_PATTERN.test(value) ||
    ISO_DATE_TIME_PATTERN.test(value) ||
    COMPACT_ISO_DATE_PATTERN.test(value) ||
    COMPACT_ISO_DATE_TIME_PATTERN.test(value)
  );
}

function parseBusinessDate(value: string, parentKey?: string) {
  if (!isBusinessDateKey(parentKey) || !isBusinessDateValue(value)) return null;

  const normalized = normalizeDbDateTime(value);
  const datePart = normalized.slice(0, 10);
  return ISO_DATE_PATTERN.test(datePart) ? dayjs(datePart) : null;
}

function parseDbDateTime(value: string) {
  if (!isDbDateTime(value)) return null;
  return dayjs.utc(normalizeDbDateTime(value)).tz(INSTITUTION_TIME_ZONE);
}

function normalizeDbDateTime(value: string) {
  return value.replace(
    /^(\d{4})(\d{2})(\d{2})(T|$)/,
    (_match, year, month, day, separator) => `${year}-${month}-${day}${separator}`
  );
}

function summarizeObject(entries: Array<[string, unknown]>, maxLength: number, depth = 0) {
  const visibleEntries = entries
    .filter(([, item]) => depth === 0 || isDisplayableNestedValue(item))
    .slice(0, depth === 0 ? 4 : 3);

  if (!visibleEntries.length) return 'Changed';

  const rendered = visibleEntries
    .map(
      ([key, item]) =>
        `${toHrAuditLabel(key)}: ${formatAuditValue(item, maxLength, depth + 1, key)}`
    )
    .join(AUDIT_VALUE_SEPARATOR);
  const suffix = entries.length > visibleEntries.length ? '...' : '';
  return truncate(`${rendered}${suffix}`, maxLength) || '-';
}

function summarizeCountObject(entries: Array<[string, unknown]>, maxLength: number) {
  if (
    !entries.length ||
    !entries.every(([key, value]) => COUNT_KEY_PATTERN.test(key) && isNumericValue(value))
  ) {
    return null;
  }

  const rendered = entries
    .slice(0, 6)
    .map(([key, value]) => `${toCountLabel(key)}: ${value}`)
    .join(AUDIT_VALUE_SEPARATOR);
  const suffix = entries.length > 6 ? '...' : '';
  return truncate(`${rendered}${suffix}`, maxLength) || null;
}

function buildCountSummary(entries: Array<[string, unknown]>): HrAuditRenderValue | null {
  if (
    !entries.length ||
    !entries.every(([key, value]) => COUNT_KEY_PATTERN.test(key) && isNumericValue(value))
  ) {
    return null;
  }

  const items = entries.map(([key, value]) => ({
    label: toCountLabel(key),
    value: String(value),
  }));

  return {
    kind: 'countSummary',
    items,
    text: items.map((item) => `${item.label}: ${item.value}`).join(AUDIT_VALUE_SEPARATOR),
  };
}

function renderAuditValueText(value: HrAuditRenderValue): string {
  if (
    value.kind === 'empty' ||
    value.kind === 'scalar' ||
    value.kind === 'date' ||
    value.kind === 'reference'
  ) {
    return value.text;
  }

  if (value.kind === 'countSummary') {
    return value.items.map((item) => `${item.label}: ${item.value}`).join(AUDIT_VALUE_SEPARATOR);
  }

  if (value.kind === 'list') {
    const separator = value.items.some((item) => item.kind === 'object')
      ? AUDIT_VALUE_SEPARATOR
      : ', ';
    return value.items.map(renderAuditValueText).join(separator) || '-';
  }

  return (
    value.entries
      .filter((entry) => entry.value.kind !== 'empty')
      .map((entry) => `${entry.label}: ${renderAuditValueText(entry.value)}`)
      .join(AUDIT_VALUE_SEPARATOR) || '-'
  );
}

function hasDisplayableScalar(entries: Array<[string, unknown]>) {
  return entries.some(([, item]) => isDisplayableNestedValue(item));
}

function isDisplayableNestedValue(value: unknown) {
  return value == null || typeof value !== 'object' || Array.isArray(value);
}

function isNumericValue(value: unknown) {
  return (
    typeof value === 'number' ||
    (typeof value === 'string' && value.trim() !== '' && !Number.isNaN(Number(value)))
  );
}

function isReferenceKey(key?: string) {
  return Boolean(key && REFERENCE_KEY_PATTERN.test(key));
}

function toCountLabel(key: string) {
  return toHrAuditLabel(key.replace(COUNT_KEY_PATTERN, ''));
}

function getKnownAuditLabel(value: string) {
  const normalized = value.trim();
  const labels: Record<string, string> = {
    holidaySummary: 'Holiday Summary',
    sourcePolicyId: 'Source Policy ID',
    workCalendarPolicyId: 'Work Calendar Policy ID',
    academicYearId: 'Academic Year ID',
    customWeeklyOffs: 'Custom Weekly Offs',
    effectiveFrom: 'Effective From',
    effectiveTo: 'Effective To',
  };

  return labels[normalized] || null;
}

function redactEmbeddedReferences(value: string) {
  return value.replace(EMBEDDED_GUID_PATTERN, 'Linked record');
}

function redactEmbeddedPayloads(value: string) {
  return value.replace(/(\[[^\]]*\]|\{[^{}]*\})/g, (match) => {
    const formatted = formatHrAuditValue(match, 80);
    return formatted.includes('{') || formatted.includes('[') ? 'Changed' : formatted;
  });
}

function truncate(value: string, maxLength: number) {
  return value.length > maxLength ? `${value.slice(0, maxLength)}...` : value;
}
