import * as Yup from 'yup';

export const requestResourceValidationSchema = Yup.object().shape({
  issueDescription: Yup.string().required('Issue description is required'),

  issueSupportingDocument: Yup.string().required('Issue supporting document is required'),

  requiredByDate: Yup.date().required('Required by date is required'),
  priority: Yup.string().required(),
});

export const NewRequestResourceValidationSchema = Yup.object().shape({
  reasonForNewResource: Yup.string().required('Reason is required'),

  requiredByDate: Yup.date().required('Required by date is required'),
  priority: Yup.string().required(),
});
