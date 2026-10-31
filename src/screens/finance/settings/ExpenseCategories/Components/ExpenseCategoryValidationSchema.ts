import { financeNameSchema } from 'src/utils/finance-name';
import * as Yup from 'yup';

import type { IExpenseCategory } from './type';

export const expenseCategoryValidationSchema = (
  existingNames: Set<string>,
  editData?: IExpenseCategory | null
) =>
  Yup.object().shape({
    name: financeNameSchema('Expense Category Name')
      .trim()
      .max(128, 'Expense Category Name must be at most 128 characters')
      .required('Expense Category Name is required')
      .test('unique-expense-category', 'This expense category name already exists', (value) => {
        if (!value?.trim()) return true;
        const trimmed = value.trim().toLowerCase();
        // Allow saving the same name when editing the current record
        if (editData && editData.name.trim().toLowerCase() === trimmed) return true;
        return !existingNames.has(trimmed);
      }),
  });
