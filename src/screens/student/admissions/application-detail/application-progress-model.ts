import type { LabelColor } from 'src/components/label';
import type { AdmissionFormStagePolicy } from 'src/redux/student/admissions/admission-form-stage-policy';
import type {
  AdmissionApplicationStage,
  AdmissionApplicationStatus,
} from 'src/redux/student/admissions/admission-applications-api';

const ACTIVE_POST_SUBMISSION_STATUSES = new Set<AdmissionApplicationStatus>([1, 4, 5, 6, 7, 8]);
const RECORDED_DECISION_STATUSES = new Set<AdmissionApplicationStatus>([3, 6]);

export const STAGE_STATUS_LABELS: Record<number, string> = {
  0: 'Not started',
  1: 'Current step',
  2: 'Completed',
  3: 'Skipped',
  4: 'Failed',
  5: 'Cancelled',
};

export const getStageStatusLabel = (status: number) => STAGE_STATUS_LABELS[status] ?? 'Unknown';

export const getStageStatusColor = (status: number): LabelColor => {
  if (status === 2) return 'success';
  if (status === 3) return 'warning';
  if (status === 4 || status === 5) return 'error';
  return 'default';
};

export function getWorkflowProgress(stages: AdmissionApplicationStage[]) {
  const total = stages.length;
  const completed = stages.filter((stage) => stage.status === 2 || stage.status === 3).length;
  return {
    total,
    completed,
    percentage: total === 0 ? 0 : Math.round((completed / total) * 100),
  };
}

export function isApprovalStage(stage?: AdmissionApplicationStage) {
  return stage?.stageType === 7 || stage?.code === 'VERIFY_APPROVE_ADMISSION';
}

export function isFormStage(stage?: AdmissionApplicationStage) {
  return stage?.stageType === 1;
}

export function canStageTypeCompleteForStatus(
  stage: AdmissionApplicationStage | undefined,
  applicationStatus: AdmissionApplicationStatus
) {
  if (!stage) return false;

  switch (stage.stageType) {
    case 0: // Historical inquiry
    case 11: // Historical custom
      return true;
    case 1: // Form
      return applicationStatus === 1;
    case 2: // Assessment
      return applicationStatus === 0 || ACTIVE_POST_SUBMISSION_STATUSES.has(applicationStatus);
    case 7: // Approval
      return RECORDED_DECISION_STATUSES.has(applicationStatus);
    case 4: // Finance fee structure confirmation
      return applicationStatus === 0 || ACTIVE_POST_SUBMISSION_STATUSES.has(applicationStatus);
    case 9: // Existing seat/identity handoff
    case 10: // Existing enrollment handoff
    case 5: // Document verification
      return ACTIVE_POST_SUBMISSION_STATUSES.has(applicationStatus);
    default:
      return false;
  }
}

export function canRequestNormalStageAdvance(
  stage: AdmissionApplicationStage | undefined,
  applicationStatus: AdmissionApplicationStatus
) {
  if (!stage) return false;

  return (
    (stage.stageType === 9 && stage.seatStageEnabled) ||
    canStageTypeCompleteForStatus(stage, applicationStatus)
  );
}

export function hasManagedStageWorkspace(stage?: AdmissionApplicationStage) {
  return Boolean(
    stage?.assessmentEnabled ||
    stage?.formStageEnabled ||
    stage?.stageType === 4 ||
    stage?.seatStageEnabled ||
    stage?.documentVerificationEnabled
  );
}

export function isAdmissionDecisionStage(stage?: AdmissionApplicationStage) {
  return Boolean(stage && [7, 9, 10].includes(stage.stageType));
}

export function canRetrySubmittedFormHandoff(
  stage: AdmissionApplicationStage | undefined,
  applicationStatus: AdmissionApplicationStatus
) {
  return isFormStage(stage) && applicationStatus === 1 && !stage?.formStageEnabled;
}

export function canCompleteStageFromProgress(
  stage: AdmissionApplicationStage | undefined,
  applicationStatus: AdmissionApplicationStatus,
  canAdvance: boolean
) {
  if (
    !stage ||
    !canAdvance ||
    isFormStage(stage) ||
    stage.assessmentEnabled ||
    stage.documentVerificationEnabled ||
    stage.stageType === 4 ||
    stage.seatStageEnabled
  )
    return false;
  return canStageTypeCompleteForStatus(stage, applicationStatus);
}

export function getStageActionLabel(stage?: AdmissionApplicationStage) {
  if (!stage) return 'Complete current step';
  if (stage.stageType === 2 || stage.code === 'ENTRANCE_EXAM_PASSED') {
    return 'Record entrance exam result';
  }
  if (stage.code === 'PHYSICAL_FORM_ISSUED') return 'Confirm physical form issued';
  if (isApprovalStage(stage)) return 'Finish admission workflow';
  return `Complete ${stage.name}`;
}

export function getStageGuidance(
  stage: AdmissionApplicationStage | undefined,
  applicationStatus: AdmissionApplicationStatus,
  nextRequiredAction?: string | null,
  formPolicy?: Pick<AdmissionFormStagePolicy, 'requireSectionVerification'> | null
) {
  if (!stage) return 'No action is currently required.';
  if ([3, 6, 8].includes(stage.stageType))
    return 'This stage type is no longer supported. Select a current admission workflow.';
  if (stage.stageType === 4)
    return 'Select a fee structure to collect fees here, or record a reason to collect later in Onboarding.';
  if (stage.seatStageEnabled)
    return 'Manage the admission capacity below. Confirm a current reservation or record another configured outcome before continuing.';
  if (stage.documentVerificationEnabled)
    return 'Review the document checklist below. Resolve every required document before continuing.';
  if (stage.assessmentEnabled)
    return 'Manage the assessment below. The configured requirements determine when this step can continue.';
  if (isFormStage(stage)) {
    if (applicationStatus === 1 && formPolicy?.requireSectionVerification)
      return 'Review the submitted sections below. Complete any required verification before continuing.';
    if (applicationStatus === 1) {
      return 'The application form is submitted. Continue to the next admission step.';
    }
    return 'Complete each registration section below, save every step, then submit the application.';
  }
  if (isApprovalStage(stage) && applicationStatus === 5)
    return 'The application is waitlisted. Record an approval or rejection before completing the admission journey.';
  if (isApprovalStage(stage) && !RECORDED_DECISION_STATUSES.has(applicationStatus)) {
    return 'Review the submitted details, then approve, waitlist, or reject the application in Admission decision.';
  }
  if (stage.code === 'PHYSICAL_FORM_ISSUED') {
    return 'Confirm that the printed form was handed to the parent and record its reference number.';
  }
  if (stage.stageType === 2 || stage.code === 'ENTRANCE_EXAM_PASSED') {
    return 'Record the exam schedule and marks. The learner must meet the pass mark to continue.';
  }
  return nextRequiredAction || 'Complete this step to continue the admission journey.';
}
