import { it, expect, describe } from 'vitest';

import {
  toWeeklyLectureCount,
  getWeeklyLectureTotal,
  normalizeWeeklyLectureValue,
  MAX_WEEKLY_LECTURES_PER_SUBJECT,
} from './weeklyLectureValue';

describe('weekly lecture value normalization', () => {
  it('caps oversized and non-finite positive values at the domain maximum', () => {
    expect(normalizeWeeklyLectureValue('6100000000000000000000000000')).toBe(
      MAX_WEEKLY_LECTURES_PER_SUBJECT
    );
    expect(normalizeWeeklyLectureValue('6.1e+27')).toBe(MAX_WEEKLY_LECTURES_PER_SUBJECT);
    expect(normalizeWeeklyLectureValue(Number.POSITIVE_INFINITY)).toBe(
      MAX_WEEKLY_LECTURES_PER_SUBJECT
    );
  });

  it('keeps form values as bounded whole numbers', () => {
    expect(normalizeWeeklyLectureValue('-4')).toBe(0);
    expect(normalizeWeeklyLectureValue('4.9')).toBe(4);
    expect(normalizeWeeklyLectureValue('')).toBe('');
    expect(normalizeWeeklyLectureValue('not-a-number')).toBe('');
  });

  it('defensively bounds totals and serialized counts', () => {
    const subjects = Array.from({ length: 4 }, () => ({
      noOfLecture: '6100000000000000000000000000',
    }));

    expect(getWeeklyLectureTotal(subjects)).toBe(80);
    expect(toWeeklyLectureCount('6100000000000000000000000000')).toBe(20);
  });
});
