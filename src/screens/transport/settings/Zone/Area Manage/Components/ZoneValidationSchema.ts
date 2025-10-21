import * as Yup from 'yup';

export const zoneValidationSchema = Yup.object().shape({
  zoneName: Yup.string()
    .required('Zone Name is required')
    .test('min-length', 'Zone Name is Too short', (value) =>
      value ? value.replace(/\s/g, '').length >= 2 : false
    )
    .test('max-length', 'Zone Name is Too long', (value) =>
      value ? value.replace(/\s/g, '').length <= 50 : true
    ),
});
