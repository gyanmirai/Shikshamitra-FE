import * as Yup from 'yup';

export const getHomeworkAssignmentAnalyticsValidationSchema = (
  visibleFields: string[],
  requiredFields: string[]
) => {
  const shape: Record<string, any> = {};

  if (visibleFields.includes('organization')) {
    shape.organization = Yup.string().required('Organization is required');
  }

  if (visibleFields.includes('class')) {
    shape.class = requiredFields.includes('class')
      ? Yup.string().required('Class is required')
      : Yup.string();
  }

  if (visibleFields.includes('divisions')) {
    shape.divisions = requiredFields.includes('divisions')
      ? Yup.array().min(1, 'At least one division is required')
      : Yup.array();
  }

  if (visibleFields.includes('subjects')) {
    shape.subjects = requiredFields.includes('subjects')
      ? Yup.array().min(1, 'At least one subject is required')
      : Yup.array();
  }

  if (visibleFields.includes('teachers')) {
    shape.teachers = requiredFields.includes('teachers')
      ? Yup.array().min(1, 'At least one teacher is required')
      : Yup.array();
  }

  if (visibleFields.includes('students')) {
    shape.students = requiredFields.includes('students')
      ? Yup.array().min(1, 'At least one student is required')
      : Yup.array();
  }

  return Yup.object().shape(shape);
};
