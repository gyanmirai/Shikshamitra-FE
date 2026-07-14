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

function orderStudents(students: SeatingStudent[], strategy: SeatingAllocationRules['strategy']) {
  const list = [...students];
  switch (strategy) {
    case 'alphabetical':
      return list.sort((a, b) => a.studentName.localeCompare(b.studentName));
    case 'random':
      return list.sort(() => Math.random() - 0.5);
    case 'alternate-division':
    case 'alternate-class': {
      const buckets = new Map<string, SeatingStudent[]>();
      list.forEach((s) => {
        const key = s.divisionId ?? s.divisionName ?? 'default';
        buckets.set(key, [...(buckets.get(key) ?? []), s]);
      });
      const keys = [...buckets.keys()];
      const ordered: SeatingStudent[] = [];
      let index = 0;
      while (ordered.length < list.length) {
        const key = keys[index % keys.length];
        const bucket = buckets.get(key)!;
        if (bucket.length > 0) ordered.push(bucket.shift()!);
        index += 1;
        if (keys.every((k) => (buckets.get(k)?.length ?? 0) === 0)) break;
      }
      return ordered;
    }
    case 'rank':
    case 'roll-number':
    default:
      return list.sort((a, b) => a.rollNo - b.rollNo);
  }
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
  const eligible = students.filter((s) => !excludedStudentIds.includes(s.studentId));
  const alreadyAssigned = new Set(existingAssignments.map((a) => a.studentId));
  const pending = eligible.filter((s) => !alreadyAssigned.has(s.studentId));

  const orderedStudents = orderStudents(pending, rules.strategy);

  // Special-requirement students get first pick of accessible/front-row seats when priority is set.
  const priorityStudents = rules.specialRequirementPriority
    ? orderedStudents.filter((s) => s.hasSpecialRequirement)
    : [];
  const regularStudents = rules.specialRequirementPriority
    ? orderedStudents.filter((s) => !s.hasSpecialRequirement)
    : orderedStudents;

  const occupiedSeatIds = new Set(existingAssignments.map((a) => a.seatId));
  const newAssignments: SeatingAssignment[] = [];
  const unallocatedStudentIds: string[] = [];

  rooms.forEach((room) => {
    const seatQueue = orderSeats(
      room.seats.filter((s) => !s.isDisabled && !occupiedSeatIds.has(s.seatId)),
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

  return { assignments: [...existingAssignments, ...newAssignments], unallocatedStudentIds };
}
