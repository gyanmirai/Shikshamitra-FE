import * as Yup from 'yup';

import type { IFeeCategory } from './type';

export const feeCategoryValidationSchema = (
  existingNames: Set<string>,
  editData?: IFeeCategory | null
) =>
  Yup.object().shape({
    name: Yup.string()
      .required('Category Name is required')
      .test('min-length', 'Category Name must be between 3 and 100 characters', (value) =>
        value ? value.trim().length >= 3 : false
      )
      .test('max-length', 'Category Name must be between 3 and 100 characters', (value) =>
        value ? value.trim().length <= 100 : true
      )
      .test('unique-fee-category', 'Category Name already exists', (value) => {
        if (!value?.trim()) return true;
        const trimmed = value.trim().toLowerCase();
        // Allow saving the same name when editing the current record
        if (editData && editData.name?.trim().toLowerCase() === trimmed) return true;
        return !existingNames.has(trimmed);
      }),
    description: Yup.string()
      .max(500, 'Description cannot exceed 500 characters')
      .test('no-only-spaces', 'Description cannot consist of only spaces', (value) => {
        if (!value) return true;
        return value.trim().length > 0;
      })
      .nullable(),
    feeHeads: Yup.array()
      .of(
        Yup.object().shape({
          name: Yup.string()
            .required('Fee Head Name is required')
            .test('min-length', 'Fee Head Name must be between 3 and 40 characters', (value) =>
              value ? value.trim().length >= 3 : false
            )
            .test('max-length', 'Fee Head Name must be between 3 and 40 characters', (value) =>
              value ? value.trim().length <= 40 : true
            ),
          module: Yup.string().required('Module is required'),
          description: Yup.string()
            .max(500, 'Description cannot exceed 500 characters')
            .test('no-only-spaces', 'Description cannot consist of only spaces', (value) => {
              if (!value) return true;
              return value.trim().length > 0;
            })
            .nullable(),
          isConcessionApplied: Yup.boolean().required(),
        })
      )
      .min(1, 'At least one Fee Head is required')
      .test('unique-fee-heads', 'Duplicate Fee Heads are not allowed', (feeHeads) => {
        if (!feeHeads) return true;
        const names = feeHeads.map((fh) => fh.name?.trim().toLowerCase()).filter(Boolean);
        return names.length === new Set(names).size;
      }),
  });
