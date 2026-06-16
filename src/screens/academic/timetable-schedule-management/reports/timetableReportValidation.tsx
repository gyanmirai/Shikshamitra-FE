import * as Yup from 'yup';

/**
 * Builds a dynamic Yup validation schema for timetable report forms.
 *
 * @param visibleFields  - Fields rendered for the selected report.
 * @param requiredFields - Subset of visibleFields that must have a value before submission.
 */
export const getTimetableValidationSchema = (visibleFields: string[], requiredFields: string[]) => {
  const shape: Record<string, any> = {};

  // Organization — always required when visible
  if (visibleFields.includes('organization')) {
    shape.organization = Yup.string().required('Organization is required');
  }

  // Classes
  if (visibleFields.includes('classes')) {
    shape.classes = requiredFields.includes('classes')
      ? Yup.string().required('Class is required')
      : Yup.string().nullable();
  }

  // Divisions — always optional (auto-populated from class selection)
  if (visibleFields.includes('divisions')) {
    shape.divisions = Yup.array();
  }

  // Teacher
  if (visibleFields.includes('teacher')) {
    shape.teacher = requiredFields.includes('teacher')
      ? Yup.string().required('Teacher is required')
      : Yup.string();
  }

  // Room No
  if (visibleFields.includes('roomNo')) {
    shape.roomNo = requiredFields.includes('roomNo')
      ? Yup.string().required('Room is required')
      : Yup.string();
  }

  // Subject
  if (visibleFields.includes('subject')) {
    shape.subject = requiredFields.includes('subject')
      ? Yup.string().required('Subject is required')
      : Yup.string();
  }

  return Yup.object().shape(shape);
};
