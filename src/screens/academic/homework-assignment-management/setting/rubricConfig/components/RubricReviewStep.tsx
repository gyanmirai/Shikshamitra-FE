import type { FormikProps } from 'formik';

import { Chip, Stack, Alert, Typography } from '@mui/material';
import { RubricScoringModel } from 'src/redux/academicAPI/HomeworkAssignmentApi/AssessmentAndFeedbackApi/RubricAssessmentApi';

import { parseRubricTags } from './RubricTagsField';
import { getPublishErrors } from '../rubricFormValues';
import { RUBRIC_SCORING_MODEL_LABELS } from '../constants';
import { RubricTemplatePreview } from './RubricTemplatePreview';
import { RubricFormSection as SectionPaper } from './RubricFormSection';

import type { RubricConfigFormValues } from '../types';

export function RubricReviewStep({ formik }: { formik: FormikProps<RubricConfigFormValues> }) {
    const publishErrors = getPublishErrors(formik.values);
    const previewTags = parseRubricTags(formik.values.tags);
    const model = formik.values.scoringModel as RubricScoringModel;

    return (
      <Stack spacing={1.5}>
        <SectionPaper
          icon="solar:clipboard-check-bold-duotone"
          title="Review & Publish"
          caption="Confirm the scoring setup before making this template available."
        >
          <Stack direction="row" flexWrap="wrap" gap={1}>
            <Chip
              variant="outlined"
              label={`Model: ${RUBRIC_SCORING_MODEL_LABELS[formik.values.scoringModel as RubricScoringModel]
                }`}
              size='small'
            />
            <Chip variant="outlined" size='small'
              label={`Criteria: ${formik.values.criteria.length}`} />
          </Stack>
          {previewTags.length > 0 && (
            <Stack direction="row" alignItems="center" flexWrap="wrap" gap={0.75} sx={{ mt: 1 }}>
              <Typography variant="caption" color="text.secondary">
                Tags
              </Typography>
              {previewTags.map((tag) => (
                <Chip key={tag} label={tag} size="small" variant="outlined" sx={{ borderRadius: 1 }} />
              ))}
            </Stack>
          )}
        </SectionPaper>
        {publishErrors.length > 0 && (
          <Alert severity="warning">
            <Stack component="ul" sx={{ pl: 2, m: 0 }}>
              {publishErrors.map((error) => (
                <Typography component="li" variant="body2" key={error}>
                  {error}
                </Typography>
              ))}
            </Stack>
          </Alert>
        )}
        <SectionPaper
          icon="solar:eye-bold-duotone"
          title="Rubric template preview"
          caption="This is how teachers will see the criteria and scoring choices."
        >
          <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.5 }}>
            {formik.values.title.trim() || 'Untitled rubric'}
          </Typography>
          <RubricTemplatePreview
            scoringModel={model}
            criteria={formik.values.criteria}
            performanceLevels={formik.values.performanceLevels}
          />
        </SectionPaper>
      </Stack>
    );
  }
