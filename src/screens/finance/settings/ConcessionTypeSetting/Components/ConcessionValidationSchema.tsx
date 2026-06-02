import * as Yup from 'yup';

export const concessionTypeValidationSchema = Yup.object().shape({
  name: Yup.string().trim().required('Concession Name is required'),

  documents: Yup.array().of(
    Yup.object().shape({
      documentName: Yup.string().trim().required('Name is required'),
      documentSize: Yup.number().required('Size is required').max(20, 'Max 20 Size can be add'),
      acceptedFormat: Yup.array()
        .of(Yup.number())
        .min(1, 'At least one file format is required')
        .required('Accepted formats are required'),
    })
  ),
  description: Yup.string().trim(),
});
