import * as Yup from 'yup';

import type { IConcessionTypeForm } from '../type';

export const concessionTypeValidationSchema = (
  existingNames: Set<string>,
  editData?: IConcessionTypeForm | null
) =>
  Yup.object().shape({
    name: Yup.string()
      .trim()
      .required('Concession Name is required')
      .test('unique-concession-type', 'This concession name already exists', (value) => {
        if (!value?.trim()) return true;
        const trimmed = value.trim().toLowerCase();
        // Allow saving the same name when editing the current record
        if (editData && editData.name.trim().toLowerCase() === trimmed) return true;
        return !existingNames.has(trimmed);
      }),

    documents: Yup.array().of(
      Yup.object().shape({
        documentName: Yup.string().trim().required('Name is required'),
        documentSize: Yup.number().required('Size is required').max(20, 'Max 20 Size can be add'),
        acceptedFormat: Yup.array()
          .of(Yup.number())
          .min(1, 'At least one file format is required')
          .required('Accepted formats are required'),
      })
    ),
    description: Yup.string().trim(),
  });
