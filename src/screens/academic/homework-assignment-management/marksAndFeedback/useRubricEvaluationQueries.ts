import {
  RubricStatus,
  useGetRubricsQuery,
  useGetSubmissionRubricEvaluationQuery,
  useGetStudentAssignmentEvaluationQuery,
} from 'src/redux/academicAPI/HomeworkAssignmentApi/AssessmentAndFeedbackApi/RubricAssessmentApi';

import { isMissingEvaluationResponse } from './rubricEvaluationUtils';

type RubricEvaluationQueriesProps = {
  mode: 'homework' | 'assignment';
  standardId: string;
  subjectId: string;
  taskId: string;
  studentId?: string;
  submissionId?: string;
};

export const useRubricEvaluationQueries = ({
  mode,
  standardId,
  subjectId,
  taskId,
  studentId,
  submissionId,
}: RubricEvaluationQueriesProps) => {
  const params =
    mode === 'homework'
      ? { standardId, subjectId, homeworkId: taskId }
      : { standardId, subjectId, assignmentId: taskId };
  const rubricsQuery = useGetRubricsQuery(params, { skip: !standardId || !subjectId || !taskId });
  const activeRubric =
    rubricsQuery.currentData?.find((item) => item.status === RubricStatus.Published) ??
    rubricsQuery.currentData?.[0];
  const assignmentQuery = useGetStudentAssignmentEvaluationQuery(
    { studentId: studentId ?? '', assignmentId: taskId },
    { skip: mode !== 'assignment' || !studentId || !taskId }
  );
  const homeworkQuery = useGetSubmissionRubricEvaluationQuery(
    { rubricId: activeRubric?.id ?? '', submissionId: submissionId ?? '', studentId: studentId ?? '' },
    { skip: mode !== 'homework' || !activeRubric?.id || !submissionId || !studentId || submissionId.startsWith('00000000') }
  );
  const currentEvaluation =
    mode === 'assignment'
      ? assignmentQuery.currentData
      : homeworkQuery.currentData;
  const hasEvaluationError =
    rubricsQuery.isError ||
    (mode === 'assignment'
      ? assignmentQuery.isError && !isMissingEvaluationResponse(assignmentQuery.error)
      : homeworkQuery.isError);

  return {
    activeRubric,
    currentEvaluation,
    hasEvaluationError,
    retryEvaluation: rubricsQuery.isError
      ? rubricsQuery.refetch
      : mode === 'assignment'
        ? assignmentQuery.refetch
        : homeworkQuery.refetch,
    isLoading: rubricsQuery.isFetching || assignmentQuery.isFetching || homeworkQuery.isFetching,
  };
};
