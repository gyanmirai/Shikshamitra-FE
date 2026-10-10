'use client';

import type { RootState } from 'src/redux/store';

import { useSelector } from 'react-redux';
import { Label } from 'src/components/label';
import { useRouter } from 'src/routes/hooks';
import { Iconify } from 'src/components/iconify';
import { fDateTime } from 'src/utils/format-time';
import { useBoolean } from 'src/hooks/use-boolean';
import { Scrollbar } from 'src/components/scrollbar';
import { useState, useEffect, useCallback } from 'react';
import { studentPaths } from 'src/constants/student-menu';
import { hasGrantedPermission } from 'src/utils/permissions';
import CustomAccordion from 'src/components/custom-accordian';
import { LoadingButton } from 'src/components/loading-button';
import { FormBusyRegion } from 'src/components/form-busy-region';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { useUnsavedNavigation } from 'src/hooks/use-unsaved-navigation';
import { usePopover, CustomPopover } from 'src/components/custom-popover';
import { useParams, usePathname, useSearchParams } from 'next/navigation';
import {
  Box,
  Alert,
  Stack,
  Paper,
  Button,
  Divider,
  MenuItem,
  Skeleton,
  Typography,
} from '@mui/material';

import { AdmissionQueryError } from './admission-query-error';
import { formatAdmissionReference } from './admission-reference';
import { FormHistoryCard } from './application-detail/form-history-card';
import { useApplicationDetail } from './application-detail/use-application-detail';
import { TransitionHistoryCard } from './application-detail/transition-history-card';
import { ApplicationRuntimeForm } from './application-detail/application-runtime-form';
import { ApplicationStageJourney } from './application-detail/application-stage-journey';
import { ApplicationDecisionCard } from './application-detail/application-decision-card';
import { ApplicationManagedStages } from './application-detail/application-managed-stages';
import { ApplicationCounsellorCard } from './application-detail/application-counsellor-card';
import { ApplicationActivityDrawer } from './application-detail/application-activity-drawer';
import { ApplicationFormDocuments } from './document-verification/application-form-documents';
import { ApplicationFinalizedActions } from './application-detail/application-finalized-summary';
import { requiresStageCompletionDetails } from './application-detail/admission-stage-completion';
import { AdmissionWorkflowRuntimeActionDialog } from './admission-workflow-runtime-action-dialog';
import { ApplicationEndJourneyDialog } from './application-detail/application-end-journey-dialog';
import { isAdmissionApplicationNotFound } from './application-detail/application-detail-query-state';
import { AdmissionStageCompletionDialog } from './application-detail/admission-stage-completion-dialog';
import {
  getAdmissionApplicationStatusColor,
  getAdmissionApplicationStatusLabel,
} from './application-status';
import {
  getApplicationReturnUrl,
  getApplicationWorkspaceUrl,
  getApplicationPhaseReturnUrl,
} from './application-detail/application-return-url';
import {
  isFormStage,
  getStageGuidance,
  getStageStatusColor,
  getStageStatusLabel,
  isAdmissionDecisionStage,
  hasManagedStageWorkspace,
  canRetrySubmittedFormHandoff,
  canCompleteStageFromProgress,
} from './application-detail/application-progress-model';

import type { ApplicationStageReadiness } from './application-detail/application-managed-stages';
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
  const pathname = usePathname();
  const requestedReturnUrl = searchParams.get('returnTo');
  const [workspace, setWorkspace] = useState<WorkspaceView>({ view: 'journey' });
  const detail = useApplicationDetail(
    applicationId ?? params.id,
    workspace.view === 'journey' ? workspace.stageId : undefined
  );
  const completionDialog = useBoolean();
  const endJourneyDialog = useBoolean();
  const activityDrawer = useBoolean();
  const actionsPopover = usePopover();
  const journeyExpanded = useBoolean();
  const [finalizationOpen, setFinalizationOpen] = useState(false);
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const canViewApplicantNotes = hasGrantedPermission(
    permissions,
    'Students.Admissions.Applicants.View'
  );
  const [feeEditorState, setFeeEditorState] = useState<AdmissionFeeSelectionEditorState>({
    dirty: false,
    busy: false,
  });
  const [stageReadiness, setStageReadiness] = useState<ApplicationStageReadiness | null>(null);
  const onStageReadinessChange = useCallback((readiness: ApplicationStageReadiness) => {
    setStageReadiness((previous) =>
      previous?.stageId === readiness.stageId &&
      previous.canComplete === readiness.canComplete &&
      previous.busy === readiness.busy &&
      previous.dirty === readiness.dirty &&
      previous.concurrencyStamp === readiness.concurrencyStamp
        ? previous
        : readiness
    );
  }, []);
  const [panelBusy, setPanelBusy] = useState({
    counsellor: false,
    decision: false,
    notes: false,
  });
  const onCounsellorBusyChange = useCallback((busy: boolean) => {
    setPanelBusy((state) => (state.counsellor === busy ? state : { ...state, counsellor: busy }));
  }, []);
  const onDecisionBusyChange = useCallback((busy: boolean) => {
    setPanelBusy((state) => (state.decision === busy ? state : { ...state, decision: busy }));
  }, []);
  const onNotesBusyChange = useCallback((busy: boolean) => {
    setPanelBusy((state) => (state.notes === busy ? state : { ...state, notes: busy }));
  }, []);
  const { applicationQuery, formQuery, workflowQuery } = detail;
  const application = applicationQuery.data;
  // Withdrawn cases belong to Applications history even when no decision stage was entered.
  const decisionWorkspace = application?.hasReachedDecision === true || application?.status === 2;
  const workspaceKnown = application?.hasReachedDecision != null || application?.status === 2;
  const returnUrl = workspaceKnown
    ? getApplicationPhaseReturnUrl(requestedReturnUrl, decisionWorkspace)
    : getApplicationReturnUrl(requestedReturnUrl);
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
  const historical = Boolean(selectedStage && selectedStage.status >= 2);
  const selectedCurrentStage = selectedStage?.id === currentStage?.id;
  const stageDraftDirty = Boolean(
    stageReadiness?.stageId === selectedStage?.id && stageReadiness?.dirty
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
    panelBusy.notes ||
    feeEditorState.busy ||
    detail.updateState.isLoading ||
    detail.submitState.isLoading ||
    detail.advanceState.isLoading ||
    detail.reopenState.isLoading ||
    detail.endJourneyState.isLoading ||
    (stageReadiness?.stageId === selectedStage?.id && Boolean(stageReadiness?.busy));
  const navigationLocked = workspaceBusy || isLoading || finalizationOpen;
  useEffect(() => {
    if (
      applicationId ||
      onClose ||
      !application ||
      !workspaceKnown ||
      navigationLocked ||
      applicationQuery.isFetching ||
      workflowQuery.isFetching ||
      isError ||
      feeEditorState.dirty ||
      stageDraftDirty ||
      detail.hasUnsavedAnswers ||
      (workflow &&
        application.currentStageInstanceId !== undefined &&
        application.currentStageInstanceId !== workflow.currentStageInstanceId)
    )
      return;
    const destination = getApplicationWorkspaceUrl(
      application.id,
      requestedReturnUrl,
      decisionWorkspace
    );
    const currentUrl = `${pathname}${searchParams.size ? `?${searchParams}` : ''}`;
    if (currentUrl !== destination) router.replace(destination, { scroll: false });
  }, [
    applicationId,
    onClose,
    application,
    workspaceKnown,
    decisionWorkspace,
    navigationLocked,
    applicationQuery.isFetching,
    workflowQuery.isFetching,
    isError,
    feeEditorState.dirty,
    stageDraftDirty,
    detail.hasUnsavedAnswers,
    workflow,
    requestedReturnUrl,
    pathname,
    searchParams,
    router,
  ]);
  const canLeaveFeeEditor = !feeEditorState.dirty && !stageDraftDirty && !workspaceBusy;
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
    Boolean(feeEditorState.dirty || stageDraftDirty || detail.hasUnsavedAnswers),
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
    journeyExpanded.onFalse();
    setFeeEditorState({ dirty: false, busy: false });
    setStageReadiness(null);
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
    const readOnly = historicalReview || !detail.canEdit;
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
        submitting={detail.submitState.isLoading}
        onChange={detail.setFieldValue}
        onBlur={detail.setFieldTouched}
        onValidateStep={detail.validateStep}
        onSave={detail.save}
        onSubmit={detail.submitApplication}
        showSaveDraft={detail.formStageQuery.currentData?.policy?.allowSaveAndResume ?? true}
        canSubmitForm={
          selectedCurrentStage &&
          (detail.formStageQuery.currentData?.canSubmit ?? application.status === 0)
        }
        managedFormStage={Boolean(selectedStage?.formStageEnabled)}
        beforeActions={
          workspace.view === 'journey' && isFormStage(selectedStage)
            ? renderManagedStages()
            : undefined
        }
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
  const canRetryFormHandoff = Boolean(
    selectedCurrentStage &&
    canRetrySubmittedFormHandoff(currentStage, application?.status ?? 0) &&
    canLeaveFeeEditor &&
    detail.canAdvance
  );
  const managedCanComplete = Boolean(
    selectedCurrentStage &&
    !historical &&
    detail.canAdvance &&
    canLeaveFeeEditor &&
    stageReadiness?.stageId === selectedStage?.id &&
    stageReadiness?.canComplete
  );
  const continueAdmission = () => {
    if (!canLeaveFeeEditor || detail.hasUnsavedAnswers || !selectedCurrentStage || !currentStage)
      return;
    if (canRetryFormHandoff) detail.submitApplication();
    else if (managedCanComplete)
      detail.advance(
        stageReadiness?.concurrencyStamp
          ? { concurrencyStamp: stageReadiness.concurrencyStamp }
          : undefined
      );
    else if (canComplete) {
      if (requiresStageCompletionDetails(currentStage)) completionDialog.onTrue();
      else detail.advance();
    }
  };
  const renderManagedStages = () =>
    application && (
      <ApplicationManagedStages
        compact
        application={application}
        workflow={workflow}
        selectedStage={selectedStage}
        canAdvance={detail.canAdvance && canLeaveFeeEditor && !historical && selectedCurrentStage}
        advancing={detail.advanceState.isLoading}
        showCompletionAction={false}
        onReadinessChange={onStageReadinessChange}
        onOpenAssessments={(url) => leaveGuard.requestNavigation(() => router.push(url))}
        onFeeSelectionStateChange={setFeeEditorState}
        onComplete={(stamp) => {
          if (canLeaveFeeEditor && !historical && selectedCurrentStage)
            detail.advance(stamp ? { concurrencyStamp: stamp } : undefined);
        }}
      />
    );
  const renderLoadedContent = () => {
    if (!application || !form) return null;
    if (workspace.view === 'history') {
      const hasJourneyClosure =
        application.status === 2 && Boolean(application.decisionReason?.trim());
      const hasHistory = Boolean(
        hasJourneyClosure || workflow?.history.length || detail.formHistoryQuery.data?.length
      );
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
              {hasJourneyClosure && (
                <Alert severity="info">
                  <Stack spacing={0.5}>
                    <Typography variant="subtitle2">Admission journey ended</Typography>
                    <Typography
                      variant="body2"
                      sx={{ overflowWrap: 'anywhere', whiteSpace: 'pre-wrap' }}
                    >
                      {application.decisionReason}
                    </Typography>
                    {application.decisionAt && (
                      <Typography variant="caption" color="text.secondary">
                        {fDateTime(application.decisionAt)}
                      </Typography>
                    )}
                  </Stack>
                </Alert>
              )}
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
        role="region"
        aria-label={selectedStage?.name ?? 'Admission stage'}
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
        {((!historical && isAdmissionDecisionStage(selectedStage)) ||
          (workflow?.status === 1 &&
            (!selectedStage || isAdmissionDecisionStage(selectedStage)))) && (
          <ApplicationDecisionCard
            compact
            hideFinalizedActions
            disabled={workspaceBusy || (!selectedCurrentStage && workflow?.status !== 1)}
            navigationDisabled={navigationLocked}
            onBusyChange={onDecisionBusyChange}
            application={application}
            journeyCompleted={workflow?.status === 1}
            workflow={workflow}
            onSelectStage={(stageId) => requestNavigation({ view: 'journey', stageId })}
            onFinalizationOpenChange={setFinalizationOpen}
          />
        )}
        {!isFormStage(selectedStage) && renderManagedStages()}
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
      </Stack>
    );
  };
  return (
    <>
      <Box
        data-testid="admission-application-workspace"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          height: 1,
          minHeight: 0,
          minWidth: 0,
          gap: 1,
        }}
      >
        <CustomBreadcrumbs
          heading="Applicant 360"
          description="Review or prepare any admission stage. Continue admission advances the current stage when its requirements are complete."
          links={[
            { name: 'Students', href: studentPaths.dashboard },
            { name: 'Admissions', href: studentPaths.enrollment.root },
            {
              name: decisionWorkspace ? 'Applications' : 'Pipeline',
              href: decisionWorkspace
                ? studentPaths.enrollment.applications
                : studentPaths.enrollment.pipeline,
            },
            { name: 'Applicant 360' },
          ]}
          action={
            <Button
              size="small"
              variant="outlined"
              startIcon={<Iconify icon="mdi:arrow-left" />}
              disabled={navigationLocked}
              onClick={closeDetail}
            >
              Back to list
            </Button>
          }
        />
        <Paper
          variant="outlined"
          data-testid="admission-connected-workspace"
          sx={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            minHeight: 0,
            minWidth: 0,
            overflow: 'hidden',
          }}
        >
          <Box
            component="header"
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: 'minmax(0, 1fr) auto',
                sm: 'minmax(0, 1fr) minmax(0, auto)',
              },
              alignItems: 'center',
              gap: 1,
              p: { xs: 1.5, sm: 2 },
              borderBottom: 1,
              borderColor: 'divider',
              flexShrink: 0,
              bgcolor: 'background.paper',
            }}
          >
            <Box sx={{ minWidth: 0 }}>
              <Stack direction="row" spacing={1} alignItems="center" useFlexGap flexWrap="wrap">
                <Typography variant="h6">
                  {application?.applicantName ?? 'Application details'}
                </Typography>
                {application && (
                  <Label color={getAdmissionApplicationStatusColor(application.status)}>
                    {getAdmissionApplicationStatusLabel(application.status)}
                  </Label>
                )}
              </Stack>
              {application && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ overflowWrap: 'anywhere' }}
                >
                  {formatAdmissionReference(application.applicationNumber)}
                </Typography>
              )}
            </Box>
            {!isLoading && !isError && application && (
              <Box
                sx={{
                  minWidth: 0,
                  maxWidth: { sm: 340 },
                  gridColumn: { xs: '1 / -1', sm: 2 },
                  gridRow: { xs: 2, sm: 1 },
                }}
              >
                <ApplicationCounsellorCard
                  compact
                  presentation="header"
                  application={application}
                  disabled={workspaceBusy || finalizationOpen}
                  onBusyChange={onCounsellorBusyChange}
                  renderHeaderAction={({ canEdit, onEdit, busy }) => (
                    <Box sx={{ ml: 'auto', flexShrink: 0 }}>
                      <Button
                        size="small"
                        variant="outlined"
                        disabled={busy}
                        aria-haspopup="menu"
                        aria-expanded={actionsPopover.open}
                        onClick={actionsPopover.onOpen}
                        endIcon={<Iconify icon="mdi:chevron-down" />}
                      >
                        More
                      </Button>
                      <CustomPopover
                        open={actionsPopover.open}
                        anchorEl={actionsPopover.anchorEl}
                        onClose={actionsPopover.onClose}
                        slotProps={{
                          arrow: { hide: true, placement: 'top-right' },
                          paper: {
                            role: 'menu',
                            'aria-label': 'Application actions',
                            sx: { width: 280 },
                          },
                        }}
                      >
                        <>
                          {canEdit && (
                            <MenuItem
                              disabled={navigationLocked || busy}
                              onClick={() => {
                                actionsPopover.onClose();
                                onEdit();
                              }}
                            >
                              <Iconify icon="mdi:account-switch-outline" />
                              {application.assignedCounsellorId
                                ? 'Change counsellor'
                                : 'Assign counsellor'}
                            </MenuItem>
                          )}
                          {((canViewApplicantNotes && application.applicantId) ||
                            (application.inquiryId &&
                              hasGrantedPermission(
                                permissions,
                                'Students.Admissions.Applications.View'
                              ))) && (
                            <MenuItem
                              disabled={navigationLocked}
                              onClick={() => {
                                actionsPopover.onClose();
                                activityDrawer.onTrue();
                              }}
                            >
                              <Iconify icon="mdi:note-text-outline" />
                              Notes &amp; Follow-ups
                            </MenuItem>
                          )}
                          <Divider />
                          <MenuItem
                            disabled={navigationLocked}
                            onClick={() => {
                              actionsPopover.onClose();
                              requestNavigation({ view: 'form' });
                            }}
                          >
                            <Iconify icon="mdi:file-document-outline" />
                            Review Application Form
                          </MenuItem>
                          <MenuItem
                            disabled={navigationLocked}
                            onClick={() => {
                              actionsPopover.onClose();
                              requestNavigation({ view: 'history' });
                            }}
                          >
                            <Iconify icon="mdi:history" />
                            Application History
                          </MenuItem>
                          {(workspace.view !== 'journey' ||
                            historical ||
                            !selectedCurrentStage) && (
                            <MenuItem
                              disabled={navigationLocked}
                              onClick={() => {
                                actionsPopover.onClose();
                                requestNavigation({ view: 'journey' });
                              }}
                            >
                              <Iconify icon="mdi:clipboard-check-outline" />
                              Current Step
                            </MenuItem>
                          )}
                          {active &&
                            canOverride &&
                            Boolean(workflow?.availableTransitions.length) && (
                              <MenuItem
                                onClick={() => {
                                  actionsPopover.onClose();
                                  detail.setRuntimeAction('override');
                                }}
                              >
                                <Iconify icon="mdi:routes" />
                                Override Route
                              </MenuItem>
                            )}
                          {active && canSkip && currentStage?.allowManualSkip && (
                            <MenuItem
                              onClick={() => {
                                actionsPopover.onClose();
                                detail.setRuntimeAction('skip');
                              }}
                            >
                              <Iconify icon="mdi:skip-next-outline" />
                              Skip Current Step
                            </MenuItem>
                          )}
                        </>
                      </CustomPopover>
                    </Box>
                  )}
                />
              </Box>
            )}
          </Box>
          <Scrollbar fillContent sx={{ flex: '1 1 auto', minHeight: 0 }}>
            <Box sx={{ minWidth: 0, flex: 1, display: 'flex', flexDirection: 'column' }}>
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
                <Box
                  sx={{
                    flex: 1,
                    display: 'flex',
                    '& > fieldset, & > fieldset > div': {
                      display: 'flex',
                      flexDirection: 'column',
                      flex: 1,
                      minWidth: 0,
                    },
                  }}
                >
                  <FormBusyRegion busy={workspaceBusy} label="Updating application…">
                    <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: '220px minmax(0, 1fr)' },
                        flex: 1,
                        alignItems: 'stretch',
                        minWidth: 0,
                      }}
                    >
                      <Box
                        component="nav"
                        aria-label="Admission journey"
                        sx={{
                          p: 2,
                          borderRight: { md: 1 },
                          borderBottom: { xs: 1, md: 0 },
                          borderColor: { xs: 'divider', md: 'divider' },
                          minWidth: 0,
                        }}
                      >
                        <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                          <Typography variant="subtitle1" sx={{ mb: 1.5 }}>
                            Admission journey
                          </Typography>
                          <ApplicationStageJourney
                            stages={workflow?.stages ?? []}
                            selectedStageId={
                              workspace.view === 'journey' ? selectedStage?.id : undefined
                            }
                            currentStageId={workflow?.currentStageInstanceId}
                            busy={navigationLocked}
                            onChange={(stageId) =>
                              requestNavigation({
                                view: 'journey',
                                stageId: stageId === currentStage?.id ? undefined : stageId,
                              })
                            }
                          />
                        </Box>
                        <Box sx={{ display: { xs: 'block', md: 'none' } }}>
                          <CustomAccordion
                            title={`Admission journey${selectedStage ? ` · ${selectedStage.name}` : ''}`}
                            expanded={journeyExpanded.value}
                            onChange={journeyExpanded.onToggle}
                            content={
                              <ApplicationStageJourney
                                stages={workflow?.stages ?? []}
                                selectedStageId={
                                  workspace.view === 'journey' ? selectedStage?.id : undefined
                                }
                                currentStageId={workflow?.currentStageInstanceId}
                                busy={navigationLocked}
                                onChange={(stageId) =>
                                  requestNavigation({
                                    view: 'journey',
                                    stageId: stageId === currentStage?.id ? undefined : stageId,
                                  })
                                }
                              />
                            }
                          />
                        </Box>
                      </Box>
                      <Box sx={{ minWidth: 0, p: { xs: 1.5, sm: 2 } }}>{renderLoadedContent()}</Box>
                    </Box>
                  </FormBusyRegion>
                </Box>
              )}
            </Box>
          </Scrollbar>
          {!finalizationOpen && (
            <Stack
              component="footer"
              direction="row"
              spacing={1}
              justifyContent="flex-end"
              alignItems="center"
              useFlexGap
              flexWrap="wrap"
              sx={{
                p: 1.5,
                borderTop: 1,
                borderColor: 'divider',
                bgcolor: 'background.paper',
                flexShrink: 0,
              }}
            >
              {!isLoading &&
                !isError &&
                application &&
                (application.status === 11 ? (
                  <ApplicationFinalizedActions
                    application={application}
                    disabled={navigationLocked}
                    onBack={closeDetail}
                    backLabel={
                      returnUrl.startsWith(studentPaths.enrollment.assessments)
                        ? 'Back to assessments'
                        : 'Back to Applications'
                    }
                  />
                ) : (
                  <>
                    {detail.canEndJourney && (
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        startIcon={<Iconify icon="mdi:stop-circle-outline" />}
                        disabled={
                          workspaceBusy ||
                          feeEditorState.dirty ||
                          stageDraftDirty ||
                          detail.hasUnsavedAnswers
                        }
                        onClick={endJourneyDialog.onTrue}
                      >
                        End Journey
                      </Button>
                    )}
                    <LoadingButton
                      size="small"
                      variant="contained"
                      endIcon={<Iconify icon="mdi:arrow-right" />}
                      loading={detail.advanceState.isLoading || detail.submitState.isLoading}
                      disabled={
                        workspaceBusy ||
                        detail.hasUnsavedAnswers ||
                        !active ||
                        !selectedCurrentStage ||
                        historical ||
                        workspace.view !== 'journey' ||
                        !(canComplete || managedCanComplete || canRetryFormHandoff)
                      }
                      onClick={continueAdmission}
                    >
                      Continue admission
                    </LoadingButton>
                  </>
                ))}
            </Stack>
          )}
        </Paper>
      </Box>
      {endJourneyDialog.value && application && (
        <ApplicationEndJourneyDialog
          open
          applicantName={application.applicantName}
          loading={detail.endJourneyState.isLoading}
          onClose={endJourneyDialog.onFalse}
          onSubmit={detail.endJourney}
        />
      )}
      {leaveGuard.confirmation}
      {application && (
        <ApplicationActivityDrawer
          open={activityDrawer.value}
          application={application}
          onClose={activityDrawer.onFalse}
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
