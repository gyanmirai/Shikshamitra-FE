import type {
  AdmissionApplicationStage,
  AdmissionApplicationStatus,
} from 'src/redux/student/admissions/admission-applications-api';

export const APPLICATION_APPROVED_STATUS: AdmissionApplicationStatus = 6;

export const STAGE_STATUS_LABELS: Record<number, string> = {
  0: 'Not started',
  1: 'Current step',
  2: 'Completed',
  3: 'Skipped',
  4: 'Failed',
  5: 'Cancelled',
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

export function hasManagedStageWorkspace(stage?: AdmissionApplicationStage) {
  return Boolean(
    stage?.assessmentEnabled ||
    stage?.formStageEnabled ||
    stage?.paymentStageEnabled ||
    stage?.offerStageEnabled ||
    stage?.seatStageEnabled ||
    stage?.documentVerificationEnabled ||
    stage?.eligibilityEnabled ||
    stage?.reviewEnabled
  );
}

export function isAdmissionDecisionStage(stage?: AdmissionApplicationStage) {
  return Boolean(
    stage &&
    ((stage.stageType === 6 && stage.reviewEnabled) ||
      (stage.stageType >= 7 && stage.stageType <= 10))
  );
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
    stage.eligibilityEnabled ||
    stage.reviewEnabled ||
    stage.paymentStageEnabled ||
    stage.offerStageEnabled ||
    stage.seatStageEnabled
  )
    return false;
  return !isApprovalStage(stage) || applicationStatus === APPLICATION_APPROVED_STATUS;
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
  nextRequiredAction?: string | null
) {
  if (!stage) return 'No action is currently required.';
  if (stage.reviewEnabled)
    return 'Review the evidence and checklist below, submit a recommendation, then record an authorized admission decision before continuing.';
  if (stage.seatStageEnabled)
    return 'Manage the admission capacity below. Confirm a current reservation or record another configured outcome before continuing.';
  if (stage.eligibilityEnabled)
    return 'Check the eligibility results below. Resolve missing information or an authorized exception before continuing.';
  if (stage.documentVerificationEnabled)
    return 'Review the document checklist below. Resolve every required document before continuing.';
  if (stage.assessmentEnabled)
    return 'Manage the assessment below. The configured requirements determine when this step can continue.';
  if (isFormStage(stage)) {
    if (applicationStatus === 1) {
      return 'The application form is submitted. Continue to the next admission step.';
    }
    return 'Complete each registration section below, save every step, then submit the application.';
  }
  if (isApprovalStage(stage) && applicationStatus !== APPLICATION_APPROVED_STATUS) {
    return 'Review the submitted details, then approve or reject the application in Admission decision.';
  }
  if (stage.code === 'PHYSICAL_FORM_ISSUED') {
    return 'Confirm that the printed form was handed to the parent and record its reference number.';
  }
  if (stage.stageType === 2 || stage.code === 'ENTRANCE_EXAM_PASSED') {
    return 'Record the exam schedule and marks. The learner must meet the pass mark to continue.';
  }
  return nextRequiredAction || 'Complete this step to continue the admission journey.';
}
