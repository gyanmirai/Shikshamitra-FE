import { describe, expect, it } from 'vitest';

import { resolvePreviousProgress } from './lessonPlanProgress';

describe('resolvePreviousProgress', () => {
  it('does not reuse progress from another division', () => {
    const plans = [
      {
        chapterId: 'chapter-family',
        divisionId: 'division-a',
        topic: 'Myself My Familyy',
        actualCompletionPercentage: 50,
        existingChapterProgress: 50,
        plannedCompletionPercentage: 50,
      },
      {
        chapterId: 'chapter-family',
        divisionId: 'division-b',
        topic: 'Myself My Familyy',
        actualCompletionPercentage: 0,
        existingChapterProgress: 0,
        plannedCompletionPercentage: 0,
      },
    ];

    expect(
      resolvePreviousProgress(plans, 'chapter-family', 'division-b', 'Myself My Familyy')
    ).toBe(0);
    expect(
      resolvePreviousProgress(plans, 'chapter-family', 'division-a', 'Myself My Familyy')
    ).toBe(50);
  });
});
