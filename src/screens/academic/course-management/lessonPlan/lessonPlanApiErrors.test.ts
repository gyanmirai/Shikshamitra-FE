import { it, expect, describe } from 'vitest';

import { getLessonPlanTextApiErrors } from './lessonPlanApiErrors';

describe('lesson plan API field errors', () => {
  it('maps ProblemDetails errors with case-insensitive and prefixed field names', () => {
    expect(
      getLessonPlanTextApiErrors({
        data: {
          errors: {
            LearningObjective: ['Objective is too long.'],
            'input.resourcesRequired': ['Resources are too long.', 'Remove unused items.'],
            '$.TOPIC': 'Topic is invalid.',
          },
        },
      })
    ).toEqual({
      learningObjective: 'Objective is too long.',
      resourcesRequired: 'Resources are too long. Remove unused items.',
      topic: 'Topic is invalid.',
    });
  });

  it('maps legacy ABP validation members and nested error dictionaries', () => {
    expect(
      getLessonPlanTextApiErrors({
        data: {
          error: {
            errors: { ResourcesRequired: ['Resources are invalid.'] },
            validationErrors: [
              { message: 'Objective is invalid.', members: ['LearningObjective'] },
            ],
          },
        },
      })
    ).toEqual({
      learningObjective: 'Objective is invalid.',
      resourcesRequired: 'Resources are invalid.',
    });
  });

  it('handles validation errors using memberNames and errorMessage', () => {
    expect(
      getLessonPlanTextApiErrors({
        data: {
          validationErrors: [
            {
              errorMessage: 'Text is invalid.',
              memberNames: ['LearningObjective', 'ResourcesRequired'],
            },
          ],
        },
      })
    ).toEqual({ learningObjective: 'Text is invalid.', resourcesRequired: 'Text is invalid.' });
  });

  it.each([
    null,
    { status: 500 },
    { data: { errors: { Other: ['Unknown field'], LearningObjective: [null, 2, {}] } } },
  ])('leaves unrecognized and malformed errors for the form-level fallback', (error) => {
    expect(getLessonPlanTextApiErrors(error)).toEqual({});
  });
});
