'use client';

import React from 'react';
import { LoadingButton } from '@mui/lab';
import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Alert, Stack, Typography } from '@mui/material';
import { FormSectionCard } from 'src/components/form-section-card';
import {
  RubricStatus,
  RubricScoringModel,
} from 'src/redux/academicAPI/HomeworkAssignmentApi/AssessmentAndFeedbackApi/RubricAssessmentApi';

import RubricScoreSummary from './rubricScoreSummary';
import { useRubricEvaluation } from './useRubricEvaluation';
import RubricCriterionScoring from './rubricCriterionScoring';
import RubricRecordedCriteria from './rubricRecordedCriteria';
import RubricEvaluationErrorAlert from './rubricEvaluationErrorAlert';

import type { RubricEvaluationPanelRef, RubricEvaluationPanelProps } from './rubricEvaluationTypes';

export type { RubricEvaluationPanelRef } from './rubricEvaluationTypes';

const RubricEvaluationPanel = React.forwardRef<
  RubricEvaluationPanelRef,
  RubricEvaluationPanelProps
>((props, ref) => {
  const evaluation = useRubricEvaluation(props);
  const compact = props.compactLayout ?? false;
  const showRubricFeedback = Boolean(props.readOnly);
  const readOnly =
    props.readOnly || evaluation.isLocked || evaluation.isLoading || evaluation.hasEvaluationError;
  const { onStateChange, studentRow } = props;
  const scoringGuidance =
    evaluation.activeRubric?.scoringModel === RubricScoringModel.Checklist
      ? 'Mark each item Met or Not met.'
      : evaluation.activeRubric?.scoringModel === RubricScoringModel.WeightedPercentage &&
          !evaluation.activeRubric.performanceLevels.length
        ? 'Enter achievement from 0 to 100% for each weighted criterion.'
        : evaluation.activeRubric?.scoringModel === RubricScoringModel.PointsBased &&
            !evaluation.activeRubric.performanceLevels.length
          ? 'Enter points earned for each criterion.'
          : evaluation.activeRubric?.scoringModel === RubricScoringModel.RatingScale
            ? 'Choose a rating for each criterion.'
            : 'Select a performance level for every criterion.';

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
    <FormSectionCard
      title="Rubric Assessment"
      icon={GlobalIcons.rubricFile}
      titleTypographyProps={{ variant: 'subtitle1', fontWeight: 600 }}
      descriptionTooltip={
        props.readOnly || evaluation.isLocked
          ? 'Review the recorded score and feedback for every criterion.'
          : scoringGuidance
      }
      action={
        evaluation.activeRubric ? (
          <Label>
            {evaluation.activeRubric.status === RubricStatus.Published ? 'Published' : 'Draft'}
          </Label>
        ) : undefined
      }
    >
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
          {evaluation.hasEvaluationError ? null : evaluation.isLoading ? (
            <Typography variant="body2" color="text.secondary">
              Loading scoring model...
            </Typography>
          ) : props.readOnly || evaluation.isLocked ? (
            <RubricRecordedCriteria
              rubric={evaluation.activeRubric}
              values={evaluation.criterionValues}
              showFeedback={showRubricFeedback}
            />
          ) : (
            <RubricCriterionScoring
              rubric={evaluation.activeRubric}
              values={evaluation.criterionValues}
              onMarksChange={evaluation.setCriterionMarks}
              onCommentsChange={evaluation.setCriterionComments}
              showFeedback={showRubricFeedback}
              readOnly={readOnly}
              compact={compact}
            />
          )}

          {showRubricFeedback && !evaluation.isLoading && !evaluation.hasEvaluationError && (
            <RubricScoreSummary
              totalMarks={evaluation.totalMarks}
              maxMarks={evaluation.activeRubric.totalMarks}
              scoringModel={evaluation.activeRubric.scoringModel}
              remarks={evaluation.remarks}
              onRemarksChange={evaluation.setRemarks}
              readOnly={readOnly}
              compact={compact}
            />
          )}
        </Stack>
      )}
    </FormSectionCard>
  );
});

export default RubricEvaluationPanel;
