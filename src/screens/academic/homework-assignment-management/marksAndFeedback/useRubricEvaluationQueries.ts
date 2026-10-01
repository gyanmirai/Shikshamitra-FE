import {
  RubricStatus,
  useGetRubricsQuery,
  useGetRubricEvaluationsQuery,
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
    rubricsQuery.data?.find((item) => item.status === RubricStatus.Published) ??
    rubricsQuery.data?.[0];
  const assignmentQuery = useGetStudentAssignmentEvaluationQuery(
    { studentId: studentId ?? '', assignmentId: taskId },
    { skip: mode !== 'assignment' || !studentId || !taskId }
  );
  const homeworkQuery = useGetRubricEvaluationsQuery(activeRubric?.id ?? '', {
    skip: mode !== 'homework' || !activeRubric?.id,
  });
  const currentEvaluation =
    mode === 'assignment'
      ? assignmentQuery.data
      : homeworkQuery.data?.find((item) => item.studentSubmissionId === submissionId);
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
