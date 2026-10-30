import { financeNameSchema } from 'src/utils/finance-name';
import * as Yup from 'yup';

import type { IIncomeCategory } from './type';

export const incomeCategoryValidationSchema = (
  existingNames: Set<string>,
  editData?: IIncomeCategory | null
) =>
  Yup.object().shape({
    name: financeNameSchema('Income Category Name')
      .trim()
      .max(40, 'Income Category Name must be at most 40 characters')
      .required('Income Category Name is required')
      .test('unique-income-category', 'This income category name already exists', (value) => {
        if (!value?.trim()) return true;
        const trimmed = value.trim().toLowerCase();
        // Allow saving the same name when editing the current record
        if (editData && editData.name.trim().toLowerCase() === trimmed) return true;
        return !existingNames.has(trimmed);
      }),
  });
