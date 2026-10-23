import type { FormikProps } from 'formik';

import { getIn } from 'formik';
import { TextField } from '@mui/material';
import CustomSelect from 'src/components/custom-select';
import { RubricScoringModel } from 'src/redux/academicAPI/HomeworkAssignmentApi/AssessmentAndFeedbackApi/RubricAssessmentApi';

import type {
  RubricConfigFormValues,
  RubricCriterionFormValue,
  RubricPerformanceLevelFormValue,
} from '../types';

export function RubricCriterionScoreField({
  formik,
  criterion,
  index,
}: {
  formik: FormikProps<RubricConfigFormValues>;
  criterion: RubricCriterionFormValue;
  index: number;
}) {
  const path = (name: keyof RubricCriterionFormValue) => `criteria[${index}].${name}`;
  const isChecklist = formik.values.scoringModel === RubricScoringModel.Checklist;
  const isPerformance = formik.values.scoringModel === RubricScoringModel.PerformanceLevels;
  const hasScoringLevels = formik.values.performanceLevels.length > 0;
  const scoreName =
    formik.values.scoringModel === RubricScoringModel.WeightedPercentage ? 'weight' : 'points';
  const scoreError = getIn(formik.touched, path(scoreName))
    ? String(getIn(formik.errors, path(scoreName)) || '')
    : '';
  return isPerformance || (isChecklist && !hasScoringLevels) ? null : hasScoringLevels ? (
    <CustomSelect
      label="Max points *"
      options={formik.values.performanceLevels
        .filter((level: RubricPerformanceLevelFormValue) => level.score !== '')
        .map((level: RubricPerformanceLevelFormValue) => ({
          label: level.label ? `${level.label} (${level.score})` : level.score,
          value: level.score,
        }))}
      labelKey="label"
      valueKey="value"
      value={criterion[scoreName] ?? ''}
      onBlur={() => formik.setFieldTouched(path(scoreName), true)}
      onChange={(value) => formik.setFieldValue(path(scoreName), String(value))}
      error={Boolean(scoreError)}
      helperText={scoreError || ' '}
      formControlProps={{
        fullWidth: true,
        sx: {
          maxWidth: 'unset',
          gridArea: 'max',
          minWidth: 0,
          '& .MuiFormHelperText-root': { minHeight: '1.25em' },
        },
      }}
    />
  ) : (
    <TextField
      fullWidth
      size="small"
      type="number"
      label={
        formik.values.scoringModel === RubricScoringModel.WeightedPercentage
          ? 'Weight % *'
          : 'Max points *'
      }
      name={path(scoreName)}
      value={criterion[scoreName] ?? ''}
      inputProps={{
        min: formik.values.scoringModel === RubricScoringModel.WeightedPercentage ? 0.01 : 0.5,
        max: formik.values.scoringModel === RubricScoringModel.WeightedPercentage ? 100 : 1000,
        step: formik.values.scoringModel === RubricScoringModel.WeightedPercentage ? 0.01 : 0.5,
      }}
      onBlur={formik.handleBlur}
      onChange={(event) => formik.setFieldValue(path(scoreName), event.target.value)}
      error={Boolean(scoreError)}
      helperText={scoreError || ' '}
      sx={{ gridArea: 'max', minWidth: 0, '& .MuiFormHelperText-root': { minHeight: '1.25em' } }}
    />
  );
}
