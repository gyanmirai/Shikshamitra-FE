import { RubricStatus, RubricScoringModel } from 'src/redux/academicAPI/HomeworkAssignmentApi/AssessmentAndFeedbackApi/RubricAssessmentApi';

import { DEFAULT_RATING_LEVELS, DEFAULT_PERFORMANCE_LEVELS } from './constants';

import type { RubricConfigFormProps, RubricConfigFormValues, RubricCriterionFormValue, RubricPerformanceLevelFormValue } from './types';

export const blankCriterion: RubricCriterionFormValue = {
  id: 'new-criterion-initial',
  title: '',
  description: '',
  points: '10',
  studentDescription: '',
  teacherGuidance: '',
  isRequired: true,
};

export const builderSteps = ['Basic Information', 'Criteria & Scoring', 'Preview'];

export const normalizeLevels = (
  levels: NonNullable<RubricConfigFormProps['editData']>['performanceLevels'] | typeof DEFAULT_PERFORMANCE_LEVELS
): RubricPerformanceLevelFormValue[] =>
  [...levels]
    .sort((first, second) => second.level - first.level)
    .map((level, index) => ({
      id: `level-${index}`,
      label: level.label,
      score: String(level.score),
      description: level.description || '',
      studentLabel: level.studentLabel || level.label,
    }));

export const buildInitialValues = (
  editData: RubricConfigFormProps['editData']
): RubricConfigFormValues => ({
  title: editData?.title || '',
  description: editData?.description || '',
  appliesToWorkType:
    editData?.appliesToWorkType === null || editData?.appliesToWorkType === undefined
      ? ''
      : editData.appliesToWorkType,
  scoringModel: editData?.scoringModel ?? RubricScoringModel.PointsBased,
  evaluationInstructions: editData?.evaluationInstructions || '',
  studentInstructions: editData?.studentInstructions || '',
  tags: editData?.tags?.join(', ') || '',
  status: editData?.status ?? RubricStatus.Draft,
  performanceLevels: editData?.performanceLevels?.length
    ? normalizeLevels(editData.performanceLevels)
    : editData?.scoringModel === RubricScoringModel.RatingScale
      ? normalizeLevels(DEFAULT_RATING_LEVELS)
      : editData?.scoringModel === RubricScoringModel.PerformanceLevels
        ? normalizeLevels(DEFAULT_PERFORMANCE_LEVELS)
        : [],
  criteria: editData?.criteria?.length
    ? [...editData.criteria]
        .sort((first, second) => first.displayOrder - second.displayOrder)
        .map((criterion) => ({
          id: `criterion-${criterion.id}`,
          title: criterion.title,
          description: criterion.description || '',
          ...(editData.scoringModel === RubricScoringModel.PerformanceLevels ? {} :
            editData.scoringModel === RubricScoringModel.WeightedPercentage ? { weight: String(criterion.weight) } : { points: String(criterion.points) }),
          studentDescription: criterion.studentDescription || '',
          teacherGuidance: criterion.teacherGuidance || '',
          isRequired: criterion.isRequired,
        }))
    : [blankCriterion],
});

const criterionMaximum = (values: RubricConfigFormValues, criterion: RubricCriterionFormValue) =>
  values.scoringModel === RubricScoringModel.PerformanceLevels
    ? Math.max(0, ...values.performanceLevels.map((level) => Number(level.score) || 0))
    : Number(values.scoringModel === RubricScoringModel.WeightedPercentage ? criterion.weight : criterion.points) || 0;

export const getPublishErrors = (values: RubricConfigFormValues) => {
  const names = values.criteria
    .map((criterion) => criterion.title.trim().toLowerCase())
    .filter(Boolean);
  const duplicateNames = names.length !== new Set(names).size;
  const total = values.criteria.reduce(
    (sum, criterion) => sum + (criterionMaximum(values, criterion)),
    0
  );
  const errors: string[] = [];

  if (values.criteria.length === 0) errors.push('At least one criterion is required.');
  if (duplicateNames) errors.push('Criterion names must be unique.');
  if (values.criteria.some((criterion) => criterionMaximum(values, criterion) > 1000)) {
    errors.push('A criterion cannot exceed 1000 points.');
  }
  if (values.scoringModel === RubricScoringModel.WeightedPercentage && Math.abs(total - 100) >= 1e-9) {
    errors.push('Weighted percentage rubrics must total exactly 100%.');
  }
  if (values.scoringModel !== RubricScoringModel.WeightedPercentage && total > 1000) {
    errors.push('Total rubric score cannot exceed 1000.');
  }
  if (
    (values.scoringModel === RubricScoringModel.PerformanceLevels || values.scoringModel === RubricScoringModel.RatingScale) &&
    values.performanceLevels.filter((level) => level.label.trim()).length < 2
  ) {
    errors.push('Add at least two scoring levels.');
  }
  if (values.scoringModel === RubricScoringModel.Checklist && !values.performanceLevels.length && values.criteria.some((criterion) => criterion.points !== '1')) {
    errors.push('Checklist items must be worth one point.');
  }

  return errors;
};

