import type {
  AdmissionApplication,
  AdmissionApplicationStage,
  AdmissionApplicationWorkflow,
} from 'src/redux/student/admissions/admission-applications-api';

import { Stack } from '@mui/material';

import { ApplicationSeatStage } from '../seat/application-seat-stage';
import { ApplicationFormStage } from '../form-stage/application-form-stage';
import { ApplicationPaymentStage } from '../payment/application-payment-stage';
import { ApplicationAssessments } from '../assessments/application-assessments';
import { ApplicationDocuments } from '../document-verification/application-documents';

import type { ApplicationStageReadinessHandler } from './application-stage-readiness';
import type { AdmissionFeeSelectionEditorState } from '../fee-selection/admission-fee-selection-editor';

export type { ApplicationStageReadiness } from './application-stage-readiness';

export function ApplicationManagedStages({
  application,
  workflow,
  onFeeSelectionStateChange,
  compact = false,
  selectedStage,
  showCompletionAction = true,
  onReadinessChange,
  onOpenAssessments,
  ...actions
}: {
  application: AdmissionApplication;
  workflow?: AdmissionApplicationWorkflow;
  canAdvance: boolean;
  advancing: boolean;
  onComplete: (concurrencyStamp?: string) => void;
  onFeeSelectionStateChange?: (state: AdmissionFeeSelectionEditorState) => void;
  compact?: boolean;
  selectedStage?: AdmissionApplicationStage;
  showCompletionAction?: boolean;
  onReadinessChange?: ApplicationStageReadinessHandler;
  onOpenAssessments?: (url: string) => void;
}) {
  const stageProps = {
    applicationId: application.id,
    stages: workflow?.stages ?? [],
    currentStage: workflow?.stages.find((stage) => stage.id === workflow.currentStageInstanceId),
    ...actions,
  };
  const stage = selectedStage ?? stageProps.currentStage;
  const historical = Boolean(stage && stage.status >= 2);
  const selectedIsCurrent = Boolean(
    stage && stage.id === stageProps.currentStage?.id && !historical
  );
  const canAdvance = actions.canAdvance && selectedIsCurrent;
  const seatStage = selectedStage
    ? selectedStage.seatStageEnabled
      ? selectedStage
      : undefined
    : stageProps.currentStage?.seatStageEnabled
      ? stageProps.currentStage
      : [...stageProps.stages]
          .reverse()
          .find((candidate) => candidate.seatStageEnabled && candidate.status === 2);
  if (
    !stageProps.stages.some(
      (candidate) =>
        candidate.assessmentEnabled ||
        candidate.formStageEnabled ||
        candidate.stageType === 4 ||
        candidate.seatStageEnabled ||
        candidate.documentVerificationEnabled
    )
  )
    return null;
  return (
    <Stack spacing={1}>
      {stage?.formStageEnabled && !historical && (
        <ApplicationFormStage
          applicationId={application.id}
          stage={stage}
          compact={compact}
          canAdvance={canAdvance}
          advancing={actions.advancing}
          onComplete={actions.onComplete}
          showCompletionAction={showCompletionAction}
          onReadinessChange={onReadinessChange}
        />
      )}
      {stage?.stageType === 4 && (
        <ApplicationPaymentStage
          applicationId={application.id}
          stage={stage}
          canAdvance={canAdvance}
          advancing={actions.advancing}
          onComplete={actions.onComplete}
          onFeeSelectionStateChange={onFeeSelectionStateChange}
          compact={compact}
          readOnly={historical}
          showCompletionAction={showCompletionAction}
          onReadinessChange={onReadinessChange}
        />
      )}
      {seatStage && (
        <ApplicationSeatStage
          applicationId={application.id}
          stage={seatStage}
          canAdvance={canAdvance}
          advancing={actions.advancing}
          onComplete={actions.onComplete}
          showCompletionAction={showCompletionAction}
          onReadinessChange={onReadinessChange}
        />
      )}
      <ApplicationAssessments
        {...stageProps}
        canAdvance={canAdvance}
        admissionOfferingId={application.admissionOfferingId}
        compact={compact}
        selectedStageId={selectedStage?.id}
        showCompletionAction={showCompletionAction}
        onReadinessChange={onReadinessChange}
        onOpenAssessments={onOpenAssessments}
      />
      <ApplicationDocuments
        {...stageProps}
        canAdvance={canAdvance}
        layout={compact ? 'table' : 'cards'}
        selectedStageId={selectedStage?.id}
        showCompletionAction={showCompletionAction}
        onReadinessChange={onReadinessChange}
      />
    </Stack>
  );
}
