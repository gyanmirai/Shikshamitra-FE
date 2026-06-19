export enum StudentRecordsReportTitle {
  // ── Student Lists ─────────────────────────────────────────────────────────
  AddressLabelReport,
  StudentContactList,
  StudentDetailInformationForm,
  StudentListDivisionWiseSerialNo,
  StudentListIDNoWise,
  StudentRegister,
  StudentRegisterWithAddress,
  NewStudentAdmissionReport,

  // ── Birthday & Dates ──────────────────────────────────────────────────────
  AllBirthdayWishListReport,
  LeftStudentList,

  // ── Summaries ─────────────────────────────────────────────────────────────
  StudentStrengthDivisionWiseSummary,
  AgeWiseSummary,
  AgewiseList,
  GenderwiseStudentStrengthSummary,
  GenderwiseSummary,
  AdmissionCategorywiseList,
  VerifyStudentData,

  // ── Demographics ──────────────────────────────────────────────────────────
  ReligionWiseReport,
  CasteCategoryWiseReport,
  BloodGroupWiseReport,
  MotherTongueWiseReport,

  // ── Compliance ────────────────────────────────────────────────────────────
  GenericUdiseStudentExport,
  GujaratGsebStudentComplianceReport,
  AadhaarApaarExceptionReport,
  RteScholarshipCasteCertificateTrackingReport,

  // ── Attendance ────────────────────────────────────────────────────────────
  DailyStrengthGenderWiseSummary,
  DailyStrengthAttendanceSummary,
  MonthlyAttendanceSummary,
  MonthlyAttendanceRegister,
  MonthlyStrengthSummary,
  StudentAbsentDaysReport,
  AbsentDaysReportDateRange,
  MonthlyStrengthReportDateRange,
}

// ─── Category identifiers (match CommonReport category IDs) ──────────────────

export const StudentRecordsReportCategory = {
  StudentLists: 'Student Lists',
  BirthdayAndDates: 'Birthday & Dates',
  Summaries: 'Summaries',
  Demographics: 'Demographics',
  Compliance: 'Compliance',
  Attendance: 'Attendance',
} as const;

// ─── API type-string map ──────────────────────────────────────────────────────
/**
 * Maps each StudentRecordsReportTitle enum value to the API `reportType`
 * string that the backend Student Report API expects.
 */
export const StudentRecordsReportApiTypeMap: Record<StudentRecordsReportTitle, string> = {
  // Student Lists
  [StudentRecordsReportTitle.AddressLabelReport]: 'Address Label Report',
  [StudentRecordsReportTitle.StudentContactList]: 'Student Contact List',
  [StudentRecordsReportTitle.StudentDetailInformationForm]: 'Student Detail Information Form',
  [StudentRecordsReportTitle.StudentListDivisionWiseSerialNo]:
    'Student List - Division Wise Serial No',
  [StudentRecordsReportTitle.StudentListIDNoWise]: 'Student List - ID No Wise',
  [StudentRecordsReportTitle.StudentRegister]: 'Student Register',
  [StudentRecordsReportTitle.StudentRegisterWithAddress]: 'Student Register With Address',
  [StudentRecordsReportTitle.NewStudentAdmissionReport]: 'New Student Admission Report',

  // Birthday & Dates
  [StudentRecordsReportTitle.AllBirthdayWishListReport]: 'All Birthday Wish List Report',
  [StudentRecordsReportTitle.LeftStudentList]: 'Left Student List',

  // Summaries
  [StudentRecordsReportTitle.StudentStrengthDivisionWiseSummary]:
    'Student Strength Division Wise Summary',
  [StudentRecordsReportTitle.AgeWiseSummary]: 'Age Wise Summary',
  [StudentRecordsReportTitle.AgewiseList]: 'Age Wise List',
  [StudentRecordsReportTitle.GenderwiseStudentStrengthSummary]:
    'Genderwise Student Strength Summary',
  [StudentRecordsReportTitle.GenderwiseSummary]: 'Genderwise Summary',
  [StudentRecordsReportTitle.AdmissionCategorywiseList]: 'Admission Categorywise List',
  [StudentRecordsReportTitle.VerifyStudentData]: 'Verify Student Data',

  // Demographics
  [StudentRecordsReportTitle.ReligionWiseReport]: 'Religion Wise Report',
  [StudentRecordsReportTitle.CasteCategoryWiseReport]: 'Caste Category Wise Report',
  [StudentRecordsReportTitle.BloodGroupWiseReport]: 'Blood Group Wise Report',
  [StudentRecordsReportTitle.MotherTongueWiseReport]: 'Mother Tongue Wise Report',

  // Compliance
  [StudentRecordsReportTitle.GenericUdiseStudentExport]: 'Generic UDISE+ Student Export',
  [StudentRecordsReportTitle.GujaratGsebStudentComplianceReport]:
    'Gujarat/GSEB Student Compliance Report',
  [StudentRecordsReportTitle.AadhaarApaarExceptionReport]: 'Aadhaar/APAAR Exception Report',
  [StudentRecordsReportTitle.RteScholarshipCasteCertificateTrackingReport]:
    'RTE/Scholarship/Caste Certificate Tracking Report',

  // Attendance
  [StudentRecordsReportTitle.DailyStrengthGenderWiseSummary]: 'Daily Strength & Gender Summary',
  [StudentRecordsReportTitle.DailyStrengthAttendanceSummary]: 'Daily Strength & Attendance',
  [StudentRecordsReportTitle.MonthlyAttendanceSummary]: 'Monthly Attendance Summary',
  [StudentRecordsReportTitle.MonthlyAttendanceRegister]: 'Monthly Attendance Register',
  [StudentRecordsReportTitle.MonthlyStrengthSummary]: 'Monthly Strength Report',
  [StudentRecordsReportTitle.StudentAbsentDaysReport]: 'Student Absent Days Report',
  [StudentRecordsReportTitle.AbsentDaysReportDateRange]: 'Absent Days Report (Date Range)',
  [StudentRecordsReportTitle.MonthlyStrengthReportDateRange]:
    'Monthly Strength Report (Date Range)',
};

// ─── Ordered options list ─────────────────────────────────────────────────────
/**
 * Ordered list of { name, label } used to look up the human-readable title
 * for a given StudentRecordsReportTitle enum value.
 */
export const StudentRecordsReportTitleOptions: {
  name: StudentRecordsReportTitle;
  label: string;
}[] = [
  // Student Lists
  { name: StudentRecordsReportTitle.AddressLabelReport, label: 'Address Label Report' },
  { name: StudentRecordsReportTitle.StudentContactList, label: 'Student Contact List' },
  {
    name: StudentRecordsReportTitle.StudentDetailInformationForm,
    label: 'Student Detail Information Form',
  },
  {
    name: StudentRecordsReportTitle.StudentListDivisionWiseSerialNo,
    label: 'Student List – Division Wise Serial No',
  },
  { name: StudentRecordsReportTitle.StudentListIDNoWise, label: 'Student List – ID No Wise' },
  { name: StudentRecordsReportTitle.StudentRegister, label: 'Student Register' },
  {
    name: StudentRecordsReportTitle.StudentRegisterWithAddress,
    label: 'Student Register With Address',
  },
  {
    name: StudentRecordsReportTitle.NewStudentAdmissionReport,
    label: 'New Student Admission Report',
  },

  // Birthday & Dates
  {
    name: StudentRecordsReportTitle.AllBirthdayWishListReport,
    label: 'All Birthday Wish List Report',
  },
  { name: StudentRecordsReportTitle.LeftStudentList, label: 'Left Student List' },

  // Summaries
  {
    name: StudentRecordsReportTitle.StudentStrengthDivisionWiseSummary,
    label: 'Student Strength Division Wise Summary',
  },
  { name: StudentRecordsReportTitle.AgeWiseSummary, label: 'Age Wise Summary' },
  { name: StudentRecordsReportTitle.AgewiseList, label: 'Age Wise List' },
  {
    name: StudentRecordsReportTitle.GenderwiseStudentStrengthSummary,
    label: 'Genderwise Student Strength Summary',
  },
  { name: StudentRecordsReportTitle.GenderwiseSummary, label: 'Genderwise Summary' },
  {
    name: StudentRecordsReportTitle.AdmissionCategorywiseList,
    label: 'Admission Categorywise List',
  },
  { name: StudentRecordsReportTitle.VerifyStudentData, label: 'Verify Student Data' },

  // Demographics
  { name: StudentRecordsReportTitle.ReligionWiseReport, label: 'Religion Wise Report' },
  {
    name: StudentRecordsReportTitle.CasteCategoryWiseReport,
    label: 'Caste Category Wise Report',
  },
  { name: StudentRecordsReportTitle.BloodGroupWiseReport, label: 'Blood Group Wise Report' },
  { name: StudentRecordsReportTitle.MotherTongueWiseReport, label: 'Mother Tongue Wise Report' },

  // Compliance
  {
    name: StudentRecordsReportTitle.GenericUdiseStudentExport,
    label: 'Generic UDISE+ Student Export',
  },
  {
    name: StudentRecordsReportTitle.GujaratGsebStudentComplianceReport,
    label: 'Gujarat/GSEB Student Compliance Report',
  },
  {
    name: StudentRecordsReportTitle.AadhaarApaarExceptionReport,
    label: 'Aadhaar/APAAR Exception Report',
  },
  {
    name: StudentRecordsReportTitle.RteScholarshipCasteCertificateTrackingReport,
    label: 'RTE/Scholarship/Caste Certificate Tracking Report',
  },

  // Attendance
  {
    name: StudentRecordsReportTitle.DailyStrengthGenderWiseSummary,
    label: 'Daily Strength & Gender Summary',
  },
  {
    name: StudentRecordsReportTitle.DailyStrengthAttendanceSummary,
    label: 'Daily Strength & Attendance',
  },
  {
    name: StudentRecordsReportTitle.MonthlyAttendanceSummary,
    label: 'Monthly Attendance Summary',
  },
  {
    name: StudentRecordsReportTitle.MonthlyAttendanceRegister,
    label: 'Monthly Attendance Register',
  },
  {
    name: StudentRecordsReportTitle.MonthlyStrengthSummary,
    label: 'Monthly Strength Report',
  },
  {
    name: StudentRecordsReportTitle.StudentAbsentDaysReport,
    label: 'Student Absent Days Report',
  },
  {
    name: StudentRecordsReportTitle.AbsentDaysReportDateRange,
    label: 'Absent Days Report (Date Range)',
  },
  {
    name: StudentRecordsReportTitle.MonthlyStrengthReportDateRange,
    label: 'Monthly Strength Report (Date Range)',
  },
];
