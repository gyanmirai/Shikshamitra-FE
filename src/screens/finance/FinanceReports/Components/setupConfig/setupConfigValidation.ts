import * as Yup from 'yup';

export const getSetupConfigValidationSchema = (currentFields: string[]) => {
  const shape: Record<string, any> = {};

  if (currentFields.includes('board')) {
    shape.board = Yup.string().required('Board is required');
  }
  if (currentFields.includes('medium')) {
    shape.medium = Yup.string().required('Medium is required');
  }

  // Single Organization
  if (currentFields.includes('organization_single')) {
    shape.organization_single = Yup.string().required('Organization is required');
  }

  // Multi Organization
  if (currentFields.includes('organizations')) {
    shape.organizations = Yup.array()
      .min(1, 'At least one Organization is required')
      .required('Organization is required');
  }

  if (currentFields.includes('standards')) {
    shape.standards = Yup.array()
      .min(1, 'At least one Class is required')
      .required('Class is required');
  }
  if (currentFields.includes('divisions')) {
    shape.divisions = Yup.array()
      .min(1, 'At least one Division is required')
      .required('Division is required');
  }
  if (currentFields.includes('students')) {
    shape.students = Yup.array()
      .min(1, 'At least one Student is required')
      .required('Student is required');
  }

  // Academic Year
  if (currentFields.includes('academicYears')) {
    shape.academicYears = Yup.array()
      .min(1, 'At least one Academic Year is required')
      .required('Academic Year is required');
  }

  // Months
  if (currentFields.includes('months')) {
    shape.months = Yup.array()
      .min(1, 'At least one Month is required')
      .required('Month is required');
  }

  // Fee Heads
  if (currentFields.includes('feeHeads')) {
    shape.feeHeads = Yup.array()
      .min(1, 'At least one Fee Head is required')
      .required('Fee Head is required');
  }

  return Yup.object().shape(shape);
};
