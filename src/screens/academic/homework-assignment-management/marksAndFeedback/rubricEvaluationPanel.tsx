'use client';

import React from 'react';
import { LoadingButton } from '@mui/lab';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Box, Card, Alert, Stack, Divider, TextField, Typography } from '@mui/material';
import { RubricStatus } from 'src/redux/academicAPI/HomeworkAssignmentApi/AssessmentAndFeedbackApi/RubricAssessmentApi';

import { useRubricEvaluation } from './useRubricEvaluation';
import RubricCriterionScoring from './rubricCriterionScoring';

import type { RubricEvaluationPanelRef, RubricEvaluationPanelProps } from './rubricEvaluationTypes';

export type { RubricEvaluationPanelRef } from './rubricEvaluationTypes';

const RubricEvaluationPanel = React.forwardRef<
  RubricEvaluationPanelRef,
  RubricEvaluationPanelProps
>((props, ref) => {
  const evaluation = useRubricEvaluation(props);

  React.useImperativeHandle(ref, () => ({ save: evaluation.save }));

  return (
    <Card variant="outlined" sx={{ p: 2, borderRadius: 1 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
        <Box>
          <Typography variant="subtitle2">Rubric Assessment</Typography>
          <Typography variant="caption" color="text.secondary">
            Select a performance level and add focused feedback for every criterion.
          </Typography>
        </Box>
        {evaluation.activeRubric ? (
          <Label
            color={evaluation.activeRubric.status === RubricStatus.Published ? 'success' : 'warning'}
          >
            {evaluation.activeRubric.status === RubricStatus.Published ? 'Published' : 'Draft'}
          </Label>
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
            <Alert severity="error">
              Unable to load this student&apos;s existing evaluation. Please try again.
            </Alert>
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
            />
          )}

          <Alert severity="info" sx={{ py: 0.5 }}>
            Total rubric score: {evaluation.totalMarks} / {evaluation.activeRubric.totalMarks}
          </Alert>

          <TextField
            size="small"
            label="Overall Rubric Feedback"
            value={evaluation.remarks}
            onChange={(event) => evaluation.setRemarks(event.target.value)}
            multiline
            rows={2}
            disabled={props.readOnly}
            helperText="Summarize the student's overall performance across all criteria."
          />
        </Stack>
      )}
    </Card>
  );
});

export default RubricEvaluationPanel;
