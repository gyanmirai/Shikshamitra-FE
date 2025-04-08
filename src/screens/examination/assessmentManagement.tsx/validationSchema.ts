import * as Yup from 'yup';

export const validationSchema = Yup.object().shape({
  className: Yup.string().required('Class is required'),
  division: Yup.string().required('Division is required'),
  subject: Yup.string().required('Subject is required'),
  assesmentTitle: Yup.string().required('Assessment title is required'),
  assessmentType: Yup.string().required('Assessment type is required'),
  examName: Yup.string().required('Exam name is required'),
  assignmentName: Yup.string().required('Assignment name is required'),
  createDate: Yup.date().required('Create date is required').typeError('Invalid create date'),
  dueDate: Yup.date()
    .nullable()
    .required('Due date is required')
    .min(Yup.ref('createDate'), 'Due date must be after the create date')
    .typeError('Invalid due date'),
  publish: Yup.boolean(),
  status: Yup.string().required('Status is required'),
});
