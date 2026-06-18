import * as Yup from 'yup';

/**
 * Builds a dynamic Yup validation schema for Student Records Report forms.
 *
 * Mirrors getStudentReportValidationSchema.ts (enrollment) but covers
 * Student Records-specific filter fields.
 *
 * @param visibleFields  - Fields rendered for the selected report.
 * @param requiredFields - Subset that must have a value before submission.
 */
export const getStudentRecordsReportValidationSchema = (
  visibleFields: string[],
  requiredFields: string[]
) => {
  const shape: Record<string, any> = {};

  const has = (f: string) => visibleFields.includes(f);
  const req = (f: string) => requiredFields.includes(f);

  // ── Organization ────────────────────────────────────────────────────────────
  if (has('organization')) {
    shape.organization = Yup.string().required('Organization is required');
  }

  // ── Class (multi-select) ─────────────────────────────────────────────────────
  if (has('classIds')) {
    shape.classIds = req('classIds')
      ? Yup.array().min(1, 'At least one class is required').required('Class is required')
      : Yup.array().nullable();
  }

  // ── Division (multi-select) ──────────────────────────────────────────────────
  if (has('divisionIds')) {
    shape.divisionIds = req('divisionIds')
      ? Yup.array().min(1, 'At least one division is required').required('Division is required')
      : Yup.array().nullable();
  }

  // ── Student (single) ────────────────────────────────────────────────────────
  if (has('studentId')) {
    shape.studentId = req('studentId')
      ? Yup.string().required('Student is required')
      : Yup.string().nullable();
  }

  // ── Admission date range ─────────────────────────────────────────────────────
  if (has('admissionDateFrom')) {
    shape.admissionDateFrom = req('admissionDateFrom')
      ? Yup.string().nullable().required('Admission from date is required')
      : Yup.string().nullable();
  }

  if (has('admissionDateTo')) {
    shape.admissionDateTo = req('admissionDateTo')
      ? Yup.string().nullable().required('Admission to date is required')
      : Yup.string().nullable();
  }

  // ── Attendance Dates ─────────────────────────────────────────────────────────
  if (has('attendanceDate')) {
    shape.attendanceDate = req('attendanceDate')
      ? Yup.string().nullable().required('Attendance date is required')
      : Yup.string().nullable();
  }

  if (has('fromDate')) {
    shape.fromDate = req('fromDate')
      ? Yup.string().nullable().required('From date is required')
      : Yup.string().nullable();
  }

  if (has('toDate')) {
    shape.toDate = req('toDate')
      ? Yup.string().nullable().required('To date is required')
      : Yup.string().nullable();
  }

  // ── Birthday & Dates ─────────────────────────────────────────────────────────
  if (has('month')) {
    shape.month = req('month')
      ? Yup.string().required('Month is required')
      : Yup.string().nullable();
  }

  if (has('leftDateFrom')) {
    shape.leftDateFrom = req('leftDateFrom')
      ? Yup.string().nullable().required('Left from date is required')
      : Yup.string().nullable();
  }

  if (has('leftDateTo')) {
    shape.leftDateTo = req('leftDateTo')
      ? Yup.string().nullable().required('Left to date is required')
      : Yup.string().nullable();
  }

  // ── Summaries ────────────────────────────────────────────────────────────────
  if (has('ageRangeFrom')) {
    shape.ageRangeFrom = req('ageRangeFrom')
      ? Yup.number().typeError('Age must be a number').required('Age from is required')
      : Yup.number().nullable().typeError('Age must be a number');
  }

  if (has('ageRangeTo')) {
    shape.ageRangeTo = req('ageRangeTo')
      ? Yup.number().typeError('Age must be a number').required('Age to is required')
      : Yup.number().nullable().typeError('Age must be a number');
  }

  if (has('admissionCategory')) {
    shape.admissionCategory = req('admissionCategory')
      ? Yup.string().required('Admission category is required')
      : Yup.string().nullable();
  }

  if (has('verificationStatus')) {
    shape.verificationStatus = req('verificationStatus')
      ? Yup.string().required('Verification status is required')
      : Yup.string().nullable();
  }

  // ── Demographics ─────────────────────────────────────────────────────────────
  if (has('religion')) {
    shape.religion = req('religion')
      ? Yup.string().required('Religion is required')
      : Yup.string().nullable();
  }

  if (has('casteCategory')) {
    shape.casteCategory = req('casteCategory')
      ? Yup.string().required('Caste category is required')
      : Yup.string().nullable();
  }

  if (has('bloodGroup')) {
    shape.bloodGroup = req('bloodGroup')
      ? Yup.string().required('Blood group is required')
      : Yup.string().nullable();
  }

  if (has('motherTongue')) {
    shape.motherTongue = req('motherTongue')
      ? Yup.string().required('Mother tongue is required')
      : Yup.string().nullable();
  }

  return Yup.object().shape(shape);
};
