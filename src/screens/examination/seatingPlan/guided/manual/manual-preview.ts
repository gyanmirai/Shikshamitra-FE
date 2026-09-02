import type { GuidedAllocationPreviewDto } from 'src/redux/academicAPI/ExaminationApi/ScheduleExamApi/seat-allocation-v2.types';

import type { SeatingStudent, SeatingAssignment, SeatingRoomLayout } from '../../types';

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
