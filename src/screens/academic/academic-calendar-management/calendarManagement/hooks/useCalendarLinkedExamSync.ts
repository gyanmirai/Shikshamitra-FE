import type { FormikProps } from 'formik';

import dayjs from 'dayjs';
import { useEffect } from 'react';

import type { CalendarDayFormValues } from '../types';

type ScheduledSubject = {
  examDate?: string;
  ExamDate?: string;
  startTime?: string;
  StartTime?: string;
  endTime?: string;
  EndTime?: string;
};

type Props = {
  enabled: boolean;
  formik: Pick<FormikProps<CalendarDayFormValues>, 'values' | 'setValues'>;
  selectedExam?: { examTypeId?: string; standardId?: string };
  schedule?: { subjects?: ScheduledSubject[]; Subjects?: ScheduledSubject[] };
  persistedLinkedExamId?: string;
};

export function useCalendarLinkedExamSync({
  enabled,
  formik: { values, setValues },
  selectedExam,
  schedule,
  persistedLinkedExamId,
}: Props) {
  const { linkedExamId } = values;
  const examTypeId = selectedExam?.examTypeId;
  const standardId = selectedExam?.standardId;

  // Depend on stable setters and exam fields, never the changing Formik bag.
  useEffect(() => {
    if (!enabled || !linkedExamId) return;

    setValues((current) => {
      const needsExamType = !current.examTypeId && Boolean(examTypeId);
      const needsClass =
        standardId &&
        (current.appliesToAll ||
          current.standardIds.length !== 1 ||
          current.standardIds[0] !== standardId ||
          Boolean(current.divisionId));

      if (!needsExamType && !needsClass) return current;

      return {
        ...current,
        examTypeId: current.examTypeId || examTypeId || '',
        ...(needsClass && standardId
          ? { appliesToAll: false, standardIds: [standardId], divisionId: '' }
          : {}),
      };
    }, false);
  }, [enabled, linkedExamId, examTypeId, standardId, setValues]);

  useEffect(() => {
    if (!enabled || !linkedExamId || persistedLinkedExamId === linkedExamId) return;

    const subjects = schedule?.subjects ?? schedule?.Subjects ?? [];
    const subject = [...subjects]
      .filter(
        (item) =>
          (item.examDate || item.ExamDate) &&
          (item.startTime || item.StartTime) &&
          (item.endTime || item.EndTime)
      )
      .sort(
        (left, right) =>
          dayjs(left.examDate ?? left.ExamDate).valueOf() -
          dayjs(right.examDate ?? right.ExamDate).valueOf()
      )[0];
    if (!subject) return;

    const date = subject.examDate ?? subject.ExamDate;
    if (!date) return;
    const examStartTime = dayjs(subject.startTime ?? subject.StartTime).format('HH:mm:ss');
    const examEndTime = dayjs(subject.endTime ?? subject.EndTime).format('HH:mm:ss');

    setValues((current) => {
      if (
        dayjs(current.date).valueOf() === dayjs(date).valueOf() &&
        current.examStartTime === examStartTime &&
        current.examEndTime === examEndTime
      ) {
        return current;
      }
      return { ...current, date, examStartTime, examEndTime };
    }, false);
  }, [enabled, linkedExamId, persistedLinkedExamId, schedule, setValues]);
}
