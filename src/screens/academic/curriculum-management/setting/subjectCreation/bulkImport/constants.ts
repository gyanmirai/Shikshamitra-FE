export const SUBJECT_IMPORT_MAX_BYTES = 5 * 1024 * 1024;
export const SUBJECT_IMPORT_MAX_ROWS = 200;

export const SUBJECT_IMPORT_MIME_TYPES = [
  'text/csv',
  'application/csv',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

export const SUBJECT_IMPORT_ACCEPT = '.csv,.xlsx';

export const SUBJECT_IMPORT_COLUMNS = [
  'Subject Name*',
  'Display Name',
  'Category*',
  'Color*',
  'Icon',
  'Status*',
  'Sort Order',
  'Description',
] as const;

export const SUBJECT_IMPORT_EXAMPLE = [
  'Mathematics',
  'Maths',
  'Scholastic',
  '#0D47A1',
  'calculator',
  'Active',
  1,
  'Core mathematics subject',
] as const;
