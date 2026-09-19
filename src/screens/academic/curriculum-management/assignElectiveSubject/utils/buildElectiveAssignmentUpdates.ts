import type { StudentElectiveRow } from '../types';

export const buildElectiveAssignmentUpdates = (
  students: Pick<StudentElectiveRow, 'studentId'>[],
  studentSelections: Record<string, string>
) =>
  students.map(({ studentId }) => ({
    studentId,
    selectedSubjectId: studentSelections[studentId] ?? null,
  }));
