import * as Yup from 'yup';

export const concessionTypeValidationSchema = Yup.object().shape({
  name: Yup.string().trim().required('Concession Name is required'),

  concessionType: Yup.string()
    .oneOf(['fixed', 'percentage'], 'Invalid concession type')
    .required('Concession Type is required'),

  amount: Yup.number().when('concessionType', {
    is: 'fixed',
    then: (schema) => schema.required('Amount is required'),
    otherwise: (schema) => schema.notRequired(),
  }),

  percentage: Yup.number().when('concessionType', {
    is: 'percentage',
    then: (schema) =>
      schema
        .required('Percentage is required')
        .min(0, 'Percentage cannot be less than 0')
        .max(100, 'Percentage cannot exceed 100'),
    otherwise: (schema) => schema.notRequired(),
  }),

  applicableFeeHeads: Yup.array()
    .of(Yup.string().trim())
    .min(1, 'At least one fee head must be selected'),

  documentRequired: Yup.boolean(),

  documents: Yup.array().when('documentRequired', {
    is: true,
    then: (schema) =>
      schema
        .of(
          Yup.object().shape({
            documentName: Yup.string().trim().required('Document Name is required'),
            documentSize: Yup.number()
              .required('Document Size is required')
              .max(20, 'Max 20 Document Size can be add'),
            acceptedFormat: Yup.array()
              .of(Yup.number())
              .min(1, 'At least one file format is required')
              .required('Accepted formats are required'),
          })
        )
        .min(1, 'At least one document is required'),
    otherwise: (schema) => schema.notRequired(),
  }),

  description: Yup.string().trim(),
});
