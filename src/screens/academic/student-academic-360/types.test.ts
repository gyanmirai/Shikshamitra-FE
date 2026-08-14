import { it, expect, describe } from 'vitest';

import { getStudentId } from './types';

describe('getStudentId', () => {
  it('uses the canonical studentId when both identifiers are present', () => {
    expect(getStudentId({ studentId: 'student-id', id: 'enrollment-id' })).toBe('student-id');
  });

  it('falls back to id when studentId is empty', () => {
    expect(getStudentId({ studentId: '  ', id: 'student-id' })).toBe('student-id');
  });
});
