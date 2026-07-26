import { it, expect, describe } from 'vitest';

import {
  parseExamResultRows,
  readExamResultImportFile,
  maximumExamResultImportRows,
  maximumExamResultImportFileBytes,
} from './exam-result-import';

describe('exam result import', () => {
  const selected = new Set(['exam-1', 'exam-2']);

  it('parses distinct per-applicant marks from scanner or spreadsheet headers', () => {
    const result = parseExamResultRows(
      [
        {
          'Exam Record ID': 'exam-1',
          'Total Marks': 100,
          'Passing Marks': 40,
          'Obtained Marks': 81,
          'Merit Rank': 2,
        },
        {
          ExamRecordId: 'exam-2',
          TotalMarks: 50,
          PassingMarks: 20,
          Marks: 31,
        },
      ],
      selected
    );

    expect(result.errors).toEqual([]);
    expect(result.items).toEqual([
      {
        examRecordId: 'exam-1',
        totalMarks: 100,
        passingMarks: 40,
        obtainedMarks: 81,
        meritRank: 2,
      },
      {
        examRecordId: 'exam-2',
        totalMarks: 50,
        passingMarks: 20,
        obtainedMarks: 31,
      },
    ]);
  });

  it('rejects duplicate, unselected, and invalid result rows without silently overwriting', () => {
    const result = parseExamResultRows(
      [
        {
          ExamRecordId: 'exam-1',
          TotalMarks: 100,
          PassingMarks: 40,
          ObtainedMarks: 70,
        },
        {
          ExamRecordId: 'exam-1',
          TotalMarks: 100,
          PassingMarks: 40,
          ObtainedMarks: 75,
        },
        {
          ExamRecordId: 'exam-3',
          TotalMarks: 100,
          PassingMarks: 40,
          ObtainedMarks: 75,
        },
        {
          ExamRecordId: 'exam-2',
          TotalMarks: 100,
          PassingMarks: 110,
          ObtainedMarks: 75,
        },
      ],
      selected
    );

    expect(result.items).toHaveLength(1);
    expect(result.errors).toEqual([
      'Row 3: Exam Record ID is duplicated.',
      'Row 4: Exam Record ID is not in the selected exams.',
      'Row 5: Passing Marks must be between 0 and Total Marks.',
    ]);
  });

  it('rejects result files larger than 5 MB before parsing', async () => {
    const file = new File(
      [new Uint8Array(maximumExamResultImportFileBytes + 1)],
      'exam-results.csv'
    );

    await expect(readExamResultImportFile(file, selected)).resolves.toEqual({
      items: [],
      errors: ['The result file must be 5 MB or smaller.'],
    });
  });

  it('rejects result files with more than the backend batch limit', async () => {
    const header = 'Exam Record ID,Total Marks,Passing Marks,Obtained Marks';
    const rows = Array.from(
      { length: maximumExamResultImportRows + 1 },
      (_, index) => `exam-${index + 1},100,40,75`
    );
    const file = new File([[header, ...rows].join('\n')], 'exam-results.csv');

    await expect(readExamResultImportFile(file, selected)).resolves.toEqual({
      items: [],
      errors: [`The result file cannot contain more than ${maximumExamResultImportRows} rows.`],
    });
  });
});
