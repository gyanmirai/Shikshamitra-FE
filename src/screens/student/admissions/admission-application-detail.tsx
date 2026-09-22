'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useBoolean } from 'src/hooks/use-boolean';
import { useRouter } from 'src/routes/hooks';
import { Iconify } from 'src/components/iconify';
import { studentPaths } from 'src/constants/student-menu';
import { CustomTabs } from 'src/components/custom-tabs';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { Alert, Box, Paper, Skeleton, Stack, Tab, Typography } from '@mui/material';

import { AdmissionQueryError } from './admission-query-error';
import { formatAdmissionReference } from './admission-reference';
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
import {
  isFormStage,
  isAdmissionDecisionStage,
  hasManagedStageWorkspace,
} from './application-detail/application-progress-model';

type DetailTab = 'current' | 'form' | 'history';

export default function AdmissionApplicationDetailScreen() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const detail = useApplicationDetail(id);
  const completionDialog = useBoolean();
  const [activeTab, setActiveTab] = useState<DetailTab>('current');
  const { applicationQuery, formQuery, workflowQuery } = detail;
  const application = applicationQuery.data;
  const form = formQuery.data;
  const workflow = workflowQuery.data;
  const currentStage = workflow?.stages.find(
    (stage) => stage.id === workflow.currentStageInstanceId
  );
  const isLoading = applicationQuery.isLoading || formQuery.isLoading || workflowQuery.isLoading;
  const isError =
    applicationQuery.isError ||
    formQuery.isError ||
    workflowQuery.isError ||
    (!isLoading && (!application || !form));

  const closeDetail = () => router.push(studentPaths.enrollment.applications);

  const renderRuntimeForm = () => {
    if (!application || !form) return null;
    return (
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
    );
  };

  const renderLoadedContent = () => {
    if (!application || !form) return null;
    const managedCurrentStage = hasManagedStageWorkspace(currentStage);
    const decisionStage = isAdmissionDecisionStage(currentStage) || workflow?.status === 1;
    const hasHistory = Boolean(
      workflow?.history.length || (detail.formHistoryQuery.data?.length ?? 0) > 0
    );

    return (
      <Stack spacing={1.5}>
        <Typography variant="body2" color="text.secondary">
          Follow the admission process configured for this offering. The current task, submitted
          form, and audit history are separated so staff can focus on the step that needs action.
        </Typography>
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
          canSkip={
            detail.canSkip &&
            !currentStage?.reviewEnabled &&
            !currentStage?.paymentStageEnabled &&
            !currentStage?.offerStageEnabled &&
            !currentStage?.seatStageEnabled
          }
          canOverride={
            detail.canOverride &&
            !currentStage?.reviewEnabled &&
            !currentStage?.paymentStageEnabled &&
            !currentStage?.offerStageEnabled &&
            !currentStage?.seatStageEnabled
          }
          advancing={detail.advanceState.isLoading}
          retryingFormHandoff={detail.submitState.isLoading}
          onAdvance={() => {
            if (requiresStageCompletionDetails(currentStage)) completionDialog.onTrue();
            else detail.advance();
          }}
          onRetryFormHandoff={detail.submitApplication}
          onSkip={() => detail.setRuntimeAction('skip')}
          onOverride={() => detail.setRuntimeAction('override')}
        />

        <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
          <CustomTabs
            value={activeTab}
            onChange={(_, value: DetailTab) => setActiveTab(value)}
            aria-label="Application detail sections"
            variant="scrollable"
            scrollButtons="auto"
            guardUnsavedChanges={false}
          >
            <Tab
              id="application-tab-current"
              aria-controls="application-panel-current"
              value="current"
              label="Current step"
              icon={<Iconify icon="mdi:clipboard-check-outline" width={20} />}
              iconPosition="start"
            />
            <Tab
              id="application-tab-form"
              aria-controls="application-panel-form"
              value="form"
              label="Application form"
              icon={<Iconify icon="mdi:file-document-outline" width={20} />}
              iconPosition="start"
            />
            <Tab
              id="application-tab-history"
              aria-controls="application-panel-history"
              value="history"
              label="History"
              icon={<Iconify icon="mdi:history" width={20} />}
              iconPosition="start"
            />
          </CustomTabs>
        </Paper>

        {activeTab === 'current' && (
          <Stack
            id="application-panel-current"
            role="tabpanel"
            aria-labelledby="application-tab-current"
            spacing={1.5}
          >
            <ApplicationManagedStages
              application={application}
              workflow={workflow}
              canAdvance={detail.canAdvance}
              advancing={detail.advanceState.isLoading}
              onComplete={(concurrencyStamp) => {
                detail.advance(concurrencyStamp ? { concurrencyStamp } : undefined);
              }}
            />
            {isFormStage(currentStage) && renderRuntimeForm()}
            {decisionStage && (
              <ApplicationDecisionCard
                application={application}
                managedOffer={currentStage?.offerStageEnabled}
              />
            )}
            {currentStage &&
              !managedCurrentStage &&
              !isFormStage(currentStage) &&
              !decisionStage && (
                <Alert severity="info" icon={<Iconify icon="mdi:clipboard-text-outline" />}>
                  <Typography variant="subtitle2">Manual workflow step</Typography>
                  <Typography variant="body2">
                    No managed checklist was configured for “{currentStage.name}” when this workflow
                    version was published. Review the required evidence, then use the completion
                    action in Admission journey above.
                  </Typography>
                </Alert>
              )}
            {!currentStage && workflow?.status !== 1 && (
              <Alert severity="info">No current admission task is available.</Alert>
            )}
          </Stack>
        )}

        {activeTab === 'form' && (
          <Stack
            id="application-panel-form"
            role="tabpanel"
            aria-labelledby="application-tab-form"
            spacing={1.5}
          >
            <Alert severity="info" icon={<Iconify icon="mdi:archive-lock-outline" />}>
              This is the form version frozen when the application started. It remains available as
              the submitted application record and does not represent the current workflow step.
            </Alert>
            {renderRuntimeForm()}
          </Stack>
        )}

        {activeTab === 'history' && (
          <Stack
            id="application-panel-history"
            role="tabpanel"
            aria-labelledby="application-tab-history"
            spacing={1.5}
          >
            {hasHistory ? (
              <>
                <TransitionHistoryCard workflow={workflow} />
                <FormHistoryCard history={detail.formHistoryQuery.data ?? []} />
              </>
            ) : (
              <Alert severity="info">No application history has been recorded yet.</Alert>
            )}
          </Stack>
        )}
      </Stack>
    );
  };

  return (
    <>
      <CustomDialog
        open
        fullScreen
        hasForm={false}
        data-testid="admission-application-full-screen-dialog"
        title={
          application
            ? `Application details - ${application.applicantName} (${formatAdmissionReference(application.applicationNumber)})`
            : 'Application details'
        }
        transitionDuration={{ enter: 0, exit: 0 }}
        handleClose={closeDetail}
        paperProps={{ sx: { borderRadius: 0, backgroundImage: 'none' } }}
      >
        <DialogScrollContent sx={{ p: 0, bgcolor: 'background.neutral' }}>
          <Box sx={{ p: { xs: 1, sm: 2 } }}>
            {isLoading && (
              <Stack spacing={2} aria-label="Loading application details">
                <Skeleton height={32} width="55%" />
                <Skeleton variant="rounded" height={220} />
                <Skeleton variant="rounded" height={320} />
              </Stack>
            )}
            {isError && (
              <AdmissionQueryError
                onRetry={() => {
                  applicationQuery.refetch();
                  formQuery.refetch();
                  workflowQuery.refetch();
                }}
              />
            )}
            {!isLoading && !isError && renderLoadedContent()}
          </Box>
        </DialogScrollContent>
      </CustomDialog>

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
    </>
  );
}
