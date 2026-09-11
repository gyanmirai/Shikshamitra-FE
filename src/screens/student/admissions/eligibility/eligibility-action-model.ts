import * as Yup from 'yup';

export type EligibilityAction =
  'evaluate' | 'requestException' | 'approveException' | 'rejectException';

export const eligibilityActionLabels: Record<EligibilityAction, string> = {
  evaluate: 'Check eligibility',
  requestException: 'Request an exception',
  approveException: 'Approve exception',
  rejectException: 'Decline exception',
};

export const eligibilityActionDescriptions: Record<EligibilityAction, string> = {
  evaluate:
    'Check the saved applicant information against the configured rules and record the result.',
  requestException:
    'Explain why an exception should be considered. An authorized reviewer must decide.',
  approveException:
    'Record why this exception is approved. The applicant continues through the configured admission workflow.',
  rejectException:
    'Explain why this exception request is declined. The decision remains in the eligibility history.',
};

export function eligibilityActionSchema(action: EligibilityAction) {
  const reason = Yup.string().trim().max(1024, 'Use at most 1,024 characters');
  return Yup.object({
    reason: action === 'evaluate' ? reason : reason.required('Give a reason for this decision'),
  });
}
