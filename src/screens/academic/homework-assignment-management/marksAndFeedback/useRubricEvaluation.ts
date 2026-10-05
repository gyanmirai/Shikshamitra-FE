import React from 'react';
import { shikshaMitraToast } from 'src/components/toast';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import {
  useAddRubricMutation,
  RubricEvaluationStatus,
  usePublishRubricMutation,
  useUpsertRubricEvaluationMutation,
  useSubmitRubricEvaluationMutation,
  useApproveRubricEvaluationMutation,
} from 'src/redux/academicAPI/HomeworkAssignmentApi/AssessmentAndFeedbackApi/RubricAssessmentApi';

import { useRubricEvaluationQueries } from './useRubricEvaluationQueries';
import {
  calculateTotalMarks,
  buildEvaluationScores,
  validateCriterionValues,
  initializeCriterionValues,
} from './rubricEvaluationUtils';

import type {
  CriterionEvaluationValues,
  RubricEvaluationPanelProps,
} from './rubricEvaluationTypes';

const defaultCriteria = [
  { title: 'Concept Understanding', isRequired: true, points: 10, displayOrder: 1 },
  { title: 'Accuracy', isRequired: true, points: 10, displayOrder: 2 },
  { title: 'Presentation', isRequired: true, points: 5, displayOrder: 3 },
];

export const useRubricEvaluation = (props: RubricEvaluationPanelProps) => {
  const { mode, standardId, subjectId, taskId, taskTitle, studentRow, ensureSubmissionId } = props;
  const studentId = studentRow?.studentId;
  const [resolvedSubmissionId, setResolvedSubmissionId] = React.useState<string | null>(null);
  const submissionId = resolvedSubmissionId || studentRow?.id;
  const evaluationQueries = useRubricEvaluationQueries({
    mode,
    standardId,
    subjectId,
    taskId,
    studentId,
    submissionId,
  });
  const { activeRubric, currentEvaluation } = evaluationQueries;
  const isLocked = currentEvaluation?.status === RubricEvaluationStatus.Approved;
  const [criterionValues, setCriterionValues] = React.useState<CriterionEvaluationValues>({});
  const [remarks, setRemarks] = React.useState('');
  const [addRubric, { isLoading: isCreating }] = useAddRubricMutation();
  const [publishRubric, { isLoading: isPublishing }] = usePublishRubricMutation();
  const [upsertEvaluation] = useUpsertRubricEvaluationMutation();
  const [submitEvaluation] = useSubmitRubricEvaluationMutation();
  const [approveEvaluation] = useApproveRubricEvaluationMutation();

  React.useEffect(() => {
    setCriterionValues(initializeCriterionValues(activeRubric, currentEvaluation));
    setRemarks(currentEvaluation?.remarks ?? '');
  }, [activeRubric, currentEvaluation]);

  React.useEffect(() => setResolvedSubmissionId(null), [studentId, taskId]);

  const setCriterionMarks = (criterionId: string, marks: string) =>
    setCriterionValues((current) => ({
      ...current,
      [criterionId]: { ...current[criterionId], marks },
    }));
  const setCriterionComments = (criterionId: string, comments: string) =>
    setCriterionValues((current) => ({
      ...current,
      [criterionId]: { ...current[criterionId], comments },
    }));

  const createDefaultRubric = async () => {
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
      shikshaMitraToast.error({
        message: parseApiProblemDetail(error).detail || 'Failed to create rubric',
      });
    }
  };

  const save = async () => {
    if (!activeRubric || !studentId) return false;
    if (evaluationQueries.isLoading || evaluationQueries.hasEvaluationError) {
      shikshaMitraToast.error({ message: 'Wait for this student’s rubric evaluation to load.' });
      return false;
    }
    if (isLocked) return true;
    if (props.readOnly) return false;
    const invalidCriterion = validateCriterionValues(activeRubric, criterionValues);
    if (invalidCriterion) {
      shikshaMitraToast.error({
        message: `Select or enter a valid score for ${invalidCriterion.title}.`,
      });
      return false;
    }
    const validSubmissionId =
      submissionId && !submissionId.startsWith('00000000')
        ? submissionId
        : await ensureSubmissionId?.();
    if (!validSubmissionId) {
      shikshaMitraToast.error({
        message: 'Student submission is not available for rubric scoring.',
      });
      return false;
    }
    setResolvedSubmissionId(validSubmissionId);
    try {
      const saved = await upsertEvaluation({
        rubricId: activeRubric.id,
        body: {
          studentSubmissionId: validSubmissionId,
          studentId,
          remarks,
          scores: buildEvaluationScores(activeRubric, criterionValues),
        },
      }).unwrap();
      await submitEvaluation(saved.id).unwrap();
      await approveEvaluation(saved.id).unwrap();
      return true;
    } catch (error) {
      shikshaMitraToast.error({
        message: parseApiProblemDetail(error).detail || 'Failed to save rubric evaluation',
      });
      return false;
    }
  };

  return {
    activeRubric,
    isLocked,
    criterionValues,
    remarks,
    setRemarks,
    setCriterionMarks,
    setCriterionComments,
    createDefaultRubric,
    save,
    isCreating,
    isPublishing,
    totalMarks: calculateTotalMarks(criterionValues),
    isLoading: evaluationQueries.isLoading,
    hasEvaluationError: evaluationQueries.hasEvaluationError,
    retryEvaluation: evaluationQueries.retryEvaluation,
  };
};
