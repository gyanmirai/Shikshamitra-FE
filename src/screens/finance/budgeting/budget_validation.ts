import * as Yup from 'yup';

export const validationSchemaForNewBudget = Yup.object({
  categoryType: Yup.string()

    .required('Category type is required'),

  categoryName: Yup.string().required('Category name is required'),

  fundAllocation: Yup.string()
    .required('Expense amount is required')
    .transform((value) => value.replace(/[^0-9.]/g, '')) // Remove non-numeric characters
    .test('is-number', 'Amount must be a valid number greater than zero', (value) => {
      const numericValue = Number(value);
      return numericValue > 0;
    }),
});
