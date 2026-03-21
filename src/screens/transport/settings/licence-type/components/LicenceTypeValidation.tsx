import * as Yup from 'yup';

export const licenceTypeValidationSchema = Yup.object().shape({
  typeName: Yup.string()
    .required('Type Name is required')
    .test('min-length', 'Type Name is Too short', (value) =>
      value ? value.replace(/\s/g, '').length >= 2 : false
    )
    .test('max-length', 'Type Name is Too long', (value) =>
      value ? value.replace(/\s/g, '').length <= 50 : true
    ),
});
