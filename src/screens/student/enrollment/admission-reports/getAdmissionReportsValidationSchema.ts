import * as Yup from 'yup';

/**
 * Builds a dynamic Yup validation schema for admission report forms.
 *
 * @param visibleFields  - Fields that are rendered for the selected report.
 * @param requiredFields - Subset of visibleFields that must have a value before submission.
 */
export const getAdmissionReportsValidationSchema = (
  visibleFields: string[],
  requiredFields: string[]
) => {
  const shape: Record<string, any> = {};

  // Organization — always required when visible
  if (visibleFields.includes('organization')) {
    shape.organization = Yup.string().required('Organization is required');
  }

  // Date range
  if (visibleFields.includes('dateFrom')) {
    shape.dateFrom = requiredFields.includes('dateFrom')
      ? Yup.string().nullable().required('From date is required')
      : Yup.string().nullable();
  }

  if (visibleFields.includes('dateTo')) {
    shape.dateTo = requiredFields.includes('dateTo')
      ? Yup.string().nullable().required('To date is required')
      : Yup.string().nullable();
  }

  // Class applied for
  if (visibleFields.includes('classAppliedFor')) {
    shape.classAppliedFor = requiredFields.includes('classAppliedFor')
      ? Yup.string().required('Class is required')
      : Yup.string().nullable();
  }

  // Inquiry source
  if (visibleFields.includes('inquirySource')) {
    shape.inquirySource = requiredFields.includes('inquirySource')
      ? Yup.string().required('Inquiry source is required')
      : Yup.string().nullable();
  }

  // Exam
  if (visibleFields.includes('exam')) {
    shape.exam = requiredFields.includes('exam')
      ? Yup.string().required('Exam is required')
      : Yup.string().nullable();
  }

  // Admission status
  if (visibleFields.includes('status')) {
    shape.status = requiredFields.includes('status')
      ? Yup.string().required('Status is required')
      : Yup.string().nullable();
  }

  // Demographic & Address Fields
  if (visibleFields.includes('classAppliedForMultiple')) {
    shape.classAppliedForMultiple = requiredFields.includes('classAppliedForMultiple')
      ? Yup.array().min(1, 'At least one class is required').required('Class is required')
      : Yup.array().nullable();
  }

  if (visibleFields.includes('religion')) {
    shape.religion = requiredFields.includes('religion')
      ? Yup.array().min(1, 'Religion is required').required('Religion is required')
      : Yup.array().nullable();
  }

  if (visibleFields.includes('casteCategory')) {
    shape.casteCategory = requiredFields.includes('casteCategory')
      ? Yup.array().min(1, 'Caste category is required').required('Caste category is required')
      : Yup.array().nullable();
  }

  if (visibleFields.includes('country')) {
    shape.country = Yup.object().shape({
      name: requiredFields.includes('country')
        ? Yup.string().required('Country is required')
        : Yup.string().nullable(),
      isoCode: Yup.string().nullable(),
    });
  }

  if (visibleFields.includes('state')) {
    shape.state = Yup.object().shape({
      name: requiredFields.includes('state')
        ? Yup.string().required('State is required')
        : Yup.string().nullable(),
      isoCode: Yup.string().nullable(),
    });
  }

  if (visibleFields.includes('city')) {
    shape.city = Yup.object().shape({
      name: requiredFields.includes('city')
        ? Yup.string().required('City is required')
        : Yup.string().nullable(),
    });
  }

  if (visibleFields.includes('pinCode')) {
    shape.pinCode = requiredFields.includes('pinCode')
      ? Yup.string().required('Pin Code is required')
      : Yup.string().nullable();
  }

  if (visibleFields.includes('month')) {
    shape.month = requiredFields.includes('month')
      ? Yup.string().required('Month is required')
      : Yup.string().nullable();
  }

  if (visibleFields.includes('gender')) {
    shape.gender = requiredFields.includes('gender')
      ? Yup.string().required('Gender is required')
      : Yup.string().nullable();
  }

  if (visibleFields.includes('verificationStatus')) {
    shape.verificationStatus = requiredFields.includes('verificationStatus')
      ? Yup.string().required('Verification Status is required')
      : Yup.string().nullable();
  }

  return Yup.object().shape(shape);
};
