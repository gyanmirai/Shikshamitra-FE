import * as Yup from 'yup';

import { documentCategories } from './types';

import type { SchoolDocument, DocumentFormValues } from './types';

export const MAX_DOCUMENT_FILES = 5;
export const MAX_DOCUMENT_FILE_BYTES = 5 * 1024 * 1024;
export const documentFileHelp = 'PDF, JPG, JPEG or PNG. Up to 5 files, 5 MB each.';

export function initialDocumentValues(document?: SchoolDocument): DocumentFormValues {
  return {
    name: document?.name ?? '',
    category: document?.category ?? '',
    notes: document?.notes ?? '',
    retainedFiles: document?.files ?? [],
    files: [],
  };
}

export function documentFilesError(files: File[], retainedCount: number): string | undefined {
  if (files.length + retainedCount < 1) return 'Attach at least one file.';
  if (files.length + retainedCount > MAX_DOCUMENT_FILES) return 'Attach no more than 5 files.';
  const invalid = files.find(
    (file) =>
      file.size === 0 ||
      file.size > MAX_DOCUMENT_FILE_BYTES ||
      !/\.(pdf|jpe?g|png)$/i.test(file.name) ||
      !['application/pdf', 'image/jpeg', 'image/png'].includes(file.type)
  );
  return invalid
    ? `${invalid.name}: select a non-empty PDF, JPG or PNG file up to 5 MB.`
    : undefined;
}

export const documentSchema = Yup.object({
  name: Yup.string()
    .trim()
    .required('Enter a document name.')
    .max(200, 'Use 200 characters or fewer.'),
  category: Yup.number()
    .typeError('Select a category.')
    .required('Select a category.')
    .oneOf(
      documentCategories.map((item) => item.value),
      'Select a category.'
    ),
  notes: Yup.string().max(2000, 'Use 2000 characters or fewer.'),
  retainedFiles: Yup.array().required(),
  files: Yup.array()
    .required()
    .test('attachments', function validateFiles(value) {
      const values = this.parent as DocumentFormValues;
      const error = documentFilesError((value ?? []) as File[], values.retainedFiles.length);
      return error ? this.createError({ message: error }) : true;
    }),
});

export function schoolDocumentError(error: unknown): string {
  const status = error && typeof error === 'object' && 'status' in error ? error.status : undefined;
  if (status === 409)
    return 'This document changed while you were editing. Close and reopen it to load the latest version.';
  if (status === 403)
    return 'You do not have permission for this action. Contact your school administrator.';
  if (status === 404)
    return 'This document or attachment is no longer available. Refresh the list.';
  if (status === 400) return 'Review the document details and attachments, then try again.';
  if (status === 413) return 'The upload is too large. Use up to 5 files of 5 MB each.';
  return 'The request could not be completed. Please try again.';
}
