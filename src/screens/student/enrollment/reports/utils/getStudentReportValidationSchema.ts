import * as Yup from 'yup';

/**
 * Builds a dynamic Yup validation schema for Student Report forms.
 *
 * Mirrors the pattern in getAdmissionReportsValidationSchema.ts but
 * covers Student Report-specific fields.
 *
 * @param visibleFields  - Fields rendered for the selected report.
 * @param requiredFields - Subset that must have a value before submission.
 */
export const getStudentReportValidationSchema = (
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

  // ── Date range ──────────────────────────────────────────────────────────────
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

  // ── Class (single) ──────────────────────────────────────────────────────────
  if (has('classId')) {
    shape.classId = req('classId')
      ? Yup.string().required('Class is required')
      : Yup.string().nullable();
  }

  // ── Class (multi) ───────────────────────────────────────────────────────────
  if (has('classIds')) {
    shape.classIds = req('classIds')
      ? Yup.array().min(1, 'At least one class is required').required('Class is required')
      : Yup.array().nullable();
  }

  // ── Division (multi) ────────────────────────────────────────────────────────
  if (has('divisionIds')) {
    shape.divisionIds = req('divisionIds')
      ? Yup.array().min(1, 'At least one division is required').required('Division is required')
      : Yup.array().nullable();
  }

  // ── Student status ──────────────────────────────────────────────────────────
  if (has('studentStatus')) {
    shape.studentStatus = req('studentStatus')
      ? Yup.string().required('Student status is required')
      : Yup.string().nullable();
  }

  // ── Demographics ────────────────────────────────────────────────────────────
  if (has('religion')) {
    shape.religion = req('religion')
      ? Yup.array().min(1, 'Religion is required').required('Religion is required')
      : Yup.array().nullable();
  }

  if (has('casteCategory')) {
    shape.casteCategory = req('casteCategory')
      ? Yup.array().min(1, 'Caste category is required').required('Caste category is required')
      : Yup.array().nullable();
  }

  if (has('gender')) {
    shape.gender = req('gender')
      ? Yup.string().required('Gender is required')
      : Yup.string().nullable();
  }

  if (has('bloodGroup')) {
    shape.bloodGroup = req('bloodGroup')
      ? Yup.string().required('Blood group is required')
      : Yup.string().nullable();
  }

  if (has('month')) {
    shape.month = req('month')
      ? Yup.string().required('Month is required')
      : Yup.string().nullable();
  }

  // ── Address ─────────────────────────────────────────────────────────────────
  if (has('country')) {
    shape.country = Yup.object().shape({
      name: req('country') ? Yup.string().required('Country is required') : Yup.string().nullable(),
      isoCode: Yup.string().nullable(),
    });
  }

  if (has('state')) {
    shape.state = Yup.object().shape({
      name: req('state') ? Yup.string().required('State is required') : Yup.string().nullable(),
      isoCode: Yup.string().nullable(),
    });
  }

  if (has('city')) {
    shape.city = Yup.object().shape({
      name: req('city') ? Yup.string().required('City is required') : Yup.string().nullable(),
    });
  }

  if (has('pinCode')) {
    shape.pinCode = req('pinCode')
      ? Yup.string().required('Pin Code is required')
      : Yup.string().nullable();
  }

  // ── Admission ────────────────────────────────────────────────────────────────
  if (has('admissionSource')) {
    shape.admissionSource = req('admissionSource')
      ? Yup.string().required('Admission source is required')
      : Yup.string().nullable();
  }

  if (has('previousSchoolId')) {
    shape.previousSchoolId = req('previousSchoolId')
      ? Yup.string().required('Previous school is required')
      : Yup.string().nullable();
  }

  // ── Verification ─────────────────────────────────────────────────────────────
  if (has('verificationStatus')) {
    shape.verificationStatus = req('verificationStatus')
      ? Yup.string().required('Verification status is required')
      : Yup.string().nullable();
  }

  return Yup.object().shape(shape);
};
