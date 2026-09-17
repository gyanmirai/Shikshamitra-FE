import type { SeatingSessionDto } from 'src/redux/academicAPI/ExaminationApi/ScheduleExamApi/seat-allocation-v2.types';

import { it, expect, describe } from 'vitest';

import { formatSession } from './workflow-utils';

function session(overrides: Partial<SeatingSessionDto> = {}): SeatingSessionDto {
  return {
    sessionKey: '2026-09-10|09:00:00|12:00:00',
    examDate: '2026-09-10',
    startTime: '09:00:00',
    endTime: '12:00:00',
    hasCompleteSchedule: true,
    subjects: [],
    divisions: [],
    availableRooms: [],
    selectedRoomIds: [],
    seatingPlanId: null,
    seatingPlanName: null,
    status: 0,
    isLocked: false,
    requiresMigration: false,
    canPrepare: true,
    totalStudents: 0,
    allocatedStudents: 0,
    pendingStudents: 0,
    roomsUsed: 0,
    usableCapacity: 0,
    emptySeats: 0,
    utilization: 0,
    issues: [],
    ...overrides,
  };
}

describe('formatSession', () => {
  it('combines the exam date with time-only API values', () => {
    expect(formatSession(session())).toBe('Thu, 10 Sep 2026 · 9:00 AM–12:00 PM');
  });

  it('formats full ISO timestamps as wall-clock values without applying a timezone offset', () => {
    expect(
      formatSession(
        session({
          examDate: '2026-09-10T00:00:00Z',
          startTime: '2026-09-10T09:00:00Z',
          endTime: '2026-09-10T12:00:00Z',
        })
      )
    ).toBe('Thu, 10 Sep 2026 · 9:00 AM–12:00 PM');
  });

  it('does not add the IST offset to the reported 5:15 PM exam schedule', () => {
    expect(
      formatSession(
        session({
          examDate: '2026-09-16T00:00:00Z',
          startTime: '2026-09-16T17:15:00Z',
          endTime: '2026-09-16T18:00:00Z',
        })
      )
    ).toBe('Wed, 16 Sep 2026 · 5:15 PM–6:00 PM');
  });

  it('returns a safe fallback for incomplete or malformed schedules', () => {
    expect(formatSession(session({ startTime: '' }))).toBe('Schedule incomplete');
    expect(formatSession(session({ startTime: 'not-a-time' }))).toBe('Schedule incomplete');
  });
});
