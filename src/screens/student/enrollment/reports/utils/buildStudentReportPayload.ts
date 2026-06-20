import {
  StudentReportTitle,
  StudentReportCategory,
  StudentReportApiTypeMap,
} from 'src/enums/student-reports';

// ─── Category membership helpers ─────────────────────────────────────────────

const STUDENT_LIST_REPORTS = new Set<StudentReportTitle>([
  StudentReportTitle.StudentList,
  StudentReportTitle.StudentDirectory,
  StudentReportTitle.ClassWiseStudentList,
  StudentReportTitle.ActiveStudentReport,
  StudentReportTitle.InactiveStudentReport,
]);

const DEMOGRAPHICS_REPORTS = new Set<StudentReportTitle>([
  StudentReportTitle.ReligionWiseReport,
  StudentReportTitle.CasteCategoryWiseReport,
  StudentReportTitle.GenderWiseDistributionReport,
  StudentReportTitle.DateOfBirthReport,
  StudentReportTitle.BloodGroupDistributionReport,
  StudentReportTitle.PinCodeWiseDistributionReport,
]);

const ADMISSION_REPORTS = new Set<StudentReportTitle>([
  StudentReportTitle.AdmissionSourceReport,
  StudentReportTitle.PreviousSchoolReport,
  StudentReportTitle.MonthlyAdmissionTrendReport,
  StudentReportTitle.AdmissionComparisonReport,
  StudentReportTitle.ClassWiseAdmissionReport,
]);

const VERIFICATION_REPORTS = new Set<StudentReportTitle>([
  StudentReportTitle.AadhaarVerificationReport,
  StudentReportTitle.ContactInformationReport,
  StudentReportTitle.DocumentVerificationReport,
]);

// ─── Formik values shape (superset of all category filters) ──────────────────

export interface StudentReportFormValues {
  report: StudentReportTitle;
  organization: string;
  // Shared
  classIds: string[];
  divisionIds: string[];
  fromDate: string | null;
  toDate: string | null;
  // Student List
  studentStatus: string;
  // Demographics
  religion: string[];
  casteCategory: string[];
  gender: string;
  bloodGroup: string;
  country: { name: string; isoCode: string } | null;
  state: { name: string; isoCode: string } | null;
  city: { name: string } | null;
  pinCode: string;
  month: string;
  // Admission
  admissionSource: string;
  previousSchoolId: string;
  // Verification
  verificationStatus: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Returns only non-empty string values from a record. */
function compact<T extends Record<string, any>>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => {
      if (v === null || v === undefined) return false;
      if (typeof v === 'string' && v.trim() === '') return false;
      if (Array.isArray(v) && v.length === 0) return false;
      return true;
    })
  ) as Partial<T>;
}

// ─── Payload builder ──────────────────────────────────────────────────────────

/**
 * Builds a minimal, category-specific StudentReportRequestDto.
 *
 * Only filters relevant to the selected report's category are included.
 * No null-valued fields from unrelated categories are sent.
 */
export function buildStudentReportPayload(
  report: StudentReportTitle,
  values: StudentReportFormValues,
  academicYearId?: string | null
) {
  const reportType = StudentReportApiTypeMap[report];

  // ── Student List ────────────────────────────────────────────────────────────
  if (STUDENT_LIST_REPORTS.has(report)) {
    return {
      reportType,
      filters: compact({
        academicYearId: academicYearId || undefined,
        classIds: values.classIds.length > 0 ? values.classIds : undefined,
        divisionIds: values.divisionIds.length > 0 ? values.divisionIds : undefined,
        studentStatus: values.studentStatus || undefined,
      }),
    };
  }

  // ── Demographics ────────────────────────────────────────────────────────────
  if (DEMOGRAPHICS_REPORTS.has(report)) {
    return {
      reportType,
      filters: compact({
        classIds: values.classIds.length > 0 ? values.classIds : undefined,
        religion: values.religion.length > 0 ? values.religion : undefined,
        casteCategory: values.casteCategory.length > 0 ? values.casteCategory : undefined,
        gender: values.gender || undefined,
        bloodGroup: values.bloodGroup || undefined,
        country: values.country?.name || undefined,
        state: values.state?.name || undefined,
        city: values.city?.name || undefined,
        pinCode: values.pinCode || undefined,
        month: values.month ? Number(values.month) : undefined,
        fromDate: values.fromDate || undefined,
        toDate: values.toDate || undefined,
      }),
    };
  }

  // ── Admission ───────────────────────────────────────────────────────────────
  if (ADMISSION_REPORTS.has(report)) {
    const payload: any = {
      reportType,
      filters: compact({
        classIds: values.classIds.length > 0 ? values.classIds : undefined,
        admissionSource: values.admissionSource || undefined,
        previousSchoolId: values.previousSchoolId || undefined,
        fromDate: values.fromDate || undefined,
        toDate: values.toDate || undefined,
      }),
    };
    // Attach chart config for trend report
    if (reportType === 'Monthly Admission Trend Report') {
      payload.chart = {
        type: 'line',
        title: 'Monthly Admissions Trend',
        categoryField: 'Month',
        valueField: 'Admissions Count',
      };
    }
    return payload;
  }

  // ── Verification ────────────────────────────────────────────────────────────
  if (VERIFICATION_REPORTS.has(report)) {
    return {
      reportType,
      filters: compact({
        classIds: values.classIds.length > 0 ? values.classIds : undefined,
        verificationStatus: values.verificationStatus || undefined,
      }),
    };
  }

  // Fallback — should never be reached with a valid StudentReportTitle
  return { reportType, filters: {} };
}

// ─── Field visibility helpers ─────────────────────────────────────────────────

/**
 * Returns the category string for a given report.
 * Useful for driving field-visibility and label decisions in the form.
 */
export function getStudentReportCategory(report: StudentReportTitle): string {
  if (STUDENT_LIST_REPORTS.has(report)) return StudentReportCategory.StudentList;
  if (DEMOGRAPHICS_REPORTS.has(report)) return StudentReportCategory.Demographics;
  if (ADMISSION_REPORTS.has(report)) return StudentReportCategory.Admission;
  if (VERIFICATION_REPORTS.has(report)) return StudentReportCategory.Verification;
  return '';
}
