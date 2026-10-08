'use client';

import { useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { Label } from 'src/components/label';
import { useRouter } from 'src/routes/hooks';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { Scrollbar } from 'src/components/scrollbar';
import { CustomTabs } from 'src/components/custom-tabs';
import { studentPaths } from 'src/constants/student-menu';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { FormBusyRegion } from 'src/components/form-busy-region';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { Box, Tab, Alert, Paper, Stack, Button, Skeleton, Typography } from '@mui/material';

import { AdmissionQueryError } from './admission-query-error';
import { formatAdmissionReference } from './admission-reference';
import { FormHistoryCard } from './application-detail/form-history-card';
import { ApplicationFollowUps } from './application-detail/application-follow-ups';
import { useApplicationDetail } from './application-detail/use-application-detail';
import { getApplicationReturnUrl } from './application-detail/application-return-url';
import { TransitionHistoryCard } from './application-detail/transition-history-card';
import { ApplicationRuntimeForm } from './application-detail/application-runtime-form';
import { ApplicationCurrentTask } from './application-detail/application-current-task';
import { ApplicationProgressCard } from './application-detail/application-progress-card';
import { ApplicationDecisionCard } from './application-detail/application-decision-card';
import { ApplicationManagedStages } from './application-detail/application-managed-stages';
import { ApplicationCounsellorCard } from './application-detail/application-counsellor-card';
import { ApplicationFormDocuments } from './document-verification/application-form-documents';
import { requiresStageCompletionDetails } from './application-detail/admission-stage-completion';
import { AdmissionWorkflowRuntimeActionDialog } from './admission-workflow-runtime-action-dialog';
import { isAdmissionApplicationNotFound } from './application-detail/application-detail-query-state';
import { AdmissionStageCompletionDialog } from './application-detail/admission-stage-completion-dialog';
import {
  getAdmissionApplicationStatusColor,
  getAdmissionApplicationStatusLabel,
} from './application-status';
import {
  isFormStage,
  isApprovalStage,
  isAdmissionDecisionStage,
  hasManagedStageWorkspace,
  canRetrySubmittedFormHandoff,
  canCompleteStageFromProgress,
  canStageTypeCompleteForStatus,
} from './application-detail/application-progress-model';

import type { AdmissionFeeSelectionEditorState } from './fee-selection/admission-fee-selection-editor';

type DetailTab = 'current' | 'form' | 'history';

export default function AdmissionApplicationDetailScreen() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const returnUrl = getApplicationReturnUrl(searchParams.get('returnTo'));
  const detail = useApplicationDetail(id);
  const completionDialog = useBoolean();
  const [activeTab, setActiveTab] = useState<DetailTab>('current');
  const [requestedTab, setRequestedTab] = useState<DetailTab>();
  const [feeEditorState, setFeeEditorState] = useState<AdmissionFeeSelectionEditorState>({
    dirty: false,
    busy: false,
  });
  const workspaceBusy =
    feeEditorState.busy ||
    detail.updateState.isLoading ||
    detail.submitState.isLoading ||
    detail.advanceState.isLoading ||
    detail.reopenState.isLoading;
  const requestTabChange = (value: DetailTab) => {
    if (value === activeTab || workspaceBusy) return;
    if (feeEditorState.dirty) setRequestedTab(value);
    else setActiveTab(value);
  };
  const { applicationQuery, formQuery, workflowQuery } = detail;
  const application = applicationQuery.data;
  const form = formQuery.data;
  const workflow = workflowQuery.data;
  const applicationNotFound = isAdmissionApplicationNotFound(applicationQuery.error);
  const currentStage = workflow?.stages.find(
    (stage) => stage.id === workflow.currentStageInstanceId
  );
  const isLoading = applicationQuery.isLoading || formQuery.isLoading || workflowQuery.isLoading;
  const isError =
    applicationQuery.isError ||
    formQuery.isError ||
    workflowQuery.isError ||
    (!isLoading && (!application || !form));

  const closeDetail = () => router.push(returnUrl);

  const renderRuntimeForm = () => {
    if (!application || !form) return null;
    return (
      <FormBusyRegion busy={workspaceBusy} label="Saving application…">
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
          documents={
            <ApplicationFormDocuments
              applicationId={application.id}
              stages={workflow?.stages ?? []}
              unsaved={detail.hasUnsavedAnswers}
              saving={detail.updateState.isLoading || detail.submitState.isLoading}
            />
          }
        />
      </FormBusyRegion>
    );
  };

  const renderLoadedContent = () => {
    if (!application || !form) return null;
    const managedCurrentStage = hasManagedStageWorkspace(currentStage);
    const decisionStage = isAdmissionDecisionStage(currentStage) || workflow?.status === 1;
    const hasHistory = Boolean(
      workflow?.history.length || (detail.formHistoryQuery.data?.length ?? 0) > 0
    );
    const active = workflow?.status === 0 && Boolean(workflow.currentStageInstanceId);
    const canLeaveFeeEditor = !feeEditorState.dirty && !workspaceBusy;
    const canComplete = canCompleteStageFromProgress(
      currentStage,
      application.status,
      detail.canAdvance &&
        canLeaveFeeEditor &&
        !currentStage?.formStageEnabled &&
        !currentStage?.paymentStageEnabled &&
        !currentStage?.offerStageEnabled &&
        !currentStage?.seatStageEnabled &&
        !currentStage?.assessmentEnabled &&
        !currentStage?.documentVerificationEnabled &&
        !currentStage?.eligibilityEnabled &&
        !currentStage?.reviewEnabled
    );
    const canRetryFormHandoff = canRetrySubmittedFormHandoff(currentStage, application.status);
    const awaitingDecision =
      isApprovalStage(currentStage) &&
      !canStageTypeCompleteForStatus(currentStage, application.status);
    const canSkip = Boolean(
      detail.canSkip &&
      canLeaveFeeEditor &&
      !currentStage?.reviewEnabled &&
      !currentStage?.paymentStageEnabled &&
      !currentStage?.offerStageEnabled &&
      !currentStage?.seatStageEnabled
    );
    const canOverride = Boolean(
      detail.canOverride &&
      canLeaveFeeEditor &&
      !currentStage?.reviewEnabled &&
      !currentStage?.paymentStageEnabled &&
      !currentStage?.offerStageEnabled &&
      !currentStage?.seatStageEnabled
    );

    return (
      <Box
        sx={{
          height: 1,
          minHeight: 0,
          display: 'grid',
          gridTemplateColumns: { xs: 'minmax(0, 1fr)', lg: '300px minmax(0, 1fr)' },
          gridTemplateRows: { xs: 'auto minmax(0, 1fr)', lg: 'minmax(0, 1fr)' },
          gap: 1.5,
          overflow: 'hidden',
        }}
      >
        <ApplicationProgressCard
          workflow={workflow}
          currentStage={currentStage}
          canOverride={canOverride}
          onOverride={() => {
            if (canLeaveFeeEditor) detail.setRuntimeAction('override');
          }}
        />

        <Paper
          component="section"
          variant="outlined"
          aria-label="Application details workspace"
          sx={{
            gridColumn: { xs: 1, lg: 2 },
            gridRow: { xs: 2, lg: 1 },
            display: 'flex',
            flexDirection: 'column',
            minWidth: 0,
            minHeight: 0,
            overflow: 'hidden',
          }}
        >
          <CustomTabs
            value={activeTab}
            onChange={(_, value: DetailTab) => requestTabChange(value)}
            aria-label="Application detail sections"
            variant="scrollable"
            scrollButtons="auto"
            guardUnsavedChanges={false}
            slotProps={{ tab: { minHeight: 44 } }}
          >
            <Tab
              id="application-tab-current"
              aria-controls="application-panel-current"
              value="current"
              disabled={workspaceBusy}
              label="Current step"
              icon={<Iconify icon="mdi:clipboard-check-outline" width={20} />}
              iconPosition="start"
            />
            <Tab
              id="application-tab-form"
              aria-controls="application-panel-form"
              value="form"
              disabled={workspaceBusy}
              label="Application form"
              icon={<Iconify icon="mdi:file-document-outline" width={20} />}
              iconPosition="start"
            />
            <Tab
              id="application-tab-history"
              aria-controls="application-panel-history"
              value="history"
              disabled={workspaceBusy}
              label="History"
              icon={<Iconify icon="mdi:history" width={20} />}
              iconPosition="start"
            />
          </CustomTabs>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }} />

          <Scrollbar sx={{ flex: 1, minHeight: 0 }}>
            <Box sx={{ p: { xs: 1.5, sm: 2 }, minWidth: 0 }}>
              {activeTab === 'current' && (
                <Stack
                  id="application-panel-current"
                  role="tabpanel"
                  aria-labelledby="application-tab-current"
                  spacing={2}
                >
                  <ApplicationCounsellorCard application={application} />
                  {currentStage && (
                    <ApplicationCurrentTask
                      stage={currentStage}
                      applicationStatus={application.status}
                      nextRequiredAction={workflow?.nextRequiredAction}
                      active={active}
                      awaitingDecision={awaitingDecision}
                      canComplete={canComplete}
                      canRetryFormHandoff={canRetryFormHandoff}
                      canSkip={canSkip}
                      advancing={detail.advanceState.isLoading}
                      retryingFormHandoff={detail.submitState.isLoading}
                      onAdvance={() => {
                        if (!canLeaveFeeEditor) return;
                        if (requiresStageCompletionDetails(currentStage)) completionDialog.onTrue();
                        else detail.advance();
                      }}
                      onRetryFormHandoff={detail.submitApplication}
                      onSkip={() => {
                        if (canLeaveFeeEditor) detail.setRuntimeAction('skip');
                      }}
                      onReviewForm={() => requestTabChange('form')}
                    />
                  )}
                  <ApplicationManagedStages
                    application={application}
                    workflow={workflow}
                    canAdvance={detail.canAdvance && canLeaveFeeEditor}
                    advancing={detail.advanceState.isLoading}
                    onFeeSelectionStateChange={setFeeEditorState}
                    onComplete={(concurrencyStamp) => {
                      if (!canLeaveFeeEditor) return;
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
                          No managed checklist was configured for “{currentStage.name}” when this
                          workflow version was published. Review the required evidence, then use the
                          available completion action.
                        </Typography>
                      </Alert>
                    )}
                  {!currentStage && workflow?.status !== 1 && (
                    <Alert severity="info">No current admission task is available.</Alert>
                  )}
                  {workflow?.status === 1 && (
                    <Alert severity="success">
                      Admission workflow completed. The decision and full audit history remain
                      available.
                    </Alert>
                  )}
                  {application.inquiryId && <ApplicationFollowUps applicationId={application.id} />}
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
                    This is the form version frozen when the application started. It remains
                    available as the submitted application record and does not represent the current
                    workflow step.
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
            </Box>
          </Scrollbar>

          <Paper
            square
            elevation={0}
            sx={{
              display: { xs: 'flex', md: 'none' },
              justifyContent: 'flex-end',
              flexShrink: 0,
              p: 1,
              borderTop: 1,
              borderColor: 'divider',
            }}
          >
            <Button
              size="small"
              variant="outlined"
              startIcon={<Iconify icon="mdi:file-document-outline" />}
              disabled={workspaceBusy}
              onClick={() => requestTabChange('form')}
            >
              Review application form
            </Button>
          </Paper>
        </Paper>
      </Box>
    );
  };

  return (
    <>
      <CustomDialog
        open
        fullScreen
        hasForm={false}
        disableClose={workspaceBusy}
        data-testid="admission-application-full-screen-dialog"
        title={
          <Box component="span" sx={{ display: 'block', minWidth: 0 }}>
            <Box component="span" sx={{ display: 'block' }}>
              Application details
            </Box>
            {application && (
              <Box
                component="span"
                sx={{
                  mt: 0.25,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  flexWrap: 'wrap',
                  typography: 'body2',
                  fontWeight: 400,
                  color: 'text.secondary',
                }}
              >
                <Box component="span" sx={{ overflowWrap: 'anywhere' }}>
                  {application.applicantName}
                </Box>
                <Box component="span" aria-hidden>
                  ·
                </Box>
                <Box component="span">
                  {formatAdmissionReference(application.applicationNumber)}
                </Box>
                <Label color={getAdmissionApplicationStatusColor(application.status)}>
                  {getAdmissionApplicationStatusLabel(application.status)}
                </Label>
              </Box>
            )}
          </Box>
        }
        transitionDuration={{ enter: 0, exit: 0 }}
        handleClose={closeDetail}
        paperProps={{
          sx: {
            borderRadius: 0,
            backgroundImage: 'none',
            '& button[aria-label="close"]': { width: 44, height: 44 },
          },
        }}
      >
        <DialogScrollContent
          sx={{ p: 0, height: 1, minHeight: 0, overflow: 'hidden', bgcolor: 'background.neutral' }}
          scrollBarProps={{
            fillContent: true,
            sx: {
              flex: '1 1 auto',
              minHeight: 0,
              '& > .simplebar-wrapper > .simplebar-mask > .simplebar-offset > .simplebar-content-wrapper > .simplebar-content':
                { height: 1, minHeight: 0, overflow: 'hidden' },
            },
          }}
        >
          <Box
            sx={{
              height: 1,
              minHeight: 0,
              display: 'flex',
              flexDirection: 'column',
              p: { xs: 1, sm: 2 },
            }}
          >
            {isLoading && (
              <Stack
                spacing={1.5}
                aria-label="Loading application details"
                role="status"
                sx={{ flex: 1, minHeight: 0 }}
              >
                <Skeleton height={32} width="55%" />
                <Box
                  sx={{
                    flex: 1,
                    minHeight: 0,
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', lg: '300px minmax(0, 1fr)' },
                    gap: 1.5,
                  }}
                >
                  <Skeleton variant="rounded" height="100%" />
                  <Skeleton variant="rounded" height="100%" />
                </Box>
              </Stack>
            )}
            {applicationNotFound && (
              <Alert
                severity="warning"
                action={
                  <Button color="inherit" size="small" onClick={closeDetail}>
                    {returnUrl === studentPaths.enrollment.applications
                      ? 'Back to applications'
                      : returnUrl.startsWith(studentPaths.enrollment.assessments)
                        ? 'Back to assessments'
                        : 'Back to Pipeline'}
                  </Button>
                }
              >
                This application is no longer available. It may have been removed, or the link may
                be outdated.
              </Alert>
            )}
            {isError && !applicationNotFound && (
              <AdmissionQueryError
                onRetry={() => {
                  applicationQuery.refetch();
                  formQuery.refetch();
                  workflowQuery.refetch();
                }}
              />
            )}
            {!isLoading && !isError && !applicationNotFound && renderLoadedContent()}
          </Box>
        </DialogScrollContent>
      </CustomDialog>

      <ConfirmDialog
        open={Boolean(requestedTab)}
        onClose={() => {
          if (!workspaceBusy) setRequestedTab(undefined);
        }}
        title="Discard unsaved fee selection?"
        icon="warning"
        content="Changing sections will discard the unsaved fee selection. Your saved application information remains available."
        disableCancel={workspaceBusy}
        disableEscapeKeyDown={workspaceBusy}
        disableBackdropClick={workspaceBusy}
        action={
          <Button
            size="small"
            variant="contained"
            color="error"
            disabled={workspaceBusy}
            onClick={() => {
              if (requestedTab) setActiveTab(requestedTab);
              setRequestedTab(undefined);
            }}
          >
            Discard changes
          </Button>
        }
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
    </>
  );
}
