import * as Yup from 'yup';

// Assignment validation schema
export const assignmentValidationSchema = Yup.object({
  title: Yup.string().required('Assignment Title is required'),
  class: Yup.string().required('Class is required'),
  divisions: Yup.array()
    .of(
      Yup.object().shape({
        divisionId: Yup.string().required('Division is required'),
        publishDate: Yup.date().nullable().required('Publish Date is required'),
        dueDate: Yup.date()
          .nullable()
          .required('Due Date is required')
          .min(Yup.ref('publishDate'), 'Due Date cannot be before Publish Date'),
      })
    )
    .min(1, 'At least one Division is required')
    .test('schedule-complete', 'Select schedule dates also', (value) => {
      if (!value || value.length === 0) return true; // Let .min(1) handle empty case
      return value.every((div) => div.publishDate && div.dueDate);
    }),
  subjects: Yup.string().required('Subject is required'),
  submissionType: Yup.string().required('Submission type is required'),
  endDate: Yup.date().required('End Date is required'),
  startDate: Yup.date().required('Start Date is required'),
  assignmentType: Yup.string().required('Assignment Type is required'),
});
