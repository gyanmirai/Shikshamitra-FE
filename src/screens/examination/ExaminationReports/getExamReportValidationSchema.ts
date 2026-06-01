import * as Yup from 'yup';

export const getExamValidationSchema = (showField: string[], requiredFields: string[] = []) => {
  const shape: Record<string, any> = {};
  const useExplicitRequiredFields = requiredFields.length > 0;
  const isRequired = (field: string, legacyRequired = true) =>
    useExplicitRequiredFields ? requiredFields.includes(field) : legacyRequired;

  // Report
  shape.report = Yup.string().required('Report is required');

  // Organizations (Multi)
  if (showField.includes('organizations')) {
    shape.organizations = isRequired('organizations')
      ? Yup.array().min(1, 'Select at least one organization').required('Organization is required')
      : Yup.array();
  }

  // Standards / Classes (Multi)
  if (showField.includes('standards')) {
    shape.standards = isRequired('standards')
      ? Yup.array().min(1, 'Select at least one class').required('Class is required')
      : Yup.array();
  }

  if (showField.includes('standard_single')) {
    shape.standard = isRequired('standard_single', true)
      ? Yup.string().required('Class is required')
      : Yup.string().nullable();
  }

  // Standard - Single (StudentAllExamResult)
  if (showField.includes('organization_single')) {
    shape.organization = isRequired('organization_single', true)
      ? Yup.string().required('Organization is required')
      : Yup.string().nullable();
  }

  // Divisions (Multi)
  if (showField.includes('divisions')) {
    shape.divisions = isRequired('divisions')
      ? Yup.array().min(1, 'Select at least one division').required('Division is required')
      : Yup.array();
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
    shape.exam = isRequired('exam', true)
      ? Yup.string().required('Exam is required')
      : Yup.string().nullable();
  }

  // Multi Exam (Weak Student Analysis, Consolidate Verify)
  if (showField.includes('exams')) {
    shape.exams = isRequired('exams', true)
      ? Yup.array().min(1, 'Select at least one exam').required('Exam is required')
      : Yup.array();
  }

  // Single Exam Group
  if (showField.includes('examGroup')) {
    shape.examGroup = isRequired('examGroup', true)
      ? Yup.string().required('Exam Group is required')
      : Yup.string().nullable();
  }

  // Multi Exam Group
  if (showField.includes('examGroups')) {
    shape.examGroups = isRequired('examGroups', true)
      ? Yup.array().min(1, 'Select at least one exam group').required('Exam Group is required')
      : Yup.array();
  }

  // Multi Subjects
  if (showField.includes('subjects')) {
    shape.subjects = isRequired('subjects', true)
      ? Yup.array().min(1, 'Select at least one subject').required('Subject is required')
      : Yup.array();
  }

  // Optional Multi Subjects
  if (showField.includes('subjects_optional')) {
    shape.subjects = Yup.array();
  }

  // Single Subject
  if (showField.includes('subject')) {
    shape.subject = isRequired('subject', true)
      ? Yup.string().required('Subject is required')
      : Yup.string().nullable();
  }

  // Multi Grade (Bright student)
  if (showField.includes('grade')) {
    shape.grade = isRequired('grade', true)
      ? Yup.array().min(1, 'Select at least one grade').required('Grade is required')
      : Yup.array();
  }

  // Students (Required Multi)
  if (showField.includes('students')) {
    shape.students = isRequired('students', true)
      ? Yup.array().min(1, 'Select at least one student').required('Student is required')
      : Yup.array();
  }

  // Students (Optional Multi)
  if (showField.includes('students_optional')) {
    shape.students = Yup.array();
  }

  // Student (Required Single)
  if (showField.includes('student')) {
    shape.student = isRequired('student', true)
      ? Yup.string().required('Student is required')
      : Yup.string().nullable();
  }

  // Min Mark (optional)
  if (showField.includes('minMark_optional')) {
    shape.minMark = Yup.string().nullable();
  }

  // Min Mark (required numeric)
  if (showField.includes('minMark')) {
    shape.minMark = isRequired('minMark', true)
      ? Yup.number()
          .typeError('Min Marks must be a number')
          .required('Min Marks is required')
          .min(0, 'Min Marks cannot be negative')
      : Yup.number().typeError('Min Marks must be a number').nullable();
  }

  // Max Mark (optional)
  if (showField.includes('maxMark_optional')) {
    shape.maxMark = Yup.string().nullable();
  }

  // Max Mark (required numeric)
  if (showField.includes('maxMark')) {
    const baseMax = Yup.number()
      .typeError('Max Marks must be a number')
      .min(0, 'Max Marks cannot be negative')
      .test(
        'max-gte-min',
        'Max Marks must be greater than or equal to Min Marks',
        function (value) {
          const { minMark } = this.parent as { minMark?: number | null };

          if (value === undefined || value === null || minMark === undefined || minMark === null) {
            return true;
          }

          return Number(value) >= Number(minMark);
        }
      );

    shape.maxMark = isRequired('maxMark', true)
      ? baseMax.required('Max Marks is required')
      : baseMax.nullable();
  }

  return Yup.object().shape(shape);
};
