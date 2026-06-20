export enum StudentReportTitle {
  // ── Student List ──────────────────────────────────────────────────────────
  StudentList,
  StudentDirectory,
  ClassWiseStudentList,
  ActiveStudentReport,
  InactiveStudentReport,

  // ── Demographics ──────────────────────────────────────────────────────────
  ReligionWiseReport,
  CasteCategoryWiseReport,
  GenderWiseDistributionReport,
  DateOfBirthReport,
  BloodGroupDistributionReport,
  PinCodeWiseDistributionReport,

  // ── Admission ─────────────────────────────────────────────────────────────
  AdmissionSourceReport,
  PreviousSchoolReport,
  MonthlyAdmissionTrendReport,
  AdmissionComparisonReport,
  ClassWiseAdmissionReport,

  // ── Verification ──────────────────────────────────────────────────────────
  AadhaarVerificationReport,
  ContactInformationReport,
  DocumentVerificationReport,
}

// ─── Category identifiers (match CommonReport category IDs) ──────────────────

export const StudentReportCategory = {
  StudentList: 'Student List',
  Demographics: 'Demographics',
  Admission: 'Admission',
  Verification: 'Verification',
} as const;

// ─── API type-string map ──────────────────────────────────────────────────────
/**
 * Maps each StudentReportTitle enum value to the API `reportType` string
 * that the backend Student Report API expects.
 */
export const StudentReportApiTypeMap: Record<StudentReportTitle, string> = {
  // Student List
  [StudentReportTitle.StudentList]: 'Student List',
  [StudentReportTitle.StudentDirectory]: 'Student Directory',
  [StudentReportTitle.ClassWiseStudentList]: 'Class-wise Student List',
  [StudentReportTitle.ActiveStudentReport]: 'Active Student Report',
  [StudentReportTitle.InactiveStudentReport]: 'Inactive Student Report',

  // Demographics
  [StudentReportTitle.ReligionWiseReport]: 'Religion Wise Report',
  [StudentReportTitle.CasteCategoryWiseReport]: 'Caste Category Wise Report',
  [StudentReportTitle.GenderWiseDistributionReport]: 'Gender Wise Distribution Report',
  [StudentReportTitle.DateOfBirthReport]: 'Date of Birth Report',
  [StudentReportTitle.BloodGroupDistributionReport]: 'Blood Group Distribution Report',
  [StudentReportTitle.PinCodeWiseDistributionReport]: 'Pin Code Wise Distribution Report',

  // Admission
  [StudentReportTitle.AdmissionSourceReport]: 'Admission Source Report',
  [StudentReportTitle.PreviousSchoolReport]: 'Previous School Report',
  [StudentReportTitle.MonthlyAdmissionTrendReport]: 'Monthly Admission Trend Report',
  [StudentReportTitle.AdmissionComparisonReport]: 'Admission Comparison Report',
  [StudentReportTitle.ClassWiseAdmissionReport]: 'Class-wise Admission Report',

  // Verification
  [StudentReportTitle.AadhaarVerificationReport]: 'Aadhaar Verification Report',
  [StudentReportTitle.ContactInformationReport]: 'Contact Information Report',
  [StudentReportTitle.DocumentVerificationReport]: 'Document Verification Report',
};

// ─── Ordered options list ─────────────────────────────────────────────────────
/**
 * Ordered list of { name, label, description, category } used to build the
 * CommonReport categories/subCategories for Student Reports.
 *
 * Category strings must match `StudentReportCategory` values.
 */
export const StudentReportTitleOptions: {
  name: StudentReportTitle;
  label: string;
  description: string;
  category: string;
}[] = [
  // ── Student List ───────────────────────────────────────────────────────────
  {
    name: StudentReportTitle.StudentList,
    label: 'Student List',
    description: 'View the complete list of enrolled students',
    category: StudentReportCategory.StudentList,
  },
  {
    name: StudentReportTitle.StudentDirectory,
    label: 'Student Directory',
    description: 'Browse student profiles with contact and class details',
    category: StudentReportCategory.StudentList,
  },
  {
    name: StudentReportTitle.ClassWiseStudentList,
    label: 'Class-wise Student List',
    description: 'View students grouped by class and division',
    category: StudentReportCategory.StudentList,
  },
  {
    name: StudentReportTitle.ActiveStudentReport,
    label: 'Active Student Report',
    description: 'List all currently active students',
    category: StudentReportCategory.StudentList,
  },
  {
    name: StudentReportTitle.InactiveStudentReport,
    label: 'Inactive Student Report',
    description: 'List students who are inactive, transferred, or withdrawn',
    category: StudentReportCategory.StudentList,
  },

  // ── Demographics ───────────────────────────────────────────────────────────
  {
    name: StudentReportTitle.ReligionWiseReport,
    label: 'Religion Wise Report',
    description: 'View student distribution by religion',
    category: StudentReportCategory.Demographics,
  },
  {
    name: StudentReportTitle.CasteCategoryWiseReport,
    label: 'Caste Category Wise Report',
    description: 'View student distribution by caste category',
    category: StudentReportCategory.Demographics,
  },
  {
    name: StudentReportTitle.GenderWiseDistributionReport,
    label: 'Gender Wise Distribution Report',
    description: 'View student distribution by gender',
    category: StudentReportCategory.Demographics,
  },
  {
    name: StudentReportTitle.DateOfBirthReport,
    label: 'Date of Birth Report',
    description: 'View student list by date of birth',
    category: StudentReportCategory.Demographics,
  },
  {
    name: StudentReportTitle.BloodGroupDistributionReport,
    label: 'Blood Group Distribution Report',
    description: 'View student distribution by blood group',
    category: StudentReportCategory.Demographics,
  },
  {
    name: StudentReportTitle.PinCodeWiseDistributionReport,
    label: 'Pin Code Wise Distribution Report',
    description: 'View student distribution by residential pin code',
    category: StudentReportCategory.Demographics,
  },

  // ── Admission ──────────────────────────────────────────────────────────────
  {
    name: StudentReportTitle.AdmissionSourceReport,
    label: 'Admission Source Report',
    description: 'Analyze admissions by the source through which students were referred',
    category: StudentReportCategory.Admission,
  },
  {
    name: StudentReportTitle.PreviousSchoolReport,
    label: 'Previous School Report',
    description: 'Analyze students based on their previous schools',
    category: StudentReportCategory.Admission,
  },
  {
    name: StudentReportTitle.MonthlyAdmissionTrendReport,
    label: 'Monthly Admission Trend Report',
    description: 'Track admission growth trends month over month',
    category: StudentReportCategory.Admission,
  },
  {
    name: StudentReportTitle.AdmissionComparisonReport,
    label: 'Admission Comparison Report',
    description: 'Compare admissions across classes and periods',
    category: StudentReportCategory.Admission,
  },
  {
    name: StudentReportTitle.ClassWiseAdmissionReport,
    label: 'Class-wise Admission Report',
    description: 'Analyze admissions broken down by class',
    category: StudentReportCategory.Admission,
  },

  // ── Verification ───────────────────────────────────────────────────────────
  {
    name: StudentReportTitle.AadhaarVerificationReport,
    label: 'Aadhaar Verification Report',
    description: 'Track Aadhaar verification status of students',
    category: StudentReportCategory.Verification,
  },
  {
    name: StudentReportTitle.ContactInformationReport,
    label: 'Contact Information Report',
    description: 'Review and validate student and parent contact information',
    category: StudentReportCategory.Verification,
  },
  {
    name: StudentReportTitle.DocumentVerificationReport,
    label: 'Document Verification Report',
    description: 'Track verification status of submitted admission documents',
    category: StudentReportCategory.Verification,
  },
];
