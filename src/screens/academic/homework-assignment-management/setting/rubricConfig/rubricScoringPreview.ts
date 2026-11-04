import type { AssessmentRubricDto } from 'src/redux/academicAPI/HomeworkAssignmentApi/AssessmentAndFeedbackApi/RubricAssessmentApi';

import {
  RubricVisibility,
  RubricScoringModel,
  getRubricCriterionMaximum,
} from 'src/redux/academicAPI/HomeworkAssignmentApi/AssessmentAndFeedbackApi/RubricAssessmentApi';

import { levelNumberAt } from './performance-level-order';

import type { RubricConfigFormValues } from './types';

export function buildScoringPreview(values: RubricConfigFormValues): AssessmentRubricDto {
  const rubric: AssessmentRubricDto = {
    id: 'rubric-preview',
    title: values.title,
    description: values.description,
    evaluationInstructions: values.evaluationInstructions,
    scoringModel: values.scoringModel,
    visibility: RubricVisibility.Institution,
    status: values.status,
    version: 1,
    tags: [],
    totalMarks: 0,
    performanceLevels: values.performanceLevels.map((level, index) => ({
      level: levelNumberAt(index, values.performanceLevels.length),
      label: level.label,
      score: Number(level.score),
      description: level.description,
      studentLabel: level.studentLabel,
    })),
    criteria: values.criteria.map((criterion, index) => ({
      ...criterion,
      rubricId: 'rubric-preview',
      title: criterion.title.trim() || `Criterion ${index + 1}`,
      points:
        values.scoringModel === RubricScoringModel.WeightedPercentage ||
        values.scoringModel === RubricScoringModel.PerformanceLevels
          ? null
          : Number(criterion.points),
      weight:
        values.scoringModel === RubricScoringModel.WeightedPercentage
          ? Number(criterion.weight)
          : null,
      displayOrder: index + 1,
    })),
  };
  rubric.totalMarks = Number(
    rubric.criteria
      .reduce((total, criterion) => total + getRubricCriterionMaximum(rubric, criterion), 0)
      .toFixed(2)
  );
  return rubric;
}
