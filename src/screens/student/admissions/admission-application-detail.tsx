'use client';

import { useParams } from 'next/navigation';
import { useBoolean } from 'src/hooks/use-boolean';
import { Box, Stack, Skeleton } from '@mui/material';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { AdmissionQueryError } from './admission-query-error';
import { FormHistoryCard } from './application-detail/form-history-card';
import { useApplicationDetail } from './application-detail/use-application-detail';
import { TransitionHistoryCard } from './application-detail/transition-history-card';
import { ApplicationRuntimeForm } from './application-detail/application-runtime-form';
import { ApplicationProgressCard } from './application-detail/application-progress-card';
import { ApplicationDecisionCard } from './application-detail/application-decision-card';
import { ApplicationManagedStages } from './application-detail/application-managed-stages';
import { requiresStageCompletionDetails } from './application-detail/admission-stage-completion';
import { AdmissionWorkflowRuntimeActionDialog } from './admission-workflow-runtime-action-dialog';
import { AdmissionStageCompletionDialog } from './application-detail/admission-stage-completion-dialog';

export default function AdmissionApplicationDetailScreen() {
  const { id } = useParams<{ id: string }>();
  const detail = useApplicationDetail(id);
  const completionDialog = useBoolean();
  const { applicationQuery, formQuery, workflowQuery } = detail;
  const application = applicationQuery.data;
  const form = formQuery.data;
  const workflow = workflowQuery.data;

  if (applicationQuery.isLoading || formQuery.isLoading || workflowQuery.isLoading) {
    return (
      <Stack spacing={2}>
        <Skeleton height={80} />
        <Skeleton variant="rounded" height={180} />
        <Skeleton variant="rounded" height={360} />
      </Stack>
    );
  }
  if (
    applicationQuery.isError ||
    formQuery.isError ||
    workflowQuery.isError ||
    !application ||
    !form
  ) {
    return (
      <AdmissionQueryError
        onRetry={() => {
          applicationQuery.refetch();
          formQuery.refetch();
          workflowQuery.refetch();
        }}
      />
    );
  }
  const currentStage = workflow?.stages.find(
    (stage) => stage.id === workflow.currentStageInstanceId
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <CustomBreadcrumbs
        heading={application.applicationNumber}
        description="Review the configured admission journey, form data, and transition history."
        links={[
          { name: 'Students', href: '/student/dashboard' },
          { name: 'Admissions', href: '/student/admissions' },
          { name: 'Applications', href: '/student/admissions/applications' },
          { name: application.applicationNumber },
        ]}
        sx={{ mb: 1 }}
      />
      <ApplicationProgressCard
        application={application}
        workflow={workflow}
        currentStage={currentStage}
        canAdvance={
          detail.canAdvance &&
          !currentStage?.formStageEnabled &&
          !currentStage?.paymentStageEnabled &&
          !currentStage?.offerStageEnabled &&
          !currentStage?.seatStageEnabled &&
          !currentStage?.assessmentEnabled &&
          !currentStage?.documentVerificationEnabled &&
          !currentStage?.eligibilityEnabled &&
          !currentStage?.reviewEnabled
        }
        canSkip={detail.canSkip && !currentStage?.reviewEnabled && !currentStage?.paymentStageEnabled && !currentStage?.offerStageEnabled && !currentStage?.seatStageEnabled}
        canOverride={detail.canOverride && !currentStage?.reviewEnabled && !currentStage?.paymentStageEnabled && !currentStage?.offerStageEnabled && !currentStage?.seatStageEnabled}
        advancing={detail.advanceState.isLoading}
        onAdvance={() => {
          if (requiresStageCompletionDetails(currentStage)) completionDialog.onTrue();
          else detail.advance();
        }}
        onSkip={() => detail.setRuntimeAction('skip')}
        onOverride={() => detail.setRuntimeAction('override')}
      />
      <ApplicationManagedStages
        application={application}
        workflow={workflow}
        canAdvance={detail.canAdvance}
        advancing={detail.advanceState.isLoading}
        onComplete={(concurrencyStamp) => {
          detail.advance(concurrencyStamp ? { concurrencyStamp } : undefined);
        }}
      />
      <ApplicationDecisionCard application={application} managedOffer={currentStage?.offerStageEnabled} />
      <TransitionHistoryCard workflow={workflow} />
      <FormHistoryCard history={detail.formHistoryQuery.data ?? []} />
      <ApplicationRuntimeForm
        application={application}
        form={form}
        values={detail.currentValues}
        errors={detail.errors}
        fieldErrors={detail.fieldErrors}
        saving={detail.updateState.isLoading}
        submitting={detail.submitState.isLoading || detail.updateState.isLoading}
        onChange={detail.setFieldValue}
        onBlur={detail.setFieldTouched}
        onValidateStep={detail.validateStep}
        onSave={detail.save}
        onSubmit={detail.submitApplication}
        showSaveDraft={detail.formStageQuery.currentData?.policy?.allowSaveAndResume ?? true}
        canSubmitForm={detail.formStageQuery.currentData?.canSubmit ?? application.status === 0}
        managedFormStage={Boolean(currentStage?.formStageEnabled)}
        canReopen={detail.canReopen}
        reopening={detail.reopenState.isLoading}
        onReopen={detail.reopenApplication}
      />
      {completionDialog.value && currentStage && (
        <AdmissionStageCompletionDialog
          open
          stage={currentStage}
          loading={detail.advanceState.isLoading}
          onClose={completionDialog.onFalse}
          onSubmit={(reason) => detail.advance({ reason })}
        />
      )}
      {detail.runtimeAction && workflow && (
        <AdmissionWorkflowRuntimeActionDialog
          open
          action={detail.runtimeAction}
          transitions={workflow.availableTransitions}
          loading={detail.advanceState.isLoading}
          onClose={() => detail.setRuntimeAction(null)}
          onSubmit={async (value) => {
            await detail.advance({
              ...value,
              skipCurrentStage: detail.runtimeAction === 'skip',
              adminOverride: detail.runtimeAction === 'override',
            });
          }}
        />
      )}
    </Box>
  );
}
