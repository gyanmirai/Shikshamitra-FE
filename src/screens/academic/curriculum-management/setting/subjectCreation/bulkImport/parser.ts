import { validateSubjectImportRow } from './validation';
import { SUBJECT_IMPORT_COLUMNS, SUBJECT_IMPORT_MAX_ROWS } from './constants';

import type { SubjectImportRow, SubjectImportResult, SubjectImportValues } from './types';

const normalizeHeader = (value: unknown) =>
  String(value ?? '')
    .trim()
    .replace(/\*$/, '')
    .toLowerCase();
const expectedHeaders = SUBJECT_IMPORT_COLUMNS.map(normalizeHeader);
const requiredHeaders = ['subject name', 'category', 'color', 'status'];

const toText = (value: unknown) => String(value ?? '').trim();

const toValues = (row: unknown[], indexes: Map<string, number>): SubjectImportValues => {
  const value = (header: string) => toText(row[indexes.get(header) ?? -1]);
  return {
    name: value('subject name'),
    displayName: value('display name'),
    category: value('category'),
    color: value('color'),
    icon: value('icon').toLowerCase(),
    status: value('status'),
    sortOrder: value('sort order'),
    description: value('description'),
  };
};

const isBlankRow = (row: unknown[]) => row.every((cell) => toText(cell) === '');

export const parseSubjectImportMatrix = (
  matrix: unknown[][],
  existingNames: ReadonlySet<string>
): SubjectImportResult => {
  if (matrix.length === 0 || isBlankRow(matrix[0] || []))
    return { rows: [], fileError: 'The file is empty.' };
  const headers = matrix[0].map(normalizeHeader);
  const indexes = new Map(headers.map((header, index) => [header, index]));
  const missing = requiredHeaders.filter((header) => !indexes.has(header));
  const unsupported = headers.filter((header) => header && !expectedHeaders.includes(header));
  if (missing.length)
    return { rows: [], fileError: `Missing required column(s): ${missing.join(', ')}.` };
  if (unsupported.length)
    return { rows: [], fileError: `Unsupported column(s): ${unsupported.join(', ')}.` };

  const sourceRows = matrix.slice(1).filter((row) => !isBlankRow(row));
  if (!sourceRows.length)
    return { rows: [], fileError: 'Add at least one subject below the header row.' };
  if (sourceRows.length > SUBJECT_IMPORT_MAX_ROWS) {
    return {
      rows: [],
      fileError: `A maximum of ${SUBJECT_IMPORT_MAX_ROWS} subjects can be imported at once.`,
    };
  }

  const counts = new Map<string, number>();
  const values = sourceRows.map((row) => toValues(row, indexes));
  values.forEach(({ name }) =>
    counts.set(name.toLowerCase(), (counts.get(name.toLowerCase()) || 0) + 1)
  );
  const rows: SubjectImportRow[] = values.map((row, index) => {
    const normalizedName = row.name.toLowerCase();
    const issues = validateSubjectImportRow(row);
    if (normalizedName && counts.get(normalizedName)! > 1)
      issues.push('Duplicate subject name in this file.');
    if (normalizedName && existingNames.has(normalizedName)) issues.push('Subject already exists.');
    return { ...row, rowNumber: index + 2, issues };
  });
  return { rows };
};

export const parseSubjectImportFile = async (file: File, existingNames: ReadonlySet<string>) => {
  const XLSX = await import('xlsx');
  const workbook = XLSX.read(await file.arrayBuffer(), { type: 'array' });
  const firstSheet = workbook.SheetNames[0];
  if (!firstSheet) return { rows: [], fileError: 'The file does not contain a worksheet.' };
  const matrix = XLSX.utils.sheet_to_json<unknown[]>(workbook.Sheets[firstSheet], {
    header: 1,
    defval: '',
  });
  return parseSubjectImportMatrix(matrix, existingNames);
};
