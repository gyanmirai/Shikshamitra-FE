import { it, expect, describe } from 'vitest';

import {
  buildApplyPayload,
  buildDraftPayload,
  buildManualApplyPayload,
} from './guided-payloads';

import type { GuidedSeatingValues } from './types';

const values: GuidedSeatingValues = {
  selectedPlanId: 'plan-1',
  planName: 'Science group',
  selectedExamSubjectIds: ['subject-1', 'subject-2'],
  selectedRoomIds: ['room-a', 'room-b'],
  allocationMode: 'automatic',
  strategy: 'alternate-division',
  fillDirection: 'front-to-back',
  leaveGap: false,
  mixDivisions: true,
  specialRequirementPriority: true,
  acknowledgeWarnings: false,
  notifyStudents: true,
  notifyParents: true,
};

describe('guided seating payloads', () => {
  it('saves the selected rooms and concurrency version together', () => {
    expect(buildDraftPayload('plan-1', values, 'opaque-version')).toMatchObject({
      seatingPlanId: 'plan-1',
      roomIds: ['room-a', 'room-b'],
      version: 'opaque-version',
    });
  });

  it('applies only the reviewed proposal and never sends room replacement rows', () => {
    const payload = buildApplyPayload(
      'plan-1',
      values,
      {
        assignments: [{ studentId: 'student-2', roomId: 'room-a', seatNumber: 2, benchId: null }],
        unallocatedStudentIds: [],
        totalStudents: 1,
        roomsUsed: 1,
        emptySeats: 4,
        utilizationPercent: 20,
      },
      'opaque-version'
    );

    expect(payload.assignments).toHaveLength(1);
    expect(payload).not.toHaveProperty('rooms');
  });

  it('replaces selected rooms and clears rooms removed during manual arrangement', () => {
    const payload = buildManualApplyPayload(
      'plan-1',
      { ...values, selectedRoomIds: ['room-b'], allocationMode: 'manual' },
      {
        assignments: [
          { studentId: 'student-2', roomId: 'room-b', seatNumber: 2, benchId: null },
        ],
        unallocatedStudentIds: [],
        totalStudents: 1,
        roomsUsed: 1,
        emptySeats: 4,
        utilizationPercent: 20,
      },
      ['room-a', 'room-b'],
      'opaque-version'
    );

    expect(payload.rooms).toEqual([
      { roomId: 'room-a', students: [] },
      {
        roomId: 'room-b',
        students: [
          { studentId: 'student-2', seatNumber: 2, benchId: null, isRoomAssign: true },
        ],
      },
    ]);
  });
});
