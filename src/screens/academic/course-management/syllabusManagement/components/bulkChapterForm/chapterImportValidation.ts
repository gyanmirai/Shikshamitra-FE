import { MAX_CHAPTER_IMPORT_ROWS } from './chapterImportTypes';
import { asTrimmedText, validateChapterImportRow } from './chapterImportRowValidation';

import type {
  ChapterImportDraft,
  ChapterImportResult,
  ChapterImportColumnKey,
  ChapterImportPreviewRow,
  ChapterImportValidationContext,
} from './chapterImportTypes';

const REQUIRED_COLUMNS: ChapterImportColumnKey[] = [
  'chapterNo',
  'chapterName',
  'startDate',
  'endDate',
];

const COLUMN_LABELS: Record<ChapterImportColumnKey, string> = {
  chapterNo: 'Chapter Number',
  chapterName: 'Chapter Name',
  startDate: 'Start Date',
  endDate: 'End Date',
  description: 'Description',
};

const HEADER_ALIASES: Record<string, ChapterImportColumnKey> = {
  chapterno: 'chapterNo',
  chapternumber: 'chapterNo',
  chaptername: 'chapterName',
  startdate: 'startDate',
  expectedstartdate: 'startDate',
  enddate: 'endDate',
  expectedenddate: 'endDate',
  description: 'description',
};

const normalizeHeader = (value: unknown) =>
  asTrimmedText(value)
    .replace(/^\uFEFF/, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');

export const parseChapterImportRows = (
  matrix: unknown[][],
  reservedChapterNumbers: Iterable<number> = [],
  validationContext: ChapterImportValidationContext = {}
): ChapterImportResult => {
  const columnIndexes = new Map<ChapterImportColumnKey, number>();
  (matrix[0] ?? []).forEach((header, index) => {
    const key = HEADER_ALIASES[normalizeHeader(header)];
    if (key && !columnIndexes.has(key)) columnIndexes.set(key, index);
  });

  const missingColumns = REQUIRED_COLUMNS.filter((key) => !columnIndexes.has(key));
  if (missingColumns.length > 0) {
    return {
      entries: [],
      rows: [],
      errors: [
        `Missing required column${missingColumns.length > 1 ? 's' : ''}: ${missingColumns
          .map((key) => COLUMN_LABELS[key])
          .join(', ')}.`,
      ],
    };
  }

  const dataRows = matrix
    .slice(1)
    .filter((row) => row.some((value) => asTrimmedText(value) !== ''));
  if (dataRows.length === 0) {
    return { entries: [], errors: ['The file does not contain any chapter rows.'], rows: [] };
  }
  if (dataRows.length > MAX_CHAPTER_IMPORT_ROWS) {
    return {
      entries: [],
      rows: [],
      errors: [`A maximum of ${MAX_CHAPTER_IMPORT_ROWS} chapters can be imported at once.`],
    };
  }

  const reservedNumbers = new Set(reservedChapterNumbers);
  const importedNumbers = new Set<number>();
  const entries: ChapterImportDraft[] = [];
  const rows: ChapterImportPreviewRow[] = [];
  const errors: string[] = [];

  dataRows.forEach((row, index) => {
    const valueFor = (key: ChapterImportColumnKey) => {
      const columnIndex = columnIndexes.get(key);
      return columnIndex === undefined ? '' : row[columnIndex];
    };
    const { preview, draft } = validateChapterImportRow(
      {
        chapterNo: valueFor('chapterNo'),
        chapterName: valueFor('chapterName'),
        startDate: valueFor('startDate'),
        endDate: valueFor('endDate'),
        description: valueFor('description'),
      },
      index + 2,
      reservedNumbers,
      importedNumbers,
      validationContext
    );

    rows.push(preview);
    if (draft) entries.push(draft);
    if (preview.errors.length > 0) {
      errors.push(`Row ${preview.rowNumber}: ${preview.errors.join('; ')}.`);
    }
  });

  return errors.length > 0 ? { entries: [], errors, rows } : { entries, errors: [], rows };
};
