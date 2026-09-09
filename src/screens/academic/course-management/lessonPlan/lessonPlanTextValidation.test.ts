import { it, expect, describe } from 'vitest';

import { validateLessonPlanText } from './lessonPlanTextValidation';

const valid = { topic: 'Fractions', learningObjective: '', resourcesRequired: '' };

describe('lesson plan text contract', () => {
  it.each([
    ['topic', 256],
    ['learningObjective', 1024],
    ['resourcesRequired', 512],
  ] as const)('accepts %s at its backend limit and rejects one extra character', (field, limit) => {
    expect(validateLessonPlanText({ ...valid, [field]: 'x'.repeat(limit) })).toEqual({});
    expect(validateLessonPlanText({ ...valid, [field]: 'x'.repeat(limit + 1) })).toHaveProperty(
      field,
      expect.stringContaining(String(limit))
    );
  });

  it('returns every oversized field so they can be corrected together', () => {
    expect(
      validateLessonPlanText({
        topic: 'x'.repeat(257),
        learningObjective: 'x'.repeat(1025),
        resourcesRequired: 'x'.repeat(513),
      })
    ).toEqual({
      topic: 'Topic must be 256 characters or fewer.',
      learningObjective: 'Learning Objective must be 1024 characters or fewer.',
      resourcesRequired: 'Resources Required must be 512 characters or fewer.',
    });
  });

  it('allows optional empty descriptions', () => {
    expect(validateLessonPlanText(valid)).toEqual({});
  });
});
