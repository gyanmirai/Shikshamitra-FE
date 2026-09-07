export type AcademicAuditContextValue = string | number | boolean | null;

export type AcademicAuditContextEntry = {
  key: string;
  label: string;
  value: string;
};

const GUID_PATTERN =
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

const FRIENDLY_LABELS: Record<string, string> = {
  educationMediumId: 'Education Medium',
  educationMediumName: 'Education Medium',
  displayName: 'Display Name',
  oldValueJson: 'Old Value',
  newValueJson: 'New Value',
};

export const isGuid = (value: unknown): value is string =>
  typeof value === 'string' && GUID_PATTERN.test(value);

export const shortenGuid = (value: string): string => `${value.slice(0, 8)}…${value.slice(-4)}`;

const formatLabel = (key: string): string => {
  if (FRIENDLY_LABELS[key]) return FRIENDLY_LABELS[key];

  return key
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/Id$/, '')
    .replace(/^./, (character) => character.toUpperCase())
    .trim();
};

const formatValue = (value: unknown): string => {
  if (value === null || value === undefined || value === '') return '-';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (isGuid(value)) return '-';
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) {
    const date = dayjs(value);
    if (date.isValid()) return date.format('DD-MM-YYYY, hh:mm A');
  }
  if (Array.isArray(value)) return value.map((item) => formatValue(item)).join(', ');
  if (typeof value === 'object') return '-';
  return String(value);
};

const flattenContext = (value: unknown, prefix = ''): Array<[string, unknown]> => {
  if (Array.isArray(value)) return [[prefix, value]];
  if (typeof value !== 'object' || value === null) return [[prefix, value]];

  return Object.entries(value).flatMap(([key, child]) => {
    const nextKey = prefix ? `${prefix}.${key}` : key;
    return typeof child === 'object' && child !== null && !Array.isArray(child)
      ? flattenContext(child, nextKey)
      : [[nextKey, child]];
  });
};

const parseNestedJson = (value: unknown): unknown => {
  if (typeof value === 'string') {
    try {
      return parseNestedJson(JSON.parse(value));
    } catch {
      return value;
    }
  }
  if (Array.isArray(value)) return value.map(parseNestedJson);
  if (typeof value !== 'object' || value === null) return value;

  return Object.fromEntries(
    Object.entries(value).map(([key, child]) => [key, parseNestedJson(child)])
  );
};

const hasReadableEducationMediumName = (entries: Array<[string, unknown]>): boolean =>
  entries.some(
    ([key, value]) =>
      /educationMediumName$/i.test(key) && typeof value === 'string' && value.trim().length > 0
  );

export const parseAcademicAuditContext = (
  contextJson?: string | null
): AcademicAuditContextEntry[] => {
  if (!contextJson?.trim()) return [];

  try {
    const parsed: unknown = parseNestedJson(JSON.parse(contextJson));
    // Calendar audit snapshots include the complete before/after entity JSON. Those values
    // belong in Changed Fields; only request metadata belongs in this technical section.
    const context =
      typeof parsed === 'object' && parsed !== null && 'metadata' in parsed
        ? (parsed as { metadata: unknown }).metadata
        : parsed;
    const allEntries = flattenContext(context).filter(([key, value]) =>
      Boolean(key) && !/(^|\.)(tenant|id|.*id|concurrencystamp)$/i.test(key) && !isGuid(value)
    );
    const entries = hasReadableEducationMediumName(allEntries)
      ? allEntries.filter(([key]) => !/educationMediumId$/i.test(key))
      : allEntries;

    return entries.map(([key, value]) => ({
      key,
      label: formatLabel(key.split('.').at(-1) ?? key),
      value: formatValue(value),
    })).filter((entry) => entry.value !== '-');
  } catch {
    return [];
  }
};
import dayjs from 'dayjs';
