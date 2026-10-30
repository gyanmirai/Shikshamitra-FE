import type { StudentElectiveRow } from '../types';

export const buildElectiveAssignmentUpdates = (
  students: Pick<StudentElectiveRow, 'studentId' | 'isLocked'>[],
  studentSelections: Record<string, string>
) =>
  students
    .filter((student) => !student.isLocked)
    .map(({ studentId }) => ({
      studentId,
      selectedSubjectId: studentSelections[studentId] ?? null,
    }));
