import * as Yup from 'yup';

export const homeworkValidationSchema = Yup.object().shape({
  title: Yup.string().required('Homework Title is required'),
  class: Yup.string().required('Class is required'),
  description: Yup.string().required('Description is required'),
  divisions: Yup.array()
    .of(
      Yup.object().shape({
        divisionId: Yup.string().required('Division is required'),
        publishDate: Yup.date().required('Publish Date is required'),
        dueDate: Yup.date()
          .required('Due Date is required')
          .min(Yup.ref('publishDate'), 'Due Date cannot be before Publish Date'),
      })
    )
    .min(1, 'At least one Division is required'),
  subject: Yup.string().required('Subject is required'),
  chapters: Yup.array().of(Yup.string()),
  homeworkType: Yup.string().required('Homework Type is required'),
  submissionType: Yup.string().required('Submission type is required'),
  attachments: Yup.array(),
  createdBy: Yup.object(),
});
