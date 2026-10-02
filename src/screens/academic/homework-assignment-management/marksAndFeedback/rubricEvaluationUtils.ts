import type {
  AssessmentRubricDto,
  RubricEvaluationDto,
  RubricEvaluationScoreInputDto,
} from 'src/redux/academicAPI/HomeworkAssignmentApi/AssessmentAndFeedbackApi/RubricAssessmentApi';
import { RubricScoringModel } from 'src/redux/academicAPI/HomeworkAssignmentApi/AssessmentAndFeedbackApi/RubricAssessmentApi';

import type { CriterionEvaluationValues } from './rubricEvaluationTypes';

export const usesPerformanceLevels = (rubric: AssessmentRubricDto) =>
  rubric.performanceLevels.length > 0;

export const initializeCriterionValues = (
  rubric: AssessmentRubricDto | undefined,
  evaluation: RubricEvaluationDto | null | undefined
): CriterionEvaluationValues => {
  if (!rubric) return {};

  const existingScores = new Map(
    evaluation?.scores.map((score) => [score.criterionId, score]) ?? []
  );

  return Object.fromEntries(
    rubric.criteria.map((criterion) => {
      const score = existingScores.get(criterion.id);
      return [
        criterion.id,
        {
          marks: score ? String(score.marks) : '',
          comments: score?.comments ?? '',
        },
      ];
    })
  );
};

export const validateCriterionValues = (
  rubric: AssessmentRubricDto,
  values: CriterionEvaluationValues
) =>
  rubric.criteria.find((criterion) => {
    const marks = values[criterion.id]?.marks;
    if (marks === undefined || marks.trim() === '') return criterion.isRequired;

    const numericMarks = Number(marks);
    if (!Number.isFinite(numericMarks) || numericMarks < 0 || numericMarks > Math.min(criterion.maxMarks, 1000)) return true;
    if (rubric.scoringModel === RubricScoringModel.Checklist && !rubric.performanceLevels.length) {
      return numericMarks !== 0 && numericMarks !== 1;
    }
    if (usesPerformanceLevels(rubric)) {
      return !rubric.performanceLevels.some((level) => level.score === numericMarks && level.score <= criterion.maxMarks);
    }
    return false;
  });

export const buildEvaluationScores = (
  rubric: AssessmentRubricDto,
  values: CriterionEvaluationValues
): RubricEvaluationScoreInputDto[] =>
  rubric.criteria
    .filter((criterion) => values[criterion.id]?.marks.trim() !== '')
    .map((criterion) => ({
      criterionId: criterion.id,
      marks: Number(values[criterion.id]?.marks),
      comments: values[criterion.id]?.comments.trim() || null,
    }));

export const calculateTotalMarks = (values: CriterionEvaluationValues) =>
  Object.values(values).reduce((total, value) => {
    const marks = Number(value.marks);
    return total + (Number.isFinite(marks) ? marks : 0);
  }, 0);

export const isMissingEvaluationResponse = (error: unknown) => {
  if (!error || typeof error !== 'object') return false;

  const responseError = error as { status?: unknown; originalStatus?: unknown };
  return responseError.status === 404 || responseError.originalStatus === 404;
};
