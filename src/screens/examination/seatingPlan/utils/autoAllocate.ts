import type {
  SeatingSeat,
  SeatingStudent,
  SeatingAssignment,
  SeatingRoomLayout,
  SeatingAllocationRules,
} from '../types';

export interface AutoAllocateResult {
  assignments: SeatingAssignment[];
  unallocatedStudentIds: string[];
}

function interleaveDivisions(students: SeatingStudent[]) {
  const buckets = new Map<string, SeatingStudent[]>();
  students.forEach((student) => {
    const key = student.divisionId ?? student.divisionName ?? 'default';
    buckets.set(key, [...(buckets.get(key) ?? []), student]);
  });

  const divisionBuckets = [...buckets.values()];
  const ordered: SeatingStudent[] = [];
  let hasStudent = true;
  while (hasStudent) {
    hasStudent = false;
    for (let index = 0; index < divisionBuckets.length; index += 1) {
      const bucket = divisionBuckets[index];
      const student = bucket.shift();
      if (student) {
        ordered.push(student);
        hasStudent = true;
      }
    }
  }
  return ordered;
}

function orderStudents(
  students: SeatingStudent[],
  strategy: SeatingAllocationRules['strategy'],
  mixDivisions: boolean
) {
  const list = [...students];
  let ordered: SeatingStudent[];
  switch (strategy) {
    case 'alphabetical':
      ordered = list.sort((a, b) => a.studentName.localeCompare(b.studentName));
      break;
    case 'random':
      ordered = list.sort(() => Math.random() - 0.5);
      break;
    case 'alternate-division':
    case 'alternate-class':
    case 'rank':
    case 'roll-number':
    default:
      ordered = list.sort((a, b) => a.rollNo - b.rollNo);
      break;
  }

  const shouldInterleave =
    mixDivisions || strategy === 'alternate-division' || strategy === 'alternate-class';
  return shouldInterleave ? interleaveDivisions(ordered) : ordered;
}

function orderSeats(seats: SeatingSeat[], fillDirection: SeatingAllocationRules['fillDirection']) {
  const list = [...seats];
  switch (fillDirection) {
    case 'back-to-front':
      return list.sort((a, b) => b.row - a.row || a.column - b.column);
    case 'column-wise':
      return list.sort((a, b) => a.column - b.column || a.row - b.row);
    case 'aisle-wise':
    case 'row-wise':
      return list.sort((a, b) => a.row - b.row || a.column - b.column);
    case 'front-to-back':
    default:
      return list.sort((a, b) => a.row - b.row || a.column - b.column);
  }
}

/**
 * Client-side auto-allocation adapter (spec §12). Runs entirely in the browser against
 * the currently-loaded rooms so the workspace is usable before the backend
 * SeatingAutoAllocationService (Phase 3 BE) exists. Proposals are never persisted here —
 * callers must explicitly "apply" the result into the draft, matching the spec's
 * preview-before-apply requirement (§12.3).
 */
export function autoAllocate(
  students: SeatingStudent[],
  rooms: SeatingRoomLayout[],
  existingAssignments: SeatingAssignment[],
  rules: SeatingAllocationRules,
  excludedStudentIds: string[]
): AutoAllocateResult {
  const seatMap = new Map<string, SeatingSeat>();
  rooms.forEach((r) => r.seats.forEach((s) => seatMap.set(s.seatId, s)));

  const studentIdSet = new Set(students.map((s) => s.studentId));

  // Preserve assignments belonging to other exams or students from other divisions sharing the room.
  // Re-allocate students in the current batch so new rules/directions override previous positions.
  const preservedExistingAssignments = existingAssignments.filter((a) => {
    if (a.isExternalExamOccupied) return true;
    if (!studentIdSet.has(a.studentId)) return true;
    return false;
  });

  const validPreservedAssignments = preservedExistingAssignments.filter((a) => {
    const seat = seatMap.get(a.seatId);
    return seat && !seat.isDisabled && !seat.isReserved;
  });

  const eligible = students.filter((s) => !excludedStudentIds.includes(s.studentId));
  const orderedStudents = orderStudents([...eligible], rules.strategy, rules.mixDivisions);

  // Special-requirement students get first pick of accessible/front-row seats when priority is set.
  const priorityStudents = rules.specialRequirementPriority
    ? orderedStudents.filter((s) => s.hasSpecialRequirement)
    : [];
  const regularStudents = rules.specialRequirementPriority
    ? orderedStudents.filter((s) => !s.hasSpecialRequirement)
    : orderedStudents;

  const occupiedSeatIds = new Set(validPreservedAssignments.map((a) => a.seatId));
  const newAssignments: SeatingAssignment[] = [];
  const unallocatedStudentIds: string[] = [];

  rooms.forEach((room) => {
    const seatQueue = orderSeats(
      room.seats.filter((s) => !s.isDisabled && !s.isReserved && !occupiedSeatIds.has(s.seatId)),
      rules.fillDirection
    );

    const takeSeat = (predicate?: (s: SeatingSeat) => boolean) => {
      const idx = seatQueue.findIndex((s) => (predicate ? predicate(s) : true));
      if (idx === -1) return undefined;
      const [seat] = seatQueue.splice(idx, 1);
      return seat;
    };

    while (priorityStudents.length > 0) {
      const seat = takeSeat((s) => s.isAccessible || s.row === 0) ?? takeSeat();
      if (!seat) break;
      const student = priorityStudents.shift()!;
      occupiedSeatIds.add(seat.seatId);
      newAssignments.push({
        studentId: student.studentId,
        roomId: room.roomId,
        seatId: seat.seatId,
        seatNumber: seat.seatNumber,
        benchId: seat.benchId,
        assignedBy: 'auto',
      });
    }

    while (regularStudents.length > 0) {
      const seat = takeSeat();
      if (rules.leaveGap && seat) {
        // Skip immediate neighbour on the same row/bench to leave one empty seat between students.
        takeSeat((s) => s.row === seat!.row && Math.abs(s.column - seat!.column) === 1);
      }
      if (!seat) break;
      const student = regularStudents.shift()!;
      occupiedSeatIds.add(seat.seatId);
      newAssignments.push({
        studentId: student.studentId,
        roomId: room.roomId,
        seatId: seat.seatId,
        seatNumber: seat.seatNumber,
        benchId: seat.benchId,
        assignedBy: 'auto',
      });
    }
  });

  const allocatedIds = new Set(newAssignments.map((a) => a.studentId));
  [...priorityStudents, ...regularStudents].forEach((s) => {
    if (!allocatedIds.has(s.studentId)) unallocatedStudentIds.push(s.studentId);
  });

  return { assignments: [...validPreservedAssignments, ...newAssignments], unallocatedStudentIds };
}
