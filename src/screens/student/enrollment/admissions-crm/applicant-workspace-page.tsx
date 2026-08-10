'use client';

import type { MouseEvent } from 'react';
import type { RootState } from 'src/redux/store';

import dayjs from 'dayjs';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { Iconify } from 'src/components/iconify';
import { hasGrantedPermission } from 'src/utils/permissions';
import { useMemo, useState, useEffect, useCallback } from 'react';
import { studentPaths, studentPermissions } from 'src/constants/student-menu';
import {
  Box,
  Stack,
  Alert,
  Paper,
  Button,
  Drawer,
  Divider,
  Skeleton,
  Accordion,
  IconButton,
  Typography,
  AccordionDetails,
  AccordionSummary,
} from '@mui/material';
import {
  AdmissionInquiryStage,
  AdmissionCrmClosedOutcome,
  AdmissionCrmPipelineColumnKey,
} from 'src/redux/student/admissions-crm/core-leads-contracts';

import {
  useGetAdmissionCrmLeadQuery,
  useGetAdmissionCrmApplicantProgressQuery,
} from 'src/redux/student/admissions-crm/core-leads-api';

import { AdmissionCrmGeneratedDocumentType } from 'src/redux/student/admissions-crm/final-admission-contracts';

import { useGetAdmissionCrmPipelineStagesQuery } from 'src/redux/student/admissions-crm/setup-playbooks-api';

import { useGetCurrentAdmissionCrmRegistrationByLeadQuery } from 'src/redux/student/admissions-crm/registration-documents-api';

import { ApplicantWorkContext } from './applicant-work-context';
import { ApplicantContextRail } from './applicant-context-rail';
import { ApplicantInquiryHeader } from './applicant-inquiry-header';
import { useEnrollmentWorkspace } from './enrollment-workspace-context';
import { ApplicantJourneyNavigator } from './applicant-journey-navigator';
import { ApplicantWorkspaceOverview } from './applicant-workspace-overview';
import { admissionCrmActionPermissions } from './admission-action-permissions';
import { ApplicantExamSchedulingDialog } from './applicant-exam-scheduling-dialog';
import { buildApplicantJourney, getApplicantNextJourneyStep } from './applicant-journey-model';
import { formatEnumLabel } from './enrollment-display';
import {
  ApplicantWorkspaceDirtyProvider,
  useApplicantWorkspaceTransition,
} from './applicant-workspace-dirty-context';
import {
  getJourneyTab,
  canOpenJourneyStep,
  getJourneyStateLabel,
  type ApplicantCommandTab,
  getApplicantPrimaryAction,
  resolveApplicantCommandTab,
  isApplicantJourneyActionable,
  isApplicantPrimaryActionPermitted,
} from './applicant-command-workspace-model';

import type { ApplicantWorkContextItem } from './enrollment-workspace-context';

const ApplicantRegistrationOperations = dynamic(() =>
  import('./applicant-registration-operations').then(
    (module) => module.ApplicantRegistrationOperations
  )
);
const ApplicantFinalAdmissionOperations = dynamic(() =>
  import('./applicant-final-admission-operations').then(
    (module) => module.ApplicantFinalAdmissionOperations
  )
);
const ApplicantActivationOperations = dynamic(() =>
  import('./applicant-activation-operations').then((module) => module.ApplicantActivationOperations)
);
const ApplicantFinancialReadiness = dynamic(() =>
  import('./applicant-financial-readiness').then((module) => module.ApplicantFinancialReadiness)
);
const ApplicantRouteOperations = dynamic(() =>
  import('./applicant-route-operations').then((module) => module.ApplicantRouteOperations)
);
const ApplicantPolicyReadiness = dynamic(() =>
  import('./applicant-policy-readiness').then((module) => module.ApplicantPolicyReadiness)
);
const ApplicantHouseholdIdentityOperations = dynamic(() =>
  import('./applicant-household-identity-operations').then(
    (module) => module.ApplicantHouseholdIdentityOperations
  )
);
const GeneratedDocumentOperations = dynamic(() =>
  import('./generated-document-operations').then((module) => module.GeneratedDocumentOperations)
);
const ApplicantExamSummary = dynamic(() =>
  import('./applicant-exam-summary').then((module) => module.ApplicantExamSummary)
);
const ApplicantActivityTimeline = dynamic(() =>
  import('./applicant-activity-timeline').then((module) => module.ApplicantActivityTimeline)
);

export type ApplicantWorkspaceTab = ApplicantCommandTab;

type Props = {
  leadId?: string;
  academicYearId?: string;
  initialTab?: ApplicantWorkspaceTab;
  activityOpen?: boolean;
  returnTo?: string;
  returnHref?: string;
  workItem?: ApplicantWorkContextItem;
  onTabChange?: (tab: ApplicantWorkspaceTab) => void;
  onActivityChange?: (open: boolean) => void;
  onAcademicYearResolved?: (academicYearId: string) => void;
  onClose: () => void;
};

const examDocumentTypes = [AdmissionCrmGeneratedDocumentType.HallTicket] as const;
const registrationDocumentTypes = [
  AdmissionCrmGeneratedDocumentType.RegistrationAcknowledgement,
  AdmissionCrmGeneratedDocumentType.CorrectionNotice,
] as const;
const offerDocumentTypes = [AdmissionCrmGeneratedDocumentType.OfferLetter] as const;
const activationDocumentTypes = [
  AdmissionCrmGeneratedDocumentType.AdmissionLetter,
  AdmissionCrmGeneratedDocumentType.CancellationLetter,
] as const;

function ApplicantDocumentDisclosure({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  const contentId = `${title.toLowerCase().replaceAll(' ', '-')}-content`;

  return (
    <Accordion disableGutters variant="outlined" sx={{ '&:before': { display: 'none' } }}>
      <AccordionSummary
        expandIcon={<Iconify icon="eva:chevron-down-fill" />}
        aria-controls={contentId}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="subtitle2">{title}</Typography>
          <Typography variant="caption" color="text.secondary">
            {description}
          </Typography>
        </Box>
      </AccordionSummary>
      <AccordionDetails id={contentId}>{children}</AccordionDetails>
    </Accordion>
  );
}

function ApplicantWorkspaceContentSkeleton() {
  return (
    <Box
      aria-label="Loading inquiry workspace"
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: 'minmax(0, 1fr)', lg: 'minmax(0, 1fr) 320px' },
        gap: 1.5,
      }}
    >
      <Stack spacing={1.5}>
        <Skeleton variant="rounded" height={118} />
        <Skeleton variant="rounded" height={320} />
      </Stack>
      <Stack spacing={1.25}>
        <Skeleton variant="rounded" height={136} />
        <Skeleton variant="rounded" height={190} />
      </Stack>
    </Box>
  );
}

function ApplicantWorkspaceContent({
  leadId,
  academicYearId,
  initialTab = 'inquiry',
  activityOpen = false,
  returnTo,
  returnHref = studentPaths.enrollment.pipeline,
  workItem,
  onTabChange,
  onActivityChange,
  onAcademicYearResolved,
  onClose,
}: Props) {
  const router = useRouter();
  const permissions = useSelector((root: RootState) => root.auth.permissions);
  const canViewOffers = hasGrantedPermission(
    permissions,
    studentPermissions.enrollment.offersSeats
  );
  const canViewActivation = hasGrantedPermission(
    permissions,
    studentPermissions.enrollment.activation
  );
  const canViewRoutes = hasGrantedPermission(
    permissions,
    studentPermissions.enrollment.governance.routes
  );
  const canViewPolicies = hasGrantedPermission(
    permissions,
    studentPermissions.enrollment.governance.policies
  );
  const canViewHouseholds = hasGrantedPermission(
    permissions,
    studentPermissions.enrollment.governance.households
  );
  const canViewGovernance = canViewRoutes || canViewPolicies || canViewHouseholds;
  const { requestTransition } = useApplicantWorkspaceTransition();
  const [requestedTab, setRequestedTab] = useState<ApplicantWorkspaceTab>(initialTab);
  const [scheduleExamOpen, setScheduleExamOpen] = useState(false);
  const [focusedActionCode, setFocusedActionCode] = useState<string>();
  const leadQuery = useGetAdmissionCrmLeadQuery({ leadId: leadId || '' }, { skip: !leadId });
  const lead = leadQuery.data;
  const currentWorkItem = workItem?.leadId === leadId ? workItem : undefined;
  const applicantAcademicYearId = lead?.academicYearId || academicYearId;
  const stagesQuery = useGetAdmissionCrmPipelineStagesQuery(
    { academicYearId: applicantAcademicYearId || '' },
    { skip: !applicantAcademicYearId || !leadId }
  );
  const progressQuery = useGetAdmissionCrmApplicantProgressQuery(
    { leadId: leadId || '' },
    { skip: !leadId || !lead }
  );
  const registrationQuery = useGetCurrentAdmissionCrmRegistrationByLeadQuery(
    { leadId: leadId || '' },
    {
      skip: !leadId || !lead || (!lead.registrationFormIssuedAt && !lead.registrationFormNumber),
    }
  );
  const currentStage = useMemo(
    () => stagesQuery.data?.find((item) => item.systemStage === lead?.stage),
    [lead?.stage, stagesQuery.data]
  );
  const slaDueAt =
    lead && currentStage?.slaTargetHours
      ? dayjs(lead.lastActivityTime).add(currentStage.slaTargetHours, 'hour')
      : null;
  const journeySteps = useMemo(
    () =>
      buildApplicantJourney(progressQuery.data, {
        canViewPlacement: canViewOffers,
        canViewActivation,
      }),
    [canViewActivation, canViewOffers, progressQuery.data]
  );
  const currentJourneyStep = useMemo(
    () =>
      journeySteps.find((step) => step.stepKey === progressQuery.data?.currentStep) ||
      getApplicantNextJourneyStep(journeySteps),
    [journeySteps, progressQuery.data?.currentStep]
  );
  const selectedTab = resolveApplicantCommandTab(requestedTab, currentJourneyStep);
  const selectedJourneyStep = journeySteps.find((step) => getJourneyTab(step) === selectedTab);
  const projectedPrimaryAction = getApplicantPrimaryAction(progressQuery.data?.nextActionCode);
  const lifecycleAllowsAction =
    progressQuery.data?.closedOutcome == null && isApplicantJourneyActionable(currentJourneyStep);
  const actionPermissionBlocked =
    lifecycleAllowsAction &&
    Boolean(projectedPrimaryAction) &&
    !isApplicantPrimaryActionPermitted(projectedPrimaryAction, permissions);
  const primaryAction =
    lifecycleAllowsAction && isApplicantPrimaryActionPermitted(projectedPrimaryAction, permissions)
      ? projectedPrimaryAction
      : undefined;
  const hasRegistration = Boolean(
    registrationQuery.data || lead?.registrationFormIssuedAt || lead?.registrationFormNumber
  );
  const isJourneyLoading = progressQuery.isLoading || registrationQuery.isFetching;
  const isViewingCurrent = selectedJourneyStep?.id === currentJourneyStep?.id;

  useEffect(() => setRequestedTab(initialTab), [initialTab, leadId]);
  useEffect(() => {
    if (lead?.academicYearId && lead.academicYearId !== academicYearId) {
      onAcademicYearResolved?.(lead.academicYearId);
    }
  }, [academicYearId, lead?.academicYearId, onAcademicYearResolved]);
  useEffect(() => {
    if (
      requestedTab === 'next' ||
      requestedTab === 'governance' ||
      isJourneyLoading ||
      !selectedJourneyStep ||
      canOpenJourneyStep(selectedJourneyStep)
    ) {
      return;
    }
    setRequestedTab('next');
    onTabChange?.('next');
  }, [isJourneyLoading, onTabChange, requestedTab, selectedJourneyStep]);
  useEffect(() => {
    if (!focusedActionCode) return undefined;
    const frame = window.requestAnimationFrame(() => {
      const region = document.getElementById('applicant-stage-operation');
      region?.focus({ preventScroll: true });
      region?.scrollIntoView({
        block: 'start',
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [focusedActionCode, selectedTab]);

  const changeTab = (nextTab: ApplicantWorkspaceTab, preserveActionFocus = false) => {
    if (nextTab === requestedTab || (nextTab === selectedTab && requestedTab !== 'next')) return;
    requestTransition(() => {
      if (!preserveActionFocus) setFocusedActionCode(undefined);
      setRequestedTab(nextTab);
      onTabChange?.(nextTab);
    });
  };

  const handleClose = () => requestTransition(onClose);
  const handleBackToPipeline = (event: MouseEvent<HTMLAnchorElement>) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }
    event.preventDefault();
    handleClose();
  };
  const navigateThroughGuard = (href: string) => (event: MouseEvent<HTMLAnchorElement>) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }
    event.preventDefault();
    requestTransition(() => router.push(href));
  };
  const examHandoffHref = (() => {
    if (!leadId || !applicantAcademicYearId || !primaryAction?.examAction) return undefined;
    const params = new URLSearchParams({
      cycle: applicantAcademicYearId,
      applicant: leadId,
      examAction: primaryAction.examAction,
    });
    if (returnTo) params.set('applicantReturn', returnTo);
    return `${studentPaths.enrollment.entranceExams}?${params.toString()}`;
  })();

  const handlePrimaryAction = () => {
    if (!primaryAction) return;
    if (primaryAction.kind === 'schedule-exam') {
      setScheduleExamOpen(true);
      return;
    }
    if (primaryAction.kind === 'open-stage') {
      setFocusedActionCode(progressQuery.data?.nextActionCode || undefined);
      changeTab(primaryAction.tab, true);
    }
  };

  const primaryActionControl = (() => {
    if (!primaryAction) return undefined;
    if (primaryAction.kind === 'open-exams') {
      return examHandoffHref ? (
        <Button
          component={Link}
          href={examHandoffHref}
          size="small"
          variant="contained"
          onClick={navigateThroughGuard(examHandoffHref)}
          endIcon={<Iconify icon="eva:arrow-forward-fill" />}
        >
          {primaryAction.label}
        </Button>
      ) : undefined;
    }
    return (
      <Button
        size="small"
        variant="contained"
        onClick={handlePrimaryAction}
        endIcon={<Iconify icon="eva:arrow-forward-fill" />}
      >
        {primaryAction.label}
      </Button>
    );
  })();

  const currentStatusLabel = currentJourneyStep
    ? getJourneyStateLabel(currentJourneyStep)
    : 'Loading progress';
  const closedOutcome = progressQuery.data?.closedOutcome;
  const isClosed = closedOutcome != null;
  const lifecycleStatusLabel = lead
    ? formatEnumLabel(AdmissionInquiryStage[lead.stage])
    : undefined;
  const closedOutcomeLabel =
    closedOutcome != null ? formatEnumLabel(AdmissionCrmClosedOutcome[closedOutcome]) : undefined;
  const pipelineColumnLabel = progressQuery.data
    ? formatEnumLabel(AdmissionCrmPipelineColumnKey[progressQuery.data.pipelineColumn])
    : undefined;

  return (
    <Stack
      component="article"
      aria-label="Applicant workspace"
      sx={{ height: '100%', minHeight: 0, overflow: 'hidden' }}
    >
      <Box
        component="section"
        aria-label="Applicant command workspace"
        sx={{ flex: 1, minHeight: 0, overflowY: 'auto', overflowX: 'hidden' }}
      >
        <Stack
          spacing={1.5}
          sx={{
            width: '100%',
            maxWidth: 'xl',
            mx: 'auto',
            px: { xs: 1.5, sm: 2 },
            pb: 2,
          }}
        >
          <ApplicantInquiryHeader
            lead={lead}
            returnHref={returnHref}
            lifecycleStatusLabel={
              isClosed
                ? `Closed · ${closedOutcomeLabel || 'Outcome recorded'}`
                : lifecycleStatusLabel
            }
            pipelineColumnLabel={pipelineColumnLabel}
            journeyStatusLabel={`${currentJourneyStep?.label || 'Inquiry review'} · ${currentStatusLabel}`}
            nextAction={progressQuery.data?.nextAction || currentJourneyStep?.reason}
            primaryAction={primaryActionControl}
            slaDueAt={slaDueAt}
            isClosed={isClosed}
            onBack={handleBackToPipeline}
          />

          {currentWorkItem ? <ApplicantWorkContext workItem={currentWorkItem} /> : null}

          {lead && journeySteps.length ? (
            <ApplicantJourneyNavigator
              steps={journeySteps}
              currentStep={currentJourneyStep}
              selectedTab={selectedTab}
              onSelect={changeTab}
            />
          ) : null}

          {progressQuery.isError ? (
            <Alert
              severity="error"
              action={
                <Button color="inherit" size="small" onClick={() => progressQuery.refetch()}>
                  Retry
                </Button>
              }
            >
              Applicant progress could not be loaded. Retry before starting the next admission
              action.
            </Alert>
          ) : null}

          {actionPermissionBlocked && projectedPrimaryAction ? (
            <Alert severity="warning">
              You do not have permission to {projectedPrimaryAction.label.toLowerCase()}. Ask an
              authorized enrollment user to complete this action.
            </Alert>
          ) : null}

          {leadQuery.isError ? (
            <Alert
              severity="error"
              action={
                <Button color="inherit" size="small" onClick={() => leadQuery.refetch()}>
                  Retry
                </Button>
              }
            >
              Applicant details could not be loaded. Retry to continue working on this record.
            </Alert>
          ) : null}

          {!lead && !leadQuery.isError ? <ApplicantWorkspaceContentSkeleton /> : null}

          {lead ? (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: 'minmax(0, 1fr)', lg: 'minmax(0, 1fr) 320px' },
                gap: 1.5,
                minWidth: 0,
                alignItems: 'start',
              }}
            >
              <Stack id="applicant-stage-panel" spacing={1.5} sx={{ minWidth: 0 }}>
                {!isViewingCurrent && selectedJourneyStep ? (
                  <Alert
                    severity="info"
                    action={
                      <Button color="inherit" size="small" onClick={() => changeTab('next')}>
                        Return to Current Work
                      </Button>
                    }
                  >
                    Reviewing {selectedJourneyStep.label} history. Current work remains{' '}
                    {currentJourneyStep?.label || 'the next admission step'}.
                  </Alert>
                ) : null}

                <Box
                  id="applicant-stage-operation"
                  tabIndex={-1}
                  sx={{
                    scrollMarginTop: 16,
                    '&:focus-visible': {
                      outline: '2px solid',
                      outlineColor: 'primary.main',
                      outlineOffset: 4,
                    },
                  }}
                >
                  {selectedTab === 'inquiry' ? (
                    <ApplicantWorkspaceOverview
                      lead={lead}
                      academicYearId={applicantAcademicYearId}
                      stages={stagesQuery.data || []}
                      slaDueAt={slaDueAt}
                      refetchLead={() => leadQuery.refetch()}
                    />
                  ) : null}

                  {leadId && applicantAcademicYearId && selectedTab === 'exam' ? (
                    <Stack spacing={1.5}>
                      <ApplicantExamSummary
                        leadId={leadId}
                        academicYearId={applicantAcademicYearId}
                      />
                      <ApplicantDocumentDisclosure
                        title="Exam Documents"
                        description="Generate a hall ticket only when the school uses one."
                      >
                        <GeneratedDocumentOperations
                          leadId={leadId}
                          allowedDocumentTypes={examDocumentTypes}
                          title="Exam Documents"
                          description="Generate a hall ticket only when the school uses one for entrance exams."
                        />
                      </ApplicantDocumentDisclosure>
                    </Stack>
                  ) : null}

                  {leadId && applicantAcademicYearId && selectedTab === 'registration' ? (
                    <Stack spacing={1.5}>
                      <ApplicantRegistrationOperations
                        leadId={leadId}
                        academicYearId={applicantAcademicYearId}
                        hasRegistration={hasRegistration}
                        requestedActionCode={focusedActionCode}
                      />
                      <ApplicantDocumentDisclosure
                        title="Registration Documents"
                        description="Acknowledgements and correction notices are available when applicable."
                      >
                        <GeneratedDocumentOperations
                          leadId={leadId}
                          allowedDocumentTypes={registrationDocumentTypes}
                          title="Registration Documents"
                          description="Generate registration acknowledgements and correction notices."
                        />
                      </ApplicantDocumentDisclosure>
                    </Stack>
                  ) : null}

                  {leadId && applicantAcademicYearId && selectedTab === 'finance' ? (
                    <ApplicantFinancialReadiness
                      leadId={leadId}
                      academicYearId={applicantAcademicYearId}
                    />
                  ) : null}

                  {leadId && applicantAcademicYearId && selectedTab === 'offer' ? (
                    <Stack spacing={1.5}>
                      <ApplicantFinalAdmissionOperations
                        leadId={leadId}
                        academicYearId={applicantAcademicYearId}
                      />
                      <ApplicantDocumentDisclosure
                        title="Placement References"
                        description="Review Finance status and placement documents when needed."
                      >
                        <Stack spacing={1.5}>
                          <ApplicantFinancialReadiness
                            leadId={leadId}
                            academicYearId={applicantAcademicYearId}
                          />
                          <GeneratedDocumentOperations
                            leadId={leadId}
                            allowedDocumentTypes={offerDocumentTypes}
                            title="Placement Documents"
                            description="Preview the placement confirmation prepared for this applicant."
                          />
                        </Stack>
                      </ApplicantDocumentDisclosure>
                    </Stack>
                  ) : null}

                  {leadId && applicantAcademicYearId && selectedTab === 'activation' ? (
                    <Stack spacing={1.5}>
                      <ApplicantActivationOperations
                        leadId={leadId}
                        academicYearId={applicantAcademicYearId}
                        requestedActionCode={focusedActionCode}
                      />
                      <ApplicantDocumentDisclosure
                        title="Admission Documents"
                        description="Admission and cancellation letters are secondary to activation work."
                      >
                        <GeneratedDocumentOperations
                          leadId={leadId}
                          allowedDocumentTypes={activationDocumentTypes}
                          title="Admission Documents"
                          description="Issue admission or cancellation letters from the activation workflow."
                        />
                      </ApplicantDocumentDisclosure>
                    </Stack>
                  ) : null}

                  {leadId && applicantAcademicYearId && selectedTab === 'governance' ? (
                    <Stack spacing={1.5}>
                      {canViewRoutes ? (
                        <ApplicantRouteOperations
                          leadId={leadId}
                          academicYearId={applicantAcademicYearId}
                          capturedRouteDefinitionId={lead.intendedRouteDefinitionId}
                        />
                      ) : null}
                      {canViewPolicies ? (
                        <ApplicantPolicyReadiness
                          leadId={leadId}
                          academicYearId={applicantAcademicYearId}
                        />
                      ) : null}
                      {canViewHouseholds ? (
                        <ApplicantHouseholdIdentityOperations leadId={leadId} />
                      ) : null}
                      {!canViewGovernance ? (
                        <Alert severity="info">
                          You do not have access to applicant Additional Checks.
                        </Alert>
                      ) : null}
                    </Stack>
                  ) : null}
                </Box>
              </Stack>

              <ApplicantContextRail
                lead={lead}
                academicYearId={applicantAcademicYearId}
                hasRegistration={hasRegistration}
                canViewGovernance={canViewGovernance}
                onOpenInquiry={() => changeTab('inquiry')}
                onOpenActivity={() => requestTransition(() => onActivityChange?.(true))}
                onOpenGovernance={() => changeTab('governance')}
                refetchLead={() => leadQuery.refetch()}
              />
            </Box>
          ) : null}
        </Stack>
      </Box>

      <Drawer
        anchor="right"
        open={activityOpen}
        onClose={() => requestTransition(() => onActivityChange?.(false))}
        aria-labelledby="applicant-activity-title"
        slotProps={{
          paper: {
            sx: {
              width: { xs: '100%', sm: 560 },
              maxWidth: '100%',
              overscrollBehavior: 'contain',
            },
          },
        }}
      >
        <Stack sx={{ height: '100%', minHeight: 0 }}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            gap={1}
            sx={{ px: 2, py: 1.5 }}
          >
            <Box sx={{ minWidth: 0 }}>
              <Typography id="applicant-activity-title" variant="h6">
                Activity & Audit
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Review the applicant’s recorded history without leaving current work.
              </Typography>
            </Box>
            <IconButton
              aria-label="Close activity and audit"
              onClick={() => requestTransition(() => onActivityChange?.(false))}
            >
              <Iconify icon="mingcute:close-line" />
            </IconButton>
          </Stack>
          <Divider />
          <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', p: 2 }}>
            {activityOpen && leadId ? <ApplicantActivityTimeline leadId={leadId} /> : null}
          </Box>
        </Stack>
      </Drawer>

      <ApplicantExamSchedulingDialog
        lead={scheduleExamOpen && primaryAction?.kind === 'schedule-exam' ? lead || null : null}
        academicYearId={applicantAcademicYearId}
        canOverrideCapacity={hasGrantedPermission(
          permissions,
          admissionCrmActionPermissions.overrideExamCapacity
        )}
        onClose={() => setScheduleExamOpen(false)}
        onScheduled={async () => {
          await Promise.all([leadQuery.refetch(), progressQuery.refetch()]);
        }}
      />
    </Stack>
  );
}

export function ApplicantWorkspace(props: Props) {
  return (
    <ApplicantWorkspaceDirtyProvider>
      <ApplicantWorkspaceContent {...props} />
    </ApplicantWorkspaceDirtyProvider>
  );
}

export function ApplicantWorkspacePage({ leadId }: { leadId: string }) {
  const {
    academicYearId,
    state,
    updateState,
    closeApplicant,
    applicantWorkItem,
    applicantReturnHref,
  } = useEnrollmentWorkspace();
  const handleTabChange = useCallback(
    (applicantTab: ApplicantWorkspaceTab) => updateState({ applicantTab }),
    [updateState]
  );
  const handleActivityChange = useCallback(
    (applicantActivity: boolean) =>
      updateState({ applicantActivity: applicantActivity || undefined }),
    [updateState]
  );
  const handleAcademicYearResolved = useCallback(
    (cycle: string) => updateState({ cycle }, 'replace'),
    [updateState]
  );

  return (
    <ApplicantWorkspace
      leadId={leadId}
      academicYearId={academicYearId}
      initialTab={state.applicantTab || 'inquiry'}
      activityOpen={Boolean(state.applicantActivity)}
      returnTo={state.returnTo}
      returnHref={applicantReturnHref}
      workItem={applicantWorkItem}
      onTabChange={handleTabChange}
      onActivityChange={handleActivityChange}
      onAcademicYearResolved={handleAcademicYearResolved}
      onClose={closeApplicant}
    />
  );
}
