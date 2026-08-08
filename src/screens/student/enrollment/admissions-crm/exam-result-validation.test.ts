import { it, expect, describe } from 'vitest';

import { isValidExamResultValues, validateExamResultValues } from './exam-result-validation';

const validResult = {
  totalMarks: '100',
  passingMarks: '40',
  obtainedMarks: '85',
  meritRank: '1',
};

describe('exam result validation', () => {
  it('accepts valid marks, boundaries, and an omitted merit rank', () => {
    expect(isValidExamResultValues(validResult)).toBe(true);
    expect(
      isValidExamResultValues({
        totalMarks: '100',
        passingMarks: '0',
        obtainedMarks: '100',
        meritRank: '',
      })
    ).toBe(true);
  });

  it('rejects marks outside the total before a request is sent', () => {
    expect(
      validateExamResultValues({ ...validResult, passingMarks: '101', obtainedMarks: '102' })
    ).toEqual(
      expect.objectContaining({
        passingMarks: 'Passing marks cannot exceed total marks.',
        obtainedMarks: 'Obtained marks cannot exceed total marks.',
      })
    );
  });

  it('rejects missing, negative, non-numeric, and invalid merit values', () => {
    expect(
      validateExamResultValues({
        totalMarks: '0',
        passingMarks: '-1',
        obtainedMarks: 'not-a-number',
        meritRank: '1.5',
      })
    ).toEqual({
      totalMarks: 'Enter total marks greater than 0.',
      passingMarks: 'Enter passing marks of 0 or more.',
      obtainedMarks: 'Enter obtained marks of 0 or more.',
      meritRank: 'Merit rank must be a positive whole number.',
    });
  });
});
