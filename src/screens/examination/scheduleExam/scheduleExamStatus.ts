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

export const isExamOngoing = (exam: ExamStatusSource, now: Dayjs = dayjs()): boolean => {
  if (Number(exam.status) === examScheduledStatus.Ongoing) return true;
  if (Number(exam.status) !== examScheduledStatus.Published) return false;

  const start = resolveBoundary(exam.startDateTime, exam.startDate, exam.startTime, false);
  const end = resolveBoundary(
    exam.endDateTime,
    exam.endDate ?? exam.startDate,
    exam.endTime,
    true
  );

  if (!start || !end || end.isBefore(start)) return false;
  return !now.isBefore(start) && !now.isAfter(end);
};

export const getEffectiveExamStatus = (
  exam: ExamStatusSource,
  now: Dayjs = dayjs()
): examScheduledStatus =>
  isExamOngoing(exam, now)
    ? examScheduledStatus.Ongoing
    : (Number(exam.status) as examScheduledStatus);

export const filterExamsByEffectiveStatus = <T extends ExamStatusSource>(
  exams: T[],
  status: examScheduledStatus,
  now: Dayjs = dayjs()
): T[] => exams.filter((exam) => getEffectiveExamStatus(exam, now) === status);

export const getExamStatusMeta = (exam: ExamStatusSource, now: Dayjs = dayjs()) =>
  EXAM_STATUS_META[getEffectiveExamStatus(exam, now)] ?? EXAM_STATUS_META[examScheduledStatus.Pending];
