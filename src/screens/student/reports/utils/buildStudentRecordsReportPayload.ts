import {
  StudentRecordsReportTitle,
  StudentRecordsReportCategory,
  StudentRecordsReportApiTypeMap,
} from 'src/enums/studentRecordsReports';

// ─── Category membership helpers ─────────────────────────────────────────────

const STUDENT_LISTS_REPORTS = new Set<StudentRecordsReportTitle>([
  StudentRecordsReportTitle.AddressLabelReport,
  StudentRecordsReportTitle.StudentContactList,
  StudentRecordsReportTitle.StudentDetailInformationForm,
  StudentRecordsReportTitle.StudentListDivisionWiseSerialNo,
  StudentRecordsReportTitle.StudentListIDNoWise,
  StudentRecordsReportTitle.StudentRegister,
  StudentRecordsReportTitle.StudentRegisterWithAddress,
  StudentRecordsReportTitle.NewStudentAdmissionReport,
]);

const BIRTHDAY_REPORTS = new Set<StudentRecordsReportTitle>([
  StudentRecordsReportTitle.AllBirthdayWishListReport,
  StudentRecordsReportTitle.LeftStudentList,
]);

const SUMMARIES_REPORTS = new Set<StudentRecordsReportTitle>([
  StudentRecordsReportTitle.StudentStrengthDivisionWiseSummary,
  StudentRecordsReportTitle.AgeWiseSummary,
  StudentRecordsReportTitle.AgewiseList,
  StudentRecordsReportTitle.GenderwiseStudentStrengthSummary,
  StudentRecordsReportTitle.GenderwiseSummary,
  StudentRecordsReportTitle.AdmissionCategorywiseList,
  StudentRecordsReportTitle.VerifyStudentData,
]);

const ATTENDANCE_REPORTS = new Set<StudentRecordsReportTitle>([
  StudentRecordsReportTitle.DailyStrengthGenderWiseSummary,
  StudentRecordsReportTitle.DailyStrengthAttendanceSummary,
  StudentRecordsReportTitle.MonthlyAttendanceSummary,
  StudentRecordsReportTitle.MonthlyAttendanceRegister,
  StudentRecordsReportTitle.MonthlyStrengthSummary,
  StudentRecordsReportTitle.StudentAbsentDaysReport,
  StudentRecordsReportTitle.AbsentDaysReportDateRange,
  StudentRecordsReportTitle.MonthlyStrengthReportDateRange,
]);

const DEMOGRAPHICS_REPORTS = new Set<StudentRecordsReportTitle>([
  StudentRecordsReportTitle.ReligionWiseReport,
  StudentRecordsReportTitle.CasteCategoryWiseReport,
  StudentRecordsReportTitle.BloodGroupWiseReport,
  StudentRecordsReportTitle.MotherTongueWiseReport,
]);

// ─── Formik values shape (superset of all Student Records filter fields) ─────

export interface StudentRecordsReportFormValues {
  report: StudentRecordsReportTitle;
  organization: string;
  /** Multi-select class IDs */
  classIds: string[];
  /** Multi-select division IDs */
  divisionIds: string[];
  /** Single student ID (for detail form) */
  studentId: string;
  /** Admission date range */
  admissionDateFrom: string | null;
  admissionDateTo: string | null;
  /** Birthday & Dates */
  month: string;
  leftDateFrom: string | null;
  leftDateTo: string | null;
  /** Summaries */
  ageRangeFrom: number | null;
  ageRangeTo: number | null;
  admissionCategory: string;
  verificationStatus: string;
  /** Demographics */
  religion: string;
  casteCategory: string;
  bloodGroup: string;
  motherTongue: string;
  /** Attendance */
  attendanceDate: string | null;
  fromDate: string | null;
  toDate: string | null;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Strips null / undefined / empty-string / empty-array values from a record. */
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
 * Builds a minimal, category-specific Student Records Report request payload.
 *
 * Only the filters relevant to the selected report are included.
 * No null-valued fields from unrelated filters are sent.
 *
 * @example
 * // Address Label Report
 * { reportType: 'Address Label Report', filters: { classIds: ['c1'], divisionIds: ['d1'] } }
 *
 * // New Student Admission Report
 * { reportType: 'New Student Admission Report', filters: { classIds: ['c1'], admissionDateFrom: '...', admissionDateTo: '...' } }
 */
export function buildStudentRecordsReportPayload(
  report: StudentRecordsReportTitle,
  values: StudentRecordsReportFormValues
) {
  const reportType = StudentRecordsReportApiTypeMap[report];

  // ── Student Lists ────────────────────────────────────────────────────────────
  if (STUDENT_LISTS_REPORTS.has(report)) {
    switch (report) {
      // Reports with multi-select Class + multi-select Division
      case StudentRecordsReportTitle.AddressLabelReport:
      case StudentRecordsReportTitle.StudentContactList:
      case StudentRecordsReportTitle.StudentRegisterWithAddress:
        return {
          reportType,
          filters: compact({
            classIds: values.classIds.length > 0 ? values.classIds : undefined,
            divisionIds: values.divisionIds.length > 0 ? values.divisionIds : undefined,
          }),
        };

      // Student Detail Information Form — organization, student, class (single)
      case StudentRecordsReportTitle.StudentDetailInformationForm:
        return {
          reportType,
          filters: compact({
            studentId: values.studentId || undefined,
            classIds: values.classIds.length > 0 ? values.classIds : undefined,
            divisionIds: values.divisionIds.length > 0 ? values.divisionIds : undefined,
          }),
        };

      // Division Wise Serial No — single class + single division
      case StudentRecordsReportTitle.StudentListDivisionWiseSerialNo:
        return {
          reportType,
          filters: compact({
            classIds: values.classIds.length > 0 ? values.classIds : undefined,
            divisionIds: values.divisionIds.length > 0 ? values.divisionIds : undefined,
          }),
        };

      // ID No Wise — single class only
      case StudentRecordsReportTitle.StudentListIDNoWise:
        return {
          reportType,
          filters: compact({
            classIds: values.classIds.length > 0 ? values.classIds : undefined,
          }),
        };

      // Student Register / Register With Address — single class + single division
      case StudentRecordsReportTitle.StudentRegister:
        return {
          reportType,
          filters: compact({
            classIds: values.classIds.length > 0 ? values.classIds : undefined,
            divisionIds: values.divisionIds.length > 0 ? values.divisionIds : undefined,
          }),
        };

      // New Student Admission — multi-class + admission date range
      case StudentRecordsReportTitle.NewStudentAdmissionReport:
        return {
          reportType,
          filters: compact({
            classIds: values.classIds.length > 0 ? values.classIds : undefined,
            admissionDateFrom: values.admissionDateFrom || undefined,
            admissionDateTo: values.admissionDateTo || undefined,
          }),
        };

      default:
        return { reportType, filters: {} };
    }
  }

  // ── Birthday & Dates ─────────────────────────────────────────────────────────
  if (BIRTHDAY_REPORTS.has(report)) {
    switch (report) {
      case StudentRecordsReportTitle.AllBirthdayWishListReport:
        return {
          reportType,
          filters: compact({
            classIds: values.classIds.length > 0 ? values.classIds : undefined,
            divisionIds: values.divisionIds.length > 0 ? values.divisionIds : undefined,
            month: values.month ? Number(values.month) : undefined,
          }),
        };

      case StudentRecordsReportTitle.LeftStudentList:
        return {
          reportType,
          filters: compact({
            classIds: values.classIds.length > 0 ? values.classIds : undefined,
            divisionIds: values.divisionIds.length > 0 ? values.divisionIds : undefined,
            leftDateFrom: values.leftDateFrom || undefined,
            leftDateTo: values.leftDateTo || undefined,
          }),
        };

      default:
        return { reportType, filters: {} };
    }
  }

  // ── Summaries ────────────────────────────────────────────────────────────────
  if (SUMMARIES_REPORTS.has(report)) {
    switch (report) {
      case StudentRecordsReportTitle.StudentStrengthDivisionWiseSummary:
      case StudentRecordsReportTitle.AgeWiseSummary:
      case StudentRecordsReportTitle.GenderwiseStudentStrengthSummary:
      case StudentRecordsReportTitle.GenderwiseSummary:
        return {
          reportType,
          filters: compact({
            classIds: values.classIds.length > 0 ? values.classIds : undefined,
            divisionIds: values.divisionIds.length > 0 ? values.divisionIds : undefined,
          }),
        };

      case StudentRecordsReportTitle.AgewiseList:
        return {
          reportType,
          filters: compact({
            classIds: values.classIds.length > 0 ? values.classIds : undefined,
            ageRange:
              values.ageRangeFrom || values.ageRangeTo
                ? {
                    from: values.ageRangeFrom || undefined,
                    to: values.ageRangeTo || undefined,
                  }
                : undefined,
          }),
        };

      case StudentRecordsReportTitle.AdmissionCategorywiseList:
        return {
          reportType,
          filters: compact({
            classIds: values.classIds.length > 0 ? values.classIds : undefined,
            admissionCategory: values.admissionCategory || undefined,
          }),
        };

      case StudentRecordsReportTitle.VerifyStudentData:
        return {
          reportType,
          filters: compact({
            classIds: values.classIds.length > 0 ? values.classIds : undefined,
            divisionIds: values.divisionIds.length > 0 ? values.divisionIds : undefined,
            verificationStatus: values.verificationStatus || undefined,
          }),
        };

      default:
        return { reportType, filters: {} };
    }
  }

  // ── Demographics ─────────────────────────────────────────────────────────────
  if (DEMOGRAPHICS_REPORTS.has(report)) {
    switch (report) {
      case StudentRecordsReportTitle.ReligionWiseReport:
        return {
          reportType,
          filters: compact({
            classIds: values.classIds.length > 0 ? values.classIds : undefined,
            religion: values.religion || undefined,
          }),
        };

      case StudentRecordsReportTitle.CasteCategoryWiseReport:
        return {
          reportType,
          filters: compact({
            classIds: values.classIds.length > 0 ? values.classIds : undefined,
            casteCategory: values.casteCategory || undefined,
          }),
        };

      case StudentRecordsReportTitle.BloodGroupWiseReport:
        return {
          reportType,
          filters: compact({
            classIds: values.classIds.length > 0 ? values.classIds : undefined,
            bloodGroup: values.bloodGroup || undefined,
          }),
        };

      case StudentRecordsReportTitle.MotherTongueWiseReport:
        return {
          reportType,
          filters: compact({
            classIds: values.classIds.length > 0 ? values.classIds : undefined,
            motherTongue: values.motherTongue || undefined,
          }),
        };

      default:
        return { reportType, filters: {} };
    }
  }

  // ── Attendance ───────────────────────────────────────────────────────────────
  if (ATTENDANCE_REPORTS.has(report)) {
    switch (report) {
      case StudentRecordsReportTitle.DailyStrengthGenderWiseSummary:
      case StudentRecordsReportTitle.DailyStrengthAttendanceSummary:
        return {
          reportType,
          filters: compact({
            classIds: values.classIds.length > 0 ? values.classIds : undefined,
            divisionIds: values.divisionIds.length > 0 ? values.divisionIds : undefined,
            attendanceDate: values.attendanceDate || undefined,
          }),
        };

      case StudentRecordsReportTitle.MonthlyAttendanceSummary:
      case StudentRecordsReportTitle.MonthlyAttendanceRegister:
      case StudentRecordsReportTitle.MonthlyStrengthSummary:
        return {
          reportType,
          filters: compact({
            classIds: values.classIds.length > 0 ? values.classIds : undefined,
            divisionIds: values.divisionIds.length > 0 ? values.divisionIds : undefined,
            month: values.month || undefined,
          }),
        };

      case StudentRecordsReportTitle.StudentAbsentDaysReport:
        return {
          reportType,
          filters: compact({
            studentId: values.studentId || undefined,
            fromDate: values.fromDate || undefined,
            toDate: values.toDate || undefined,
          }),
        };

      case StudentRecordsReportTitle.AbsentDaysReportDateRange:
      case StudentRecordsReportTitle.MonthlyStrengthReportDateRange:
        return {
          reportType,
          filters: compact({
            classIds: values.classIds.length > 0 ? values.classIds : undefined,
            divisionIds: values.divisionIds.length > 0 ? values.divisionIds : undefined,
            fromDate: values.fromDate || undefined,
            toDate: values.toDate || undefined,
          }),
        };

      default:
        return { reportType, filters: {} };
    }
  }

  // Fallback — non-Student-Lists reports are not handled by this builder
  return { reportType, filters: {} };
}

// ─── Field visibility helper ──────────────────────────────────────────────────

/**
 * Returns the category string for a given Student Records report.
 */
export function getStudentRecordsReportCategory(report: StudentRecordsReportTitle): string {
  if (STUDENT_LISTS_REPORTS.has(report)) return StudentRecordsReportCategory.StudentLists;
  if (BIRTHDAY_REPORTS.has(report)) return StudentRecordsReportCategory.BirthdayAndDates;
  if (SUMMARIES_REPORTS.has(report)) return StudentRecordsReportCategory.Summaries;
  if (DEMOGRAPHICS_REPORTS.has(report)) return StudentRecordsReportCategory.Demographics;
  if (ATTENDANCE_REPORTS.has(report)) return StudentRecordsReportCategory.Attendance;
  return '';
}
