'use client';

import React from 'react';
import { LoadingButton } from '@mui/lab';
import { Iconify } from 'src/components/iconify';
import CustomTooltip from 'src/components/custom-tooltip';
import { Box, Card, Chip, Alert, Stack, Divider, Typography, IconButton } from '@mui/material';
import { RubricStatus, RubricScoringModel } from 'src/redux/academicAPI/HomeworkAssignmentApi/AssessmentAndFeedbackApi/RubricAssessmentApi';

import RubricScoreSummary from './rubricScoreSummary';
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
  const readOnly =
    props.readOnly || evaluation.isLocked || evaluation.isLoading || evaluation.hasEvaluationError;
  const { onStateChange, studentRow } = props;
  const scoringGuidance = evaluation.activeRubric?.scoringModel === RubricScoringModel.Checklist
    ? 'Mark each item Met or Not met and add focused feedback.'
    : evaluation.activeRubric?.scoringModel === RubricScoringModel.WeightedPercentage && !evaluation.activeRubric.performanceLevels.length
      ? 'Enter achievement from 0 to 100% for each weighted criterion.'
      : evaluation.activeRubric?.scoringModel === RubricScoringModel.PointsBased && !evaluation.activeRubric.performanceLevels.length
        ? 'Enter points earned for each criterion and add focused feedback.'
        : evaluation.activeRubric?.scoringModel === RubricScoringModel.RatingScale
          ? 'Choose a rating for each criterion and add focused feedback.'
          : 'Select a performance level and add focused feedback for every criterion.';

  React.useEffect(() => {
    onStateChange?.({
      studentId: studentRow?.studentId,
      isLocked: evaluation.isLocked,
      isLoading: evaluation.isLoading,
      hasError: evaluation.hasEvaluationError,
    });
  }, [
    onStateChange,
    studentRow?.studentId,
    evaluation.isLocked,
    evaluation.isLoading,
    evaluation.hasEvaluationError,
  ]);

  React.useImperativeHandle(ref, () => ({ save: evaluation.save, isLocked: evaluation.isLocked }));

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
                title={
                  props.readOnly
                    ? 'Review the recorded score and feedback for every criterion.'
                    : scoringGuidance
                }
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
              {scoringGuidance}
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

      {evaluation.isLocked ? (
        <Alert severity="info" sx={{ mb: 1.5 }}>
          This evaluation is approved and locked. You can review the feedback and move to the next
          student.
        </Alert>
      ) : null}

      {evaluation.hasEvaluationError ? (
        <RubricEvaluationErrorAlert
          isLoading={evaluation.isLoading}
          onRetry={evaluation.retryEvaluation}
        />
      ) : null}

      {!evaluation.activeRubric ? (
        <Stack spacing={1}>
          <Typography variant="body2" color="text.secondary">
            No rubric is linked with this {props.mode}. Create a default rubric to start evaluation.
          </Typography>
          <LoadingButton
            size="small"
            variant="outlined"
            loading={evaluation.isCreating || evaluation.isPublishing || evaluation.isLoading}
            disabled={readOnly}
            startIcon={<Iconify icon="material-symbols-light:rubric-rounded" />}
            onClick={evaluation.createDefaultRubric}
          >
            Create Rubric
          </LoadingButton>
        </Stack>
      ) : (
        <Stack spacing={1.5}>
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
              readOnly={readOnly}
              compact={compact}
            />
          )}

          <RubricScoreSummary
            totalMarks={evaluation.totalMarks}
            maxMarks={evaluation.activeRubric.totalMarks}
            scoringModel={evaluation.activeRubric.scoringModel}
            remarks={evaluation.remarks}
            onRemarksChange={evaluation.setRemarks}
            readOnly={readOnly}
            compact={compact}
          />
        </Stack>
      )}
    </Card>
  );
});

export default RubricEvaluationPanel;
