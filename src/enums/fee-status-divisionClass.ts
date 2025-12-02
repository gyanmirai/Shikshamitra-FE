// ============================================================
// Fee STATUS – CLASS/DIVISION REPORTS (NEW ENUM)
// ============================================================
export enum FeeStatusClassDivReportsTitle {
  FeeStatusDivisionWise,
  FeeStatusReceiptBookWise,
  FeeStatusStudentWiseAsOnDate,
  FeeStatusStudentWise,
  FeeStatusClassDivisionWise,
  FeeStatusHeadwise,
  StudentCountStatus,
}

// ============================================================
//  OPTIONS (Use in Autocomplete)
// ============================================================
export const FeeStatusClassDivReportsTitleOptions = [
  {
    name: FeeStatusClassDivReportsTitle.FeeStatusDivisionWise,
    label: 'Fee Status – Division Wise',
  },
  {
    name: FeeStatusClassDivReportsTitle.FeeStatusReceiptBookWise,
    label: 'Fee Status – Receipt Book Wise',
  },
  {
    name: FeeStatusClassDivReportsTitle.FeeStatusStudentWiseAsOnDate,
    label: 'Fee Status – Student Wise As On Date',
  },
  {
    name: FeeStatusClassDivReportsTitle.FeeStatusStudentWise,
    label: 'Fee Status – Student Wise',
  },
  {
    name: FeeStatusClassDivReportsTitle.FeeStatusClassDivisionWise,
    label: 'Fee Status – Classwise / Division Wise',
  },
  {
    name: FeeStatusClassDivReportsTitle.FeeStatusHeadwise,
    label: 'Fee Status – Headwise',
  },
  {
    name: FeeStatusClassDivReportsTitle.StudentCountStatus,
    label: 'Student Count Status',
  },
];
