export type GrNumberRow = {
  studentId?: string;
  studentName?: string;
  name?: string;
  grNo?: number | null;
  grNumber?: string | null;
};

export const hasAssignedGrNumber = (row: GrNumberRow) =>
  row.grNo != null || Boolean(row.grNumber?.trim());

export const getGrNumberChanges = (current: GrNumberRow[], original: GrNumberRow[]) =>
  current.flatMap((row) => {
    const previous = original.find((item) => item.studentId === row.studentId);
    if (!row.studentId || !previous || (previous.grNo ?? null) === (row.grNo ?? null)) return [];
    return [
      {
        studentId: row.studentId,
        studentName: row.studentName || row.name || 'Unknown',
        oldGrNo: previous.grNo ?? null,
        oldGrNumber: previous.grNumber || previous.grNo?.toString() || null,
        newGrNo: row.grNo ?? null,
        requiresReason: hasAssignedGrNumber(previous),
      },
    ];
  });

export const buildGrNumberUpdates = (
  changes: ReturnType<typeof getGrNumberChanges>,
  reasons: Record<string, string>
) =>
  changes.map((change) => ({
    studentId: change.studentId,
    grNo: change.newGrNo,
    ...(change.requiresReason ? { reason: reasons[change.studentId]?.trim() ?? '' } : {}),
  }));
