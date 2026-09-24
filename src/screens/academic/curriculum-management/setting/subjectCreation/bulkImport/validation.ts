import * as Yup from 'yup';

import { SUBJECT_ICONS, SUBJECT_CATEGORIES } from '../type';
import {
  SUBJECT_IMPORT_ACCEPT,
  SUBJECT_IMPORT_MAX_BYTES,
  SUBJECT_IMPORT_MIME_TYPES,
} from './constants';

import type { SubjectImportValues } from './types';

const statuses = ['Active', 'Inactive', 'Archived'];
const icons = SUBJECT_ICONS.map(({ value }) => value);

export const subjectImportFileSchema = Yup.mixed<File>()
  .required('Select a CSV or Excel file.')
  .test(
    'file-size',
    'File size must be 5 MB or less.',
    (file) => !file || file.size <= SUBJECT_IMPORT_MAX_BYTES
  )
  .test('file-extension', `Only ${SUBJECT_IMPORT_ACCEPT} files are supported.`, (file) => {
    if (!file) return true;
    return /\.(csv|xlsx)$/i.test(file.name);
  })
  .test('file-type', 'The selected file format does not match CSV or Excel.', (file) => {
    if (!file?.type) return true;
    return SUBJECT_IMPORT_MIME_TYPES.includes(file.type);
  });

const subjectRowSchema = Yup.object({
  name: Yup.string()
    .trim()
    .min(2)
    .max(100)
    .matches(/^[a-zA-Z0-9\s]+$/)
    .required(),
  displayName: Yup.string()
    .trim()
    .max(50)
    .matches(/^[a-zA-Z0-9\s]*$/),
  category: Yup.string()
    .oneOf([...SUBJECT_CATEGORIES])
    .required(),
  color: Yup.string()
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .required(),
  icon: Yup.string().oneOf(['', ...icons]),
  status: Yup.string().oneOf(statuses).required(),
  sortOrder: Yup.string().test('sort-order', 'invalid', (value) => {
    if (!value) return true;
    const number = Number(value);
    return Number.isInteger(number) && number >= 1 && number <= 999999;
  }),
  description: Yup.string().max(500),
});

export const validateSubjectImportRow = (values: SubjectImportValues) => {
  try {
    subjectRowSchema.validateSync(values, { abortEarly: false });
    return [];
  } catch (error) {
    if (!(error instanceof Yup.ValidationError)) return ['Row contains invalid values.'];
    const labels: Record<string, string> = {
      name: 'Subject name',
      displayName: 'Display name',
      category: 'Category',
      color: 'Color',
      icon: 'Icon',
      status: 'Status',
      sortOrder: 'Sort order',
      description: 'Description',
    };
    return [
      ...new Set(error.inner.map((issue) => `${labels[issue.path || ''] || 'Value'} is invalid.`)),
    ];
  }
};
