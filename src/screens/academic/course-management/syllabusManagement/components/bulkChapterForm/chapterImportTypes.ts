import type { IBulkChapterEntry } from './type';

export const MAX_CHAPTER_IMPORT_ROWS = 200;
export const MAX_CHAPTER_IMPORT_FILE_SIZE = 5 * 1024 * 1024;
export const CHAPTER_IMPORT_ACCEPT = '.xlsx,.xls,.csv';

export const CHAPTER_IMPORT_HEADERS = [
  'Chapter Number',
  'Chapter Name',
  'Start Date',
  'End Date',
  'Description',
] as const;

export type ChapterImportDraft = Omit<IBulkChapterEntry, 'uid' | 'chapterId'>;
export type ChapterImportColumnKey =
  'chapterNo' | 'chapterName' | 'startDate' | 'endDate' | 'description';

export interface ChapterImportPreviewRow {
  rowNumber: number;
  chapterNo: string;
  chapterName: string;
  startDate: string;
  endDate: string;
  description: string;
  errors: string[];
}

export interface ChapterImportResult {
  entries: ChapterImportDraft[];
  errors: string[];
  rows: ChapterImportPreviewRow[];
}

export interface ChapterImportValidationContext {
  academicYearStart?: string;
  academicYearEnd?: string;
  today?: string;
}
