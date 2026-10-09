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

import type { AdmissionFeeSelectionEditorState } from '../fee-selection/admission-fee-selection-editor';

export function ApplicationManagedStages({
  application,
  workflow,
  onFeeSelectionStateChange,
  compact = false,
  selectedStage,
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
}) {
  const stageProps = {
    applicationId: application.id,
    stages: workflow?.stages ?? [],
    currentStage: workflow?.stages.find((stage) => stage.id === workflow.currentStageInstanceId),
    ...actions,
  };
  const seatStage = stageProps.currentStage?.seatStageEnabled
    ? stageProps.currentStage
    : [...stageProps.stages]
        .reverse()
        .find((stage) => stage.seatStageEnabled && stage.status === 2);
  const historical = Boolean(
    selectedStage && (selectedStage.id !== stageProps.currentStage?.id || selectedStage.status >= 2)
  );
  if (historical && selectedStage) {
    return (
      <Stack spacing={1}>
        {selectedStage.stageType === 4 && (
          <ApplicationPaymentStage
            applicationId={application.id}
            stage={selectedStage}
            compact={compact}
            readOnly
            canAdvance={false}
            advancing={false}
            onComplete={actions.onComplete}
          />
        )}
        <ApplicationAssessments
          {...stageProps}
          compact={compact}
          selectedStageId={selectedStage.id}
          admissionOfferingId={application.admissionOfferingId}
        />
        <ApplicationDocuments
          {...stageProps}
          layout={compact ? 'table' : 'cards'}
          selectedStageId={selectedStage.id}
        />
      </Stack>
    );
  }
  if (
    !stageProps.stages.some(
      (stage) =>
        stage.assessmentEnabled ||
        stage.formStageEnabled ||
        stage.stageType === 4 ||
        stage.seatStageEnabled ||
        stage.documentVerificationEnabled
    )
  )
    return null;
  return (
    <Stack spacing={1}>
      {stageProps.currentStage?.formStageEnabled && (
        <ApplicationFormStage
          applicationId={application.id}
          stage={stageProps.currentStage}
          compact={compact}
          canAdvance={actions.canAdvance}
          advancing={actions.advancing}
          onComplete={actions.onComplete}
        />
      )}
      {stageProps.currentStage?.stageType === 4 && (
        <ApplicationPaymentStage
          applicationId={application.id}
          stage={stageProps.currentStage}
          canAdvance={actions.canAdvance}
          advancing={actions.advancing}
          onComplete={actions.onComplete}
          onFeeSelectionStateChange={onFeeSelectionStateChange}
          compact={compact}
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
        compact={compact}
      />
      <ApplicationDocuments {...stageProps} layout={compact ? 'table' : 'cards'} />
    </Stack>
  );
}
