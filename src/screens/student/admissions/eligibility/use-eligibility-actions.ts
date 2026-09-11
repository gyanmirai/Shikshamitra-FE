import type { EligibilitySummary } from 'src/redux/student/admissions/admission-eligibility-types';

import {
  useReviewEligibilityExceptionMutation,
  useRequestEligibilityExceptionMutation,
  useEvaluateAdmissionEligibilityMutation,
} from 'src/redux/student/admissions/admission-eligibility-api';

import type { EligibilityAction } from './eligibility-action-model';

export function useEligibilityActions() {
  const [evaluate] = useEvaluateAdmissionEligibilityMutation();
  const [request] = useRequestEligibilityExceptionMutation();
  const [review] = useReviewEligibilityExceptionMutation();
  return (
    summary: EligibilitySummary,
    action: EligibilityAction,
    reason: string,
    exceptionId?: string
  ) => {
    const key = {
      applicationId: summary.applicationId,
      stageId: summary.stageId,
      concurrencyStamp: summary.concurrencyStamp,
    };
    if (action === 'evaluate') return evaluate(key).unwrap();
    if (action === 'requestException' && summary.latestEvaluation)
      return request({ ...key, evaluationId: summary.latestEvaluation.id, reason }).unwrap();
    if ((action === 'approveException' || action === 'rejectException') && exceptionId)
      return review({
        ...key,
        exceptionId,
        decision: action === 'approveException' ? 'approved' : 'rejected',
        reason,
      }).unwrap();
    return Promise.reject(new Error('Refresh eligibility before trying this action again.'));
  };
}
