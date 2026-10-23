import * as Yup from 'yup';
import { RubricScoringModel } from 'src/redux/academicAPI/HomeworkAssignmentApi/AssessmentAndFeedbackApi/RubricAssessmentApi';

import type { RubricPerformanceLevelFormValue } from './types';

const basicInformationSchema = Yup.object({
  title: Yup.string()
    .trim()
    .max(256, 'Rubric name is too long')
    .required('Rubric name is required'),
  appliesToWorkType: Yup.number()
    .typeError('Applies to is required')
    .required('Applies to is required'),
});

const scoringModelSchema = Yup.object({
  scoringModel: Yup.number().required('Scoring model is required'),
  performanceLevels: Yup.array()
    .of(
      Yup.object({
        label: Yup.string().trim().required('Level label is required'),
        score: Yup.number()
          .typeError('Score must be a number')
          .min(0, 'Score cannot be negative')
          .max(1000, 'Score cannot exceed 1000')
          .test(
            'precision',
            'Use no more than two decimal places',
            (value) => value == null || Math.abs(value * 100 - Math.round(value * 100)) < 1e-9
          )
          .required('Score is required'),
        studentLabel: Yup.string().trim().required('Student label is required'),
      })
    )
    .test('model-levels', function validateLevels(levels) {
      const model = this.parent.scoringModel;
      if (
        model !== RubricScoringModel.PerformanceLevels &&
        model !== RubricScoringModel.RatingScale
      )
        return true;
      if (!levels || levels.length < 2)
        return this.createError({ message: 'Add at least two levels' });
      const scores = levels.map((level) => Number(level.score));
      if (new Set(scores).size !== scores.length)
        return this.createError({ message: 'Each level needs a different score' });
      if (
        model === RubricScoringModel.RatingScale &&
        scores.some((score) => !Number.isInteger(score) || score < 1 || score > 10)
      ) {
        return this.createError({ message: 'Ratings must be whole numbers from 1 to 10' });
      }
      return true;
    }),
});

const criteriaSchema = Yup.object({
  criteria: Yup.array()
    .of(
      Yup.object({
        title: Yup.string().trim().required('Criterion title is required'),
        points: Yup.number()
          .transform((value, original) => (original === undefined ? undefined : value))
          .optional()
          .typeError('Score must be a number')
          .moreThan(0, 'Score must be greater than zero')
          .max(1000, 'Score cannot exceed 1000')
          .test(
            'precision',
            'Use no more than two decimal places',
            (value) => value == null || Math.abs(value * 100 - Math.round(value * 100)) < 1e-9
          )
          .optional(),
        weight: Yup.number()
          .optional()
          .moreThan(0, 'Weight must be greater than zero')
          .max(100, 'Weight cannot exceed 100')
          .test(
            'precision',
            'Use no more than two decimal places',
            (value) => value == null || Math.abs(value * 100 - Math.round(value * 100)) < 1e-9
          ),
      })
    )
    .min(1, 'Add at least one criterion')
    .test('unique-criterion-title', 'Criterion names must be unique', (criteria) => {
      const names = (criteria || [])
        .map((criterion) => criterion.title?.trim().toLowerCase())
        .filter(Boolean);

      return names.length === new Set(names).size;
    })
    .test(
      'weighted-total',
      'Weighted percentage rubrics must total exactly 100%',
      function validateWeightedTotal(criteria) {
        if (this.parent.scoringModel !== RubricScoringModel.WeightedPercentage) return true;

        const total = (criteria || []).reduce(
          (sum, criterion) => sum + (Number(criterion.weight) || 0),
          0
        );

        return Math.abs(total - 100) < 1e-9;
      }
    )
    .test('model-criteria', function validateModelCriteria(criteria) {
      const model = this.parent.scoringModel;
      if (!criteria) return true;
      if (model === RubricScoringModel.PerformanceLevels) {
        const levels = this.parent.performanceLevels as RubricPerformanceLevelFormValue[];
        if (
          !levels?.length ||
          levels.some(
            (level) =>
              level.score == null ||
              String(level.score).trim() === '' ||
              !Number.isFinite(Number(level.score))
          )
        )
          return true;
        if (Math.max(...levels.map((level) => Number(level.score))) <= 0) {
          return this.createError({
            path: 'performanceLevels',
            message: 'At least one performance level needs a positive score',
          });
        }
      }
      const maxScores = criteria.map((criterion) =>
        model === RubricScoringModel.PerformanceLevels
          ? Math.max(
              0,
              ...(this.parent.performanceLevels as RubricPerformanceLevelFormValue[]).map((level) =>
                Number(level.score)
              )
            )
          : Number(
              model === RubricScoringModel.WeightedPercentage ? criterion.weight : criterion.points
            )
      );
      if (maxScores.some((score) => !Number.isFinite(score) || score <= 0)) {
        return this.createError({
          message: 'Each criterion needs a positive points or weight value',
        });
      }
      if (model === RubricScoringModel.PointsBased && maxScores.some((score) => score < 0.5)) {
        return this.createError({ message: 'Points-based criteria need at least 0.5 points' });
      }
      if (
        model === RubricScoringModel.WeightedPercentage &&
        maxScores.some((score) => score > 100)
      ) {
        return this.createError({ message: 'Each weight must be 100% or less' });
      }
      if (
        model === RubricScoringModel.Checklist &&
        !this.parent.performanceLevels?.length &&
        maxScores.some((score) => score !== 1)
      ) {
        return this.createError({ message: 'Checklist items must be worth one point' });
      }
      if (
        model === RubricScoringModel.PerformanceLevels ||
        model === RubricScoringModel.RatingScale
      ) {
        const levels = this.parent.performanceLevels as RubricPerformanceLevelFormValue[];
        const scores = levels.map((level) => Number(level.score));
        if (maxScores.some((score) => !scores.includes(score))) {
          return this.createError({ message: 'Choose a maximum from the configured levels' });
        }
      }
      if (
        model !== RubricScoringModel.WeightedPercentage &&
        maxScores.reduce((sum, score) => sum + score, 0) > 1000
      ) {
        return this.createError({ message: 'Total rubric score cannot exceed 1000' });
      }
      return true;
    }),
});

export const fullValidationSchema = basicInformationSchema
  .concat(scoringModelSchema)
  .concat(criteriaSchema);
const criteriaAndScoringSchema = scoringModelSchema.concat(criteriaSchema);
export const stepValidationSchemas = [
  basicInformationSchema,
  criteriaAndScoringSchema,
  fullValidationSchema,
];
