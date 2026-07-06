import dayjs from 'dayjs';

import type { AuditLogDiff, AuditDiffChangeType } from '../types/auditLogs.types';

/** Pretty-print a raw JSON value for display. */
const pretty = (raw: unknown): string => {
  if (raw === null || raw === undefined) return '';
  if (typeof raw === 'string') {
    // try date
    if (/^\d{4}-\d{2}-\d{2}/.test(raw)) {
      const d = dayjs(raw);
      if (d.isValid()) return d.format('DD MMM YYYY');
    }
    return raw;
  }
  if (typeof raw === 'boolean') return raw ? 'Yes' : 'No';
  if (typeof raw === 'number') return String(raw);
  try {
    return JSON.stringify(raw, null, 2);
  } catch {
    return String(raw);
  }
};

/** Map a raw value to a display-friendly label, plus inferred data type. */
const describeValue = (raw: unknown) => {
  if (typeof raw === 'boolean')
    return { display: raw ? 'Yes' : 'No', dataType: 'boolean' as const };
  if (typeof raw === 'number') return { display: String(raw), dataType: 'number' as const };
  if (typeof raw === 'string' && /^\d{4}-\d{2}-\d{2}/.test(raw)) {
    const d = dayjs(raw);
    return d.isValid()
      ? { display: d.format('DD MMM YYYY'), dataType: 'date' as const }
      : { display: raw, dataType: 'string' as const };
  }
  return { display: pretty(raw), dataType: 'string' as const };
};

/** Humanize a camelCase / snake_case key into a readable label. */
const humanizeKey = (key: string): string =>
  key
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]/g, ' ')
    .replace(/^\w/, (c) => c.toUpperCase());

/**
 * Build a structured diff between two raw JSON payloads.
 * Handles create (only new), update (both), and delete (only old).
 */
export const buildDiff = (
  oldRaw: Record<string, unknown> | null,
  newRaw: Record<string, unknown> | null,
  keyLabels?: Record<string, string>
): AuditLogDiff[] => {
  const keys = Array.from(
    new Set([...Object.keys(oldRaw || {}), ...Object.keys(newRaw || {})])
  ).sort();

  return keys.map((key, i) => {
    const oldVal = oldRaw?.[key];
    const newVal = newRaw?.[key];

    const oldDesc = describeValue(oldVal);
    const newDesc = describeValue(newVal);

    let changeType: AuditDiffChangeType;
    if (oldVal === undefined || oldVal === null) changeType = 'added';
    else if (newVal === undefined || newVal === null) changeType = 'removed';
    else if (oldDesc.display !== newDesc.display) changeType = 'updated';
    else changeType = 'unchanged';

    return {
      fieldName: key,
      displayName: keyLabels?.[key] ?? humanizeKey(key),
      oldValue: changeType === 'added' ? null : oldDesc.display,
      newValue: changeType === 'removed' ? null : newDesc.display,
      changeType,
      dataType: newDesc.dataType || oldDesc.dataType,
      sortOrder: i,
    };
  });
};

/** Shorthand to know whether any real change exists. */
export const hasRealChanges = (diff: AuditLogDiff[] | undefined) =>
  !!diff?.some((d) => d.changeType !== 'unchanged');

/** Group diffs by change type for summary chips. */
export const summarizeDiff = (diff: AuditLogDiff[] = []) => {
  const counts = { added: 0, updated: 0, removed: 0, unchanged: 0 };
  diff.forEach((d) => {
    counts[d.changeType] += 1;
  });
  return counts;
};
