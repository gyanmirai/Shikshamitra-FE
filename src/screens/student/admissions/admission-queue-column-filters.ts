import type { IParams } from 'src/components/customizabaleTable/types';

type Queue = 'pipeline' | 'applications';
const labels: Record<string, string> = {
  applicantName: 'Student name',
  applicationNumber: 'Application',
  inquiryNumber: 'Inquiry',
  standardName: 'Class',
  contactPhone: 'Phone',
  contactEmail: 'Email',
  decisionEnteredAt: 'Decision phase entered',
  lastSavedAt: 'Last saved',
};
const textColumns = {
  pipeline: [
    'applicantName',
    'applicationNumber',
    'inquiryNumber',
    'standardName',
    'contactPhone',
    'contactEmail',
  ],
  applications: ['standardName'],
};
const dateParts = (value: unknown) => {
  if (typeof value !== 'string') return undefined;
  const dmy = /^(\d{2})-(\d{2})-(\d{4})$/.exec(value);
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!dmy && !iso) return undefined;
  const [year, month, day] = dmy
    ? [Number(dmy[3]), Number(dmy[2]), Number(dmy[1])]
    : [Number(iso![1]), Number(iso![2]), Number(iso![3])];
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day
    ? { year, month, day }
    : undefined;
};
const valid = (filter: IParams['filters'][number], queue: Queue) => {
  if (!filter || typeof filter !== 'object') return false;
  if (textColumns[queue].includes(filter.column))
    return (
      filter.valueType === 'string' &&
      ['contains', 'equals', 'startsWith', 'endsWith'].includes(filter.type) &&
      typeof filter.value === 'string' &&
      filter.value.trim().length > 0 &&
      filter.value.length <= 250
    );
  return (
    queue === 'applications' &&
    ['decisionEnteredAt', 'lastSavedAt'].includes(filter.column) &&
    filter.valueType === 'date' &&
    ['equals', 'before', 'after'].includes(filter.type) &&
    Boolean(dateParts(filter.value))
  );
};
export function readQueueColumnFilters(value: string, queue: Queue): IParams['filters'] {
  if (!value || value.length > 12000) return [];
  try {
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed) || parsed.length > 20) return [];
    return parsed
      .filter((item) => valid(item, queue))
      .map(({ column, type, value: term, valueType }) => ({
        column,
        type,
        value: term,
        valueType,
        label: labels[column],
      }));
  } catch {
    return [];
  }
}
export function serializeQueueColumnFilters(
  filters: IParams['filters'],
  queue: Queue,
  forRequest = true
): string {
  const criteria = filters
    .filter((filter) => valid(filter, queue))
    .map(({ column, type, value, valueType }) => {
      const parts = valueType === 'date' && forRequest ? dateParts(value) : undefined;
      return {
        column,
        type,
        value,
        valueType,
        ...(parts
          ? {
              startOffsetMinutes: new Date(
                parts.year,
                parts.month - 1,
                parts.day
              ).getTimezoneOffset(),
              endOffsetMinutes: new Date(
                parts.year,
                parts.month - 1,
                parts.day + 1
              ).getTimezoneOffset(),
            }
          : {}),
      };
    });
  return criteria.length ? JSON.stringify(criteria) : '';
}
