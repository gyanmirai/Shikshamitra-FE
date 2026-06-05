import * as Yup from 'yup';

import type { IFeeCategory } from './type';

export const feeCategoryValidationSchema = (
  existingNames: Set<string>,
  editData?: IFeeCategory | null
) =>
  Yup.object().shape({
    name: Yup.string()
      .required('Fee Category Name is required')
      .test('min-length', 'Fee Category Name is Too short', (value) =>
        value ? value.replace(/\s/g, '').length >= 2 : false
      )
      .test('max-length', 'Fee Category Name is Too long', (value) =>
        value ? value.replace(/\s/g, '').length <= 50 : true
      )
      .test('unique-fee-category', 'This fee category name already exists', (value) => {
        if (!value?.trim()) return true;
        const trimmed = value.trim().toLowerCase();
        // Allow saving the same name when editing the current record
        if (editData && editData.name.trim().toLowerCase() === trimmed) return true;
        return !existingNames.has(trimmed);
      }),
  });
