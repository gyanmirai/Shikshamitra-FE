import type { CalendarFormValues, CalendarDayFormValues } from './types';

export const calendarInitialValues = (data?: any): CalendarFormValues => ({
  academicYearId: data?.academicYearId ?? '',
  name: data?.name ?? '',
  description: data?.description ?? '',
  startDate: data?.startDate ?? null,
  endDate: data?.endDate ?? null,
  isDefault: data?.isDefault ?? false,
});

export const calendarDayInitialValues = (data?: any): CalendarDayFormValues => ({
  date: data?.date ?? null,
  endDate: data?.endDate ?? null,
  dayType: data?.dayType ?? '',
  holidayCategory: data?.holidayCategory ?? '',
  title: data?.title ?? '',
  description: data?.description ?? '',
  appliesToAll: data?.appliesToAll ?? true,
  standardIds: data?.standardIds ?? (data?.standardId ? [data.standardId] : []),
  divisionId: data?.divisionId ?? '',
  startTime: data?.startTime ?? '',
  endTime: data?.endTime ?? '',
  changeReason: data?.changeReason ?? '',
});
