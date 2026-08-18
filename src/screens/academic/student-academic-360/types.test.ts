import { it, expect, describe } from 'vitest';

import { getStudentId } from './types';
import { getExamStatusCategory } from './components/ExamsResultsDashboardCard';

describe('getStudentId', () => {
  it('uses the canonical studentId when both identifiers are present', () => {
    expect(getStudentId({ studentId: 'student-id', id: 'enrollment-id' })).toBe('student-id');
  });

  it('falls back to id when studentId is empty', () => {
    expect(getStudentId({ studentId: '  ', id: 'student-id' })).toBe('student-id');
  });
});

describe('getExamStatusCategory', () => {
  it('classifies published/scheduled exams as PUBLISHED', () => {
    expect(getExamStatusCategory({ examName: 'Unit Test 1', status: 'PUBLISHED' })).toBe('PUBLISHED');
    expect(getExamStatusCategory({ examName: 'Midterm', status: 'ONGOING' })).toBe('PUBLISHED');
  });

  it('classifies exams with completed status or scores as COMPLETED', () => {
    expect(getExamStatusCategory({ examName: 'Term 1', status: 'COMPLETED' })).toBe('COMPLETED');
    expect(getExamStatusCategory({ examName: 'Term 1', percentage: 85 })).toBe('COMPLETED');
    expect(getExamStatusCategory({ examName: 'Term 1', grade: 'A' })).toBe('COMPLETED');
    expect(getExamStatusCategory({ examName: 'Term 1', resultPublished: true })).toBe('COMPLETED');
  });
});
