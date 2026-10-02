import type { IExamMarkItem } from './type';

export const buildMarksPayload = (rows: IExamMarkItem[]) =>
  rows.map((row) => ({
    studentId: row.studentId,
    attendanceStatus: row.attendanceStatus ?? null,
    obtainedMarks: row.attendanceStatus === 0 ? row.marks : null,
    feedback: row.attendanceStatus === 0 ? (row.feedback ?? '') : '',
  }));
