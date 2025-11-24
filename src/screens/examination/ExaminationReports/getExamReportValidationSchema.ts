import * as Yup from 'yup';

export const getExamValidationSchema = (showField: string[]) => {
  const shape: Record<string, any> = {};

  // Report
  shape.report = Yup.string().required('Report is required');

  // Organizations (Multi)
  if (showField.includes('organizations')) {
    shape.organizations = Yup.array()
      .min(1, 'Select at least one organization')
      .required('Organization is required');
  }

  // Standards / Classes (Multi)
  if (showField.includes('standards')) {
    shape.standards = Yup.array().min(1, 'Select at least one class').required('Class is required');
  }

  if (showField.includes('standard_single')) {
    shape.standard = Yup.string().required('Class is required');
  }

  // Standard - Single (StudentAllExamResult)
  if (showField.includes('organization_single')) {
    shape.organization = Yup.string().required('Organization is required');
  }

  // Divisions (Multi)
  if (showField.includes('divisions')) {
    shape.divisions = Yup.array()
      .min(1, 'Select at least one division')
      .required('Division is required');
  }

  // Division - Optional (Subject Avg Class Report)
  if (showField.includes('divisions_optional')) {
    shape.divisions = Yup.array();
  }

  // Division - Single
  if (showField.includes('division_single')) {
    shape.division = Yup.string().required('Division is required');
  }

  // Single Exam
  if (showField.includes('exam')) {
    shape.exam = Yup.string().required('Exam is required');
  }

  // Multi Exam (Weak Student Analysis, Consolidate Verify)
  if (showField.includes('exams')) {
    shape.exams = Yup.array().min(1, 'Select at least one exam').required('Exam is required');
  }

  // Multi Subjects
  if (showField.includes('subjects')) {
    shape.subjects = Yup.array()
      .min(1, 'Select at least one subject')
      .required('Subject is required');
  }

  // Optional Multi Subjects
  if (showField.includes('subjects_optional')) {
    shape.subjects = Yup.array();
  }

  // Single Subject
  if (showField.includes('subject')) {
    shape.subject = Yup.string().required('Subject is required');
  }

  // Multi Grade (Bright student)
  if (showField.includes('grade')) {
    shape.grade = Yup.array().min(1, 'Select at least one grade').required('Grade is required');
  }

  // Students (Optional Multi)
  if (showField.includes('students_optional')) {
    shape.students = Yup.array();
  }

  // Min Mark (optional)
  if (showField.includes('minMark_optional')) {
    shape.minMark = Yup.string().nullable();
  }

  // Max Mark (optional)
  if (showField.includes('maxMark_optional')) {
    shape.maxMark = Yup.string().nullable();
  }

  return Yup.object().shape(shape);
};
