export enum StudentCentricReportsTitle {
  StudentWiseFeeDetail = 1,
  StudentCountStatus = 2,
  FeeStatusStudentwiseWithPaidDate = 3,
  FeeStatusStudentWiseDetails = 4,
  FeeStatusStudentWiseWithDiscount = 5,
  PendingFeeSlipWithDetails = 6,
  FeeStatusStudentWiseAsOnDate = 7,
}

export const StudentCentricReportsTitleOptions = [
  {
    name: StudentCentricReportsTitle.StudentWiseFeeDetail,
    label: 'Student Wise Fee Detail',
  },
  {
    name: StudentCentricReportsTitle.StudentCountStatus,
    label: 'Student Count Status',
  },
  {
    name: StudentCentricReportsTitle.FeeStatusStudentwiseWithPaidDate,
    label: 'Fee Status – Studentwise With Paid Date',
  },
  {
    name: StudentCentricReportsTitle.FeeStatusStudentWiseDetails,
    label: 'Fee Status Student Wise Details',
  },
  {
    name: StudentCentricReportsTitle.FeeStatusStudentWiseWithDiscount,
    label: 'Fee Status Student Wise With Discount',
  },
  {
    name: StudentCentricReportsTitle.PendingFeeSlipWithDetails,
    label: 'Pending Fee Slip With Details',
  },
  {
    name: StudentCentricReportsTitle.FeeStatusStudentWiseAsOnDate,
    label: 'Fee Status – Student Wise As On Date',
  },
];
