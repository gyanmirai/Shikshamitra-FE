import type { AdmissionCrmEntranceExamDto } from 'src/redux/student/admissions-crm/communication-exams-events-contracts';

export type ExamResultImportItem = {
  examRecordId: string;
  totalMarks: number;
  passingMarks: number;
  obtainedMarks: number;
  meritRank?: number;
};

export type ExamResultImportPreview = {
  items: ExamResultImportItem[];
  errors: string[];
};

export const maximumExamResultImportRows = 100;
export const maximumExamResultImportFileBytes = 5 * 1024 * 1024;

const normalizeHeader = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');

const readCell = (row: Record<string, unknown>, names: string[]) => {
  const entries = Object.entries(row);
  const aliases = new Set(names.map(normalizeHeader));
  return entries.find(([key]) => aliases.has(normalizeHeader(key)))?.[1];
};

const readNumber = (value: unknown) => {
  if (value == null || String(value).trim() === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

export const parseExamResultRows = (
  rows: Record<string, unknown>[],
  allowedExamIds: ReadonlySet<string>
): ExamResultImportPreview => {
  const errors: string[] = [];
  const items: ExamResultImportItem[] = [];
  const seenIds = new Set<string>();

  rows.forEach((row, index) => {
    const rowNumber = index + 2;
    const examRecordId = String(
      readCell(row, ['Exam Record ID', 'ExamRecordId', 'Exam ID']) ?? ''
    ).trim();
    const totalMarks = readNumber(readCell(row, ['Total Marks', 'TotalMarks']));
    const passingMarks = readNumber(readCell(row, ['Passing Marks', 'PassingMarks']));
    const obtainedMarks = readNumber(readCell(row, ['Obtained Marks', 'ObtainedMarks', 'Marks']));
    const meritRank = readNumber(readCell(row, ['Merit Rank', 'MeritRank', 'Rank']));

    if (!examRecordId) {
      errors.push(`Row ${rowNumber}: Exam Record ID is required.`);
      return;
    }
    if (!allowedExamIds.has(examRecordId)) {
      errors.push(`Row ${rowNumber}: Exam Record ID is not in the selected exams.`);
      return;
    }
    if (seenIds.has(examRecordId)) {
      errors.push(`Row ${rowNumber}: Exam Record ID is duplicated.`);
      return;
    }
    seenIds.add(examRecordId);
    if (totalMarks == null || totalMarks <= 0) {
      errors.push(`Row ${rowNumber}: Total Marks must be greater than 0.`);
      return;
    }
    if (passingMarks == null || passingMarks < 0 || passingMarks > totalMarks) {
      errors.push(`Row ${rowNumber}: Passing Marks must be between 0 and Total Marks.`);
      return;
    }
    if (obtainedMarks == null || obtainedMarks < 0 || obtainedMarks > totalMarks) {
      errors.push(`Row ${rowNumber}: Obtained Marks must be between 0 and Total Marks.`);
      return;
    }
    if (meritRank != null && (!Number.isInteger(meritRank) || meritRank <= 0)) {
      errors.push(`Row ${rowNumber}: Merit Rank must be a positive whole number.`);
      return;
    }

    items.push({
      examRecordId,
      totalMarks,
      passingMarks,
      obtainedMarks,
      ...(meritRank == null ? {} : { meritRank }),
    });
  });

  return { items, errors };
};

export const readExamResultImportFile = async (file: File, allowedExamIds: ReadonlySet<string>) => {
  const extension = file.name.split('.').pop()?.toLowerCase();
  if (!extension || !['csv', 'xls', 'xlsx'].includes(extension)) {
    return {
      items: [],
      errors: ['Choose a CSV, XLS, or XLSX result file.'],
    } satisfies ExamResultImportPreview;
  }
  if (file.size > maximumExamResultImportFileBytes) {
    return {
      items: [],
      errors: ['The result file must be 5 MB or smaller.'],
    } satisfies ExamResultImportPreview;
  }

  const XLSX = await import('xlsx');
  const workbook = XLSX.read(await file.arrayBuffer(), { type: 'array' });
  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) {
    return { items: [], errors: ['The result file has no worksheet.'] };
  }
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(workbook.Sheets[firstSheetName], {
    defval: '',
  });
  if (rows.length === 0) {
    return { items: [], errors: ['The result file has no data rows.'] };
  }
  if (rows.length > maximumExamResultImportRows) {
    return {
      items: [],
      errors: [`The result file cannot contain more than ${maximumExamResultImportRows} rows.`],
    };
  }
  return parseExamResultRows(rows, allowedExamIds);
};

export const downloadExamResultTemplate = async (exams: AdmissionCrmEntranceExamDto[]) => {
  const XLSX = await import('xlsx');
  const rows = exams.map((exam) => ({
    'Exam Record ID': exam.id,
    Applicant: exam.applicantName,
    'Total Marks': exam.totalMarks || 100,
    'Passing Marks': exam.passingMarks || 40,
    'Obtained Marks': exam.obtainedMarks ?? '',
    'Merit Rank': exam.meritRank ?? '',
  }));
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Exam Results');
  XLSX.writeFile(workbook, 'admission-exam-results-template.xlsx');
};
