import { fDate, fTime } from 'src/utils/format-time';

import type { GuidedSeatingValues } from './types';

interface SessionSchedule {
  examDate?: string | null;
  startTime?: string | null;
  endTime?: string | null;
}

function dateTimeValue(examDate: string, time: string) {
  if (time.includes('T')) return time;
  return `${examDate.split('T')[0]}T${time}`;
}

export function formatSession(session: SessionSchedule): string {
  if (!session.examDate || !session.startTime || !session.endTime) return 'Schedule incomplete';

  const date = fDate(session.examDate, 'ddd, D MMM YYYY');
  const startTime = fTime(dateTimeValue(session.examDate, session.startTime), 'h:mm A');
  const endTime = fTime(dateTimeValue(session.examDate, session.endTime), 'h:mm A');

  if (
    !date ||
    !startTime ||
    !endTime ||
    [date, startTime, endTime].includes('Invalid time value')
  ) {
    return 'Schedule incomplete';
  }

  return `${date} · ${startTime}–${endTime}`;
}

export function formatPlanSchedules(subjects: SessionSchedule[]): string {
  const schedules = [...new Set(subjects.map(formatSession))];
  if (schedules.length === 0) return 'No subjects selected';
  if (schedules.length === 1) return schedules[0];
  return `${schedules.length} schedules · ${schedules[0]} + ${schedules.length - 1} more`;
}

export function buildRules(values: GuidedSeatingValues) {
  return {
    strategy: values.strategy,
    fillDirection: values.fillDirection,
    leaveGap: values.leaveGap,
    mixDivisions: values.mixDivisions,
    specialRequirementPriority: values.specialRequirementPriority,
  };
}
