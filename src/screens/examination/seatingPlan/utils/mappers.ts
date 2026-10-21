import { seatId } from '../hooks/useSeatingDraft';
import { DEFAULT_ALLOCATION_RULES } from '../types';

import type {
  ISeatAllocation,
  IExamAllocation,
  IStudentRoomAssignment,
} from '../../seatAllocation/type';
import type {
  SeatingStudent,
  SeatingPlanDraft,
  SeatingPlanStatus,
  SeatingAssignment,
  SeatingRoomLayout,
  SeatingPlanListRow,
} from '../types';

const SEATING_PLAN_STATUS_BY_VALUE: Record<number, SeatingPlanStatus> = {
  0: 'not-started',
  1: 'in-progress',
  2: 'ready',
  3: 'needs-attention',
  4: 'completed',
  5: 'published',
};

/** Maps the backend lifecycle status and falls back to allocation counts for older responses. */
export function toSeatingPlanStatus(row: {
  totalStudents: number;
  allocatedStudents: number;
  status?: number;
}): SeatingPlanStatus {
  const backendStatus = row.status == null ? undefined : SEATING_PLAN_STATUS_BY_VALUE[row.status];
  if (backendStatus) return backendStatus;

  if (row.allocatedStudents === 0) return 'not-started';
  if (row.allocatedStudents > 0 && row.allocatedStudents < row.totalStudents) return 'in-progress';
  if (row.totalStudents > 0 && row.allocatedStudents >= row.totalStudents) return 'ready';
  return 'not-started';
}

function capacityStatus(totalStudents: number, usableCapacity: number) {
  if (usableCapacity <= 0) return 'unused' as const;
  if (usableCapacity < totalStudents) return 'shortage' as const;
  return 'ok' as const;
}

function mapDivisionProgress(divisions: IExamAllocation['divisionProgress'] = []) {
  return divisions.map((division) => {
    const divisionTotal = division.totalStudents ?? 0;
    const divisionAllocated = division.allocatedStudents ?? 0;

    return {
      divisionId: division.divisionId,
      divisionName: division.divisionName,
      totalStudents: divisionTotal,
      allocatedStudents: divisionAllocated,
      pendingStudents: Math.max(0, divisionTotal - divisionAllocated),
      progress: divisionTotal === 0 ? 0 : Math.round((divisionAllocated / divisionTotal) * 100),
    };
  });
}

/** Keeps the exam as the single top-level list record. Plans are managed inside its workspace. */
export function toSeatingPlanListRows(exam: IExamAllocation): SeatingPlanListRow[] {
  return [toSeatingPlanListRow(exam)];
}

/** Maps one exam envelope into one list row, regardless of its subject/session count. */
export function toSeatingPlanListRow(exam: IExamAllocation): SeatingPlanListRow {
  const totalStudents = exam.totalStudents ?? 0;
  const allocatedStudents = exam.allocatedStudents ?? 0;
  const pendingStudents = Math.max(0, totalStudents - allocatedStudents);
  const progress = totalStudents === 0 ? 0 : Math.round((allocatedStudents / totalStudents) * 100);
  const legacySubjectNames = [
    ...new Set(exam.sessions?.flatMap((session) => session.subjectNames ?? []) ?? []),
  ];
  const subjectNames = exam.subjectNames?.length ? exam.subjectNames : legacySubjectNames;
  const legacyPlannedSubjectNames = new Set(
    exam.sessions
      ?.filter((session) => session.seatingPlanId)
      .flatMap((session) => session.subjectNames ?? []) ?? []
  );

  return {
    id: exam.examId,
    examId: exam.examId,
    examName: exam.examName,
    examTypeName: exam.examTypeName,
    standardName: exam.standardName,
    divisions: exam.divisions ?? [],
    divisionProgress: mapDivisionProgress(exam.divisionProgress),
    subjectNames,
    subjectCount: exam.subjectCount ?? subjectNames.length,
    plannedSubjectCount: exam.plannedSubjectCount ?? legacyPlannedSubjectNames.size,
    seatingPlanCount: exam.seatingPlanCount ?? 0,
    totalStudents,
    allocatedStudents,
    pendingStudents,
    roomsUsed: exam.roomsUsed ?? 0,
    usableCapacity: 0,
    emptySeats: 0,
    utilization: 0,
    capacityStatus: 'unused',
    progress,
    status: toSeatingPlanStatus({ totalStudents, allocatedStudents, status: exam.status }),
    hasCompleteSchedule: exam.sessions?.every((session) => session.hasCompleteSchedule) ?? false,
    canPrepare: (exam.plannedSubjectCount ?? 0) < (exam.subjectCount ?? 0),
    requiresMigration: exam.sessions?.some((session) => session.requiresMigration) ?? false,
    blockingIssueCount:
      exam.sessions?.reduce((total, session) => total + (session.blockingIssueCount ?? 0), 0) ?? 0,
  };
}

export { toSeatingRoomLayout } from './room-layout';

export function upsertSeatingRoomLayout(
  rooms: SeatingRoomLayout[],
  layout: SeatingRoomLayout
): SeatingRoomLayout[] {
  const existingIndex = rooms.findIndex((room) => room.roomId === layout.roomId);
  if (existingIndex === -1) return [...rooms, layout];

  return rooms.map((room, index) => {
    if (index !== existingIndex) return room;

    // A division-scoped room query can briefly be out of sync with the seat-layout query.
    // Do not let the UUID fallback overwrite a human-readable label already in the draft.
    const roomName = layout.roomName === layout.roomId ? room.roomName : layout.roomName;
    return { ...layout, roomName };
  });
}

export function toSeatingStudents(items: IStudentRoomAssignment[] = []): SeatingStudent[] {
  return items.map((s) => ({
    studentId: s.studentId,
    studentName: s.studentName,
    rollNo: s.rollNo,
    standardName: s.standardName,
  }));
}

export function toSeatingAssignments(
  items: ISeatAllocation[] | undefined,
  roomId: string
): SeatingAssignment[] {
  return (items ?? [])
    .filter((i) => i.studentId !== null)
    .map((i) => ({
      studentId: i.studentId as string,
      roomId,
      seatId: seatId(roomId, i.seatNumber),
      seatNumber: i.seatNumber,
      benchId: i.benchId,
      assignedBy: 'manual' as const,
      isExternalExamOccupied: !!i.isExternalExamOccupied,
    }));
}

/** Builds display data for occupants that may belong to divisions outside the active queue. */
export function toSeatingStudentsFromAllocations(
  items: ISeatAllocation[] | undefined
): SeatingStudent[] {
  return (items ?? [])
    .filter((item) => item.studentId !== null)
    .map((item) => ({
      studentId: item.studentId as string,
      studentName: item.studentName ?? 'Student',
      rollNo: item.rollNo ?? 0,
      standardName: item.standardName,
      isExternalExamOccupied: !!item.isExternalExamOccupied,
    }));
}

export function toSaveSeatingPlanPayload(draft: SeatingPlanDraft, roomId: string) {
  return {
    roomId,
    students: draft.assignments
      .filter((a) => a.roomId === roomId)
      .map((a) => ({
        studentId: a.studentId,
        seatNumber: a.seatNumber,
        // Empty UUIDs can come from legacy seat-layout responses; they mean
        // "no bench" and must not be sent as a foreign-key identifier.
        benchId:
          a.benchId && a.benchId !== '00000000-0000-0000-0000-000000000000' ? a.benchId : null,
        isRoomAssign: true,
      })),
  };
}

export function buildEmptyDraft(examId: string, exam?: IExamAllocation): SeatingPlanDraft {
  return {
    examId,
    examName: exam?.examName,
    examTypeName: exam?.examTypeName,
    standardName: exam?.standardName,
    divisionIds: [],
    roomIds: [],
    students: [],
    rooms: [],
    assignments: [],
    allocationRules: DEFAULT_ALLOCATION_RULES,
    excludedStudentIds: [],
    validation: { blockers: [], warnings: [] },
    status: 'not-started',
  };
}
