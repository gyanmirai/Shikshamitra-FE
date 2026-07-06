import * as Yup from 'yup';

import type { IExpenseCategory } from './type';

export const expenseCategoryValidationSchema = (
  existingNames: Set<string>,
  editData?: IExpenseCategory | null
) =>
  Yup.object().shape({
    name: Yup.string()
      .required('Expense Category Name is required')
      .test('unique-expense-category', 'This expense category name already exists', (value) => {
        if (!value?.trim()) return true;
        const trimmed = value.trim().toLowerCase();
        // Allow saving the same name when editing the current record
        if (editData && editData.name.trim().toLowerCase() === trimmed) return true;
        return !existingNames.has(trimmed);
      }),
    tags: Yup.array()
      .of(Yup.string().required('Each tag must be a non-empty string'))
      .min(1, 'At least one tag is required')
      .required('Tags are required'),
    expenseHeadId: Yup.string().nullable(),
  });
