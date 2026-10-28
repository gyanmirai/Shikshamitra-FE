import type { AppDispatch } from 'src/redux/store';

import React from 'react';
import { api } from 'src/redux/service';
import { useDispatch } from 'react-redux';
import { academicType } from 'src/redux/tagTypes';
import { shikshaMitraToast } from 'src/components/toast';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import {
  RubricEvaluationStatus,
  submissionRubricEvaluationTag,
  assignmentRubricEvaluationTag,
  useUpsertRubricEvaluationMutation,
  useSubmitRubricEvaluationMutation,
  useApproveRubricEvaluationMutation,
} from 'src/redux/academicAPI/HomeworkAssignmentApi/AssessmentAndFeedbackApi/RubricAssessmentApi';

import { useDefaultRubricCreation } from './useDefaultRubricCreation';
import { saveRubricEvaluationChain } from './saveRubricEvaluationChain';
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

export const useRubricEvaluation = (props: RubricEvaluationPanelProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const { mode, standardId, subjectId, taskId, studentRow, ensureSubmissionId } = props;
  const { createDefaultRubric, isCreating, isPublishing } = useDefaultRubricCreation(props);
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
      await saveRubricEvaluationChain({
        upsert: () => upsertEvaluation({
        rubricId: activeRubric.id,
        deferInvalidation: true,
        body: {
          studentSubmissionId: validSubmissionId,
          studentId,
          remarks,
          scores: buildEvaluationScores(activeRubric, criterionValues),
        },
        }).unwrap(),
        submit: evaluationId => submitEvaluation({ evaluationId, deferInvalidation: true }).unwrap(),
        approve: evaluationId => approveEvaluation({ evaluationId, deferInvalidation: true }).unwrap(),
        refresh: () => dispatch(api.util.invalidateTags([
          mode === 'homework'
            ? submissionRubricEvaluationTag({ rubricId: activeRubric.id, submissionId: validSubmissionId, studentId })
            : assignmentRubricEvaluationTag({ assignmentId: taskId, studentId }),
          { type: mode === 'homework' ? academicType.homeworkSubmissions : academicType.assignmentSubmissions, id: taskId },
          { type: mode === 'homework' ? academicType.homeworkSubmissions : academicType.assignmentSubmissions, id: 'LIST' },
        ])),
      });
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
