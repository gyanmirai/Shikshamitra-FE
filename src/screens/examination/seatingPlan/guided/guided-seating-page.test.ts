import type {
  SeatingPlanGroupDto,
  SeatingPlanWorkspaceDto,
} from 'src/redux/academicAPI/ExaminationApi/ScheduleExamApi/seat-allocation-v2.types';

import { it, expect, describe } from 'vitest';

import { normalizeWorkspace } from './normalize-workspace';

const legacyPublishedPlan: SeatingPlanGroupDto = {
  seatingPlanId: 'plan-1',
  name: 'English',
  scopeType: 2,
  status: 5,
  isLocked: true,
  hasCompleteSchedule: true,
  canConfigure: false,
  scheduleCount: 1,
  subjects: [
    {
      examSubjectId: 'exam-subject-1',
      subjectId: 'subject-1',
      subjectName: 'English',
    },
  ],
  divisions: [],
  availableRooms: [
    {
      roomId: 'room-1',
      roomName: 'Room 1',
      capacity: 30,
      usableCapacity: 30,
      disabledSeats: 0,
    },
  ],
  selectedRoomIds: ['room-1'],
  totalStudents: 3,
  allocatedStudents: 3,
  pendingStudents: 0,
  roomsUsed: 1,
  usableCapacity: 30,
  emptySeats: 27,
  utilization: 10,
  issues: [],
};

function createWorkspace(isPublished: boolean): SeatingPlanWorkspaceDto {
  return {
    examId: 'exam-1',
    examName: 'Term examination',
    standardId: 'standard-1',
    standardName: 'Nursery',
    selectedSeatingPlanId: legacyPublishedPlan.seatingPlanId,
    version: 'v1',
    availableSubjects: legacyPublishedPlan.subjects,
    plans: [legacyPublishedPlan],
    sessions: [],
    readiness: {
      examId: 'exam-1',
      isPublished,
      isReadyToPublish: true,
      canResetDraft: !isPublished,
      totalSubjectCount: 1,
      plannedSubjectCount: 1,
      totalPlanCount: 1,
      readyPlanCount: 1,
      totalStudentSeats: 3,
      allocatedStudentSeats: 3,
      blockers: [],
      warnings: [],
    },
  };
}

describe('normalizeWorkspace', () => {
  it('reopens legacy per-plan publication when the examination remains draft', () => {
    const plan = normalizeWorkspace(createWorkspace(false)).plans[0];

    expect(plan.status).toBe(2);
    expect(plan.isLocked).toBe(false);
    expect(plan.canConfigure).toBe(true);
  });

  it('locks every plan at the examination publication boundary', () => {
    const plan = normalizeWorkspace(createWorkspace(true)).plans[0];

    expect(plan.status).toBe(5);
    expect(plan.isLocked).toBe(true);
    expect(plan.canConfigure).toBe(false);
  });
});
