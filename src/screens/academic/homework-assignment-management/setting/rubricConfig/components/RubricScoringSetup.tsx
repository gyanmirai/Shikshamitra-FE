import type { FormikProps } from 'formik';

import CustomSelect from 'src/components/custom-select';
import { Box, Stack, Alert, Typography } from '@mui/material';
import { RubricScoringModel } from 'src/redux/academicAPI/HomeworkAssignmentApi/AssessmentAndFeedbackApi/RubricAssessmentApi';

import { RUBRIC_SCORING_MODEL_OPTIONS } from '../constants';
import { RubricPerformanceLevels } from './RubricPerformanceLevels';
import { RubricFormSection as SectionPaper } from './RubricFormSection';

import type { RubricConfigFormValues } from '../types';

export function RubricScoringSetup({
  formik,
  isEditing,
  onModelChange,
}: {
  formik: FormikProps<RubricConfigFormValues>;
  isEditing: boolean;
  onModelChange: (value: unknown) => void;
}) {
  const modelGuidance: Record<RubricScoringModel, string> = {
    [RubricScoringModel.PointsBased]:
      'Set the maximum points for each criterion (up to 1000). Teachers enter points earned.',
    [RubricScoringModel.WeightedPercentage]:
      'Assign each criterion a weight. All weights must add to 100%; teachers enter achievement as a percentage.',
    [RubricScoringModel.PerformanceLevels]:
      'Define descriptive levels. Every criterion uses the highest level score as its maximum.',
    [RubricScoringModel.Checklist]:
      'Add the items teachers will mark Met or Not met. Each item is worth one point.',
    [RubricScoringModel.RatingScale]:
      'Define a shared rating scale from 1 to 10. Teachers choose one rating per criterion.',
  };

  return (
    <Stack spacing={1.5}>
      <SectionPaper
        icon="solar:calculator-bold-duotone"
        title="Scoring Model"
        caption="Choose how the criteria score should be interpreted."
      >
        <Box sx={{ width: '100%', maxWidth: 480 }}>
          <CustomSelect
            label="Scoring model *"
            options={
              isEditing && formik.values.scoringModel === RubricScoringModel.RatingScale
                ? [
                    ...RUBRIC_SCORING_MODEL_OPTIONS,
                    { value: RubricScoringModel.RatingScale, label: 'Rating Scale' },
                  ]
                : RUBRIC_SCORING_MODEL_OPTIONS
            }
            labelKey="label"
            valueKey="value"
            value={formik.values.scoringModel}
            onChange={(value) => onModelChange(value)}
            formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
          />
        </Box>
        <Typography variant="body2" color="text.secondary">
          {modelGuidance[formik.values.scoringModel as RubricScoringModel]}
        </Typography>
        {isEditing &&
          formik.values.performanceLevels.length > 0 &&
          formik.values.scoringModel !== RubricScoringModel.PerformanceLevels &&
          formik.values.scoringModel !== RubricScoringModel.RatingScale && (
            <Alert severity="info">
              This existing rubric uses performance levels when teachers score it. Its level
              settings are shown below.
            </Alert>
          )}
      </SectionPaper>

      {(formik.values.scoringModel === RubricScoringModel.PerformanceLevels ||
        formik.values.scoringModel === RubricScoringModel.RatingScale ||
        formik.values.performanceLevels.length > 0) && <RubricPerformanceLevels formik={formik} />}
    </Stack>
  );
}
