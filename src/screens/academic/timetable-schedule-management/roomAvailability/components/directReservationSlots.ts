import type { ScheduleSlot } from '../types';

export const MIN_SLOT_DURATION_MINUTES = 15;
export const MAX_SLOT_DURATION_MINUTES = 240;
export const DEFAULT_SLOT_DURATION_MINUTES = 60;

export interface GeneratedReservationSlot {
  period: string;
  time: string;
  startTime: string;
  endTime: string;
  startMinutes: number;
  endMinutes: number;
  status: ScheduleSlot['status'];
  details: string;
  occupiedBy?: string;
  teacher?: string;
  conflictMinutes: number;
  conflicts: ScheduleSlot[];
}

export const toMinutes = (time24h: string): number => {
  if (!time24h) return Number.NaN;
  const [hours, minutes] = time24h.split(':').map(Number);
  return hours * 60 + minutes;
};

export const parseDisplayTimeToMinutes = (timeText: string): number => {
  const trimmed = timeText.trim().toUpperCase();
  const twelveHourMatch = trimmed.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/);

  if (twelveHourMatch) {
    let hours = parseInt(twelveHourMatch[1], 10);
    const minutes = parseInt(twelveHourMatch[2], 10);
    const modifier = twelveHourMatch[3];

    if (modifier === 'PM' && hours < 12) {
      hours += 12;
    }

    if (modifier === 'AM' && hours === 12) {
      hours = 0;
    }

    return hours * 60 + minutes;
  }

  return toMinutes(trimmed);
};

export const parseSlotRange = (
  timeRange: string
): { startMinutes: number; endMinutes: number } | null => {
  const parts = timeRange.replace(/[–—]/g, '-').split(/\s*-\s*/);
  if (parts.length !== 2) return null;

  const startMinutes = parseDisplayTimeToMinutes(parts[0]);
  let endMinutes = parseDisplayTimeToMinutes(parts[1]);

  if (Number.isNaN(startMinutes) || Number.isNaN(endMinutes)) {
    return null;
  }

  if (endMinutes <= startMinutes) {
    endMinutes += 24 * 60;
  }

  return { startMinutes, endMinutes };
};

export const formatTimeInput = (minutes: number): string => {
  const cappedMinutes = Math.min(minutes, 23 * 60 + 59);
  const hours = Math.floor(cappedMinutes / 60);
  const minute = cappedMinutes % 60;
  return `${hours.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
};

export const formatSlotTime = (minutes: number): string => {
  const normalized = minutes % (24 * 60);
  const hours = Math.floor(normalized / 60);
  const minute = normalized % 60;
  const displayHour = hours % 12 === 0 ? 12 : hours % 12;
  const suffix = hours < 12 ? 'AM' : 'PM';
  return `${displayHour.toString().padStart(2, '0')}:${minute
    .toString()
    .padStart(2, '0')} ${suffix}`;
};

export const clampSlotDuration = (value: number): number =>
  Math.min(Math.max(value, MIN_SLOT_DURATION_MINUTES), MAX_SLOT_DURATION_MINUTES);

export const getOverlapMinutes = (
  firstStart: number,
  firstEnd: number,
  secondStart: number,
  secondEnd: number
): number => Math.max(0, Math.min(firstEnd, secondEnd) - Math.max(firstStart, secondStart));

export const generateReservationSlots = (
  scheduleSlots: ScheduleSlot[],
  slotDurationMinutes: number
): GeneratedReservationSlot[] => {
  const parsedScheduleSlots = scheduleSlots
    .map((slot) => {
      const range = parseSlotRange(slot.time);
      return range ? { slot, ...range } : null;
    })
    .filter(
      (
        parsed
      ): parsed is ScheduleSlot & {
        slot: ScheduleSlot;
        startMinutes: number;
        endMinutes: number;
      } => Boolean(parsed)
    );

  const windowStart =
    parsedScheduleSlots.length > 0
      ? Math.min(...parsedScheduleSlots.map((slot) => slot.startMinutes))
      : 6 * 60;
  const windowEnd =
    parsedScheduleSlots.length > 0
      ? Math.max(...parsedScheduleSlots.map((slot) => slot.endMinutes))
      : 24 * 60;

  const duration = clampSlotDuration(slotDurationMinutes);
  const generatedSlots: GeneratedReservationSlot[] = [];

  for (let startMinutes = windowStart; startMinutes < windowEnd; startMinutes += duration) {
    const endMinutes = Math.min(startMinutes + duration, windowEnd);
    const conflicts = parsedScheduleSlots.filter(
      ({ slot, startMinutes: occupiedStart, endMinutes: occupiedEnd }) =>
        slot.status !== 'free' &&
        getOverlapMinutes(startMinutes, endMinutes, occupiedStart, occupiedEnd) > 0
    );
    const conflictMinutes = conflicts.reduce(
      (total, { startMinutes: occupiedStart, endMinutes: occupiedEnd }) =>
        total + getOverlapMinutes(startMinutes, endMinutes, occupiedStart, occupiedEnd),
      0
    );
    const firstConflict = conflicts[0]?.slot;

    generatedSlots.push({
      period: `P${generatedSlots.length + 1}`,
      time: `${formatSlotTime(startMinutes)}-${formatSlotTime(endMinutes)}`,
      startTime: formatTimeInput(startMinutes),
      endTime: formatTimeInput(endMinutes),
      startMinutes,
      endMinutes,
      status: firstConflict?.status || 'free',
      details: firstConflict?.details || 'Available',
      occupiedBy: firstConflict?.occupiedBy,
      teacher: firstConflict?.teacher,
      conflictMinutes,
      conflicts: conflicts.map(({ slot }) => slot),
    });
  }

  return generatedSlots;
};
