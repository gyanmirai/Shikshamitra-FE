import * as Yup from 'yup';

import type { IIncomeCategory } from './type';

export const incomeCategoryValidationSchema = (
  existingNames: Set<string>,
  editData?: IIncomeCategory | null
) =>
  Yup.object().shape({
    name: Yup.string()
      .required('Income Category Name is required')
      .test('unique-income-category', 'This income category name already exists', (value) => {
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
  });
