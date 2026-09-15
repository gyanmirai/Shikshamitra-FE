import type { CalendarFormValues, CalendarDayFormValues } from './types';

const EXAM_SYNC_DESCRIPTION_PREFIX = 'Auto-created from examination schedule. ExamId: ';

export const getSyncedExamId = (description?: string): string => {
  if (!description?.startsWith(EXAM_SYNC_DESCRIPTION_PREFIX)) return '';

  const candidate = description.slice(EXAM_SYNC_DESCRIPTION_PREFIX.length).trim();
  return /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(
    candidate
  )
    ? candidate
    : '';
};

export const calendarInitialValues = (data?: any): CalendarFormValues => ({
  academicMediumId: data?.academicMediumId ?? '',
  name: data?.name ?? '',
  description: data?.description ?? '',
  startDate: data?.startDate ?? null,
  endDate: data?.endDate ?? data?.rangeEndDate ?? null,
  isDefault: data?.isDefault ?? false,
});

const sanitizeDescription = (desc?: string, id?: string): string => {
  if (!desc) return '';
  const trimmed = String(desc).trim();
  const isGuid =
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(trimmed);
  if (isGuid || trimmed === id || (id && trimmed.includes(id))) return '';
  return desc;
};

export const calendarDayInitialValues = (data?: any): CalendarDayFormValues => ({
  date: data?.date ?? null,
  endDate: data?.endDate ?? data?.rangeEndDate ?? null,
  dayType: data?.dayType ?? '',
  holidayCategory: data?.holidayCategory ?? '',
  title: data?.title ?? '',
  description: sanitizeDescription(data?.description, data?.id),
  appliesToAll: data?.appliesToAll ?? true,
  standardIds: data?.standardIds ?? (data?.standardId ? [data.standardId] : []),
  divisionId: data?.divisionId ?? '',
  startTime: data?.startTime ?? '',
  endTime: data?.endTime ?? '',
  venue: data?.venue ?? '',
  examTypeId: data?.examTypeId ?? '',
  linkedExamId: data?.linkedExamId ?? getSyncedExamId(data?.description),
  // Older auto-generated exam markers stored their schedule in the generic time fields.
  examStartTime: data?.examStartTime ?? data?.startTime ?? '',
  examEndTime: data?.examEndTime ?? data?.endTime ?? '',
  ptmMode: data?.ptmMode ?? '',
  roomId: data?.roomId ?? '',
  meetingLink: data?.meetingLink ?? '',
  changeReason: data?.changeReason ?? '',
});
