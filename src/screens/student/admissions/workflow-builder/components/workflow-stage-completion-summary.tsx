import type { AdmissionWorkflowStage } from 'src/redux/student/admissions/admission-workflows-api';

import { StudentFeedback } from 'src/components/student-feedback';
import { readStageConfiguration } from 'src/redux/student/admissions/admission-assessment-policy';
import { readPaymentCompletionPolicy } from 'src/redux/student/admissions/admission-payment-completion-policy';

import { WorkflowSettingLabel } from './workflow-setting-label';
import { getStageOutcomeRule } from '../workflow-runtime-route-rules';

const POLICY_KEYS: Record<number, string> = {
  1: 'form',
  2: 'assessment',
  3: 'eligibility',
  4: 'payment',
  5: 'documentVerification',
  6: 'review',
  8: 'offer',
  9: 'seat',
};

export function getWorkflowStageCompletionDescription(stage: AdmissionWorkflowStage) {
  const config = readStageConfiguration(stage.configurationJson);
  const policy = config?.[POLICY_KEYS[stage.stageType]] as Record<string, unknown> | undefined;
  const managed = policy?.enabled === true;
  const outcome = getStageOutcomeRule(stage);
  let description =
    'Authorized staff complete the stage after its application status requirements are met.';
  if (stage.stageType === 1)
    description = managed
      ? 'The attached form is submitted with valid required answers. Outstanding correction requests must be resolved.'
      : 'The application is submitted using the attached published form.';
  if (stage.stageType === 2 && managed)
    description = `An assessment outcome is recorded${policy?.schedulingEnabled ? ' for a booked session' : ''}${policy?.attendanceRequired ? ', with attendance recorded' : ''}${policy?.reviewRequired ? ', and the result is reviewed' : ''}. Failed, absent, and retake outcomes cannot follow the usual path; staff can arrange an allowed retake or end the journey as Withdrawn.`;
  if (stage.stageType === 3 && managed)
    description =
      'Every eligibility check passes or has an approved exception. Ineligible or missing-information outcomes need an explicit matching path to continue.';
  if (stage.stageType === 4) {
    const payment = readPaymentCompletionPolicy(stage.configurationJson);
    description = `${payment?.paymentRule === 'full' ? 'The entire selected Finance fee structure, including future installments, is cleared' : 'A confirmed partial payment is recorded in Finance'}. Finance-verified zero payable needs no payment entry.${payment?.allowCollectionLater ? ' Authorized staff can instead defer collection to Onboarding with a reason.' : ''}`;
  }
  if (stage.stageType === 5 && managed)
    description = `All applicable required documents are accepted${policy?.allowWaivers ? ' or have an authorized waiver' : ''}. Replaced documents require fresh review. Documents for other classes do not block completion.`;
  if (stage.stageType === 6 && managed)
    description = `A reviewer submits a recommendation and an authorized approver records the decision${policy?.requireIndependentApprover ? ' as a different person' : ''}. Approval requires the configured evidence and required checks to pass.`;
  if (stage.stageType === 7)
    description =
      'An authorized approver has recorded Approve, Waitlist, or Reject. Required review prerequisites and application decision permissions still apply.';
  if ([8, 9].includes(stage.stageType) && managed)
    description = `A recorded outcome is allowed by this stage: ${outcome?.allowed.join(', ') || 'choose completion outcomes in Settings'}. Each non-success outcome needs its own matching special path.`;
  return description;
}

export function WorkflowStageCompletionSummary({
  stage,
  error,
}: {
  stage: AdmissionWorkflowStage;
  error?: string;
}) {
  return error ? (
    <StudentFeedback notificationKey="STU-0582" presentation="persistent" severity="error">
      {error}
    </StudentFeedback>
  ) : (
    <WorkflowSettingLabel
      label="Stage completion"
      help={getWorkflowStageCompletionDescription(stage)}
    />
  );
}
