import type { IParams } from 'src/components/customizabaleTable/types';

import { assessmentStatusLabels, assessmentAttendanceLabels } from './assessment-roster-status';

const labels: Record<string, string> = {
  applicationNumber: 'Application number',
  className: 'Class',
  sessionName: 'Session',
  attendance: 'Attendance',
  status: 'Status',
};
const attendance: Record<string, string> = assessmentAttendanceLabels;
const statuses: Record<string, string> = Object.fromEntries(
  Object.entries(assessmentStatusLabels).filter(([key]) => key !== 'unavailable')
);

export function readAssessmentColumnFilters(raw: string): IParams['filters'] {
  if (!raw || raw.length > 12000) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length > 20) return [];
    return parsed.flatMap((filter) => {
      if (!filter || typeof filter !== 'object' || typeof filter.value !== 'string') return [];
      const column = filter.column === 'result' ? 'status' : filter.column;
      if (!Object.hasOwn(labels, column)) return [];
      const options =
        column === 'attendance' ? attendance : column === 'status' ? statuses : undefined;
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
          column,
          type: filter.type,
          value: filter.value,
          valueType: filter.valueType,
          label: labels[column],
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
