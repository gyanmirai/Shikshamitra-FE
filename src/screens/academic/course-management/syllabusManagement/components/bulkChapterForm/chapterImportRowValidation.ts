import dayjs from 'dayjs';
import {
  MAX_CHAPTER_NUMBER,
  MIN_CHAPTER_NUMBER,
} from 'src/screens/academic/course-management/syllabusManagement/chapterNumber';

import type {
  ChapterImportDraft,
  ChapterImportPreviewRow,
  ChapterImportValidationContext,
} from './chapterImportTypes';

type RawChapterRow = {
  chapterNo: unknown;
  chapterName: unknown;
  startDate: unknown;
  endDate: unknown;
  description: unknown;
};

export const asTrimmedText = (value: unknown) => String(value ?? '').trim();

const parseDate = (value: unknown) => {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return dayjs(value);

  if (typeof value === 'number' && Number.isFinite(value)) {
    const excelEpoch = Date.UTC(1899, 11, 30);
    const parsed = dayjs(new Date(excelEpoch + Math.floor(value) * 24 * 60 * 60 * 1000));
    return parsed.isValid() ? parsed.startOf('day') : null;
  }

  const text = asTrimmedText(value);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) return null;
  const parsed = dayjs(text);
  return parsed.isValid() && parsed.format('YYYY-MM-DD') === text ? parsed : null;
};

const validateDateRange = (
  startDate: ReturnType<typeof dayjs> | null,
  endDate: ReturnType<typeof dayjs> | null,
  context: ChapterImportValidationContext,
  errors: string[]
) => {
  const today = context.today ? dayjs(context.today).startOf('day') : dayjs().startOf('day');
  const yearStart = context.academicYearStart ? dayjs(context.academicYearStart) : null;
  const yearEnd = context.academicYearEnd ? dayjs(context.academicYearEnd) : null;

  if (startDate?.isBefore(today, 'day')) errors.push('Start Date cannot be in the past');
  if (endDate?.isBefore(today, 'day')) errors.push('End Date cannot be in the past');
  if (startDate && yearStart?.isValid() && startDate.isBefore(yearStart, 'day')) {
    errors.push('Start Date is before the academic year');
  }
  if (startDate && yearEnd?.isValid() && startDate.isAfter(yearEnd, 'day')) {
    errors.push('Start Date is after the academic year');
  }
  if (endDate && yearStart?.isValid() && endDate.isBefore(yearStart, 'day')) {
    errors.push('End Date is before the academic year');
  }
  if (endDate && yearEnd?.isValid() && endDate.isAfter(yearEnd, 'day')) {
    errors.push('End Date is after the academic year');
  }
  if (startDate && endDate && endDate.isBefore(startDate, 'day')) {
    errors.push('End Date cannot be before Start Date');
  }
};

export const validateChapterImportRow = (
  raw: RawChapterRow,
  rowNumber: number,
  reservedNumbers: Set<number>,
  importedNumbers: Set<number>,
  context: ChapterImportValidationContext
) => {
  const rawChapterNumber = asTrimmedText(raw.chapterNo);
  const chapterNo = Number(rawChapterNumber);
  const chapterName = asTrimmedText(raw.chapterName);
  const description = asTrimmedText(raw.description);
  const startDate = parseDate(raw.startDate);
  const endDate = parseDate(raw.endDate);
  const errors: string[] = [];
  const isValidNumber =
    rawChapterNumber !== '' &&
    Number.isInteger(chapterNo) &&
    chapterNo >= MIN_CHAPTER_NUMBER &&
    chapterNo <= MAX_CHAPTER_NUMBER;

  if (!isValidNumber) {
    errors.push(
      `Chapter Number must be a whole number between ${MIN_CHAPTER_NUMBER} and ${MAX_CHAPTER_NUMBER}`
    );
  } else if (reservedNumbers.has(chapterNo)) {
    errors.push(`Chapter Number ${chapterNo} already exists in the current chapter list`);
  } else if (importedNumbers.has(chapterNo)) {
    errors.push(`Chapter Number ${chapterNo} is duplicated in this file`);
  }
  if (isValidNumber) importedNumbers.add(chapterNo);
  if (chapterName.length < 3) errors.push('Chapter Name must contain at least 3 characters');
  if (!startDate) errors.push('Start Date must use YYYY-MM-DD');
  if (!endDate) errors.push('End Date must use YYYY-MM-DD');
  validateDateRange(startDate, endDate, context, errors);

  const preview: ChapterImportPreviewRow = {
    rowNumber,
    chapterNo: rawChapterNumber,
    chapterName,
    startDate: startDate?.format('YYYY-MM-DD') ?? asTrimmedText(raw.startDate),
    endDate: endDate?.format('YYYY-MM-DD') ?? asTrimmedText(raw.endDate),
    description,
    errors,
  };
  const draft: ChapterImportDraft | null =
    errors.length === 0 && startDate && endDate
      ? { chapterNo, chapterName, description, startDate, endDate, documents: [] }
      : null;

  return { preview, draft };
};
