import { ValidationError } from 'yup';
import { it, expect, describe } from 'vitest';
import {
  RubricWorkType,
  RubricScoringModel,
} from 'src/redux/academicAPI/HomeworkAssignmentApi/AssessmentAndFeedbackApi/RubricAssessmentApi';

import { buildInitialValues } from './rubricFormValues';
import { fullValidationSchema } from './rubricValidation';

describe('performance level validation ownership', () => {
  it('reports a missing level score without asking for hidden criterion points', async () => {
    const values = {
      ...buildInitialValues(null),
      title: 'Reasoning',
      appliesToWorkType: RubricWorkType.Both,
      scoringModel: RubricScoringModel.PerformanceLevels,
      criteria: [
        {
          title: 'Reasoning',
          description: '',
          studentDescription: '',
          teacherGuidance: '',
          isRequired: true,
        },
      ],
      performanceLevels: [
        { label: 'Good', score: 4, studentLabel: 'Good' },
        { label: '', score: undefined, studentLabel: '' },
      ],
    };
    try {
      await fullValidationSchema.validate(values, { abortEarly: false });
      throw new Error('Expected invalid level');
    } catch (error) {
      expect(error).toBeInstanceOf(ValidationError);
      const validation = error as ValidationError;
      expect(validation.inner.some(({ path }) => path === 'performanceLevels[1].score')).toBe(true);
      expect(validation.errors.join(' ')).not.toContain('points or weight');
    }
  });
});
