import * as Yup from 'yup';

export const vehicleDocumentValidationSchema = Yup.object().shape({
  documentName: Yup.string()
    .required('Document Name is required')
    .test('min-length', 'Name is Too short', (value) =>
      value ? value.replace(/\s/g, '').length >= 2 : false
    )
    .test('max-length', 'Name is Too long', (value) =>
      value ? value.replace(/\s/g, '').length <= 50 : true
    ),
  documentSize: Yup.string()
    .required('Document Size is required')
    .test('valid-number', 'Must be a valid number', (value) =>
      value ? /^\d+$/.test(value) : false
    ),
  acceptedFormat: Yup.array()
    .min(1, 'At least one accepted format must be selected')
    .required('Accepted Format is required'),
});
