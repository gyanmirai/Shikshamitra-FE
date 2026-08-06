import type { SeatingPlanDraft, SeatingValidationIssue } from '../types';

/**
 * Client-side validation adapter (spec §16). Runs the same blocker/warning checks the
 * backend SeatingValidationService will eventually run server-side (Phase 2 BE) — kept
 * here as an adapter so the workspace UI is fully functional before that endpoint exists,
 * per the "keep advanced unavailable features behind adapters" migration principle.
 */
export function validateSeatingDraft(draft: SeatingPlanDraft): {
  blockers: SeatingValidationIssue[];
  warnings: SeatingValidationIssue[];
} {
  const blockers: SeatingValidationIssue[] = [];
  const warnings: SeatingValidationIssue[] = [];

  // Duplicate assignment: one student in more than one seat.
  const byStudent = new Map<string, number>();
  draft.assignments.forEach((a) => byStudent.set(a.studentId, (byStudent.get(a.studentId) ?? 0) + 1));
  byStudent.forEach((count, studentId) => {
    if (count > 1) {
      blockers.push({
        code: 'STUDENT_DUPLICATE_ASSIGNMENT',
        message: 'A student is assigned more than once.',
        studentId,
      });
    }
  });

  // Two students on the same seat.
  const bySeat = new Map<string, string[]>();
  draft.assignments.forEach((a) => {
    bySeat.set(a.seatId, [...(bySeat.get(a.seatId) ?? []), a.studentId]);
  });
  bySeat.forEach((studentIds, seatId) => {
    if (studentIds.length > 1) {
      blockers.push({
        code: 'SEAT_DOUBLE_BOOKED',
        message: 'Two students are assigned to the same seat.',
        seatId,
      });
    }
  });

  // Assigned seat does not exist in the room layout.
  const validSeatIds = new Set(draft.rooms.flatMap((r) => r.seats.map((s) => s.seatId)));
  draft.assignments.forEach((a) => {
    if (!validSeatIds.has(a.seatId)) {
      blockers.push({
        code: 'SEAT_NOT_FOUND',
        message: 'Assigned seat does not exist in the room layout.',
        studentId: a.studentId,
        seatId: a.seatId,
      });
    }
  });

  // Assigned seat is marked as reserved.
  draft.assignments.forEach((a) => {
    const room = draft.rooms.find((r) => r.roomId === a.roomId);
    const seat = room?.seats.find((s) => s.seatId === a.seatId);
    if (seat?.isReserved) {
      blockers.push({
        code: 'RESERVED_SEAT_OCCUPIED',
        message: `Seat #${seat.seatNumber} in ${room?.roomName ?? 'room'} is reserved and cannot be assigned to a student.`,
        studentId: a.studentId,
        seatId: a.seatId,
        roomId: a.roomId,
      });
    }
  });

  // Room capacity exceeded.
  draft.rooms.forEach((room) => {
    const occupied = draft.assignments.filter((a) => a.roomId === room.roomId).length;
    const usable = room.seats.filter((s) => !s.isDisabled).length || room.capacity;
    if (occupied > usable) {
      blockers.push({
        code: 'ROOM_CAPACITY_EXCEEDED',
        message: `Room ${room.roomName} has more students allocated than usable seats.`,
        roomId: room.roomId,
      });
    } else if (usable > 0 && occupied / usable < 0.4) {
      warnings.push({
        code: 'ROOM_LOW_UTILIZATION',
        message: `Room ${room.roomName} utilization is below 40%.`,
        roomId: room.roomId,
      });
    }
  });

  // Special requirement not satisfied (front seat expectation, row 0).
  const eligible = draft.students.filter((s) => !draft.excludedStudentIds.includes(s.studentId));
  eligible
    .filter((s) => s.hasSpecialRequirement)
    .forEach((s) => {
      const assignment = draft.assignments.find((a) => a.studentId === s.studentId);
      if (!assignment) return;
      const seat = draft.rooms
        .find((r) => r.roomId === assignment.roomId)
        ?.seats.find((s2) => s2.seatId === assignment.seatId);
      if (seat && seat.row > 0 && !seat.isAccessible) {
        warnings.push({
          code: 'SPECIAL_REQUIREMENT_NOT_SATISFIED',
          message: 'Special requirement is not satisfied for this student.',
          studentId: s.studentId,
        });
      }
    });

  return { blockers, warnings };
}
