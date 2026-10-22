import * as Yup from 'yup';

import type { IFeeCategory } from './type';

export const feeCategoryValidationSchema = (
  existingNames: Set<string>,
  editData?: IFeeCategory | null,
  existingCategories: IFeeCategory[] = []
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
      .test('unique-fee-category', 'Category Name already exists', function checkUnique(value) {
        if (!value?.trim()) return true;
        const trimmed = value.trim().replace(/\s+/g, ' ').toLowerCase();
        // Allow saving the same name when editing the current record
        if (editData && editData.name?.trim().replace(/\s+/g, ' ').toLowerCase() === trimmed)
          return true;
        const duplicate = existingCategories.find(
          (category) =>
            category.id !== editData?.id &&
            category.name.trim().replace(/\s+/g, ' ').toLowerCase() === trimmed
        );
        if (duplicate)
          return this.createError({
            message: duplicate.isActive
              ? 'Category name already exists in Current categories. Use a different name.'
              : 'Category name already exists in Archived categories. Restore it from the Archived tab or use a different name.',
          });
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
          incomeCategoryId: Yup.string().required('Income Category is required'),
          name: Yup.string()
            .required('Fee Head Name is required')
            .test('min-length', 'Fee Head Name must be between 3 and 40 characters', (value) =>
              value ? value.trim().length >= 3 : false
            )
            .test('max-length', 'Fee Head Name must be between 3 and 40 characters', (value) =>
              value ? value.trim().length <= 40 : true
            ),
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
