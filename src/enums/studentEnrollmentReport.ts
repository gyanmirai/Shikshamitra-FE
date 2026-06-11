export enum StudentEnrollmentReportTitle {
  ClassWiseStudentEnrollmentReport,
  StudentEnrollmentList,
  AadharVerificationReport,
  ContactInformationReport,
  ReligionWiseStudentReport,
  CasteCategoryWiseReport,
  PreviousSchoolRepot,
  PinCodeWiseStudentDistribution,
  AdmissionSourceReport,
  DateOfBirthReport,
  GenderWiseStudentDistributionReport,
  MonthlyAdmissionTrendReport,
  AcademicYearComparisonReport,
  GenericUdiseStudentExport,
  GujaratGsebStudentComplianceReport,
  AadhaarApaarExceptionReport,
  RteScholarshipCasteCertificateTrackingReport,
}

export const StudentEnrollmentReportTitleOptions = [
  {
    name: StudentEnrollmentReportTitle.ClassWiseStudentEnrollmentReport,
    label: 'Class Wise Student Enrollment Report',
  },
  { name: StudentEnrollmentReportTitle.StudentEnrollmentList, label: 'Student Enrollment List' },
  {
    name: StudentEnrollmentReportTitle.AadharVerificationReport,
    label: 'Aadhar Verification Report',
  },
  {
    name: StudentEnrollmentReportTitle.ContactInformationReport,
    label: 'Contact Information Report',
  },
  {
    name: StudentEnrollmentReportTitle.ReligionWiseStudentReport,
    label: 'Religion Wise Student Report',
  },
  {
    name: StudentEnrollmentReportTitle.CasteCategoryWiseReport,
    label: 'Caste Category Wise Report',
  },
  { name: StudentEnrollmentReportTitle.PreviousSchoolRepot, label: 'Previous School Repot' },
  {
    name: StudentEnrollmentReportTitle.PinCodeWiseStudentDistribution,
    label: 'PinCode Wise Student Distribution',
  },
  { name: StudentEnrollmentReportTitle.AdmissionSourceReport, label: 'Admission Source Report' },
  { name: StudentEnrollmentReportTitle.DateOfBirthReport, label: 'Date Of Birth Report' },
  {
    name: StudentEnrollmentReportTitle.GenderWiseStudentDistributionReport,
    label: 'Gender Wise Student Distribution Report',
  },
  {
    name: StudentEnrollmentReportTitle.MonthlyAdmissionTrendReport,
    label: 'Monthly Admission Trend Report',
  },
  {
    name: StudentEnrollmentReportTitle.AcademicYearComparisonReport,
    label: 'Academic Year Comparison eport',
  },
  {
    name: StudentEnrollmentReportTitle.GenericUdiseStudentExport,
    label: 'Generic UDISE+ Student Export',
  },
  {
    name: StudentEnrollmentReportTitle.GujaratGsebStudentComplianceReport,
    label: 'Gujarat/GSEB Student Compliance Report',
  },
  {
    name: StudentEnrollmentReportTitle.AadhaarApaarExceptionReport,
    label: 'Aadhaar/APAAR Exception Report',
  },
  {
    name: StudentEnrollmentReportTitle.RteScholarshipCasteCertificateTrackingReport,
    label: 'RTE/Scholarship/Caste Certificate Tracking Report',
  },
];
