export enum AdmissionReportTitle {
  // Inquiry Reports
  InquirySummaryReport,
  InquirySourceAnalysisReport,

  // Registration Form Issued Reports
  RegistrationFormIssuedReport,
  UnusedRegistrationFormsReport,

  // Registration Reports
  RegistrationSummaryReport,
  RegistrationConversionReport,

  // Entrance Exam Reports
  EntranceExamAttendanceReport,
  EntranceExamResultReport,
  EntranceExamMeritList,

  // Admission Reports
  AdmissionSummaryReport,
  AdmissionStatusReport,
  InquiryToAdmissionConversionReport,

  // Demographic Reports
  ReligionWiseReport,
  CasteCategoryWiseReport,
  PinCodeWiseDistributionReport,
  DateOfBirthReport,
  GenderWiseDistributionReport,

  // Student & Admission Reports (Unified Form)
  PreviousSchoolReport,
  AdmissionSourceReport,
  MonthlyAdmissionTrendReport,
  AdmissionComparisonReport,
  ClassWiseAdmissionReport,

  // Student Verification & Contact Reports
  AadhaarVerificationReport,
  ContactInformationReport,
  DocumentVerificationReport,
}

/**
 * Maps each AdmissionReportTitle enum value to the API report-type string.
 */
export const AdmissionReportApiTypeMap: Record<AdmissionReportTitle, string> = {
  [AdmissionReportTitle.InquirySummaryReport]: 'Inquiry Summary Report',
  [AdmissionReportTitle.InquirySourceAnalysisReport]: 'Inquiry Source Analysis Report',
  [AdmissionReportTitle.RegistrationFormIssuedReport]: 'Registration Form Issued Report',
  [AdmissionReportTitle.UnusedRegistrationFormsReport]: 'Unused Registration Forms Report',
  [AdmissionReportTitle.RegistrationSummaryReport]: 'Registration Summary Report',
  [AdmissionReportTitle.RegistrationConversionReport]: 'Registration Conversion Report',
  [AdmissionReportTitle.EntranceExamAttendanceReport]: 'Entrance Exam Attendance Report',
  [AdmissionReportTitle.EntranceExamResultReport]: 'Entrance Exam Result Report',
  [AdmissionReportTitle.EntranceExamMeritList]: 'Entrance Exam Merit List',
  [AdmissionReportTitle.AdmissionSummaryReport]: 'Admission Summary Report',
  [AdmissionReportTitle.AdmissionStatusReport]: 'Admission Status Report',
  [AdmissionReportTitle.InquiryToAdmissionConversionReport]:
    'Inquiry-to-Admission Conversion Report',
  [AdmissionReportTitle.ReligionWiseReport]: 'Religion Wise Report',
  [AdmissionReportTitle.CasteCategoryWiseReport]: 'Caste Category Wise Report',
  [AdmissionReportTitle.PinCodeWiseDistributionReport]: 'Pin Code Wise Distribution',
  [AdmissionReportTitle.DateOfBirthReport]: 'Date of Birth Report',
  [AdmissionReportTitle.GenderWiseDistributionReport]: 'Gender Wise Distribution',
  [AdmissionReportTitle.PreviousSchoolReport]: 'Previous School Report',
  [AdmissionReportTitle.AdmissionSourceReport]: 'Admission Source Report',
  [AdmissionReportTitle.MonthlyAdmissionTrendReport]: 'Monthly Admission Trend Report',
  [AdmissionReportTitle.AdmissionComparisonReport]: 'Admission Comparison Report',
  [AdmissionReportTitle.ClassWiseAdmissionReport]: 'Class-wise Admission Report',
  [AdmissionReportTitle.AadhaarVerificationReport]: 'Aadhaar Verification Report',
  [AdmissionReportTitle.ContactInformationReport]: 'Contact Information Report',
  [AdmissionReportTitle.DocumentVerificationReport]: 'Document Verification Report',
};

/**
 * Ordered list of { name, label, category } used to build the CommonReport
 * categories/subCategories. Category strings must match the category IDs
 * defined in AdmissionReports.tsx.
 */
export const AdmissionReportTitleOptions: {
  name: AdmissionReportTitle;
  label: string;
  category: string;
}[] = [
  // ── Inquiry Reports ──────────────────────────────────────────────────────
  {
    name: AdmissionReportTitle.InquirySummaryReport,
    label: 'Inquiry Summary Report',
    category: 'InquiryReports',
  },
  {
    name: AdmissionReportTitle.InquirySourceAnalysisReport,
    label: 'Inquiry Source Analysis Report',
    category: 'InquiryReports',
  },

  // ── Registration Form Issued Reports ─────────────────────────────────────
  {
    name: AdmissionReportTitle.RegistrationFormIssuedReport,
    label: 'Registration Form Issued Report',
    category: 'RegistrationFormIssuedReports',
  },
  {
    name: AdmissionReportTitle.UnusedRegistrationFormsReport,
    label: 'Unused Registration Forms Report',
    category: 'RegistrationFormIssuedReports',
  },

  // ── Registration Reports ──────────────────────────────────────────────────
  {
    name: AdmissionReportTitle.RegistrationSummaryReport,
    label: 'Registration Summary Report',
    category: 'RegistrationReports',
  },
  {
    name: AdmissionReportTitle.RegistrationConversionReport,
    label: 'Registration Conversion Report',
    category: 'RegistrationReports',
  },

  // ── Entrance Exam Reports ─────────────────────────────────────────────────
  {
    name: AdmissionReportTitle.EntranceExamAttendanceReport,
    label: 'Entrance Exam Attendance Report',
    category: 'EntranceExamReports',
  },
  {
    name: AdmissionReportTitle.EntranceExamResultReport,
    label: 'Entrance Exam Result Report',
    category: 'EntranceExamReports',
  },
  {
    name: AdmissionReportTitle.EntranceExamMeritList,
    label: 'Entrance Exam Merit List',
    category: 'EntranceExamReports',
  },

  // ── Admission Reports ─────────────────────────────────────────────────────
  {
    name: AdmissionReportTitle.AdmissionSummaryReport,
    label: 'Admission Summary Report',
    category: 'AdmissionReports',
  },
  {
    name: AdmissionReportTitle.AdmissionStatusReport,
    label: 'Admission Status Report',
    category: 'AdmissionReports',
  },
  {
    name: AdmissionReportTitle.InquiryToAdmissionConversionReport,
    label: 'Inquiry-to-Admission Conversion Report',
    category: 'AdmissionReports',
  },

  // ── Demographic Reports ───────────────────────────────────────────────────
  {
    name: AdmissionReportTitle.ReligionWiseReport,
    label: 'Religion Wise Report',
    category: 'Demographics',
  },
  {
    name: AdmissionReportTitle.CasteCategoryWiseReport,
    label: 'Caste Category Wise Report',
    category: 'Demographics',
  },
  {
    name: AdmissionReportTitle.PinCodeWiseDistributionReport,
    label: 'Pin Code Wise Distribution',
    category: 'Demographics',
  },
  {
    name: AdmissionReportTitle.DateOfBirthReport,
    label: 'Date of Birth Report',
    category: 'Demographics',
  },
  {
    name: AdmissionReportTitle.GenderWiseDistributionReport,
    label: 'Gender Wise Distribution',
    category: 'Demographics',
  },

  // ── Student & Admission Reports (Unified Form) ─────────────────────────────
  {
    name: AdmissionReportTitle.PreviousSchoolReport,
    label: 'Previous School Report',
    category: 'AdmissionReports',
  },
  {
    name: AdmissionReportTitle.AdmissionSourceReport,
    label: 'Admission Source Report',
    category: 'AdmissionReports',
  },
  {
    name: AdmissionReportTitle.MonthlyAdmissionTrendReport,
    label: 'Monthly Admission Trend Report',
    category: 'AdmissionReports',
  },
  {
    name: AdmissionReportTitle.AdmissionComparisonReport,
    label: 'Admission Comparison Report',
    category: 'AdmissionReports',
  },
  {
    name: AdmissionReportTitle.ClassWiseAdmissionReport,
    label: 'Class-wise Admission Report',
    category: 'AdmissionReports',
  },
  {
    name: AdmissionReportTitle.AadhaarVerificationReport,
    label: 'Aadhaar Verification Report',
    category: 'Verification',
  },
  {
    name: AdmissionReportTitle.ContactInformationReport,
    label: 'Contact Information Report',
    category: 'Verification',
  },
  {
    name: AdmissionReportTitle.DocumentVerificationReport,
    label: 'Document Verification Report',
    category: 'Verification',
  },
];
