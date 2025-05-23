import * as Yup from 'yup';

// Assignment validation schema
export const assignmentValidationSchema = Yup.object({
  title: Yup.string().required('Title is required'),
  description: Yup.string().required('Description is required'),
  class: Yup.string().required('Class is required'),
  division: Yup.array().min(1, 'At least one division must be selected'),
  subjects: Yup.array().min(1, 'At least one subject must be selected'),
  submissionType: Yup.string().required('Submission type is required'),
  dueDate: Yup.date().nullable().required('Due date is required'),
  assignmentType: Yup.string().required('Assignment type is required'),
  evaluationCriteria: Yup.string().required('Evaluation criteria is required'),
});
