import { it, expect, describe } from 'vitest';

import {
  parseTeachingMethods,
  formatTeachingMethods,
  serializeTeachingMethods,
  getPrimaryTeachingMethod,
} from './lessonPlanTeachingMethods';

describe('lesson plan teaching methods', () => {
  it('loads legacy single values and canonical multi-values', () => {
    expect(parseTeachingMethods('ExplanationBoardWork')).toEqual(['ExplanationBoardWork']);
    expect(parseTeachingMethods('ExplanationBoardWork,ActivityBased')).toEqual([
      'ExplanationBoardWork',
      'ActivityBased',
    ]);
  });

  it('normalizes labels, JSON arrays, duplicates, and unsupported values', () => {
    expect(
      parseTeachingMethods(
        '["Explanation + Board Work","ActivityBased","ActivityBased","Unsupported"]'
      )
    ).toEqual(['ExplanationBoardWork', 'ActivityBased']);
  });

  it('serializes and displays multiple methods consistently', () => {
    const value = serializeTeachingMethods([
      'ExplanationBoardWork',
      'ActivityBased',
      'ActivityBased',
    ]);

    expect(value).toBe('ExplanationBoardWork,ActivityBased');
    expect(formatTeachingMethods(value)).toBe('Explanation + Board Work, Activity Based');
    expect(getPrimaryTeachingMethod(value)).toBe('ExplanationBoardWork');
  });
});
