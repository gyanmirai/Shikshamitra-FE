import * as Yup from 'yup';

export const feeCategoryValidationSchema = Yup.object().shape({
  feeCategoryName: Yup.string()
    .required('Fee Category Name is required')
    .test('min-length', 'Fee Category Name is Too short', (value) =>
      value ? value.replace(/\s/g, '').length >= 2 : false
    )
    .test('max-length', 'Fee Category Name is Too long', (value) =>
      value ? value.replace(/\s/g, '').length <= 50 : true
    ),
});
