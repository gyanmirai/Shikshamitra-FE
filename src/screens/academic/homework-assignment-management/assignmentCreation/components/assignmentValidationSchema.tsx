import * as Yup from 'yup';

// Assignment validation schema
export const assignmentValidationSchema = Yup.object({
  title: Yup.string().required('Assignment Title is required'),
  class: Yup.string().required('Class is required'),
  divisions: Yup.array()
    .of(
      Yup.object().shape({
        divisionId: Yup.string().required('Division is required'),
        createdAt: Yup.date().required('Assign Date is required'),
        publishDate: Yup.date().required('Publish Date is required'),
        dueDate: Yup.date()
          .required('Due Date is required')
          .min(Yup.ref('publishDate'), 'Due Date cannot be before Publish Date'),
      })
    )
    .min(1, 'At least one division is required'),
  subjects: Yup.string().required('Subject is required'),
  submissionType: Yup.string().required('Submission type is required'),
  endDate: Yup.date().required('End Date is required'),
  startDate: Yup.date().required('Start Date is required'),
  assignmentType: Yup.string().required('Assignment type is required'),
});
