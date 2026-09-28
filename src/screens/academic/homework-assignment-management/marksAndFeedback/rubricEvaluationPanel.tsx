'use client';

import React from 'react';
import { LoadingButton } from '@mui/lab';
import { Iconify } from 'src/components/iconify';
import CustomTooltip from 'src/components/custom-tooltip';
import {
  Box,
  Card,
  Chip,
  Paper,
  Stack,
  Divider,
  TextField,
  Typography,
  IconButton,
} from '@mui/material';
import { RubricStatus } from 'src/redux/academicAPI/HomeworkAssignmentApi/AssessmentAndFeedbackApi/RubricAssessmentApi';

import { useRubricEvaluation } from './useRubricEvaluation';
import RubricCriterionScoring from './rubricCriterionScoring';
import RubricEvaluationErrorAlert from './rubricEvaluationErrorAlert';

import type { RubricEvaluationPanelRef, RubricEvaluationPanelProps } from './rubricEvaluationTypes';

export type { RubricEvaluationPanelRef } from './rubricEvaluationTypes';

const RubricEvaluationPanel = React.forwardRef<
  RubricEvaluationPanelRef,
  RubricEvaluationPanelProps
>((props, ref) => {
  const evaluation = useRubricEvaluation(props);
  const compact = props.compactLayout ?? false;

  React.useImperativeHandle(ref, () => ({ save: evaluation.save }));

  return (
    <Card variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
        <Box>
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <Typography component="h2" variant="subtitle1" fontWeight={700}>
              Rubric Assessment
            </Typography>
            {compact ? (
              <CustomTooltip
                title="Select a performance level and add focused feedback for every criterion."
                placement="right"
                arrow
              >
                <IconButton size="small" aria-label="About rubric assessment">
                  <Iconify icon="lucide:info" width={18} color="info.main" />
                </IconButton>
              </CustomTooltip>
            ) : null}
          </Stack>
          {!compact ? (
            <Typography variant="body2" color="text.secondary">
              Select a performance level and add focused feedback for every criterion.
            </Typography>
          ) : null}
        </Box>
        {evaluation.activeRubric ? (
          <Chip
            size="small"
            variant="outlined"
            label={
              evaluation.activeRubric.status === RubricStatus.Published ? 'Published' : 'Draft'
            }
          />
        ) : null}
      </Stack>

      <Divider sx={{ my: 1.5 }} />

      {!evaluation.activeRubric ? (
        <Stack spacing={1}>
          <Typography variant="body2" color="text.secondary">
            No rubric is linked with this {props.mode}. Create a default rubric to start evaluation.
          </Typography>
          <LoadingButton
            size="small"
            variant="outlined"
            loading={evaluation.isCreating || evaluation.isPublishing || evaluation.isLoading}
            startIcon={<Iconify icon="material-symbols-light:rubric-rounded" />}
            onClick={evaluation.createDefaultRubric}
          >
            Create Rubric
          </LoadingButton>
        </Stack>
      ) : (
        <Stack spacing={1.5}>
          {evaluation.hasEvaluationError ? (
            <RubricEvaluationErrorAlert
              isLoading={evaluation.isLoading}
              onRetry={evaluation.retryEvaluation}
            />
          ) : null}
          {evaluation.isLoading ? (
            <Typography variant="body2" color="text.secondary">
              Loading scoring model...
            </Typography>
          ) : (
            <RubricCriterionScoring
              rubric={evaluation.activeRubric}
              values={evaluation.criterionValues}
              onMarksChange={evaluation.setCriterionMarks}
              onCommentsChange={evaluation.setCriterionComments}
              readOnly={props.readOnly}
              compact={compact}
            />
          )}

          <Paper
            component="section"
            aria-labelledby="rubric-score-summary"
            variant="outlined"
            sx={{ p: 2, borderRadius: 2, bgcolor: 'background.neutral' }}
          >
            <Stack spacing={1.5}>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                justifyContent="space-between"
                alignItems={{ xs: 'flex-start', sm: 'center' }}
                spacing={0.5}
              >
                <Box>
                  <Typography id="rubric-score-summary" component="h3" variant="subtitle2">
                    Score summary
                  </Typography>
                  {!compact ? (
                    <Typography variant="caption" color="text.secondary">
                      Updates automatically as criteria are scored.
                    </Typography>
                  ) : null}
                </Box>
                <Typography
                  variant="h6"
                  sx={{
                    fontVariantNumeric: 'tabular-nums',
                    color: compact ? 'primary.main' : 'text.primary',
                  }}
                >
                  {evaluation.totalMarks}
                  <Typography component="span" variant="body2" color="text.secondary">
                    {' '}
                    / {evaluation.activeRubric.totalMarks}
                  </Typography>
                </Typography>
              </Stack>

              <Divider />

              <TextField
                fullWidth
                size="small"
                label="Overall rubric feedback (optional)"
                value={evaluation.remarks}
                onChange={(event) => evaluation.setRemarks(event.target.value)}
                placeholder="Summarize the student's overall performance"
                multiline
                rows={3}
                disabled={props.readOnly}
                helperText={
                  compact ? undefined : 'This note applies to the complete rubric assessment.'
                }
              />
            </Stack>
          </Paper>
        </Stack>
      )}
    </Card>
  );
});

export default RubricEvaluationPanel;
