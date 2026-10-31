import { financeNameSchema } from 'src/utils/finance-name';
import * as Yup from 'yup';

import type { IConcessionTypeForm } from '../type';

export const concessionTypeValidationSchema = (
  existingNames: Set<string>,
  editData?: IConcessionTypeForm | null
) =>
  Yup.object().shape({
    name: financeNameSchema('Concession Type Name')
      .trim()
      .max(100, 'Concession Type Name cannot exceed 100 characters')
      .required('Concession Type Name is required')
      .test('unique-concession-type', 'This concession type name already exists', (value) => {
        if (!value?.trim()) return true;
        const trimmed = value.trim().toLowerCase();
        // Allow saving the same name when editing the current record
        if (editData && editData.name.trim().toLowerCase() === trimmed) return true;
        return !existingNames.has(trimmed);
      }),

    documents: Yup.array()
      .of(
        Yup.object().shape({
          documentName: financeNameSchema('Document Name')
            .trim()
            .max(100, 'Document Name cannot exceed 100 characters')
            .required('Document Name is required'),
          maxFileSizeMb: Yup.number()
            .typeError('Maximum file size is required')
            .moreThan(0, 'Maximum file size must be greater than 0 MB')
            .max(20, 'Maximum allowed file size is 20 MB')
            .required('Maximum file size is required'),
          acceptedFormats: Yup.array()
            .of(Yup.number())
            .min(1, 'At least one file format is required')
            .required('Accepted formats are required'),
          isRequired: Yup.boolean().required(),
        })
      )
      .test(
        'unique-document-names',
        'Document names must be unique within the concession type',
        (documents) => {
          if (!documents) return true;
          const names = documents
            .map((document) => document?.documentName?.trim().replace(/\s+/g, ' ').toLowerCase())
            .filter(Boolean);
          return new Set(names).size === names.length;
        }
      ),
    description: Yup.string().trim().max(500, 'Description cannot exceed 500 characters'),
  });
