import type { Dayjs } from 'dayjs';
import type { LabelColor } from 'src/components/label';

import dayjs from 'dayjs';
import { examScheduledStatus } from 'src/enums/exam-scheduled-status';
import { parseWallClockTime } from 'src/utils/time-of-day';

export interface ExamStatusSource {
  status?: number | null;
  startDate?: string | null;
  endDate?: string | null;
  startDateTime?: string | null;
  endDateTime?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  subjects?: unknown[] | null;
  examSubjects?: unknown[] | null;
  schedules?: unknown[] | null;
}

export const EXAM_STATUS_META: Record<
  examScheduledStatus,
  { label: string; color: LabelColor }
> = {
  [examScheduledStatus.Pending]: { label: 'Draft', color: 'warning' },
  [examScheduledStatus.Published]: { label: 'Published', color: 'info' },
  [examScheduledStatus.Completed]: { label: 'Completed', color: 'success' },
  [examScheduledStatus.Ongoing]: { label: 'Ongoing', color: 'primary' },
};

const resolveBoundary = (
  exactDateTime: string | null | undefined,
  dateValue: string | null | undefined,
  timeValue: string | null | undefined,
  isEnd: boolean
): Dayjs | null => {
  if (exactDateTime) {
    const exact = dayjs(exactDateTime);
    return exact.isValid() ? exact : null;
  }

  if (!dateValue) return null;

  const date = dayjs(dateValue);
  if (!date.isValid()) return null;

  const clock = parseWallClockTime(timeValue);
  if (clock) {
    return date
      .hour(clock.hour())
      .minute(clock.minute())
      .second(clock.second())
      .millisecond(0);
  }

  return isEnd ? date.endOf('day') : date.startOf('day');
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const getText = (value: unknown): string | null =>
  typeof value === 'string' && value.length > 0 ? value : null;

const getScheduleEntries = (exam: ExamStatusSource): Record<string, unknown>[] => {
  const entries = [exam.subjects, exam.examSubjects, exam.schedules].find(
    (value): value is unknown[] => Array.isArray(value) && value.length > 0
  );
  return (entries ?? []).filter(isRecord);
};

type ExamScheduleWindow = { start: Dayjs; end: Dayjs };

const getScheduleWindow = (entry: Record<string, unknown>): ExamScheduleWindow | null => {
  const startDate = getText(entry.examDate) ?? getText(entry.date) ?? getText(entry.scheduleDate);
  const endDate = getText(entry.endDate) ?? startDate;
  const startTime = getText(entry.startTime) ?? getText(entry.fromTime) ?? getText(entry.start);
  const endTime = getText(entry.endTime) ?? getText(entry.toTime) ?? getText(entry.end);

  const start = resolveBoundary(
    getText(entry.startDateTime),
    startDate,
    startTime,
    false
  );
  const end = resolveBoundary(getText(entry.endDateTime), endDate, endTime, true);

  return start && end && !end.isBefore(start) ? { start, end } : null;
};

export const isExamOngoing = (exam: ExamStatusSource, now: Dayjs = dayjs()): boolean => {
  const lifecycleStatus = Number(exam.status);
  if (
    lifecycleStatus !== examScheduledStatus.Published &&
    lifecycleStatus !== examScheduledStatus.Ongoing
  ) {
    return false;
  }

  const start = resolveBoundary(exam.startDateTime, exam.startDate, exam.startTime, false);
  const end = resolveBoundary(
    exam.endDateTime,
    exam.endDate ?? exam.startDate,
    exam.endTime,
    true
  );

  if (start && end && !end.isBefore(start)) {
    return !now.isBefore(start) && !now.isAfter(end);
  }

  return getScheduleEntries(exam).some((entry) => {
    const window = getScheduleWindow(entry);
    return Boolean(window && !now.isBefore(window.start) && !now.isAfter(window.end));
  });
};

const hasExamEnded = (exam: ExamStatusSource, now: Dayjs): boolean => {
  const end = resolveBoundary(
    exam.endDateTime,
    exam.endDate ?? exam.startDate,
    exam.endTime,
    true
  );
  if (end) return now.isAfter(end);

  const scheduleWindows = getScheduleEntries(exam)
    .map(getScheduleWindow)
    .filter((window): window is ExamScheduleWindow => window !== null);

  return scheduleWindows.length > 0 && scheduleWindows.every((window) => now.isAfter(window.end));
};

export const getEffectiveExamStatus = (
  exam: ExamStatusSource,
  now: Dayjs = dayjs()
): examScheduledStatus => {
  const lifecycleStatus = Number(exam.status) as examScheduledStatus;
  if (
    lifecycleStatus !== examScheduledStatus.Published &&
    lifecycleStatus !== examScheduledStatus.Ongoing
  ) {
    return lifecycleStatus;
  }

  if (isExamOngoing(exam, now)) return examScheduledStatus.Ongoing;
  if (hasExamEnded(exam, now)) return examScheduledStatus.Completed;
  return examScheduledStatus.Published;
};

export const filterExamsByEffectiveStatus = <T extends ExamStatusSource>(
  exams: T[],
  status: examScheduledStatus,
  now: Dayjs = dayjs()
): T[] => exams.filter((exam) => getEffectiveExamStatus(exam, now) === status);

export const getExamStatusMeta = (exam: ExamStatusSource, now: Dayjs = dayjs()) =>
  EXAM_STATUS_META[getEffectiveExamStatus(exam, now)] ?? EXAM_STATUS_META[examScheduledStatus.Pending];
