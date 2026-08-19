'use client';

import React from 'react';
import { LoadingButton } from '@mui/lab';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { shikshaMitraToast } from 'src/components/toast';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { Alert, Box, Card, Stack, Divider, TextField, Typography } from '@mui/material';
import {
  RubricStatus,
  useGetRubricsQuery,
  useAddRubricMutation,
  usePublishRubricMutation,
  useGetRubricEvaluationsQuery,
  useGetStudentAssignmentEvaluationQuery,
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

export type RubricEvaluationPanelRef = {
  save: () => Promise<boolean>;
};

const defaultCriteria = [
  { title: 'Concept Understanding', maxMarks: 10, displayOrder: 1 },
  { title: 'Accuracy', maxMarks: 10, displayOrder: 2 },
  { title: 'Presentation', maxMarks: 5, displayOrder: 3 },
];

const RubricEvaluationPanel = React.forwardRef<RubricEvaluationPanelRef, Props>(
  function RubricEvaluationPanel(
    { mode, standardId, subjectId, taskId, taskTitle, studentRow, ensureSubmissionId }: Props,
    ref
  ) {
    const params =
      mode === 'homework'
        ? { standardId, subjectId, homeworkId: taskId }
        : { standardId, subjectId, assignmentId: taskId };

    const { data: rubrics = [], isFetching } = useGetRubricsQuery(params, {
      skip: !standardId || !subjectId || !taskId,
    });
    const activeRubric =
      rubrics.find((rubric) => rubric.status === RubricStatus.Published) ?? rubrics[0];
    const studentId = studentRow?.studentId as string | undefined;
    const assignmentEvaluationQuery = useGetStudentAssignmentEvaluationQuery(
      { studentId: studentId ?? '', assignmentId: taskId },
      { skip: mode !== 'assignment' || !studentId || !taskId }
    );
    const { data: evaluations = [] } = useGetRubricEvaluationsQuery(activeRubric?.id ?? '', {
      skip: mode !== 'homework' || !activeRubric?.id,
    });
    const [resolvedSubmissionId, setResolvedSubmissionId] = React.useState<string | null>(null);
    const studentSubmissionId = resolvedSubmissionId || studentRow?.id;
    const currentEvaluation =
      mode === 'assignment'
        ? assignmentEvaluationQuery.data
        : evaluations.find((evaluation) => evaluation.studentSubmissionId === studentSubmissionId);
    const isEvaluationLoading =
      isFetching || assignmentEvaluationQuery.isLoading || assignmentEvaluationQuery.isFetching;
    const hasEvaluationError = mode === 'assignment' && assignmentEvaluationQuery.isError;
    const [scores, setScores] = React.useState<Record<string, string>>({});
    const [remarks, setRemarks] = React.useState('');

    const [addRubric, { isLoading: isCreating }] = useAddRubricMutation();
    const [publishRubric, { isLoading: isPublishing }] = usePublishRubricMutation();
    const [upsertEvaluation] = useUpsertRubricEvaluationMutation();
    const [submitEvaluation] = useSubmitRubricEvaluationMutation();
    const [approveEvaluation] = useApproveRubricEvaluationMutation();

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
        const parsed = parseApiProblemDetail(error);
        shikshaMitraToast.error({ message: parsed.detail || 'Failed to create rubric' });
      }
    };

    const handleSaveEvaluation = async () => {
      if (!activeRubric || !studentRow?.studentId) return false;

      const submissionId =
        studentSubmissionId && !studentSubmissionId.startsWith('00000000')
          ? studentSubmissionId
          : await ensureSubmissionId?.();

      if (!submissionId) {
        shikshaMitraToast.error({
          message: 'Student submission is not available for rubric scoring.',
        });
        return false;
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
        return true;
      } catch (error) {
        console.error('Failed to save rubric evaluation', error);
        const parsed = parseApiProblemDetail(error);
        shikshaMitraToast.error({ message: parsed.detail || 'Failed to save rubric evaluation' });
        return false;
      }
    };

    React.useImperativeHandle(ref, () => ({ save: handleSaveEvaluation }), [
      activeRubric,
      approveEvaluation,
      ensureSubmissionId,
      remarks,
      scores,
      studentRow,
      studentSubmissionId,
      submitEvaluation,
      upsertEvaluation,
    ]);

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
              loading={isCreating || isPublishing || isEvaluationLoading}
              startIcon={<Iconify icon="material-symbols-light:rubric-rounded" />}
              onClick={handleCreateRubric}
            >
              Create Rubric
            </LoadingButton>
          </Stack>
        ) : (
          <Stack spacing={1}>
            {hasEvaluationError &&
            assignmentEvaluationQuery.error &&
            'status' in assignmentEvaluationQuery.error &&
            assignmentEvaluationQuery.error.status !== 404 ? (
              <Alert severity="error">
                Unable to load this student&apos;s existing evaluation. Please try again.
              </Alert>
            ) : null}
            {isEvaluationLoading ? (
              <Typography variant="body2" color="text.secondary">
                Loading scoring model...
              </Typography>
            ) : null}
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
          </Stack>
        )}
      </Card>
    );
  }
);

export default RubricEvaluationPanel;
