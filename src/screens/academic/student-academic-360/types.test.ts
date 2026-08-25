import { it, expect, describe } from 'vitest';

import { getStudentId } from './types';
import {
  getExamStatusCategory,
  isExamGradingCompleted,
  getParsedExamDetails,
} from './components/ExamsResultsDashboardCard';

describe('getStudentId', () => {
  it('uses the canonical studentId when both identifiers are present', () => {
    expect(getStudentId({ studentId: 'student-id', id: 'enrollment-id' })).toBe('student-id');
  });

  it('falls back to id when studentId is empty', () => {
    expect(getStudentId({ studentId: '  ', id: 'student-id' })).toBe('student-id');
  });
});

describe('getExamStatusCategory and isExamGradingCompleted', () => {
  it('classifies published/scheduled/upcoming exams as UPCOMING', () => {
    expect(getExamStatusCategory({ examName: 'Unit Test 1', status: 'PUBLISHED' })).toBe('UPCOMING');
    expect(getExamStatusCategory({ examName: 'Midterm', status: 'ONGOING' })).toBe('UPCOMING');
    expect(getExamStatusCategory({ examName: 'Nikhil exam oral exams', examStatus: 'Completed', gradingStatus: 'Not Started' })).toBe('UPCOMING');
    expect(isExamGradingCompleted({ examName: 'Nikhil exam oral exams', examStatus: 'Completed', gradingStatus: 'Not Started' })).toBe(false);
  });

  it('classifies exams with completed grading status or results as COMPLETED', () => {
    expect(getExamStatusCategory({ examName: 'Term 1', status: 'COMPLETED', gradingStatus: 'Completed' })).toBe('COMPLETED');
    expect(getExamStatusCategory({ examName: 'Term 1', percentage: 85 })).toBe('COMPLETED');
    expect(getExamStatusCategory({ examName: 'Term 1', grade: 'A' })).toBe('COMPLETED');
    expect(getExamStatusCategory({ examName: 'Term 1', resultPublished: true })).toBe('COMPLETED');
    expect(isExamGradingCompleted({ examName: 'One day exam', examStatus: 'Completed', gradingStatus: 'Completed', resultAvailable: true })).toBe(true);
  });
});

describe('getParsedExamDetails', () => {
  it('correctly parses multi-day exam dates, times, subjects, and total marks', () => {
    const details = getParsedExamDetails({
      examName: 'exam prerna',
      startDate: '2026-08-26T14:30:00',
      endDate: '2026-08-28T15:30:00',
      subjects: [
        { subjectName: 'English' },
        { subjectName: 'Science' },
        { subjectName: 'Maths' },
      ],
      totalMarks: 300,
    });

    expect(details.startDateStr).toBe('26-08-2026');
    expect(details.endDateStr).toBe('28-08-2026');
    expect(details.isDateRange).toBe(true);
    expect(details.timeStr).toBe('02:30 PM – 03:30 PM');
    expect(details.subjectSummary).toBe('3 Subjects (English, Science +1)');
    expect(details.allSubjectsTooltip).toBe('English, Science, Maths');
    expect(details.totalMarksStr).toBe('300 Marks');
  });

  it('correctly parses single-day exam without duplicating dates', () => {
    const details = getParsedExamDetails({
      examName: 'Single Day Test',
      startDate: '2026-08-26T10:00:00',
      endDate: '2026-08-26T11:30:00',
      subjectName: 'Mathematics',
      totalMarks: 100,
    });

    expect(details.startDateStr).toBe('26-08-2026');
    expect(details.endDateStr).toBe(null);
    expect(details.isDateRange).toBe(false);
    expect(details.timeStr).toBe('10:00 AM – 11:30 AM');
    expect(details.subjectSummary).toBe('Mathematics');
    expect(details.totalMarksStr).toBe('100 Marks');
  });

  it('handles explicit startTime and endTime strings', () => {
    const details = getParsedExamDetails({
      examName: 'Unit Test',
      examDate: '2026-09-01',
      startTime: '09:00:00',
      endTime: '11:00:00',
      subjects: [{ subjectName: 'History' }, { subjectName: 'Geography' }],
      maxScore: 50,
    });

    expect(details.startDateStr).toBe('01-09-2026');
    expect(details.isDateRange).toBe(false);
    expect(details.timeStr).toBe('09:00 AM – 11:00 AM');
    expect(details.subjectSummary).toBe('History, Geography');
    expect(details.totalMarksStr).toBe('50 Marks');
  });
});
