type AssignmentRowIdentity = {
  classId: string;
  divisionId: string;
  assignmentStatus: string;
};

const getAssignmentRowKey = (row: AssignmentRowIdentity) =>
  `${row.classId}-${row.divisionId}`;

export const getPendingAssignmentRows = <TRow extends AssignmentRowIdentity>(
  rows: TRow[],
  locallyChangedRows: TRow[]
) => {
  const changedRowKeys = new Set(locallyChangedRows.map(getAssignmentRowKey));

  return rows.filter(
    (row) =>
      row.assignmentStatus === 'Changed' || changedRowKeys.has(getAssignmentRowKey(row))
  );
};
