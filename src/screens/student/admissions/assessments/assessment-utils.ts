import { parseApiProblemDetail } from 'src/utils/api-problem-details';

export function assessmentErrorMessage(
  error: unknown,
  fallback = 'Unable to save the assessment. Please try again.'
) {
  const { detail } = parseApiProblemDetail(error);
  return detail === 'Something went wrong' ? fallback : detail;
}

export function assessmentScopeKey(scope: {
  admissionOfferingId: string;
  workflowStageDefinitionId: string;
}) {
  return `${scope.admissionOfferingId}:${scope.workflowStageDefinitionId}`;
}
