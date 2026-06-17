import * as Yup from 'yup';

/**
 * Builds a dynamic Yup validation schema for curriculum report forms.
 *
 * @param visibleFields - Fields that are rendered for the selected report.
 * @param requiredFields - Subset of visibleFields that must have a value before submission.
 */
export const getCurriculumValidationSchema = (
  visibleFields: string[],
  requiredFields: string[]
) => {
  const shape: Record<string, any> = {};

  // Organization is always required when visible
  if (visibleFields.includes('organization')) {
    shape.organization = Yup.string().required('Organization is required');
  }

  // Classes
  if (visibleFields.includes('classes')) {
    shape.classes = requiredFields.includes('classes')
      ? Yup.string().required('Class is required')
      : Yup.string().nullable();
  }

  // Divisions
  if (visibleFields.includes('divisions')) {
    shape.divisions = requiredFields.includes('divisions')
      ? Yup.array().min(1, 'At least one division is required').required('Division is required')
      : Yup.array();
  }

  // Subjects
  if (visibleFields.includes('subjects')) {
    shape.subjects = requiredFields.includes('subjects')
      ? Yup.string().required('Subject is required')
      : Yup.string().nullable();
  }

  // Chapters — always optional
  if (visibleFields.includes('chapters')) {
    shape.chapters = Yup.array();
  }

  return Yup.object().shape(shape);
};
