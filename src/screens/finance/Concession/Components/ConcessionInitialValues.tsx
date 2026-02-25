export const getInitialConcessionFormData = () => ({
  // Step 1
  id: '',
  boardId: '',
  boardName: '',
  mediumId: '',
  mediumName: '',
  standardId: '',
  standardName: '',
  divisionId: '',
  divisionName: '',
  studentId: '',
  studentName: '',
  selectedStudent: null,
  // Step 2
  concessionTypeIds: [] as string[],
  // Step 2 response – stores { concessionTypeId, ConcessionRequestConcessionTypeId, name }[]
  selectedConcessionTypes: [] as Array<{
    concessionTypeId: string;
    ConcessionRequestConcessionTypeId: string;
    name: string;
  }>,
  // Step 3 – map: concessionTypeId → feeHeadId[]
  selectedFeeHeads: {} as Record<string, string[]>,
  // Step 4 – map: concessionTypeId → { feeHeadId → { basedOn, amount } }
  valueEntries: {} as Record<string, Record<string, { basedOn: 0 | 1; amount: number }>>,
});
