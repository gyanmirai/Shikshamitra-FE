import type {
  AssessmentRubricDto,
  RubricEvaluationDto,
} from 'src/redux/academicAPI/HomeworkAssignmentApi/AssessmentAndFeedbackApi/RubricAssessmentApi';

import { it, expect, describe } from 'vitest';
import {
  RubricStatus,
  RubricVisibility,
  RubricScoringModel,
} from 'src/redux/academicAPI/HomeworkAssignmentApi/AssessmentAndFeedbackApi/RubricAssessmentApi';

import {
  calculateTotalMarks,
  buildEvaluationScores,
  usesPerformanceLevels,
  validateCriterionValues,
  initializeCriterionValues,
  isMissingEvaluationResponse,
} from './rubricEvaluationUtils';

const rubric = {
  id: 'rubric',
  title: 'Evaluation rubric',
  scoringModel: RubricScoringModel.PerformanceLevels,
  visibility: RubricVisibility.Institution,
  performanceLevels: [],
  tags: [],
  totalMarks: 8,
  version: 1,
  status: RubricStatus.Published,
  criteria: [
    {
      id: 'accuracy',
      rubricId: 'rubric',
      title: 'Accuracy',
      isRequired: true,
      maxMarks: 4,
      displayOrder: 1,
    },
    {
      id: 'presentation',
      rubricId: 'rubric',
      title: 'Presentation',
      isRequired: true,
      maxMarks: 4,
      displayOrder: 2,
    },
  ],
} as AssessmentRubricDto;

describe('rubric evaluation utilities', () => {
  it('initializes saved marks and criterion comments', () => {
    const values = initializeCriterionValues(rubric, {
      scores: [{ criterionId: 'accuracy', marks: 3, comments: 'Check one answer.' }],
    } as RubricEvaluationDto);

    expect(values.accuracy).toEqual({ marks: '3', comments: 'Check one answer.' });
    expect(values.presentation).toEqual({ marks: '', comments: '' });
  });

  it('requires a valid score for every criterion', () => {
    expect(
      validateCriterionValues(rubric, {
        accuracy: { marks: '4', comments: '' },
        presentation: { marks: '', comments: '' },
      })?.title
    ).toBe('Presentation');
  });

  it('builds score payloads with comments and calculates the total', () => {
    const values = {
      accuracy: { marks: '4', comments: ' Accurate work. ' },
      presentation: { marks: '3', comments: '' },
    };

    expect(buildEvaluationScores(rubric, values)).toEqual([
      { criterionId: 'accuracy', marks: 4, comments: 'Accurate work.' },
      { criterionId: 'presentation', marks: 3, comments: null },
    ]);
    expect(calculateTotalMarks(values)).toBe(7);
  });

  it('allows optional criteria to remain unscored', () => {
    const optionalRubric = {
      ...rubric,
      criteria: rubric.criteria.map((criterion) =>
        criterion.id === 'presentation' ? { ...criterion, isRequired: false } : criterion
      ),
    };
    const values = {
      accuracy: { marks: '4', comments: '' },
      presentation: { marks: '', comments: '' },
    };

    expect(validateCriterionValues(optionalRubric, values)).toBeUndefined();
    expect(buildEvaluationScores(optionalRubric, values)).toEqual([
      { criterionId: 'accuracy', marks: 4, comments: null },
    ]);
  });

  it('uses configured performance levels for legacy points-based rubric records', () => {
    const legacyRubric = {
      ...rubric,
      scoringModel: RubricScoringModel.PointsBased,
      performanceLevels: [{ level: 4, label: 'Excellent', score: 4 }],
    };

    expect(usesPerformanceLevels(legacyRubric)).toBe(true);
  });

  it('treats direct and parsing 404 responses as a missing optional evaluation', () => {
    expect(isMissingEvaluationResponse({ status: 404 })).toBe(true);
    expect(isMissingEvaluationResponse({ status: 'PARSING_ERROR', originalStatus: 404 })).toBe(
      true
    );
    expect(isMissingEvaluationResponse({ status: 500 })).toBe(false);
    expect(isMissingEvaluationResponse(undefined)).toBe(false);
  });
});
