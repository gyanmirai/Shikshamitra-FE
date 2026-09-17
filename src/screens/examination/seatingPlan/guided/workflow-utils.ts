import {
  formatDateTimeOffsetAsWallClockDate,
  formatDateTimeOffsetAsWallClockTime,
} from 'src/utils/dateConvertor';

import type { GuidedSeatingValues } from './types';

interface SessionSchedule {
  examDate?: string | null;
  startTime?: string | null;
  endTime?: string | null;
}

export function formatSession(session: SessionSchedule): string {
  if (!session.examDate || !session.startTime || !session.endTime) return 'Schedule incomplete';

  const date = formatDateTimeOffsetAsWallClockDate(session.examDate, 'ddd, D MMM YYYY');
  const startTime = formatDateTimeOffsetAsWallClockTime(session.startTime, 'h:mm A');
  const endTime = formatDateTimeOffsetAsWallClockTime(session.endTime, 'h:mm A');

  if (!date || !startTime || !endTime) {
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
