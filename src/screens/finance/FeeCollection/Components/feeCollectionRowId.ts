export function feeCollectionRowId(row: {
  studentId?: string | null;
  financeFeeAccountId?: string | null;
  id?: string | number;
}): string | number | undefined {
  return row.financeFeeAccountId ?? row.studentId ?? row.id;
}
