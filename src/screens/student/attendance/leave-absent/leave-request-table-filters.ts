import type { IParams } from 'src/components/customizabaleTable/types';

type TableFilters = IParams['filters'];

export function parseLeaveTableFilters(saved: string | null): TableFilters {
  if (!saved) return [];
  try {
    const parsed: unknown = JSON.parse(saved);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((filter): filter is TableFilters[number] =>
      typeof filter?.column === 'string' && typeof filter?.type === 'string'
    );
  } catch {
    return [];
  }
}

export function serializeLeaveTableFiltersForApi(filters: TableFilters): string | undefined {
  if (!filters.length) return undefined;
  return JSON.stringify(filters.map(({ column, type, value }) => {
    const isDate = column === 'formattedLeaveDate' || column === 'formattedEndDate';
    const parts = isDate && typeof value === 'string'
      ? value.match(/^(\d{2})-(\d{2})-(\d{4})$/)
      : null;
    const start = parts ? new Date(Number(parts[3]), Number(parts[2]) - 1, Number(parts[1])) : null;
    const end = parts ? new Date(Number(parts[3]), Number(parts[2]) - 1, Number(parts[1]) + 1) : null;
    return {
      column,
      type,
      value: typeof value === 'object' && value !== null ? undefined : String(value),
      min: start ? start.toISOString() : typeof value === 'object' && value !== null ? String(value.min) : undefined,
      max: end ? end.toISOString() : typeof value === 'object' && value !== null ? String(value.max) : undefined,
    };
  }));
}
