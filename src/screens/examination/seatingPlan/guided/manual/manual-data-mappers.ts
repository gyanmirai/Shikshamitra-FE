import type { SeatingPlanGroupDto } from 'src/redux/academicAPI/ExaminationApi/ScheduleExamApi/seat-allocation-v2.types';

import { seatId } from '../../hooks/useSeatingDraft';
import { toSeatingRoomLayout } from '../../utils/mappers';

import type { SeatingStudent } from '../../types';
import type {
  GuidedManualEditorData,
  ManualLayoutResponseDto,
  ManualStudentResponseDto,
} from './manual-editor-types';

interface MappingOptions {
  showPlanContext?: boolean;
}

function isProtectedOccupancy(item: {
  isExternalExamOccupied?: boolean;
  isOtherPlanOccupied?: boolean;
}) {
  return Boolean(item.isExternalExamOccupied || item.isOtherPlanOccupied);
}

function allocationContext(item: { seatingPlanName?: string | null; subjectNames?: string[] }) {
  const subjects = item.subjectNames?.filter(Boolean).join(', ');
  if (subjects && item.seatingPlanName) return `${subjects} · ${item.seatingPlanName}`;
  return item.seatingPlanName ?? subjects;
}

export function mapGuidedManualEditorData(
  plan: SeatingPlanGroupDto,
  studentResponses: ManualStudentResponseDto[],
  layoutResponses: ManualLayoutResponseDto[],
  options: MappingOptions = {}
): GuidedManualEditorData {
  const studentMap = new Map<string, SeatingStudent>(
    studentResponses.flatMap((response, index) => {
      const division = plan.divisions[index];
      return response.items.map(
        (student) =>
          [
            student.studentId,
            {
              studentId: student.studentId,
              studentName: student.studentName,
              rollNo: student.rollNo,
              standardName: student.standardName,
              divisionId: division?.id,
              divisionName: division?.name,
            },
          ] as const
      );
    })
  );

  const rooms = layoutResponses.map((layout) => {
    const roomId = layout.roomId ?? '';
    const roomName = plan.availableRooms.find((room) => room.roomId === roomId)?.roomName ?? roomId;
    return toSeatingRoomLayout(layout, roomId, roomName);
  });
  const assignments = layoutResponses.flatMap((layout) =>
    (layout.items ?? [])
      .filter((item) => item.studentId)
      .map((item) => ({
        studentId: item.studentId as string,
        roomId: layout.roomId ?? '',
        seatId: seatId(layout.roomId ?? '', item.seatNumber),
        seatNumber: item.seatNumber,
        benchId: item.benchId,
        assignedBy: 'manual' as const,
        isExternalExamOccupied: isProtectedOccupancy(item),
      }))
  );

  layoutResponses.forEach((layout) => {
    (layout.items ?? []).forEach((item) => {
      if (!item.studentId) return;
      const protectedOccupancy = isProtectedOccupancy(item);
      const context = allocationContext(item);
      const existingStudent = studentMap.get(item.studentId);
      if (existingStudent) {
        studentMap.set(item.studentId, {
          ...existingStudent,
          divisionName:
            (options.showPlanContext || protectedOccupancy) && context
              ? context
              : existingStudent.divisionName,
          isExternalExamOccupied: existingStudent.isExternalExamOccupied || protectedOccupancy,
        });
        return;
      }
      studentMap.set(item.studentId, {
        studentId: item.studentId,
        studentName: item.studentName ?? 'Blocked seat',
        rollNo: item.rollNo ?? 0,
        standardName: item.standardName,
        divisionName: context,
        isExternalExamOccupied: protectedOccupancy,
      });
    });
  });

  return { students: [...studentMap.values()], rooms, assignments };
}
