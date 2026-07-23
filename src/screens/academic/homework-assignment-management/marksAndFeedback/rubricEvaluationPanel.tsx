'use client';

import React from 'react';
import { LoadingButton } from '@mui/lab';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { shikshaMitraToast } from 'src/components/toast';
import { Box, Card, Stack, Divider, TextField, Typography } from '@mui/material';
import {
  RubricStatus,
  useGetRubricsQuery,
  useAddRubricMutation,
  usePublishRubricMutation,
  useGetRubricEvaluationsQuery,
  useUpsertRubricEvaluationMutation,
  useSubmitRubricEvaluationMutation,
  useApproveRubricEvaluationMutation,
} from 'src/redux/academicAPI/HomeworkAssignmentApi/AssessmentAndFeedbackApi/RubricAssessmentApi';

type Props = {
  mode: 'homework' | 'assignment';
  standardId: string;
  subjectId: string;
  taskId: string;
  taskTitle?: string;
  studentRow?: any;
  ensureSubmissionId?: () => Promise<string | null>;
};

const defaultCriteria = [
  { title: 'Concept Understanding', maxMarks: 10, displayOrder: 1 },
  { title: 'Accuracy', maxMarks: 10, displayOrder: 2 },
  { title: 'Presentation', maxMarks: 5, displayOrder: 3 },
];

export default function RubricEvaluationPanel({
  mode,
  standardId,
  subjectId,
  taskId,
  taskTitle,
  studentRow,
  ensureSubmissionId,
}: Props) {
  const params =
    mode === 'homework'
      ? { standardId, subjectId, homeworkId: taskId }
      : { standardId, subjectId, assignmentId: taskId };

  const { data: rubrics = [], isFetching } = useGetRubricsQuery(params, {
    skip: !standardId || !subjectId || !taskId,
  });
  const activeRubric =
    rubrics.find((rubric) => rubric.status === RubricStatus.Published) ?? rubrics[0];
  const { data: evaluations = [] } = useGetRubricEvaluationsQuery(activeRubric?.id ?? '', {
    skip: !activeRubric?.id,
  });
  const [resolvedSubmissionId, setResolvedSubmissionId] = React.useState<string | null>(null);
  const studentSubmissionId = resolvedSubmissionId || studentRow?.id;
  const currentEvaluation = evaluations.find(
    (evaluation) => evaluation.studentSubmissionId === studentSubmissionId
  );
  const [scores, setScores] = React.useState<Record<string, string>>({});
  const [remarks, setRemarks] = React.useState('');

  const [addRubric, { isLoading: isCreating }] = useAddRubricMutation();
  const [publishRubric, { isLoading: isPublishing }] = usePublishRubricMutation();
  const [upsertEvaluation, { isLoading: isSaving }] = useUpsertRubricEvaluationMutation();
  const [submitEvaluation, { isLoading: isSubmitting }] = useSubmitRubricEvaluationMutation();
  const [approveEvaluation, { isLoading: isApproving }] = useApproveRubricEvaluationMutation();

  React.useEffect(() => {
    if (!currentEvaluation) {
      setScores({});
      setRemarks('');
      return;
    }

    setRemarks(currentEvaluation.remarks ?? '');
    setScores(
      currentEvaluation.scores.reduce<Record<string, string>>((acc, score) => {
        acc[score.criterionId] = String(score.marks);
        return acc;
      }, {})
    );
  }, [currentEvaluation]);

  const handleCreateRubric = async () => {
    try {
      const created = await addRubric({
        standardId,
        subjectId,
        homeworkId: mode === 'homework' ? taskId : null,
        assignmentId: mode === 'assignment' ? taskId : null,
        title: `${taskTitle || 'Task'} Rubric`,
        description: 'Default assessment rubric',
        criteria: defaultCriteria,
      }).unwrap();
      await publishRubric(created.id).unwrap();
      shikshaMitraToast.success({ message: 'Rubric created and published successfully.' });
    } catch (error) {
      console.error('Failed to create rubric', error);
    }
  };

  const handleSaveEvaluation = async () => {
    if (!activeRubric || !studentRow?.studentId) return;

    const submissionId =
      studentSubmissionId && !studentSubmissionId.startsWith('00000000')
        ? studentSubmissionId
        : await ensureSubmissionId?.();

    if (!submissionId) {
      shikshaMitraToast.error({ message: 'Student submission is not available for rubric scoring.' });
      return;
    }

    setResolvedSubmissionId(submissionId);

    const payloadScores = activeRubric.criteria.map((criterion) => ({
      criterionId: criterion.id,
      marks: Number(scores[criterion.id] || 0),
      comments: null,
    }));

    try {
      const saved = await upsertEvaluation({
        rubricId: activeRubric.id,
        body: {
          studentSubmissionId: submissionId,
          studentId: studentRow.studentId,
          remarks,
          scores: payloadScores,
        },
      }).unwrap();
      await submitEvaluation(saved.id).unwrap();
      await approveEvaluation(saved.id).unwrap();
      shikshaMitraToast.success({ message: 'Rubric evaluation approved successfully.' });
    } catch (error) {
      console.error('Failed to save rubric evaluation', error);
    }
  };

  return (
    <Card variant="outlined" sx={{ p: 2, borderRadius: 1 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
        <Box>
          <Typography variant="subtitle2">Rubric Assessment</Typography>
          <Typography variant="caption" color="text.secondary">
            Criteria-based scoring for practical, project, and rubric tasks.
          </Typography>
        </Box>
        {activeRubric ? (
          <Label color={activeRubric.status === RubricStatus.Published ? 'success' : 'warning'}>
            {activeRubric.status === RubricStatus.Published ? 'Published' : 'Draft'}
          </Label>
        ) : null}
      </Stack>

      <Divider sx={{ my: 1.5 }} />

      {!activeRubric ? (
        <Stack spacing={1}>
          <Typography variant="body2" color="text.secondary">
            No rubric is linked with this {mode}. Create a default rubric to start evaluation.
          </Typography>
          <LoadingButton
            size="small"
            variant="outlined"
            loading={isCreating || isPublishing || isFetching}
            startIcon={<Iconify icon="material-symbols-light:rubric-rounded" />}
            onClick={handleCreateRubric}
          >
            Create Rubric
          </LoadingButton>
        </Stack>
      ) : (
        <Stack spacing={1}>
          {activeRubric.criteria.map((criterion) => (
            <Stack
              key={criterion.id}
              direction={{ xs: 'column', sm: 'row' }}
              alignItems={{ xs: 'stretch', sm: 'center' }}
              spacing={1}
            >
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="body2" fontWeight={600}>
                  {criterion.title}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Max {criterion.maxMarks}
                </Typography>
              </Box>
              <TextField
                size="small"
                type="number"
                label="Marks"
                value={scores[criterion.id] ?? ''}
                onChange={(event) =>
                  setScores((prev) => ({ ...prev, [criterion.id]: event.target.value }))
                }
                inputProps={{ min: 0, max: criterion.maxMarks, step: 0.5 }}
                sx={{ width: { xs: '100%', sm: 130 } }}
              />
            </Stack>
          ))}

          <TextField
            size="small"
            label="Rubric Remarks"
            value={remarks}
            onChange={(event) => setRemarks(event.target.value)}
            multiline
            rows={2}
          />

          <Stack direction="row" justifyContent="flex-end">
            <LoadingButton
              size="small"
              variant="contained"
              loading={isSaving || isSubmitting || isApproving}
              disabled={!studentRow?.studentId}
              onClick={handleSaveEvaluation}
            >
              Save Rubric Score
            </LoadingButton>
          </Stack>
        </Stack>
      )}
    </Card>
  );
}
