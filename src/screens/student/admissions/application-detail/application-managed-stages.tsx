import type {
  AdmissionApplication,
  AdmissionApplicationWorkflow,
} from 'src/redux/student/admissions/admission-applications-api';

import { Stack } from '@mui/material';

import { ApplicationReviews } from '../review/application-reviews';
import { ApplicationSeatStage } from '../seat/application-seat-stage';
import { ApplicationOfferStage } from '../offer/application-offer-stage';
import { ApplicationFormStage } from '../form-stage/application-form-stage';
import { ApplicationPaymentStage } from '../payment/application-payment-stage';
import { ApplicationEligibility } from '../eligibility/application-eligibility';
import { ApplicationAssessments } from '../assessments/application-assessments';
import { ApplicationDocuments } from '../document-verification/application-documents';

export function ApplicationManagedStages({
  application,
  workflow,
  ...actions
}: {
  application: AdmissionApplication;
  workflow?: AdmissionApplicationWorkflow;
  canAdvance: boolean;
  advancing: boolean;
  onComplete: (concurrencyStamp?: string) => void;
}) {
  const stageProps = {
    applicationId: application.id,
    stages: workflow?.stages ?? [],
    currentStage: workflow?.stages.find((stage) => stage.id === workflow.currentStageInstanceId),
    ...actions,
  };
  const seatStage = stageProps.currentStage?.seatStageEnabled
    ? stageProps.currentStage
    : [...stageProps.stages].reverse().find((stage) => stage.seatStageEnabled && stage.status === 2);
  if (
    !stageProps.stages.some(
      (stage) =>
        stage.assessmentEnabled ||
        stage.formStageEnabled ||
        stage.paymentStageEnabled ||
        stage.offerStageEnabled ||
        stage.seatStageEnabled ||
        stage.documentVerificationEnabled ||
        stage.eligibilityEnabled ||
        stage.reviewEnabled
    )
  )
    return null;
  return (
    <Stack spacing={1}>
      {stageProps.currentStage?.formStageEnabled && (
        <ApplicationFormStage
          applicationId={application.id}
          stage={stageProps.currentStage}
          canAdvance={actions.canAdvance}
          advancing={actions.advancing}
          onComplete={actions.onComplete}
        />
      )}
      {stageProps.currentStage?.paymentStageEnabled && (
        <ApplicationPaymentStage
          applicationId={application.id}
          stage={stageProps.currentStage}
          canAdvance={actions.canAdvance}
          advancing={actions.advancing}
          onComplete={actions.onComplete}
        />
      )}
      {stageProps.currentStage?.offerStageEnabled && (
        <ApplicationOfferStage
          applicationId={application.id}
          stage={stageProps.currentStage}
          canAdvance={actions.canAdvance}
          advancing={actions.advancing}
          onComplete={actions.onComplete}
        />
      )}
      {seatStage && (
        <ApplicationSeatStage
          applicationId={application.id}
          stage={seatStage}
          canAdvance={actions.canAdvance}
          advancing={actions.advancing}
          onComplete={actions.onComplete}
        />
      )}
      <ApplicationAssessments
        {...stageProps}
        admissionOfferingId={application.admissionOfferingId}
      />
      <ApplicationDocuments {...stageProps} />
      <ApplicationEligibility {...stageProps} />
      <ApplicationReviews {...stageProps} />
    </Stack>
  );
}
