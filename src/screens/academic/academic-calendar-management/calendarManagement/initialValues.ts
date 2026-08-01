import type { CalendarFormValues, CalendarDayFormValues } from './types';

export const calendarInitialValues = (data?: any): CalendarFormValues => ({
  academicYearId: data?.academicYearId ?? '',
  name: data?.name ?? '',
  description: data?.description ?? '',
  startDate: data?.startDate ?? null,
  endDate: data?.endDate ?? null,
  isDefault: data?.isDefault ?? false,
});

const sanitizeDescription = (desc?: string, id?: string): string => {
  if (!desc) return '';
  const trimmed = String(desc).trim();
  const isGuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(trimmed);
  if (isGuid || trimmed === id || (id && trimmed.includes(id))) return '';
  return desc;
};

export const calendarDayInitialValues = (data?: any): CalendarDayFormValues => ({
  date: data?.date ?? null,
  endDate: data?.endDate ?? null,
  dayType: data?.dayType ?? '',
  holidayCategory: data?.holidayCategory ?? '',
  title: data?.title ?? '',
  description: sanitizeDescription(data?.description, data?.id),
  appliesToAll: data?.appliesToAll ?? true,
  standardIds: data?.standardIds ?? (data?.standardId ? [data.standardId] : []),
  divisionId: data?.divisionId ?? '',
  startTime: data?.startTime ?? '',
  endTime: data?.endTime ?? '',
  changeReason: data?.changeReason ?? '',
});
