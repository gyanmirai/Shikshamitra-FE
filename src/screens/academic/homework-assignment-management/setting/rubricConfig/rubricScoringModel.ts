import type { FormikProps } from 'formik';

import { RubricScoringModel } from 'src/redux/academicAPI/HomeworkAssignmentApi/AssessmentAndFeedbackApi/RubricAssessmentApi';

import { normalizeLevels } from './rubricFormValues';
import { DEFAULT_RATING_LEVELS, DEFAULT_PERFORMANCE_LEVELS } from './constants';

import type { RubricConfigFormValues, RubricPerformanceLevelFormValue } from './types';

export type ScoringDrafts = Partial<Record<RubricScoringModel, { scores: { title: string; points?: string; weight?: string }[]; levels: RubricPerformanceLevelFormValue[] }>>;
export function changeRubricScoringModel(formik: FormikProps<RubricConfigFormValues>, value: unknown, scoringDrafts: { current: ScoringDrafts }) {
    const nextModel = Number(value) as RubricScoringModel;
    const current = formik.values;
    if (!Number.isInteger(nextModel) || nextModel < RubricScoringModel.PointsBased || nextModel > RubricScoringModel.RatingScale) return;
    if (nextModel === current.scoringModel) return;
    scoringDrafts.current[current.scoringModel] = {
      scores: current.criteria.map((criterion) => ({
        title: criterion.title,
        points: criterion.points,
        weight: criterion.weight,
      })),
      levels: current.performanceLevels,
    };
    const saved = scoringDrafts.current[nextModel];
    const defaultLevels = nextModel === RubricScoringModel.RatingScale
      ? normalizeLevels(DEFAULT_RATING_LEVELS)
      : nextModel === RubricScoringModel.PerformanceLevels
        ? normalizeLevels(DEFAULT_PERFORMANCE_LEVELS)
        : [];
    const levels = saved?.levels ?? defaultLevels;
    const highestScore = Math.max(...levels.map((level) => Number(level.score)));
    const weight = (index: number) => {
      const previous = Math.round((index * 10000) / current.criteria.length) / 100;
      const next = Math.round(((index + 1) * 10000) / current.criteria.length) / 100;
      return String(Number((next - previous).toFixed(2)));
    };
    const defaultMax = (index: number) => {
      if (nextModel === RubricScoringModel.WeightedPercentage) return weight(index);
      if (nextModel === RubricScoringModel.Checklist) return '1';
      if (nextModel === RubricScoringModel.PointsBased) return '10';
      return String(highestScore);
    };
    formik.setValues({
      ...current,
      scoringModel: nextModel,
      performanceLevels: levels,
      criteria: current.criteria.map((criterion, index) => ({
        ...criterion,
        points: nextModel === RubricScoringModel.PerformanceLevels || nextModel === RubricScoringModel.WeightedPercentage
          ? undefined : saved?.scores.find((score) => score.title === criterion.title)?.points ?? defaultMax(index),
        weight: nextModel === RubricScoringModel.WeightedPercentage
          ? saved?.scores.find((score) => score.title === criterion.title)?.weight ?? weight(index) : undefined,
      })),
    }, false);
    formik.setTouched({ ...formik.touched, criteria: [], performanceLevels: [] }, false);
  }
