import type { LessonPlanTimelineSlot } from 'src/redux/academicAPI/CurriculumManagementApi/LessonPlanApi/lesson-plan-api';

export type TodayTimelineStatus = 'completed' | 'ongoing' | 'upcoming';

const parseTimeToMinutes = (value: string): number | null => {
  const match = value.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!match) return null;

  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  const meridiem = match[3]?.toUpperCase();

  if (minutes > 59 || hours > (meridiem ? 12 : 23)) return null;
  if (meridiem === 'AM' && hours === 12) hours = 0;
  if (meridiem === 'PM' && hours !== 12) hours += 12;

  return hours * 60 + minutes;
};

export const getTodayTimelineStatus = (
  slot: Pick<LessonPlanTimelineSlot, 'startTime' | 'endTime'>,
  now: Date
): TodayTimelineStatus => {
  const start = parseTimeToMinutes(slot.startTime);
  const end = parseTimeToMinutes(slot.endTime);
  const current = now.getHours() * 60 + now.getMinutes();

  if (start === null || end === null) return 'upcoming';
  if (current > end) return 'completed';
  if (current >= start) return 'ongoing';
  return 'upcoming';
};

export const getLessonPlanState = (slot: LessonPlanTimelineSlot) => {
  if (!slot.lessonPlan) {
    return { label: 'Plan needed', color: 'warning' as const };
  }

  const normalizedStatus = String(slot.lessonPlan.status).toLowerCase();
  if (normalizedStatus === '2' || normalizedStatus === 'approved') {
    return { label: 'Plan approved', color: 'success' as const };
  }
  if (normalizedStatus === '1' || normalizedStatus === 'submitted') {
    return { label: 'In review', color: 'info' as const };
  }
  if (normalizedStatus === '4' || normalizedStatus === 'needschanges') {
    return { label: 'Changes requested', color: 'error' as const };
  }
  if (normalizedStatus === '3' || normalizedStatus === 'rejected') {
    return { label: 'Rejected', color: 'error' as const };
  }
  return { label: 'Draft plan', color: 'warning' as const };
};
