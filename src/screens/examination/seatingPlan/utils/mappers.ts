import { seatId } from '../hooks/useSeatingDraft';
import { DEFAULT_ALLOCATION_RULES } from '../types';

import type { ISeatAllocation, IExamAllocation, IStudentRoomAssignment } from '../../seatAllocation/type';
import type {
  SeatingSeat,
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

export function toSeatingPlanListRow(exam: IExamAllocation): SeatingPlanListRow {
  const totalStudents = exam.totalStudents ?? 0;
  const allocatedStudents = exam.allocatedStudents ?? 0;
  const pendingStudents = Math.max(0, totalStudents - allocatedStudents);
  const progress = totalStudents === 0 ? 0 : Math.round((allocatedStudents / totalStudents) * 100);
  const divisionProgress = (exam.divisionProgress ?? []).map((division) => {
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

  return {
    examId: exam.examId,
    examName: exam.examName,
    examTypeName: exam.examTypeName,
    standardName: exam.standardName,
    divisions: exam.divisions ?? [],
    divisionProgress,
    totalStudents,
    allocatedStudents,
    pendingStudents,
    roomsUsed: 0, // populated once BE returns room usage per exam (Phase 2 BE)
    capacityStatus: 'ok',
    progress,
    status: toSeatingPlanStatus({ totalStudents, allocatedStudents, status: exam.status }),
  };
}

function parseIntCsv(csv?: string | null): Set<number> {
  if (!csv) return new Set();
  return new Set(
    csv
      .split(',')
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !Number.isNaN(n))
  );
}

export function toSeatingRoomLayout(room: {
  roomId?: string;
  room?: {
    capacity?: number;
    benchesPerRow?: number;
    benchesPerColumn?: number;
    benchCapacity?: number;
    boardPosition?: string;
    entrancePosition?: string;
    disabledSeatNumbersCsv?: string;
    reservedSeatNumbersCsv?: string;
    accessibleSeatNumbersCsv?: string;
    aisleAfterColumnsCsv?: string;
  };
} | undefined, roomId: string, roomName: string): SeatingRoomLayout {
  const capacity = room?.room?.capacity ?? 0;
  const rows = room?.room?.benchesPerRow ?? 0;
  const columns = room?.room?.benchesPerColumn ?? 0;
  const benchCapacity = room?.room?.benchCapacity ?? 1;

  const disabledSeats = parseIntCsv(room?.room?.disabledSeatNumbersCsv);
  const reservedSeats = parseIntCsv(room?.room?.reservedSeatNumbersCsv);
  const accessibleSeats = parseIntCsv(room?.room?.accessibleSeatNumbersCsv);
  const aisleAfterColumns = [...parseIntCsv(room?.room?.aisleAfterColumnsCsv)];

  const seats: SeatingSeat[] = [];
  let seatNumber = 1;
  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < columns; c += 1) {
      for (let b = 0; b < benchCapacity; b += 1) {
        if (seats.length >= capacity) break;
        seats.push({
          seatId: seatId(roomId, seatNumber),
          seatNumber,
          row: r,
          column: c,
          isDisabled: disabledSeats.has(seatNumber),
          isReserved: reservedSeats.has(seatNumber),
          isAccessible: accessibleSeats.has(seatNumber),
        });
        seatNumber += 1;
      }
    }
  }

  return {
    roomId,
    roomName,
    capacity,
    rows,
    columns,
    benchCapacity,
    seats,
    boardPosition: room?.room?.boardPosition,
    entrancePosition: room?.room?.entrancePosition,
    aisleAfterColumns,
  };
}

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
          a.benchId && a.benchId !== '00000000-0000-0000-0000-000000000000'
            ? a.benchId
            : null,
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
