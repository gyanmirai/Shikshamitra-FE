import type {
  SeatingPlanGroupDto,
  GuidedAllocationPreviewDto,
} from 'src/redux/academicAPI/ExaminationApi/ScheduleExamApi/seat-allocation-v2.types';

import { mapGuidedManualEditorData } from '../manual/manual-data-mappers';
import { restoreManualPreviewAssignments } from '../manual/manual-preview';

import type { ManualLayoutResponseDto } from '../manual/manual-editor-types';

export function mapClassroomPreview(
  plan: SeatingPlanGroupDto,
  layout: ManualLayoutResponseDto,
  preview: GuidedAllocationPreviewDto
) {
  const data = mapGuidedManualEditorData(plan, [], [layout]);
  const students = new Map(data.students.map((student) => [student.studentId, student]));
  preview.assignments.forEach((assignment) => {
    students.set(assignment.studentId, {
      studentId: assignment.studentId,
      studentName: assignment.studentName || `Student ${assignment.studentId.slice(0, 6)}`,
      rollNo: assignment.rollNo ?? 0,
      divisionId: assignment.divisionId ?? undefined,
      divisionName: assignment.divisionName ?? undefined,
    });
  });
  return {
    ...data,
    students: [...students.values()],
    assignments: restoreManualPreviewAssignments(data.assignments, preview, [
      layout.roomId ?? '',
    ]).map((assignment) => ({ ...assignment, assignedBy: 'auto' as const })),
  };
}
