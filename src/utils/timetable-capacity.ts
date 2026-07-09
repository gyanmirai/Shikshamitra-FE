/**
 * Shared capacity/status math for the Timetable Settings screens
 * (Lecture Slots + Weekly Lectures). Both screens must use these helpers so
 * the "available vs required" numbers and status never disagree between them.
 */

export type TimetableSettingStatus =
  | 'PendingSlotSetup'
  | 'PendingWeeklyLectures'
  | 'OverCapacity'
  | 'FreeSlotsAvailable'
  | 'Balanced';

export interface TimeSlotLike {
  slotType?: string | number;
}

export interface SlotGroupLike {
  weekRangeStart: number;
  weekRangeEnd: number;
  timeSlots: TimeSlotLike[];
}

const isTeachingSlot = (slotType: string | number | undefined) =>
  slotType === 'period' || slotType === 0 || slotType === '0';

export const getTeachingSlotsPerDay = (timeSlots: TimeSlotLike[] = []) =>
  timeSlots.filter((slot) => isTeachingSlot(slot.slotType)).length;

export const getNonTeachingSlotsPerDay = (timeSlots: TimeSlotLike[] = []) =>
  timeSlots.length - getTeachingSlotsPerDay(timeSlots);

export const getActiveDaysCount = (
  groups: Pick<SlotGroupLike, 'weekRangeStart' | 'weekRangeEnd'>[] = []
) => groups.reduce((sum, g) => sum + (g.weekRangeEnd - g.weekRangeStart + 1), 0);

export const getWeeklyTeachingCapacity = (groups: SlotGroupLike[] = []) =>
  groups.reduce(
    (sum, g) => sum + getTeachingSlotsPerDay(g.timeSlots) * (g.weekRangeEnd - g.weekRangeStart + 1),
    0
  );

export const getRequiredWeeklyLectures = (subjects: { weeklyLectures?: number }[] = []) =>
  subjects.reduce((sum, s) => sum + Number(s.weeklyLectures || 0), 0);

export const getCapacityDifference = (availableCapacity: number, requiredLectures: number) =>
  availableCapacity - requiredLectures;

export function getTimetableSettingStatus({
  availableCapacity,
  requiredLectures,
  hasSlots,
  hasWeeklyLectures,
}: {
  availableCapacity: number;
  requiredLectures: number;
  hasSlots: boolean;
  hasWeeklyLectures: boolean;
}): TimetableSettingStatus {
  if (!hasSlots) return 'PendingSlotSetup';
  if (!hasWeeklyLectures || requiredLectures === 0) return 'PendingWeeklyLectures';
  if (requiredLectures > availableCapacity) return 'OverCapacity';
  if (requiredLectures < availableCapacity) return 'FreeSlotsAvailable';
  return 'Balanced';
}

/**
 * Backend enum values serialize as numbers (see NullableEnumConverter pattern
 * used across this codebase), not string literals. Status columns coming
 * straight from the API must be normalized before being handed to the chip.
 * Order must match ShikshaMitra.Academic.Timetable.TimetableSettingStatus.
 */
const STATUS_BY_NUMBER: TimetableSettingStatus[] = [
  'PendingSlotSetup',
  'PendingWeeklyLectures',
  'OverCapacity',
  'FreeSlotsAvailable',
  'Balanced',
];

export function normalizeTimetableStatus(
  value: TimetableSettingStatus | number | string | null | undefined
): TimetableSettingStatus | undefined {
  if (value == null) return undefined;
  if (typeof value === 'number') return STATUS_BY_NUMBER[value];
  if (typeof value === 'string' && /^\d+$/.test(value)) return STATUS_BY_NUMBER[Number(value)];
  return value as TimetableSettingStatus;
}

export const TIMETABLE_STATUS_LABEL: Record<TimetableSettingStatus, string> = {
  Balanced: 'Balanced / Ready',
  FreeSlotsAvailable: 'Free Slots Available',
  PendingWeeklyLectures: 'Pending Weekly Lectures',
  PendingSlotSetup: 'Pending Slot Setup',
  OverCapacity: 'Over Capacity',
};
