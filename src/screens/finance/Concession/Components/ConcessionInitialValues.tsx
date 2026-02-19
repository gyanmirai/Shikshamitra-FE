export const getInitialConcessionFormData = () => ({
  // Step 1
  id: '',
  boardId: '',
  mediumId: '',
  standardId: '',
  divisionId: '',
  studentId: '',
  studentName: '',
  // Step 2
  concessionTypeIds: [] as string[],
  // Step 3 – map: concessionTypeId → feeHeadId[]
  selectedFeeHeads: {} as Record<string, string[]>,
  // Step 4 – map: concessionTypeId → { feeHeadId → { basedOn, amount } }
  valueEntries: {} as Record<string, Record<string, { basedOn: 0 | 1; amount: number }>>,
});
