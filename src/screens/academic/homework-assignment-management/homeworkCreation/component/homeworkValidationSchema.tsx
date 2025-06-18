import * as Yup from 'yup';

export const homeworkValidationSchema = Yup.object().shape({
  title: Yup.string().required('Homework Title is required'),
  class: Yup.string().required('Class is required'),
  division: Yup.array()
    .of(Yup.string().required('Division is required'))
    .min(1, 'At least one division is required'),
  subject: Yup.string().required('Subject is required'),
  chapters: Yup.array().of(Yup.string()),
  homeworkType: Yup.string().required('Homework type is required'),
  submissionType: Yup.string().required('Submission type is required'),
  attachments: Yup.array(),
  createdBy: Yup.string(),
  status: Yup.string().oneOf(['draft', 'publish']),
  endDate: Yup.date().required('End Date is required'),
  startDate: Yup.date().required('Start Date is required'),
});
