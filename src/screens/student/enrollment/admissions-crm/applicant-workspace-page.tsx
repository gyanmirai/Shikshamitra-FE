'use client';

import type { MouseEvent } from 'react';
import type { RootState } from 'src/redux/store';

import dayjs from 'dayjs';
import dynamic from 'next/dynamic';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { useTheme } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import useMediaQuery from '@mui/material/useMediaQuery';
import { CustomTabs } from 'src/components/custom-tabs';
import { hasGrantedPermission } from 'src/utils/permissions';
import { useMemo, useState, useEffect, useCallback } from 'react';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { studentPaths, studentPermissions } from 'src/constants/student-menu';
import {
  Box,
  Tab,
  Chip,
  Menu,
  Step,
  Alert,
  Stack,
  Button,
  Divider,
  Tooltip,
  Stepper,
  MenuItem,
  StepButton,
  Typography,
  LinearProgress,
} from '@mui/material';
import {
  useGetAdmissionCrmLeadQuery,
  AdmissionCrmGeneratedDocumentType,
  useGetAdmissionCrmPipelineStagesQuery,
  useGetAdmissionCrmApplicantProgressQuery,
  useGetCurrentAdmissionCrmRegistrationByLeadQuery,
} from 'src/redux/student/admissions-crm/admissions-crm-api';

import { ApplicantWorkContext } from './applicant-work-context';
import { AdmissionCrmStageChip } from './admission-crm-stage-chip';
import { useEnrollmentWorkspace } from './enrollment-workspace-context';
import { ApplicantActivityTimeline } from './applicant-activity-timeline';
import { ApplicantWorkspaceOverview } from './applicant-workspace-overview';
import { getAdmissionCrmLeadName, getAdmissionCrmChannelLabel } from './admissions-crm-utils';
import { buildApplicantJourney, getApplicantNextJourneyStep } from './applicant-journey-model';
import {
  formatEnrollmentDate,
  formatApplicantContact,
  joinEnrollmentMetadata,
} from './enrollment-display';
import {
  ApplicantWorkspaceDirtyProvider,
  useApplicantWorkspaceTransition,
} from './applicant-workspace-dirty-context';

import type { ApplicantJourneyStep } from './applicant-journey-model';
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

export type ApplicantWorkspaceTab =
  | 'overview'
  | 'exam'
  | 'registration'
  | 'finance'
  | 'offer'
  | 'activation'
  | 'governance'
  | 'activity';

type Props = {
  leadId?: string;
  academicYearId?: string;
  initialTab?: ApplicantWorkspaceTab;
  workItem?: ApplicantWorkContextItem;
  onTabChange?: (tab: ApplicantWorkspaceTab) => void;
  onAcademicYearResolved?: (academicYearId: string) => void;
  onClose: () => void;
};

const sections: Array<{ value: ApplicantWorkspaceTab; label: string; icon: string }> = [
  { value: 'overview', label: 'Overview', icon: 'solar:widget-2-bold-duotone' },
  { value: 'exam', label: 'Entrance Exam', icon: 'solar:clipboard-check-bold-duotone' },
  { value: 'registration', label: 'Registration', icon: 'solar:document-add-bold-duotone' },
  { value: 'finance', label: 'Finance', icon: 'solar:wallet-money-bold-duotone' },
  { value: 'offer', label: 'Class Placement', icon: 'solar:buildings-2-bold-duotone' },
  { value: 'activation', label: 'Activation', icon: 'solar:user-check-bold-duotone' },
  { value: 'governance', label: 'Additional Checks', icon: 'solar:shield-check-bold-duotone' },
  { value: 'activity', label: 'Activity', icon: 'solar:history-bold-duotone' },
];

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

const disabledTabCopy: Record<ApplicantWorkspaceTab, string> = {
  overview: '',
  exam: 'Schedule an entrance exam first.',
  registration:
    'Issue registration first, or enable registration before exam for this admission year.',
  finance: 'Verify registration before requesting Finance review.',
  offer: 'Complete registration and Finance review before assigning class placement.',
  activation: 'Complete class placement before activating admission.',
  governance: 'Open governance checks after registration details are available.',
  activity: '',
};

function ApplicantWorkspaceDrawerContent({
  leadId,
  academicYearId,
  initialTab = 'overview',
  workItem,
  onTabChange,
  onAcademicYearResolved,
  onClose,
}: Props) {
  const theme = useTheme();
  const router = useRouter();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
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
  const [tab, setTab] = useState<ApplicantWorkspaceTab>(initialTab);
  const [sectionMenuAnchor, setSectionMenuAnchor] = useState<HTMLElement | null>(null);
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
  const nextJourneyStep = getApplicantNextJourneyStep(journeySteps);
  const journeyByTab = useMemo<ReadonlyMap<ApplicantWorkspaceTab, ApplicantJourneyStep>>(
    () =>
      new Map<ApplicantWorkspaceTab, ApplicantJourneyStep>(
        journeySteps.map((step) => [step.workspaceTab, step])
      ),
    [journeySteps]
  );
  const tabAvailability = useMemo(
    () =>
      sections.reduce<Record<ApplicantWorkspaceTab, { disabled: boolean; reason: string }>>(
        (acc, section) => {
          let disabled = !lead && section.value !== 'overview';
          let reason = disabled ? 'Load an applicant before opening this workspace section.' : '';

          if (lead) {
            if (journeyByTab.has(section.value)) {
              const journeyStep = journeyByTab.get(section.value);
              disabled = journeyStep?.state === 'blocked' || journeyStep?.state === 'skipped';
              reason = disabled ? journeyStep?.reason || disabledTabCopy[section.value] : '';
            } else if (section.value === 'governance') {
              const hasRegistration = Boolean(
                registrationQuery.data ||
                lead.registrationFormIssuedAt ||
                lead.registrationFormNumber
              );
              disabled = !hasRegistration || !canViewGovernance;
              if (!hasRegistration) {
                reason = disabledTabCopy.governance;
              } else if (!canViewGovernance) {
                reason = 'You do not have access to applicant governance details.';
              } else {
                reason = '';
              }
            } else if (section.value === 'activity') {
              disabled = false;
              reason = '';
            }
          }

          acc[section.value] = { disabled, reason };
          return acc;
        },
        {} as Record<ApplicantWorkspaceTab, { disabled: boolean; reason: string }>
      ),
    [canViewGovernance, journeyByTab, lead, registrationQuery.data]
  );
  const visibleSections = useMemo(
    () => sections.filter((section) => !tabAvailability[section.value]?.disabled),
    [tabAvailability]
  );
  const isJourneyLoading =
    progressQuery.isLoading || progressQuery.isFetching || registrationQuery.isFetching;
  const selectedSection =
    visibleSections.find((section) => section.value === tab) || visibleSections[0] || sections[0];
  const selectedDisabledReason = tabAvailability[tab]?.reason;

  useEffect(() => setTab(initialTab), [initialTab, leadId]);
  useEffect(() => {
    if (lead?.academicYearId && lead.academicYearId !== academicYearId) {
      onAcademicYearResolved?.(lead.academicYearId);
    }
  }, [academicYearId, lead?.academicYearId, onAcademicYearResolved]);
  useEffect(() => {
    if (!lead || isJourneyLoading || progressQuery.isError || !tabAvailability[tab]?.disabled)
      return;
    setTab('overview');
    onTabChange?.('overview');
  }, [isJourneyLoading, lead, onTabChange, progressQuery.isError, tab, tabAvailability]);

  const changeTab = (nextTab: ApplicantWorkspaceTab) => {
    if (nextTab === tab) return;
    if (tabAvailability[nextTab]?.disabled) return;
    requestTransition(() => {
      setTab(nextTab);
      onTabChange?.(nextTab);
    });
  };

  const handleClose = () => requestTransition(onClose);
  const cycleQuery = applicantAcademicYearId
    ? `?cycle=${encodeURIComponent(applicantAcademicYearId)}`
    : '';
  const enrollmentMyWorkHref = `${studentPaths.enrollment.myWork}${cycleQuery}`;
  const navigateThroughGuard = (href: string) => (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    requestTransition(() => router.push(href));
  };
  const activeJourneyStep = journeySteps.findIndex(
    (step) =>
      step.state === 'in-progress' || step.state === 'needs-review' || step.state === 'not-started'
  );

  return (
    <Stack
      component="article"
      aria-label="Applicant workspace"
      sx={{ height: '100%', minHeight: 0, overflow: 'hidden' }}
    >
      <CustomBreadcrumbs
        heading={lead ? getAdmissionCrmLeadName(lead) : 'Applicant workspace'}
        description="Move this applicant through inquiry, entrance exam, registration, Finance, class placement, and activation."
        isBack
        onBack={handleClose}
        links={[
          {
            name: 'Student',
            href: studentPaths.dashboard,
            onClick: navigateThroughGuard(studentPaths.dashboard),
          },
          {
            name: 'Student Enrollment',
            href: enrollmentMyWorkHref,
            onClick: navigateThroughGuard(enrollmentMyWorkHref),
          },
          { name: 'Applicant' },
        ]}
        action={
          nextJourneyStep && nextJourneyStep.workspaceTab !== tab ? (
            <Button
              size="small"
              variant="contained"
              onClick={() => changeTab(nextJourneyStep.workspaceTab)}
              endIcon={<Iconify icon="eva:arrow-forward-fill" />}
            >
              Continue {nextJourneyStep.label}
            </Button>
          ) : undefined
        }
        sx={{ px: 2, flexShrink: 0 }}
      />

      <Box
        component="header"
        sx={{
          mx: 2,
          my: 1,
          px: 1.5,
          py: 1.25,
          border: 1,
          borderColor: 'divider',
          borderRadius: 1,
          bgcolor: 'background.paper',
          flexShrink: 0,
        }}
      >
        {lead ? (
          <Stack spacing={1}>
            <Typography variant="body2" color="text.secondary">
              {joinEnrollmentMetadata(
                lead.desiredClassName || 'Class not captured',
                formatApplicantContact(lead.primaryContactNo, lead.email),
                getAdmissionCrmChannelLabel(lead.channel)
              )}
            </Typography>
            <Stack direction="row" gap={0.75} flexWrap="wrap" alignItems="center">
              <AdmissionCrmStageChip stage={lead.stage} />
              <Chip size="small" variant="outlined" label={`Score ${lead.leadScore}`} />
              <Chip
                size="small"
                variant="outlined"
                color={lead.ownerUserId ? 'default' : 'warning'}
                label={lead.ownerUserId ? 'Owner assigned' : 'Owner required'}
              />
              {slaDueAt ? (
                <Chip
                  size="small"
                  variant="outlined"
                  color={slaDueAt.isBefore(dayjs()) ? 'warning' : 'default'}
                  label={`${slaDueAt.isBefore(dayjs()) ? 'SLA overdue' : 'SLA due'} ${formatEnrollmentDate(
                    slaDueAt.toDate(),
                    true
                  )}`}
                />
              ) : null}
            </Stack>
          </Stack>
        ) : (
          <LinearProgress aria-label="Loading applicant summary" />
        )}
      </Box>

      {currentWorkItem ? <ApplicantWorkContext workItem={currentWorkItem} /> : null}

      {lead && journeySteps.length ? (
        <Box sx={{ px: 2, py: 1, flexShrink: 0, overflowX: 'auto' }}>
          <Stepper
            nonLinear
            activeStep={activeJourneyStep === -1 ? journeySteps.length : activeJourneyStep}
            aria-label="Admission journey"
            sx={{ minWidth: { xs: 640, md: 0 } }}
          >
            {journeySteps.map((step) => {
              const isLocked = step.state === 'blocked' || step.state === 'skipped';
              return (
                <Step
                  key={step.id}
                  completed={step.state === 'complete' || step.state === 'skipped'}
                  active={step.state === 'in-progress' || step.state === 'needs-review'}
                >
                  <Tooltip title={step.reason || `${step.label}: ${step.state}`}>
                    <span>
                      <StepButton disabled={isLocked} onClick={() => changeTab(step.workspaceTab)}>
                        {step.label}
                      </StepButton>
                    </span>
                  </Tooltip>
                </Step>
              );
            })}
          </Stepper>
        </Box>
      ) : null}

      <Divider />

      {isMobile ? (
        <Box sx={{ px: 1.5, py: 1, flexShrink: 0 }}>
          <Button
            fullWidth
            variant="outlined"
            aria-haspopup="menu"
            aria-expanded={Boolean(sectionMenuAnchor)}
            startIcon={<Iconify icon={selectedSection.icon} />}
            endIcon={<Iconify icon="eva:chevron-down-fill" />}
            onClick={(event: MouseEvent<HTMLButtonElement>) =>
              setSectionMenuAnchor(event.currentTarget)
            }
            sx={{ justifyContent: 'space-between', minHeight: 44 }}
          >
            {selectedSection.label}
          </Button>
          <Menu
            anchorEl={sectionMenuAnchor}
            open={Boolean(sectionMenuAnchor)}
            onClose={() => setSectionMenuAnchor(null)}
            MenuListProps={{ 'aria-label': 'Applicant workspace sections' }}
            slotProps={{ paper: { sx: { width: 'calc(100vw - 24px)', maxWidth: 420 } } }}
          >
            {visibleSections.map((section) => (
              <MenuItem
                key={section.value}
                selected={section.value === tab}
                onClick={() => {
                  setSectionMenuAnchor(null);
                  changeTab(section.value);
                }}
              >
                <Iconify icon={section.icon} sx={{ mr: 1 }} />
                {section.label}
              </MenuItem>
            ))}
          </Menu>
        </Box>
      ) : (
        <CustomTabs
          value={tab}
          onChange={(_, value: ApplicantWorkspaceTab) => changeTab(value)}
          variant="scrollable"
          scrollButtons="auto"
          aria-label="Applicant workspace sections"
          sx={{ flexShrink: 0 }}
          slotProps={{
            scroller: { px: 1, py: 0.5 },
            tab: { px: 1.25, minHeight: 40 },
          }}
        >
          {visibleSections.map((section) => (
            <Tab
              key={section.value}
              value={section.value}
              icon={<Iconify icon={section.icon} width={18} />}
              iconPosition="start"
              label={section.label}
            />
          ))}
        </CustomTabs>
      )}
      <Divider />

      <Box
        component="section"
        aria-label={`${selectedSection.label} workspace`}
        sx={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          overflowX: 'hidden',
          px: { xs: 1.5, sm: 2 },
          py: 1.5,
          scrollBehavior: 'smooth',
          '@media (prefers-reduced-motion: reduce)': { scrollBehavior: 'auto' },
        }}
      >
        {leadQuery.isFetching && !lead ? <LinearProgress aria-label="Loading applicant" /> : null}
        {leadQuery.isError ? (
          <Alert
            severity="error"
            action={
              <Button color="inherit" size="small" onClick={() => leadQuery.refetch()}>
                Retry
              </Button>
            }
          >
            Applicant details are unavailable. Check your connection and try again.
          </Alert>
        ) : null}
        {progressQuery.isError ? (
          <Alert
            severity="error"
            sx={{ mb: 1.5 }}
            action={
              <Button color="inherit" size="small" onClick={() => progressQuery.refetch()}>
                Retry
              </Button>
            }
          >
            Admission progress is unavailable. Retry before continuing this applicant.
          </Alert>
        ) : null}

        {lead && selectedDisabledReason ? (
          <Alert severity="info" sx={{ mb: 1.5 }}>
            {selectedDisabledReason}
          </Alert>
        ) : null}

        {lead && tab === 'overview' && !selectedDisabledReason ? (
          <ApplicantWorkspaceOverview
            lead={lead}
            academicYearId={applicantAcademicYearId}
            stages={stagesQuery.data || []}
            slaDueAt={slaDueAt}
            refetchLead={() => leadQuery.refetch()}
          />
        ) : null}

        {leadId && applicantAcademicYearId && tab === 'exam' && !selectedDisabledReason ? (
          <Stack spacing={2}>
            <ApplicantExamSummary leadId={leadId} academicYearId={applicantAcademicYearId} />
            <GeneratedDocumentOperations
              leadId={leadId}
              allowedDocumentTypes={examDocumentTypes}
              title="Exam documents"
              description="Generate a hall ticket only when the school uses one for entrance exams."
            />
          </Stack>
        ) : null}
        {leadId && applicantAcademicYearId && tab === 'finance' && !selectedDisabledReason ? (
          <ApplicantFinancialReadiness leadId={leadId} academicYearId={applicantAcademicYearId} />
        ) : null}
        {leadId && applicantAcademicYearId && tab === 'registration' && !selectedDisabledReason ? (
          <Stack spacing={2}>
            <ApplicantRegistrationOperations
              leadId={leadId}
              academicYearId={applicantAcademicYearId}
              hasRegistration={Boolean(
                lead?.registrationFormIssuedAt || lead?.registrationFormNumber
              )}
            />
            <GeneratedDocumentOperations
              leadId={leadId}
              allowedDocumentTypes={registrationDocumentTypes}
              title="Registration documents"
              description="Generate registration acknowledgements and correction notices."
            />
          </Stack>
        ) : null}
        {leadId && applicantAcademicYearId && tab === 'offer' && !selectedDisabledReason ? (
          <Stack spacing={2}>
            <ApplicantFinalAdmissionOperations
              leadId={leadId}
              academicYearId={applicantAcademicYearId}
            />
            <ApplicantFinancialReadiness leadId={leadId} academicYearId={applicantAcademicYearId} />
            <GeneratedDocumentOperations
              leadId={leadId}
              allowedDocumentTypes={offerDocumentTypes}
              title="Placement documents"
              description="Preview the placement confirmation prepared for this applicant."
            />
          </Stack>
        ) : null}
        {leadId && applicantAcademicYearId && tab === 'activation' && !selectedDisabledReason ? (
          <Stack spacing={2}>
            <ApplicantActivationOperations
              leadId={leadId}
              academicYearId={applicantAcademicYearId}
            />
            <GeneratedDocumentOperations
              leadId={leadId}
              allowedDocumentTypes={activationDocumentTypes}
              title="Admission documents"
              description="Issue admission or cancellation letters from the activation workflow."
            />
          </Stack>
        ) : null}
        {leadId && applicantAcademicYearId && tab === 'governance' && !selectedDisabledReason ? (
          <Stack spacing={2}>
            {canViewRoutes ? (
              <ApplicantRouteOperations
                leadId={leadId}
                academicYearId={applicantAcademicYearId}
                capturedRouteDefinitionId={lead?.intendedRouteDefinitionId}
              />
            ) : null}
            {canViewPolicies ? (
              <ApplicantPolicyReadiness leadId={leadId} academicYearId={applicantAcademicYearId} />
            ) : null}
            {canViewHouseholds ? <ApplicantHouseholdIdentityOperations leadId={leadId} /> : null}
          </Stack>
        ) : null}
        {leadId && tab === 'activity' && !selectedDisabledReason ? (
          <ApplicantActivityTimeline leadId={leadId} />
        ) : null}
      </Box>
    </Stack>
  );
}

export function ApplicantWorkspace(props: Props) {
  return (
    <ApplicantWorkspaceDirtyProvider>
      <ApplicantWorkspaceDrawerContent {...props} />
    </ApplicantWorkspaceDirtyProvider>
  );
}

export function ApplicantWorkspacePage({ leadId }: { leadId: string }) {
  const { academicYearId, state, updateState, closeApplicant, applicantWorkItem } =
    useEnrollmentWorkspace();
  const handleTabChange = useCallback(
    (applicantTab: ApplicantWorkspaceTab) => updateState({ applicantTab }),
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
      initialTab={state.applicantTab}
      workItem={applicantWorkItem}
      onTabChange={handleTabChange}
      onAcademicYearResolved={handleAcademicYearResolved}
      onClose={closeApplicant}
    />
  );
}
