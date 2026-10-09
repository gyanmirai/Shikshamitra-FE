'use client';

import type { RootState } from 'src/redux/store';

import { useSelector } from 'react-redux';
import { Label } from 'src/components/label';
import { useRouter } from 'src/routes/hooks';
import { useState, useCallback } from 'react';
import { Iconify } from 'src/components/iconify';
import { fDateTime } from 'src/utils/format-time';
import { useBoolean } from 'src/hooks/use-boolean';
import { Scrollbar } from 'src/components/scrollbar';
import CustomTooltip from 'src/components/custom-tooltip';
import { studentPaths } from 'src/constants/student-menu';
import { hasGrantedPermission } from 'src/utils/permissions';
import { useParams, useSearchParams } from 'next/navigation';
import ThreeDotsActions from 'src/components/three-dots-actions';
import { FormBusyRegion } from 'src/components/form-busy-region';
import { useUnsavedNavigation } from 'src/hooks/use-unsaved-navigation';
import {
  Box,
  Alert,
  Stack,
  Button,
  Drawer,
  MenuItem,
  Skeleton,
  IconButton,
  Typography,
} from '@mui/material';

import { AdmissionQueryError } from './admission-query-error';
import { formatAdmissionReference } from './admission-reference';
import { FormHistoryCard } from './application-detail/form-history-card';
import { ApplicationFollowUps } from './application-detail/application-follow-ups';
import { useApplicationDetail } from './application-detail/use-application-detail';
import { ApplicationStageTabs } from './application-detail/application-stage-tabs';
import { TransitionHistoryCard } from './application-detail/transition-history-card';
import { getApplicationReturnUrl } from './application-detail/application-return-url';
import { ApplicationRuntimeForm } from './application-detail/application-runtime-form';
import { ApplicationCurrentTask } from './application-detail/application-current-task';
import { ApplicationDecisionCard } from './application-detail/application-decision-card';
import { ApplicationManagedStages } from './application-detail/application-managed-stages';
import { ApplicationCounsellorCard } from './application-detail/application-counsellor-card';
import { ApplicationFormDocuments } from './document-verification/application-form-documents';
import { requiresStageCompletionDetails } from './application-detail/admission-stage-completion';
import { AdmissionWorkflowRuntimeActionDialog } from './admission-workflow-runtime-action-dialog';
import { isAdmissionApplicationNotFound } from './application-detail/application-detail-query-state';
import { AdmissionStageCompletionDialog } from './application-detail/admission-stage-completion-dialog';
import { ApplicationApplicantNotesDialog } from './application-detail/application-applicant-notes-dialog';
import {
  getAdmissionApplicationStatusColor,
  getAdmissionApplicationStatusLabel,
} from './application-status';
import {
  isFormStage,
  isApprovalStage,
  getStageGuidance,
  getStageStatusColor,
  getStageStatusLabel,
  isAdmissionDecisionStage,
  hasManagedStageWorkspace,
  canRetrySubmittedFormHandoff,
  canCompleteStageFromProgress,
  canStageTypeCompleteForStatus,
} from './application-detail/application-progress-model';

import type { AdmissionFeeSelectionEditorState } from './fee-selection/admission-fee-selection-editor';

type WorkspaceView = { view: 'journey'; stageId?: string } | { view: 'form' | 'history' };
type Navigation = WorkspaceView | { view: 'close' };

export default function AdmissionApplicationDetailScreen({
  applicationId,
  onClose,
}: { applicationId?: string; onClose?: () => void } = {}) {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const returnUrl = getApplicationReturnUrl(searchParams.get('returnTo'));
  const detail = useApplicationDetail(applicationId ?? params.id);
  const completionDialog = useBoolean();
  const expanded = useBoolean();
  const notesDialog = useBoolean();
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const canViewApplicantNotes = hasGrantedPermission(
    permissions,
    'Students.Admissions.Applicants.View'
  );
  const [workspace, setWorkspace] = useState<WorkspaceView>({ view: 'journey' });
  const [feeEditorState, setFeeEditorState] = useState<AdmissionFeeSelectionEditorState>({
    dirty: false,
    busy: false,
  });
  const [panelBusy, setPanelBusy] = useState({
    counsellor: false,
    decision: false,
    followUps: false,
    notes: false,
  });
  const onCounsellorBusyChange = useCallback((busy: boolean) => {
    setPanelBusy((state) => (state.counsellor === busy ? state : { ...state, counsellor: busy }));
  }, []);
  const onDecisionBusyChange = useCallback((busy: boolean) => {
    setPanelBusy((state) => (state.decision === busy ? state : { ...state, decision: busy }));
  }, []);
  const onFollowUpsBusyChange = useCallback((busy: boolean) => {
    setPanelBusy((state) => (state.followUps === busy ? state : { ...state, followUps: busy }));
  }, []);
  const onNotesBusyChange = useCallback((busy: boolean) => {
    setPanelBusy((state) => (state.notes === busy ? state : { ...state, notes: busy }));
  }, []);
  const { applicationQuery, formQuery, workflowQuery } = detail;
  const application = applicationQuery.data;
  const form = formQuery.data;
  const workflow = workflowQuery.data;
  const currentStage = workflow?.stages.find(
    (stage) => stage.id === workflow.currentStageInstanceId
  );
  const selectedStage =
    workspace.view === 'journey'
      ? (workflow?.stages.find((stage) => stage.id === workspace.stageId) ??
        currentStage ??
        [...(workflow?.stages ?? [])].reverse().find((stage) => stage.status >= 2))
      : undefined;
  const historical = Boolean(
    selectedStage && (selectedStage.id !== currentStage?.id || selectedStage.status >= 2)
  );
  const isLoading = applicationQuery.isLoading || formQuery.isLoading || workflowQuery.isLoading;
  const applicationNotFound = isAdmissionApplicationNotFound(applicationQuery.error);
  const isError =
    applicationQuery.isError ||
    formQuery.isError ||
    workflowQuery.isError ||
    (!isLoading && (!application || !form));
  const workspaceBusy =
    panelBusy.counsellor ||
    panelBusy.decision ||
    panelBusy.followUps ||
    panelBusy.notes ||
    feeEditorState.busy ||
    detail.updateState.isLoading ||
    detail.submitState.isLoading ||
    detail.advanceState.isLoading ||
    detail.reopenState.isLoading;
  const navigationLocked = workspaceBusy || isLoading;
  const canLeaveFeeEditor = !feeEditorState.dirty && !workspaceBusy;
  const active = workflow?.status === 0 && Boolean(currentStage);
  const canSkip = Boolean(
    detail.canSkip &&
    canLeaveFeeEditor &&
    currentStage?.stageType !== 4 &&
    !currentStage?.seatStageEnabled
  );
  const canOverride = Boolean(
    detail.canOverride &&
    canLeaveFeeEditor &&
    currentStage?.stageType !== 4 &&
    !currentStage?.seatStageEnabled
  );

  const leaveGuard = useUnsavedNavigation(
    Boolean(feeEditorState.dirty || detail.hasUnsavedAnswers),
    {
      push: router.push,
      blockNavigation: navigationLocked,
      title: feeEditorState.dirty
        ? 'Discard Unsaved Fee Selection?'
        : 'Discard Unsaved Application Changes?',
      description:
        'Your unsaved changes will be discarded. Saved application information remains available.',
    }
  );

  const navigate = (target: Navigation) => {
    setFeeEditorState({ dirty: false, busy: false });
    if (target.view === 'close') {
      if (onClose) onClose();
      else router.push(returnUrl);
    } else setWorkspace(target);
  };
  const requestNavigation = (target: Navigation) => {
    if (navigationLocked) return;
    if (
      target.view === 'journey' &&
      workspace.view === 'journey' &&
      (target.stageId ?? currentStage?.id) === selectedStage?.id
    )
      return;
    leaveGuard.requestNavigation(() => {
      if (detail.hasUnsavedAnswers) detail.discardUnsavedAnswers();
      navigate(target);
    });
  };
  const closeDetail = () => requestNavigation({ view: 'close' });
  const renderRuntimeForm = (historicalReview = false) => {
    if (!application || !form) return null;
    const readOnly = historicalReview || !detail.canAdvance;
    return (
      <ApplicationRuntimeForm
        compact
        readOnly={readOnly}
        application={application}
        form={form}
        values={detail.currentValues}
        errors={readOnly ? [] : detail.errors}
        fieldErrors={readOnly ? {} : detail.fieldErrors}
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
          !readOnly && (
            <ApplicationFormDocuments
              applicationId={application.id}
              stages={workflow?.stages ?? []}
              unsaved={detail.hasUnsavedAnswers}
              saving={detail.updateState.isLoading || detail.submitState.isLoading}
            />
          )
        }
      />
    );
  };
  const canComplete =
    application &&
    canCompleteStageFromProgress(
      currentStage,
      application.status,
      detail.canAdvance && canLeaveFeeEditor
    );
  const formVisible =
    workspace.view === 'form' || (workspace.view === 'journey' && isFormStage(selectedStage));
  const renderLoadedContent = () => {
    if (!application || !form) return null;
    if (workspace.view === 'history') {
      const hasHistory = Boolean(workflow?.history.length || detail.formHistoryQuery.data?.length);
      return (
        <Stack spacing={1.5}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="h6">Application history</Typography>
            <Button size="small" onClick={() => requestNavigation({ view: 'journey' })}>
              Current Step
            </Button>
          </Stack>
          {hasHistory ? (
            <>
              <TransitionHistoryCard workflow={workflow} />
              <FormHistoryCard history={detail.formHistoryQuery.data ?? []} />
            </>
          ) : (
            <Alert severity="info">No application history has been recorded yet.</Alert>
          )}
        </Stack>
      );
    }
    if (workspace.view === 'form')
      return (
        <Stack spacing={1.5}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="h6">Application record</Typography>
            <Button size="small" onClick={() => requestNavigation({ view: 'journey' })}>
              Current Step
            </Button>
          </Stack>
          {renderRuntimeForm(!isFormStage(currentStage))}
        </Stack>
      );
    return (
      <Stack
        id={selectedStage ? `application-stage-panel-${selectedStage.id}` : undefined}
        role="tabpanel"
        aria-labelledby={selectedStage ? `application-stage-tab-${selectedStage.id}` : undefined}
        spacing={1.5}
      >
        {historical && selectedStage && (
          <Stack direction="row" spacing={1} alignItems="center" useFlexGap flexWrap="wrap">
            <Label color={getStageStatusColor(selectedStage.status)}>
              {getStageStatusLabel(selectedStage.status)}
            </Label>
            {selectedStage.completedAt && (
              <Typography variant="caption" color="text.secondary">
                {fDateTime(selectedStage.completedAt)}
              </Typography>
            )}
            {selectedStage.completionReason && (
              <Typography variant="body2" color="text.secondary">
                {selectedStage.completionReason}
              </Typography>
            )}
          </Stack>
        )}
        {isFormStage(selectedStage) && renderRuntimeForm(historical)}
        {((!historical && isAdmissionDecisionStage(currentStage)) ||
          (workflow?.status === 1 &&
            (!selectedStage || isAdmissionDecisionStage(selectedStage)))) && (
          <ApplicationDecisionCard
            compact
            disabled={workspaceBusy}
            onBusyChange={onDecisionBusyChange}
            application={application}
            journeyCompleted={workflow?.status === 1}
          />
        )}
        <ApplicationManagedStages
          compact
          application={application}
          workflow={workflow}
          selectedStage={historical ? selectedStage : undefined}
          canAdvance={detail.canAdvance && canLeaveFeeEditor && !historical}
          advancing={detail.advanceState.isLoading}
          onFeeSelectionStateChange={setFeeEditorState}
          onComplete={(stamp) => {
            if (canLeaveFeeEditor && !historical)
              detail.advance(stamp ? { concurrencyStamp: stamp } : undefined);
          }}
        />
        {selectedStage &&
          !hasManagedStageWorkspace(selectedStage) &&
          !isFormStage(selectedStage) &&
          !isAdmissionDecisionStage(selectedStage) && (
            <Alert severity="info">
              <Typography variant="subtitle2">{selectedStage.name}</Typography>
              <Typography variant="body2">
                {historical
                  ? 'The recorded outcome for this step is available in Application History.'
                  : getStageGuidance(
                      selectedStage,
                      application.status,
                      workflow?.nextRequiredAction
                    )}
              </Typography>
            </Alert>
          )}
        {!currentStage && workflow?.status !== 1 && (
          <Alert severity="info">No current admission task is available.</Alert>
        )}
        {!historical && workflow?.status === 1 && (
          <Alert severity="success">
            Admission workflow completed. The decision and full audit history remain available.
          </Alert>
        )}
        {!historical && application.inquiryId && (
          <ApplicationFollowUps
            compact
            applicationId={application.id}
            disabled={workspaceBusy}
            onBusyChange={onFollowUpsBusyChange}
          />
        )}
      </Stack>
    );
  };
  return (
    <>
      <Drawer
        open
        anchor="right"
        onClose={closeDetail}
        transitionDuration={{ enter: 0, exit: 0 }}
        PaperProps={{
          role: 'dialog',
          'aria-modal': true,
          'aria-labelledby': 'application-drawer-title',
          'data-testid': 'admission-application-drawer',
          sx: {
            width: {
              xs: '100%',
              sm: expanded.value && formVisible ? 'min(1200px, 96vw)' : 'min(840px, 96vw)',
            },
            maxWidth: '100%',
            bgcolor: 'background.paper',
            backgroundImage: 'none',
            display: 'flex',
            flexDirection: 'column',
            overscrollBehavior: 'contain',
          },
        }}
      >
        <Box
          component="header"
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: 'minmax(0, 1fr) auto',
              sm: 'minmax(0, 1fr) minmax(0, auto) auto',
            },
            alignItems: 'center',
            gap: 1,
            p: { xs: 1.5, sm: 2 },
            borderBottom: 1,
            borderColor: 'divider',
            flexShrink: 0,
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Stack direction="row" spacing={1} alignItems="center" useFlexGap flexWrap="wrap">
              <Typography id="application-drawer-title" variant="h6">
                Applicant 360
              </Typography>
              {application && (
                <Label color={getAdmissionApplicationStatusColor(application.status)}>
                  {getAdmissionApplicationStatusLabel(application.status)}
                </Label>
              )}
              <CustomTooltip title="Review the current admission step, application record and history.">
                <IconButton aria-label="About admission application" size="small">
                  <Iconify icon="mdi:information-outline" width={18} />
                </IconButton>
              </CustomTooltip>
            </Stack>
            {application && (
              <Typography variant="body2" color="text.secondary" sx={{ overflowWrap: 'anywhere' }}>
                {application.applicantName} ·{' '}
                {formatAdmissionReference(application.applicationNumber)}
              </Typography>
            )}
          </Box>
          {!isLoading && !isError && application && (
            <Box
              sx={{
                minWidth: 0,
                maxWidth: { sm: 260 },
                gridColumn: { xs: '1 / -1', sm: 2 },
                gridRow: { xs: 2, sm: 1 },
              }}
            >
              <ApplicationCounsellorCard
                compact
                presentation="header"
                application={application}
                disabled={workspaceBusy}
                onBusyChange={onCounsellorBusyChange}
              />
            </Box>
          )}
          <Stack
            direction="row"
            alignItems="center"
            spacing={0.5}
            sx={{ flexShrink: 0, gridColumn: { xs: 2, sm: 3 }, gridRow: 1 }}
          >
            {formVisible && (
              <Button
                size="small"
                variant="outlined"
                disabled={navigationLocked}
                startIcon={
                  <Iconify
                    icon={
                      expanded.value
                        ? 'mdi:arrow-collapse-horizontal'
                        : 'mdi:arrow-expand-horizontal'
                    }
                  />
                }
                onClick={expanded.onToggle}
                sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
              >
                {expanded.value ? 'Restore' : 'Expand'}
              </Button>
            )}
            {!isError && application && (
              <ThreeDotsActions
                moreLabel="Application actions"
                actions={({ popover }) => (
                  <>
                    <MenuItem
                      disabled={navigationLocked}
                      onClick={() => {
                        popover.onClose();
                        requestNavigation({ view: 'form' });
                      }}
                    >
                      <Iconify icon="mdi:file-document-outline" />
                      Review Application Form
                    </MenuItem>
                    <MenuItem
                      disabled={navigationLocked}
                      onClick={() => {
                        popover.onClose();
                        requestNavigation({ view: 'history' });
                      }}
                    >
                      <Iconify icon="mdi:history" />
                      Application History
                    </MenuItem>
                    {canViewApplicantNotes && application.applicantId && (
                      <MenuItem
                        disabled={navigationLocked}
                        onClick={() => {
                          popover.onClose();
                          notesDialog.onTrue();
                        }}
                      >
                        <Iconify icon="mdi:note-text-outline" />
                        Applicant Notes
                      </MenuItem>
                    )}
                    {(workspace.view !== 'journey' || historical) && (
                      <MenuItem
                        disabled={navigationLocked}
                        onClick={() => {
                          popover.onClose();
                          requestNavigation({ view: 'journey' });
                        }}
                      >
                        <Iconify icon="mdi:clipboard-check-outline" />
                        Current Step
                      </MenuItem>
                    )}
                    {active && canOverride && Boolean(workflow?.availableTransitions.length) && (
                      <MenuItem
                        onClick={() => {
                          popover.onClose();
                          detail.setRuntimeAction('override');
                        }}
                      >
                        <Iconify icon="mdi:routes" />
                        Override Route
                      </MenuItem>
                    )}
                  </>
                )}
              />
            )}
            <IconButton
              aria-label="Close application details"
              disabled={navigationLocked}
              onClick={closeDetail}
            >
              <Iconify icon="mdi:close" />
            </IconButton>
          </Stack>
        </Box>
        {!isLoading && !isError && workspace.view === 'journey' && (
          <ApplicationStageTabs
            stages={workflow?.stages ?? []}
            selectedStageId={selectedStage?.id}
            currentStageId={workflow?.currentStageInstanceId}
            busy={workspaceBusy}
            onChange={(stageId) =>
              requestNavigation({
                view: 'journey',
                stageId: stageId === currentStage?.id ? undefined : stageId,
              })
            }
          />
        )}
        <Scrollbar sx={{ flex: '1 1 auto', minHeight: 0 }}>
          <Box sx={{ p: { xs: 1.5, sm: 2 }, minWidth: 0 }}>
            {isLoading && (
              <Stack spacing={1.5} role="status" aria-label="Loading application details">
                <Skeleton height={56} />
                <Skeleton variant="rounded" height={48} />
                <Skeleton variant="rounded" height={200} />
              </Stack>
            )}
            {applicationNotFound && (
              <Alert
                severity="warning"
                action={
                  <Button color="inherit" size="small" onClick={closeDetail}>
                    {returnUrl.startsWith(studentPaths.enrollment.pipeline)
                      ? 'Back to Pipeline'
                      : returnUrl.startsWith(studentPaths.enrollment.assessments)
                        ? 'Back to assessments'
                        : 'Back to applications'}
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
            {!isLoading && !isError && !applicationNotFound && (
              <FormBusyRegion busy={workspaceBusy} label="Updating application…">
                {renderLoadedContent()}
              </FormBusyRegion>
            )}
          </Box>
        </Scrollbar>
        <Stack
          component="footer"
          direction="row"
          spacing={1}
          justifyContent="space-between"
          alignItems="center"
          sx={{ p: { xs: 1.5, sm: 2 }, borderTop: 1, borderColor: 'divider', flexShrink: 0 }}
        >
          <Button size="small" variant="outlined" disabled={navigationLocked} onClick={closeDetail}>
            Close
          </Button>
          {!isLoading &&
            !isError &&
            application &&
            currentStage &&
            workspace.view === 'journey' &&
            !historical && (
              <ApplicationCurrentTask
                compact
                stage={currentStage}
                applicationStatus={application.status}
                formPolicy={detail.formStageQuery.currentData?.policy}
                nextRequiredAction={workflow?.nextRequiredAction}
                active={active}
                awaitingDecision={
                  isApprovalStage(currentStage) &&
                  !canStageTypeCompleteForStatus(currentStage, application.status)
                }
                canComplete={Boolean(canComplete)}
                canRetryFormHandoff={
                  canRetrySubmittedFormHandoff(currentStage, application.status) &&
                  canLeaveFeeEditor &&
                  detail.canAdvance
                }
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
                onReviewForm={() => requestNavigation({ view: 'form' })}
              />
            )}
        </Stack>
      </Drawer>
      {leaveGuard.confirmation}
      {application?.applicantId && (
        <ApplicationApplicantNotesDialog
          open={notesDialog.value}
          applicantId={application.applicantId}
          onClose={notesDialog.onFalse}
          onBusyChange={onNotesBusyChange}
        />
      )}
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
