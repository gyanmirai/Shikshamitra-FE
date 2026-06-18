export type RollNumberValidationRow = {
  studentId?: string | null;
  rollNo?: number | null;
};

export const buildRollNumberValidationErrors = (
  rows: RollNumberValidationRow[],
  totalStudents: number
): Record<string, string> => {
  const rollCounts = new Map<number, number>();

  rows.forEach((row) => {
    if (row.rollNo !== null && row.rollNo !== undefined) {
      rollCounts.set(row.rollNo, (rollCounts.get(row.rollNo) || 0) + 1);
    }
  });

  return rows.reduce<Record<string, string>>((errors, row) => {
    if (!row.studentId || row.rollNo === null || row.rollNo === undefined) {
      return errors;
    }

    if (row.rollNo <= 0) {
      errors[row.studentId] = 'Roll No. must be greater than zero.';
    } else if (row.rollNo > totalStudents) {
      errors[row.studentId] = `Roll No. cannot exceed total students (${totalStudents}).`;
    } else if ((rollCounts.get(row.rollNo) || 0) > 1) {
      errors[row.studentId] = 'Duplicate Roll No!';
    }

    return errors;
  }, {});
};

export const hasRollNumberValidationErrors = (errors: Record<string, string>) =>
  Object.values(errors).some(Boolean);
