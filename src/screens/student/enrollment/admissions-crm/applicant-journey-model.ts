import type { AdmissionCrmLeadDto } from 'src/redux/student/admissions-crm/admissions-crm-api';

import {
  AdmissionInquiryStage,
  AdmissionCrmSeatOfferStatus,
  AdmissionCrmActivationStatus,
  AdmissionCrmRegistrationStatus,
} from 'src/redux/student/admissions-crm/admissions-crm-api';

export type ApplicantJourneyStepId = 'inquiry' | 'exam' | 'registration' | 'offer' | 'activation';

export type ApplicantJourneyStepState = 'complete' | 'current' | 'available' | 'locked' | 'skipped';

export type ApplicantJourneyStep = {
  id: ApplicantJourneyStepId;
  label: string;
  workspaceTab: 'overview' | 'exam' | 'registration' | 'offer' | 'activation';
  state: ApplicantJourneyStepState;
  reason?: string;
};

export type ApplicantJourneyFacts = {
  lead: AdmissionCrmLeadDto;
  allowRegistrationBeforeExam: boolean;
  entranceExamRequired: boolean;
  hasExam: boolean;
  registrationStatus?: AdmissionCrmRegistrationStatus;
  offerStatus?: AdmissionCrmSeatOfferStatus;
  activationStatus?: AdmissionCrmActivationStatus;
  canViewOffers: boolean;
  canViewActivation: boolean;
};

const decisionStages = new Set([
  AdmissionInquiryStage.Eligible,
  AdmissionInquiryStage.Waitlisted,
  AdmissionInquiryStage.Rejected,
]);

const terminalStages = new Set([
  AdmissionInquiryStage.Rejected,
  AdmissionInquiryStage.Stale,
  AdmissionInquiryStage.Archived,
]);

const terminalStageReason =
  'This applicant is in a terminal pipeline stage. Existing records remain available, but new admission work cannot be started.';

const registrationCompleteStatuses = new Set([
  AdmissionCrmRegistrationStatus.Verified,
  AdmissionCrmRegistrationStatus.AdmissionReady,
]);

const registrationClosedStatuses = new Set([
  AdmissionCrmRegistrationStatus.Expired,
  AdmissionCrmRegistrationStatus.Revoked,
  AdmissionCrmRegistrationStatus.Withdrawn,
]);

const offerInProgressStatuses = new Set([
  AdmissionCrmSeatOfferStatus.Draft,
  AdmissionCrmSeatOfferStatus.ApprovalPending,
  AdmissionCrmSeatOfferStatus.Approved,
  AdmissionCrmSeatOfferStatus.Issued,
  AdmissionCrmSeatOfferStatus.Opened,
]);

const activationInProgressStatuses = new Set([
  AdmissionCrmActivationStatus.Draft,
  AdmissionCrmActivationStatus.ApprovalPending,
  AdmissionCrmActivationStatus.Approved,
  AdmissionCrmActivationStatus.InProgress,
  AdmissionCrmActivationStatus.RepairRequired,
  AdmissionCrmActivationStatus.CancellationPending,
]);

const activationCompleteStatuses = new Set([AdmissionCrmActivationStatus.FirstDayReady]);

export function buildApplicantJourney({
  lead,
  allowRegistrationBeforeExam,
  entranceExamRequired,
  hasExam,
  registrationStatus,
  offerStatus,
  activationStatus,
  canViewOffers,
  canViewActivation,
}: ApplicantJourneyFacts): ApplicantJourneyStep[] {
  const terminalStage = terminalStages.has(lead.stage);
  const inquiryComplete =
    terminalStage ||
    lead.stage >= AdmissionInquiryStage.ExamReady ||
    registrationStatus !== undefined;
  const decisionReached = decisionStages.has(lead.stage);
  const examComplete = decisionReached;
  const examSkipped = !hasExam && (!entranceExamRequired || decisionReached);
  const registrationExists =
    registrationStatus !== undefined ||
    Boolean(lead.registrationFormIssuedAt) ||
    Boolean(lead.registrationFormNumber);
  const registrationComplete =
    registrationStatus !== undefined &&
    (registrationCompleteStatuses.has(registrationStatus) ||
      (terminalStage && registrationClosedStatuses.has(registrationStatus)));
  const registrationAvailable =
    !terminalStage &&
    (!entranceExamRequired ||
      allowRegistrationBeforeExam ||
      registrationExists ||
      lead.stage === AdmissionInquiryStage.Eligible ||
      lead.stage === AdmissionInquiryStage.Waitlisted);
  const offerAccepted = offerStatus === AdmissionCrmSeatOfferStatus.Accepted;
  const offerExists = offerStatus !== undefined;
  const offerInProgress = offerStatus !== undefined && offerInProgressStatuses.has(offerStatus);
  const offerComplete = offerAccepted || (terminalStage && offerExists && !offerInProgress);
  const offerAvailable =
    !terminalStage &&
    canViewOffers &&
    registrationComplete &&
    (lead.stage === AdmissionInquiryStage.Eligible ||
      lead.stage === AdmissionInquiryStage.Waitlisted ||
      offerExists);
  const activationExists = activationStatus !== undefined;
  const activationInProgress =
    activationStatus !== undefined && activationInProgressStatuses.has(activationStatus);
  const activationComplete =
    activationStatus !== undefined &&
    (activationCompleteStatuses.has(activationStatus) || (terminalStage && !activationInProgress));
  const activationAvailable =
    !terminalStage && canViewActivation && (offerAccepted || activationExists);

  const examState: ApplicantJourneyStepState = examSkipped
    ? 'skipped'
    : examComplete || (terminalStage && hasExam)
      ? 'complete'
      : terminalStage
        ? 'locked'
        : hasExam || lead.stage >= AdmissionInquiryStage.ExamReady
          ? 'current'
          : 'locked';
  const registrationState: ApplicantJourneyStepState = registrationComplete
    ? 'complete'
    : registrationExists
      ? 'current'
      : registrationAvailable
        ? 'available'
        : 'locked';
  const offerState: ApplicantJourneyStepState = !canViewOffers
    ? 'locked'
    : offerComplete
      ? 'complete'
      : offerInProgress
        ? 'current'
        : offerAvailable
          ? 'available'
          : 'locked';
  const activationState: ApplicantJourneyStepState = !canViewActivation
    ? 'locked'
    : activationComplete
      ? 'complete'
      : activationInProgress
        ? 'current'
        : activationAvailable
          ? 'available'
          : 'locked';

  return [
    {
      id: 'inquiry',
      label: 'Inquiry',
      workspaceTab: 'overview',
      state: inquiryComplete ? 'complete' : 'current',
    },
    {
      id: 'exam',
      label: 'Entrance',
      workspaceTab: 'exam',
      state: examState,
      reason:
        examState === 'locked' && terminalStage
          ? terminalStageReason
          : !hasExam && lead.stage < AdmissionInquiryStage.ExamReady
            ? 'Complete inquiry qualification before scheduling an entrance assessment.'
            : undefined,
    },
    {
      id: 'registration',
      label: 'Registration',
      workspaceTab: 'registration',
      state: registrationState,
      reason:
        registrationState !== 'locked'
          ? undefined
          : terminalStage
            ? terminalStageReason
            : 'Complete the entrance decision, or enable registration before exam for this cycle.',
    },
    {
      id: 'offer',
      label: 'Offer & Seat',
      workspaceTab: 'offer',
      state: offerState,
      reason:
        offerState !== 'locked'
          ? undefined
          : !canViewOffers
            ? 'You do not have permission to view seat offers.'
            : terminalStage
              ? terminalStageReason
              : 'Verify registration before preparing a seat offer.',
    },
    {
      id: 'activation',
      label: 'Activation',
      workspaceTab: 'activation',
      state: activationState,
      reason:
        activationState !== 'locked'
          ? undefined
          : !canViewActivation
            ? 'You do not have permission to view activation.'
            : terminalStage
              ? terminalStageReason
              : 'An accepted seat offer is required before activation.',
    },
  ];
}

export function getApplicantNextJourneyStep(steps: ApplicantJourneyStep[]) {
  return (
    steps.find((step) => step.state === 'current' && step.id !== 'inquiry') ||
    steps.find((step) => step.state === 'available') ||
    steps.find((step) => step.state === 'current')
  );
}
