import * as Yup from 'yup';

// Assignment validation schema
export const assignmentValidationSchema = Yup.object({
  title: Yup.string().required('Assignment Title is required'),
  class: Yup.string().required('Class is required'),
  division: Yup.array().min(1, 'At least one division must be selected'),
  subjects: Yup.string().required('Subject is required'),
  submissionType: Yup.string().required('Submission type is required'),
  endDate: Yup.date().required('End Date is required'),
  startDate: Yup.date().required('Start Date is required'),
  assignmentType: Yup.string().required('Assignment type is required'),
});
