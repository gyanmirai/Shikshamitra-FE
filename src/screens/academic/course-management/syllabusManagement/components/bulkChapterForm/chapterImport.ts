import { parseChapterImportRows } from './chapterImportValidation';
import { CHAPTER_IMPORT_HEADERS, MAX_CHAPTER_IMPORT_FILE_SIZE } from './chapterImportTypes';

import type { ChapterImportValidationContext } from './chapterImportTypes';

export { parseChapterImportRows } from './chapterImportValidation';
export {
  CHAPTER_IMPORT_ACCEPT,
  CHAPTER_IMPORT_HEADERS,
  MAX_CHAPTER_IMPORT_ROWS,
  MAX_CHAPTER_IMPORT_FILE_SIZE,
} from './chapterImportTypes';
export type {
  ChapterImportDraft,
  ChapterImportResult,
  ChapterImportPreviewRow,
  ChapterImportValidationContext,
} from './chapterImportTypes';

export const readChapterImportFile = async (
  file: File,
  reservedChapterNumbers: Iterable<number> = [],
  validationContext: ChapterImportValidationContext = {}
) => {
  const extension = file.name.split('.').pop()?.toLowerCase();
  if (!extension || !['xlsx', 'xls', 'csv'].includes(extension)) {
    return {
      entries: [],
      errors: ['Choose an Excel (.xlsx or .xls) or CSV (.csv) file.'],
      rows: [],
    };
  }
  if (file.size > MAX_CHAPTER_IMPORT_FILE_SIZE) {
    return { entries: [], errors: ['The selected file is larger than 5 MB.'], rows: [] };
  }

  const XLSX = await import('xlsx');
  const workbook = XLSX.read(await file.arrayBuffer(), { type: 'array', cellDates: true });
  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) {
    return {
      entries: [],
      errors: ['The selected file does not contain a worksheet.'],
      rows: [],
    };
  }

  const matrix = XLSX.utils.sheet_to_json<unknown[]>(workbook.Sheets[firstSheetName], {
    header: 1,
    defval: '',
    raw: true,
  });
  return parseChapterImportRows(matrix, reservedChapterNumbers, validationContext);
};

export const downloadChapterImportTemplate = async () => {
  const XLSX = await import('xlsx');
  const worksheet = XLSX.utils.aoa_to_sheet([[...CHAPTER_IMPORT_HEADERS]]);
  worksheet['!cols'] = [{ wch: 18 }, { wch: 32 }, { wch: 16 }, { wch: 16 }, { wch: 44 }];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Chapters');
  XLSX.writeFile(workbook, 'chapter-import-template.xlsx', { compression: true });
};
