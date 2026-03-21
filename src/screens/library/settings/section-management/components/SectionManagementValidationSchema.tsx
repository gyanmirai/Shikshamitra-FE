import * as Yup from 'yup';

export const sectionManagementValidationSchema = Yup.object().shape({
  sectionName: Yup.string()
    .required('Section Name is required')
    .test('min-length', 'Section Name is Too short', (value) =>
      value ? value.replace(/\s/g, '').length >= 2 : false
    )
    .test('max-length', 'Section Name is Too long', (value) =>
      value ? value.replace(/\s/g, '').length <= 50 : true
    ),
  numberOfColumns: Yup.number()
    .required('Number of Shelf is required')
    .min(1, 'Number of Shelf must be at least 1')
    .integer('Number of Shelf must be a whole number')
    .typeError('Number of Shelf must be a number'),
});
