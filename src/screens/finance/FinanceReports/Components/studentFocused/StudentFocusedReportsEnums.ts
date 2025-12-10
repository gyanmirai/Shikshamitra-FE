export enum StudentFocusedReportsTitle {
  ReceiptListNumberWise,
  StudentFeeHistory,
  StudentOptionalFeeList,
  FeeCertificateBasedOnStudentFee,
  FeeCertificateWithAllFeeDetails,
  ReceiptListStudentWise,
  FeeSummaryPayTypeWiseStudentFilter,
}

export const StudentFocusedReportsTitleOptions = [
  { label: 'Receipt List Number Wise', name: StudentFocusedReportsTitle.ReceiptListNumberWise },
  { label: 'Student Fee History', name: StudentFocusedReportsTitle.StudentFeeHistory },
  { label: 'Student Optional Fee List', name: StudentFocusedReportsTitle.StudentOptionalFeeList },
  {
    label: 'Fee Certificate Based On Student Fee',
    name: StudentFocusedReportsTitle.FeeCertificateBasedOnStudentFee,
  },
  {
    label: 'Fee Certificate With All Fee Details',
    name: StudentFocusedReportsTitle.FeeCertificateWithAllFeeDetails,
  },
  { label: 'Receipt List Student Wise', name: StudentFocusedReportsTitle.ReceiptListStudentWise },
  {
    label: 'Fee Summary Pay Type Wise (Student filter)',
    name: StudentFocusedReportsTitle.FeeSummaryPayTypeWiseStudentFilter,
  },
];
