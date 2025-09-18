import * as Yup from 'yup';

export const bookReturnValidationSchema = Yup.object().shape({
  bookCondition: Yup.string().required('Book Condition is required'),

  fineAmount: Yup.string().when('bookCondition', {
    is: 'Damaged',
    then: (schema) =>
      schema
        .required('Fine Amount is required')
        .transform((value) => value.replace(/[^0-9.]/g, ''))
        .test('is-number', 'Fine amount must be a valid number greater than zero', (value) => {
          const numericValue = Number(value);
          return numericValue > 0;
        }),
    otherwise: (schema) => schema.notRequired(),
  }),
});
