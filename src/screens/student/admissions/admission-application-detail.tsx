'use client';

import type { RootState } from 'src/redux/store';

import { useSelector } from 'react-redux';
import { Label } from 'src/components/label';
import { useRouter } from 'src/routes/hooks';
import { Iconify } from 'src/components/iconify';
import { fDateTime } from 'src/utils/format-time';
import { useBoolean } from 'src/hooks/use-boolean';
import { Scrollbar } from 'src/components/scrollbar';
import { hasGrantedPermission } from 'src/utils/permissions';
import { LoadingButton } from 'src/components/loading-button';
import { useId, useState, useEffect, useCallback } from 'react';
import { FormBusyRegion } from 'src/components/form-busy-region';
import { StudentFeedback } from 'src/components/student-feedback';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { useUnsavedNavigation } from 'src/hooks/use-unsaved-navigation';
import { usePopover, CustomPopover } from 'src/components/custom-popover';
import { useParams, usePathname, useSearchParams } from 'next/navigation';
import { studentPaths, studentPermissions } from 'src/constants/student-menu';
import { useGetAdmissionOfferingQuery } from 'src/redux/student/admissions/admission-offerings-api';
import {
  Box,
  Stack,
  Paper,
  Button,
  Drawer,
  Divider,
  MenuList,
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
import { ApplicationJourneyHistory } from './application-detail/application-journey-history';
import { ApplicationActivityDrawer } from './application-detail/application-activity-drawer';
import { ApplicationFormDocuments } from './document-verification/application-form-documents';
import { ApplicationWorkspaceActions } from './application-detail/application-workspace-actions';
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
  presentation = 'page',
}: { applicationId?: string; onClose?: () => void; presentation?: 'page' | 'drawer' } = {}) {
  const isDrawer = presentation === 'drawer';
  const titleId = useId();
  const focusMode = useBoolean();
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const requestedReturnUrl =
    searchParams.get('returnTo') ?? (isDrawer ? studentPaths.enrollment.pipeline : null);
  const [workspace, setWorkspace] = useState<WorkspaceView>({ view: 'journey' });
  const detail = useApplicationDetail(
    applicationId ?? params.id,
    workspace.view === 'journey' ? workspace.stageId : undefined,
    workspace.view
  );
  const completionDialog = useBoolean();
  const endJourneyDialog = useBoolean();
  const activityDrawer = useBoolean();
  const actionsPopover = usePopover();
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
    decision: false,
    notes: false,
  });
  const onDecisionBusyChange = useCallback((busy: boolean) => {
    setPanelBusy((state) => (state.decision === busy ? state : { ...state, decision: busy }));
  }, []);
  const onNotesBusyChange = useCallback((busy: boolean) => {
    setPanelBusy((state) => (state.notes === busy ? state : { ...state, notes: busy }));
  }, []);
  const { applicationQuery, formQuery, workflowQuery } = detail;
  const application = applicationQuery.data;
  const canReadOfferingContext =
    Boolean(application?.admissionOfferingId) &&
    hasGrantedPermission(permissions, studentPermissions.enrollment.settings.offerings);
  // Read the application's own Offering, never infer its academic identity from list filters.
  const offeringContext = useGetAdmissionOfferingQuery(application?.admissionOfferingId ?? '', {
    skip: !canReadOfferingContext,
  });
  const academicOffering = canReadOfferingContext ? offeringContext.currentData : undefined;
  const academicContext = [
    application?.standardName || academicOffering?.standardName,
    academicOffering?.boardName,
    academicOffering?.mediumName,
  ].filter((value): value is string => Boolean(value?.trim()));
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
  const requiresForm =
    workspace.view === 'form' || (workspace.view === 'journey' && isFormStage(selectedStage));
  const isLoading = applicationQuery.isLoading || workflowQuery.isLoading;
  const refreshingDetails = !isLoading && (applicationQuery.isFetching || workflowQuery.isFetching);
  const formLoading = requiresForm && !formQuery.isError && (formQuery.isLoading || !form);
  const applicationNotFound = isAdmissionApplicationNotFound(applicationQuery.error);
  const isError =
    applicationQuery.isError ||
    workflowQuery.isError ||
    (!isLoading && (!application || !workflow));
  const workspaceBusy =
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
      ((applicationId || onClose) && !isDrawer) ||
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
    if (isDrawer && !decisionWorkspace) return;
    const destination = getApplicationWorkspaceUrl(
      application.id,
      requestedReturnUrl,
      decisionWorkspace
    );
    const currentUrl = `${pathname}${searchParams.size ? `?${searchParams}` : ''}`;
    if (currentUrl !== destination) router.replace(destination, { scroll: false });
  }, [
    applicationId,
    isDrawer,
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
    actionsPopover.onClose();
    setFeeEditorState({ dirty: false, busy: false });
    setStageReadiness(null);
    if (target.view === 'close') {
      if (onClose) onClose();
      else router.push(returnUrl);
    } else setWorkspace(target);
  };
  const requestNavigation = (target: Navigation) => {
    if (navigationLocked) return;
    actionsPopover.onClose();
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
        sectionActions={
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
        onDeferFeeCollection={async (reason) => {
          if (!canLeaveFeeEditor || historical || !selectedCurrentStage || !detail.canAdvance)
            return false;
          return detail.advance({ reason, deferFeeCollection: true });
        }}
        onComplete={(stamp) => {
          if (canLeaveFeeEditor && !historical && selectedCurrentStage)
            detail.advance(stamp ? { concurrencyStamp: stamp } : undefined);
        }}
      />
    );
  const renderLoadedContent = () => {
    if (!application) return null;
    if (formLoading)
      return (
        <Stack spacing={1.5} role="status" aria-label="Loading admission form">
          <Skeleton height={40} />
          <Skeleton variant="rounded" height={200} />
          <Skeleton variant="rounded" height={200} />
        </Stack>
      );
    if (requiresForm && formQuery.isError)
      return <AdmissionQueryError onRetry={formQuery.refetch} />;
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
          <ApplicationJourneyHistory applicantId={application.applicantId} />
          {detail.formHistoryQuery.isLoading ? (
            <Skeleton variant="rounded" height={160} aria-label="Loading application history" />
          ) : detail.formHistoryQuery.isError ? (
            <AdmissionQueryError onRetry={detail.formHistoryQuery.refetch} />
          ) : hasHistory ? (
            <>
              {hasJourneyClosure && (
                <StudentFeedback notificationKey="STU-0014" presentation="inline" severity="info">
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
                </StudentFeedback>
              )}
              <TransitionHistoryCard workflow={workflow} />
              <FormHistoryCard history={detail.formHistoryQuery.data ?? []} />
            </>
          ) : (
            <StudentFeedback notificationKey="STU-0015" presentation="inline" severity="info">
              No application history has been recorded yet.
            </StudentFeedback>
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
        sx={
          selectedStage?.stageType === 4 ||
          isFormStage(selectedStage) ||
          selectedStage?.documentVerificationEnabled
            ? { flex: 1, minWidth: 0, minHeight: 0 }
            : undefined
        }
      >
        {selectedStage?.completedAt && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Handled by: {selectedStage.completedByName || 'Staff name not recorded'}
          </Typography>
        )}
        {historical && selectedStage && !isFormStage(selectedStage) && (
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
            <StudentFeedback notificationKey="STU-0016" presentation="persistent" severity="info">
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
            </StudentFeedback>
          )}
        {!currentStage && workflow?.status !== 1 && (
          <StudentFeedback notificationKey="STU-0017" presentation="inline" severity="info">
            No current admission task is available.
          </StudentFeedback>
        )}
        {!historical && workflow?.status === 1 && (
          <StudentFeedback notificationKey="STU-0018" presentation="inline" severity="success">
            Admission workflow completed. The decision and full audit history remain available.
          </StudentFeedback>
        )}
      </Stack>
    );
  };
  const content = (
    <Box
      data-testid="admission-application-workspace"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        height: 1,
        minHeight: 0,
        minWidth: 0,
        gap: isDrawer ? 0 : 1,
      }}
    >
      {!isDrawer && (
        <CustomBreadcrumbs
          heading={decisionWorkspace ? 'Applications' : 'Pipeline'}
          description="Review or prepare any admission stage. Continue admission advances the current stage when its requirements are complete."
          links={[
            { name: 'Students', href: studentPaths.dashboard },
            { name: 'Admissions', href: studentPaths.enrollment.root },
            { name: decisionWorkspace ? 'Applications' : 'Pipeline' },
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
      )}
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
          ...(isDrawer && { border: 0, borderRadius: 0 }),
        }}
      >
        <Box
          component="header"
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: 'minmax(0, 1fr)',
              sm: 'minmax(0, 1fr) minmax(0, auto)',
            },
            alignItems: 'center',
            gap: 1,
            '& > [aria-label="Applicant actions"]': { justifySelf: 'end' },
            p: { xs: 1.5, sm: 2 },
            borderBottom: 1,
            borderColor: 'divider',
            flexShrink: 0,
            bgcolor: 'background.paper',
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Stack direction="row" spacing={1} alignItems="center" useFlexGap flexWrap="wrap">
              <Typography id={titleId} variant="h6">
                {application?.applicantName ?? 'Application details'}
              </Typography>
              {application &&
                (refreshingDetails ? (
                  <Skeleton
                    variant="rounded"
                    width={80}
                    height={24}
                    role="status"
                    aria-label="Refreshing application status"
                  />
                ) : (
                  <Label color={getAdmissionApplicationStatusColor(application.status)}>
                    {getAdmissionApplicationStatusLabel(application.status)}
                  </Label>
                ))}
            </Stack>
            {application && (
              <Stack
                direction="row"
                spacing={1}
                useFlexGap
                flexWrap="wrap"
                alignItems="center"
                aria-label="Application academic context"
                sx={{ color: 'text.secondary', mt: 0.25 }}
              >
                {[formatAdmissionReference(application.applicationNumber), ...academicContext].map(
                  (value, index) => (
                    <Typography
                      key={`${index}-${value}`}
                      variant="body2"
                      component="span"
                      sx={{
                        overflowWrap: 'anywhere',
                        ...(index > 0 && { borderLeft: 1, borderColor: 'divider', pl: 1 }),
                      }}
                    >
                      {value}
                    </Typography>
                  )
                )}
              </Stack>
            )}
          </Box>
          <ApplicationWorkspaceActions
            disabled={navigationLocked || isError || !application}
            closeDisabled={navigationLocked}
            canViewActivity={Boolean(
              !isError &&
              application &&
              ((canViewApplicantNotes && application.applicantId) ||
                (application.inquiryId &&
                  hasGrantedPermission(permissions, 'Students.Admissions.Applications.View')))
            )}
            historySelected={workspace.view === 'history'}
            journeyOpen={actionsPopover.open}
            onActivity={activityDrawer.onTrue}
            onHistory={() => requestNavigation({ view: 'history' })}
            onJourney={actionsPopover.onOpen}
            focused={focusMode.value}
            onFocus={isDrawer ? focusMode.onToggle : undefined}
            onClose={closeDetail}
          />
          <CustomPopover
            open={actionsPopover.open}
            anchorEl={actionsPopover.anchorEl}
            onClose={actionsPopover.onClose}
            slotProps={{
              arrow: { hide: true, placement: 'top-right' },
              paper: {
                role: 'dialog',
                'aria-label': 'Admission journey',
                sx: { width: 320, maxWidth: 'calc(100vw - 32px)' },
              },
            }}
          >
            <Scrollbar sx={{ maxHeight: '65vh' }}>
              <Stack spacing={1} sx={{ p: 1 }}>
                <Typography variant="subtitle1">Admission journey</Typography>
                <ApplicationStageJourney
                  stages={workflow?.stages ?? []}
                  selectedStageId={workspace.view === 'journey' ? selectedStage?.id : undefined}
                  currentStageId={workflow?.currentStageInstanceId}
                  busy={navigationLocked}
                  onChange={(stageId) =>
                    requestNavigation({
                      view: 'journey',
                      stageId: stageId === currentStage?.id ? undefined : stageId,
                    })
                  }
                />
                <Divider />
                <MenuList disablePadding aria-label="Journey actions">
                  <MenuItem
                    disabled={navigationLocked}
                    onClick={() => requestNavigation({ view: 'form' })}
                  >
                    <Iconify icon="mdi:file-document-outline" />
                    Review Application Form
                  </MenuItem>
                  {(workspace.view !== 'journey' || historical || !selectedCurrentStage) && (
                    <MenuItem
                      disabled={navigationLocked}
                      onClick={() => requestNavigation({ view: 'journey' })}
                    >
                      <Iconify icon="mdi:clipboard-check-outline" />
                      Current Step
                    </MenuItem>
                  )}
                  {active && canOverride && Boolean(workflow?.availableTransitions.length) && (
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
                </MenuList>
              </Stack>
            </Scrollbar>
          </CustomPopover>
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
              <StudentFeedback
                notificationKey="STU-0020"
                presentation="persistent"
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
              </StudentFeedback>
            )}
            {isError && !applicationNotFound && (
              <AdmissionQueryError
                onRetry={() => {
                  applicationQuery.refetch();
                  if (requiresForm && !formQuery.isUninitialized) formQuery.refetch();
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
                <FormBusyRegion
                  busy={workspaceBusy}
                  showOverlay={false}
                  label={
                    finalizationOpen && panelBusy.decision
                      ? 'Finalizing admission…'
                      : detail.advanceState.isLoading
                        ? 'Moving to the next admission stage…'
                        : 'Updating admission details…'
                  }
                >
                  <Box
                    sx={{
                      flex: 1,
                      minWidth: 0,
                      p: { xs: 1.5, sm: 2 },
                      ...(isFormStage(selectedStage) && { pb: 0.5 }),
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    {renderLoadedContent()}
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
                    loadingPosition="end"
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
                    {detail.advanceState.isLoading
                      ? 'Moving to next stage…'
                      : detail.submitState.isLoading
                        ? 'Submitting application…'
                        : 'Continue admission'}
                  </LoadingButton>
                </>
              ))}
          </Stack>
        )}
      </Paper>
    </Box>
  );
  return (
    <>
      {isDrawer ? (
        <Drawer
          anchor="right"
          open
          onClose={closeDetail}
          slotProps={{
            paper: {
              role: 'dialog',
              'aria-modal': true,
              'aria-labelledby': titleId,
              sx: {
                width: { xs: '100%', md: focusMode.value ? '100%' : 'min(1600px, 84vw)' },
                maxWidth: '100%',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                borderTopLeftRadius: focusMode.value ? 0 : { xs: 0, md: 2 },
                borderBottomLeftRadius: focusMode.value ? 0 : { xs: 0, md: 2 },
              },
            },
          }}
        >
          {content}
        </Drawer>
      ) : (
        content
      )}
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
