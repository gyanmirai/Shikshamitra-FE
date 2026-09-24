import type { GuidedAllocationPreviewDto } from 'src/redux/academicAPI/ExaminationApi/ScheduleExamApi/seat-allocation-v2.types';

import { seatId } from '../../hooks/useSeatingDraft';

import type { SeatingStudent, SeatingAssignment, SeatingRoomLayout } from '../../types';

export function restoreManualPreviewAssignments(
  savedAssignments: SeatingAssignment[],
  preview: GuidedAllocationPreviewDto | undefined,
  selectedRoomIds: string[]
): SeatingAssignment[] {
  if (!preview) return savedAssignments;

  const protectedAssignments = savedAssignments.filter(
    (assignment) => assignment.isExternalExamOccupied
  );
  const protectedStudentIds = new Set(
    protectedAssignments.map((assignment) => assignment.studentId)
  );
  const protectedSeatIds = new Set(protectedAssignments.map((assignment) => assignment.seatId));
  const selectedRooms = new Set(selectedRoomIds);

  const inProgressAssignments = preview.assignments
    .filter((assignment) => selectedRooms.has(assignment.roomId))
    .map(
      (assignment): SeatingAssignment => ({
        studentId: assignment.studentId,
        roomId: assignment.roomId,
        seatId: seatId(assignment.roomId, assignment.seatNumber),
        seatNumber: assignment.seatNumber,
        benchId: assignment.benchId,
        assignedBy: 'manual',
      })
    )
    .filter(
      (assignment) =>
        !protectedStudentIds.has(assignment.studentId) &&
        !protectedSeatIds.has(assignment.seatId)
    );

  return [...protectedAssignments, ...inProgressAssignments];
}

export function buildGuidedManualPreview(
  students: SeatingStudent[],
  rooms: SeatingRoomLayout[],
  assignments: SeatingAssignment[]
): GuidedAllocationPreviewDto {
  const eligibleStudents = students.filter((student) => !student.isExternalExamOccupied);
  const eligibleById = new Map(eligibleStudents.map((student) => [student.studentId, student]));
  const roomById = new Map(rooms.map((room) => [room.roomId, room]));
  const internalAssignments = assignments.filter(
    (assignment) =>
      !assignment.isExternalExamOccupied && eligibleById.has(assignment.studentId)
  );
  const assignedStudentIds = new Set(internalAssignments.map((assignment) => assignment.studentId));
  const usableSeats = rooms.reduce(
    (total, room) =>
      total + room.seats.filter((seat) => !seat.isDisabled && !seat.isReserved).length,
    0
  );

  return {
    assignments: internalAssignments.map((assignment) => {
      const student = eligibleById.get(assignment.studentId);
      return {
        studentId: assignment.studentId,
        studentName: student?.studentName,
        rollNo: student?.rollNo,
        divisionId: student?.divisionId,
        divisionName: student?.divisionName,
        roomId: assignment.roomId,
        roomName: roomById.get(assignment.roomId)?.roomName,
        seatNumber: assignment.seatNumber,
        benchId: assignment.benchId,
      };
    }),
    unallocatedStudentIds: eligibleStudents
      .filter((student) => !assignedStudentIds.has(student.studentId))
      .map((student) => student.studentId),
    totalStudents: eligibleStudents.length,
    roomsUsed: new Set(internalAssignments.map((assignment) => assignment.roomId)).size,
    emptySeats: Math.max(0, usableSeats - internalAssignments.length),
    utilizationPercent:
      usableSeats === 0 ? 0 : Math.round((internalAssignments.length / usableSeats) * 100),
  };
}
