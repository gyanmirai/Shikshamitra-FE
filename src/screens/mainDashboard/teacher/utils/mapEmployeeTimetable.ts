import type { DayOfWeek, TimeSlot, SlotSubject } from 'src/components/timetable/types';

import { SlotType, BreakType } from 'src/components/timetable/types';

// ---------------------------------------------------------------------------
// Types that mirror the Teacher Timetable API response shape
// (GET /api/academics/timetable/by-employee/{employeeId})
// ---------------------------------------------------------------------------

export interface EmployeeTimetableSlot {
  timetableId?: string;
  timetableSlotId?: string;
  standardId?: string;
  standardName?: string;
  divisionId?: string;
  divisionName?: string;
  sequence?: number;
  startTime: string;
  endTime: string;
  /** 0 = LECTURE, 1 = BREAK */
  type: number;
  /** 0 = SHORT, 1 = LUNCH */
  breakType?: number;
  subjectType?: number | null;
  electiveGroupId?: string | null;
  electiveGroupName?: string | null;
  electiveGroupColor?: string | null;
  subjectAssignmentId?: string | null;
  subjectId?: string | null;
  subjectName?: string | null;
  subjectCode?: string | null;
  subjectColor?: string | null;
  roomId?: string | null;
  roomName?: string | null;
  teacherId?: string | null;
  teacherName?: string | null;
}

/**
 * The actual API response shape:
 * GET /api/academics/timetable/by-employee/{employeeId}
 * Days are nested inside the `days` property.
 */
export interface EmployeeTimetableResponse {
  employeeId?: string;
  employeeName?: string;
  academicYearId?: string;
  totalSlots?: number;
  /** Day-keyed map: { MONDAY: [...], TUESDAY: [...], ... } */
  days: Record<string, EmployeeTimetableSlot[]>;
}

// ---------------------------------------------------------------------------
// Day name normalisation
// ---------------------------------------------------------------------------

const DAY_KEY_MAP: Record<string, DayOfWeek> = {
  monday: 'MONDAY',
  tuesday: 'TUESDAY',
  wednesday: 'WEDNESDAY',
  thursday: 'THURSDAY',
  friday: 'FRIDAY',
  saturday: 'SATURDAY',
};

const VALID_DAYS = new Set<DayOfWeek>([
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
]);

function normaliseDayKey(raw: string): DayOfWeek | null {
  const lower = raw.toLowerCase();
  return DAY_KEY_MAP[lower] ?? (VALID_DAYS.has(raw as DayOfWeek) ? (raw as DayOfWeek) : null);
}

// ---------------------------------------------------------------------------
// Empty scaffold
// ---------------------------------------------------------------------------

export function emptyTimetableSlots(): Record<DayOfWeek, TimeSlot[]> {
  return {
    MONDAY: [],
    TUESDAY: [],
    WEDNESDAY: [],
    THURSDAY: [],
    FRIDAY: [],
    SATURDAY: [],
  };
}

// ---------------------------------------------------------------------------
// Main mapper
// ---------------------------------------------------------------------------

/**
 * Transform the Teacher Timetable API response into the
 * `Record<DayOfWeek, TimeSlot[]>` shape expected by TimetableBoard.
 *
 * The API response wraps day arrays inside a `days` property:
 *   { employeeId, employeeName, days: { MONDAY: [...], ... }, totalSlots }
 *
 * Mirrors the initialSlots transform in newTimetable.tsx (TimeTableForm) so
 * the rendering behaviour is identical to the admin timetable screen.
 */
export function mapEmployeeTimetableToSlots(
  data: EmployeeTimetableResponse | null | undefined
): Record<DayOfWeek, TimeSlot[]> {
  const result = emptyTimetableSlots();

  // Unwrap the `days` envelope — the root object also has employeeId, totalSlots etc.
  const daysMap = data?.days;
  if (!daysMap || typeof daysMap !== 'object') return result;

  Object.entries(daysMap).forEach(([rawDay, daySlots]) => {
    const day = normaliseDayKey(rawDay);
    if (!day || !Array.isArray(daySlots)) return;

    result[day] = daySlots.map((slot, index): TimeSlot => {
      const slotType = slot.type === 1 ? SlotType.BREAK : SlotType.LECTURE;
      const breakType =
        slotType === SlotType.BREAK
          ? slot.breakType === 1
            ? BreakType.LUNCH
            : BreakType.SHORT
          : undefined;

      // Display label: "Nursery - A" — shown in the slot card
      const classLabel = [slot.standardName, slot.divisionName].filter(Boolean).join(' - ');

      // Build subjects array for LECTURE slots that have a subject assigned
      const subjects: SlotSubject[] =
        slotType === SlotType.LECTURE && slot.subjectId
          ? [
              {
                subjectId: slot.subjectId,
                subjectAssignmentId: slot.subjectAssignmentId ?? '',
                name: slot.subjectName ?? '',
                color: slot.subjectColor ?? slot.electiveGroupColor ?? '#1573b6',
                teacherId: slot.teacherId ?? undefined,
                teacherName: slot.teacherName ?? undefined,
                roomId: slot.roomId ?? undefined,
                roomName: slot.roomName ?? undefined,
                // className already includes division (e.g. "Nursery A")
                // Don't set `division` — TimetableSlot appends `-{division}` which would duplicate it
                className: classLabel || undefined,
              },
            ]
          : [];

      return {
        id: slot.timetableSlotId ?? `${day}-${index}`,
        sequence: slot.sequence ?? index,
        day,
        startTime: slot.startTime ?? '00:00',
        endTime: slot.endTime ?? '00:00',
        type: slotType,
        breakType,
        subjectType: slot.subjectType ?? null,
        electiveGroupId: slot.electiveGroupId ?? null,
        electiveGroupName: slot.electiveGroupName ?? null,
        subjectId: slot.subjectId ?? null,
        subjectAssignmentId: slot.subjectAssignmentId ?? null,
        subjects,
      };
    });
  });

  return result;
}

// ---------------------------------------------------------------------------
// Guard: is the mapped timetable completely empty (no slots in any day)?
// ---------------------------------------------------------------------------

export function isTimetableEmpty(slots: Record<DayOfWeek, TimeSlot[]>): boolean {
  return Object.values(slots).every((daySlots) => daySlots.length === 0);
}

