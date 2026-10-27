import type { IParams } from 'src/components/customizabaleTable/types';

const labels: Record<string, string> = {
  applicationNumber: 'Application number',
  className: 'Class',
  sessionName: 'Session',
  attendance: 'Attendance',
  result: 'Result',
};
const attendance: Record<string, string> = {
  pending: 'Pending',
  present: 'Present',
  absent: 'Absent',
};
const results: Record<string, string> = { passed: 'Pass', failed: 'Failed', waived: 'Waived' };

export function readAssessmentColumnFilters(raw: string): IParams['filters'] {
  if (!raw || raw.length > 12000) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length > 20) return [];
    return parsed.flatMap((filter) => {
      if (
        !filter ||
        typeof filter !== 'object' ||
        !Object.hasOwn(labels, filter.column) ||
        typeof filter.value !== 'string'
      )
        return [];
      const options =
        filter.column === 'attendance'
          ? attendance
          : filter.column === 'result'
            ? results
            : undefined;
      if (
        options
          ? filter.type !== 'equals' ||
            filter.valueType !== 'enum' ||
            !Object.hasOwn(options, filter.value)
          : filter.valueType !== 'string' ||
            !['contains', 'equals', 'startsWith', 'endsWith'].includes(filter.type) ||
            !filter.value.trim() ||
            filter.value.length > 128
      )
        return [];
      return [
        {
          column: filter.column,
          type: filter.type,
          value: filter.value,
          valueType: filter.valueType,
          label: labels[filter.column],
          ...(options ? { displayValue: options[filter.value] } : {}),
        },
      ];
    });
  } catch {
    return [];
  }
}

export function serializeAssessmentColumnFilters(filters: IParams['filters']): string | undefined {
  const criteria = filters
    .filter(({ column }) => Object.hasOwn(labels, column))
    .map(({ column, type, value, valueType }) => ({ column, type, value, valueType }));
  return criteria.length ? JSON.stringify(criteria) : undefined;
}
