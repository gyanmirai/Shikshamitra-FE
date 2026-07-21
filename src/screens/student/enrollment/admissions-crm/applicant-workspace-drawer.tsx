'use client';

import type { MouseEvent } from 'react';
import type { AdmissionCrmMyWorkItemDto } from 'src/redux/student/admissions-crm/admissions-crm-api';

import dayjs from 'dayjs';
import dynamic from 'next/dynamic';
import { useTheme } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import { useMemo, useState, useEffect } from 'react';
import useMediaQuery from '@mui/material/useMediaQuery';
import { CustomTabs } from 'src/components/custom-tabs';
import {
  Box,
  Tab,
  Chip,
  Menu,
  Alert,
  Stack,
  Button,
  Drawer,
  Divider,
  Tooltip,
  MenuItem,
  Typography,
  IconButton,
  LinearProgress,
} from '@mui/material';
import {
  AdmissionInquiryStage,
  AdmissionCrmLeadPriority,
  useGetAdmissionCrmLeadQuery,
  AdmissionCrmWorkspaceSection,
  AdmissionCrmRecommendedAction,
  AdmissionCrmGeneratedDocumentType,
  useGetAdmissionCrmPipelineStagesQuery,
} from 'src/redux/student/admissions-crm/admissions-crm-api';

import { AdmissionCrmStageChip } from './admission-crm-stage-chip';
import { ApplicantWorkspaceOverview } from './applicant-workspace-overview';
import { getAdmissionCrmLeadName, getAdmissionCrmChannelLabel } from './admissions-crm-utils';
import {
  formatEnrollmentDate,
  formatApplicantContact,
  joinEnrollmentMetadata,
} from './enrollment-display';
import {
  ApplicantWorkspaceDirtyProvider,
  useApplicantWorkspaceTransition,
} from './applicant-workspace-dirty-context';

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

export type ApplicantDrawerTab =
  | 'overview'
  | 'exam'
  | 'registration'
  | 'offer'
  | 'activation'
  | 'governance';

type Props = {
  leadId?: string;
  academicYearId?: string;
  initialTab?: ApplicantDrawerTab;
  onTabChange?: (tab: ApplicantDrawerTab) => void;
  onClose: () => void;
  context?: 'full' | 'pipeline' | 'my-work';
  allowRegistrationBeforeExam?: boolean;
  workItem?: AdmissionCrmMyWorkItemDto;
};

const sections: Array<{ value: ApplicantDrawerTab; label: string; icon: string }> = [
  { value: 'overview', label: 'Overview', icon: 'solar:widget-2-bold-duotone' },
  { value: 'exam', label: 'Entrance Exam', icon: 'solar:clipboard-check-bold-duotone' },
  { value: 'registration', label: 'Registration', icon: 'solar:document-add-bold-duotone' },
  { value: 'offer', label: 'Offer & Seat', icon: 'solar:ticket-sale-bold-duotone' },
  { value: 'activation', label: 'Activation', icon: 'solar:user-check-bold-duotone' },
  { value: 'governance', label: 'Governance', icon: 'solar:shield-check-bold-duotone' },
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

const pipelineExamStages = new Set([
  AdmissionInquiryStage.ExamReady,
  AdmissionInquiryStage.ExamScheduled,
  AdmissionInquiryStage.ExamCompleted,
  AdmissionInquiryStage.Eligible,
  AdmissionInquiryStage.Waitlisted,
  AdmissionInquiryStage.Rejected,
]);

const workActionLabels: Record<AdmissionCrmRecommendedAction, string> = {
  [AdmissionCrmRecommendedAction.OpenApplicant]: 'Open applicant',
  [AdmissionCrmRecommendedAction.CompleteTask]: 'Review task',
  [AdmissionCrmRecommendedAction.ScheduleExam]: 'Schedule exam',
  [AdmissionCrmRecommendedAction.RecordAttendance]: 'Record attendance',
  [AdmissionCrmRecommendedAction.RescheduleExam]: 'Reschedule exam',
  [AdmissionCrmRecommendedAction.RecordResult]: 'Record result',
  [AdmissionCrmRecommendedAction.DecideEligibility]: 'Decide eligibility',
  [AdmissionCrmRecommendedAction.ReviewRegistration]: 'Review registration',
  [AdmissionCrmRecommendedAction.ReviewDocuments]: 'Review documents',
  [AdmissionCrmRecommendedAction.ReviewOffer]: 'Review offer',
  [AdmissionCrmRecommendedAction.RepairActivation]: 'Repair activation',
};

const workPriorityLabels: Record<AdmissionCrmLeadPriority, string> = {
  [AdmissionCrmLeadPriority.None]: 'Not set',
  [AdmissionCrmLeadPriority.Hot]: 'Hot',
  [AdmissionCrmLeadPriority.Warm]: 'Warm',
  [AdmissionCrmLeadPriority.Cold]: 'Cold',
  [AdmissionCrmLeadPriority.Low]: 'Low',
};

const workSectionTabs: Record<AdmissionCrmWorkspaceSection, ApplicantDrawerTab> = {
  [AdmissionCrmWorkspaceSection.Overview]: 'overview',
  [AdmissionCrmWorkspaceSection.EntranceExam]: 'exam',
  [AdmissionCrmWorkspaceSection.Registration]: 'registration',
  [AdmissionCrmWorkspaceSection.Offer]: 'offer',
  [AdmissionCrmWorkspaceSection.Activation]: 'activation',
  [AdmissionCrmWorkspaceSection.Governance]: 'governance',
};

const disabledTabCopy: Record<ApplicantDrawerTab, string> = {
  overview: '',
  exam: 'Schedule an entrance exam first.',
  registration: 'Issue registration first, or enable registration before exam for this cycle.',
  offer: 'Complete eligibility and registration review before working on offers.',
  activation: 'Approve an offer before activating admission.',
  governance: 'Open governance checks after registration details are available.',
};

function ApplicantWorkspaceDrawerContent({
  leadId,
  academicYearId,
  initialTab = 'overview',
  onTabChange,
  onClose,
  context = 'full',
  allowRegistrationBeforeExam = false,
  workItem,
}: Props) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { requestTransition } = useApplicantWorkspaceTransition();
  const [tab, setTab] = useState<ApplicantDrawerTab>(initialTab);
  const [sectionMenuAnchor, setSectionMenuAnchor] = useState<HTMLElement | null>(null);
  const leadQuery = useGetAdmissionCrmLeadQuery({ leadId: leadId || '' }, { skip: !leadId });
  const lead = leadQuery.data;
  const stagesQuery = useGetAdmissionCrmPipelineStagesQuery(
    { academicYearId: academicYearId || '' },
    { skip: !academicYearId || !leadId }
  );
  const currentStage = useMemo(
    () => stagesQuery.data?.find((item) => item.systemStage === lead?.stage),
    [lead?.stage, stagesQuery.data]
  );
  const slaDueAt =
    lead && currentStage?.slaTargetHours
      ? dayjs(lead.lastActivityTime).add(currentStage.slaTargetHours, 'hour')
      : null;
  const tabAvailability = useMemo(() => {
    const recommendedTab = workItem ? workSectionTabs[workItem.recommendedSection] : null;
    return sections.reduce<Record<ApplicantDrawerTab, { disabled: boolean; reason: string }>>(
      (acc, section) => {
        let disabled = !lead && section.value !== 'overview';
        let reason = disabled ? 'Load an applicant before opening this workspace section.' : '';

        if (lead) {
          if (
            context === 'my-work' &&
            recommendedTab &&
            section.value !== 'overview' &&
            section.value !== recommendedTab
          ) {
            disabled = true;
            reason = 'This work item recommends a different applicant workspace section.';
          } else if (section.value === 'exam') {
            disabled = !pipelineExamStages.has(lead.stage);
            reason = disabled ? disabledTabCopy.exam : '';
          } else if (section.value === 'registration') {
            disabled = !(
              allowRegistrationBeforeExam ||
              lead.registrationFormIssuedAt ||
              lead.registrationFormNumber ||
              lead.stage === AdmissionInquiryStage.Eligible ||
              lead.stage === AdmissionInquiryStage.Waitlisted
            );
            reason = disabled ? disabledTabCopy.registration : '';
          } else if (section.value === 'offer') {
            disabled = ![
              AdmissionInquiryStage.Eligible,
              AdmissionInquiryStage.Waitlisted,
              AdmissionInquiryStage.Rejected,
            ].includes(lead.stage);
            reason = disabled ? disabledTabCopy.offer : '';
          } else if (section.value === 'activation') {
            disabled = !lead.registrationFormNumber;
            reason = disabled ? disabledTabCopy.activation : '';
          } else if (section.value === 'governance') {
            disabled = !lead.registrationFormNumber;
            reason = disabled ? disabledTabCopy.governance : '';
          }
        }

        acc[section.value] = { disabled, reason };
        return acc;
      },
      {} as Record<ApplicantDrawerTab, { disabled: boolean; reason: string }>
    );
  }, [allowRegistrationBeforeExam, context, lead, workItem]);
  const selectedSection = sections.find((section) => section.value === tab) || sections[0];
  const selectedDisabledReason = tabAvailability[tab]?.reason;

  useEffect(() => setTab(initialTab), [initialTab, leadId]);

  const changeTab = (nextTab: ApplicantDrawerTab) => {
    if (nextTab === tab) return;
    if (tabAvailability[nextTab]?.disabled) return;
    requestTransition(() => {
      setTab(nextTab);
      onTabChange?.(nextTab);
    });
  };

  const handleClose = () => requestTransition(onClose);

  return (
    <Drawer
      anchor="right"
      open={Boolean(leadId)}
      onClose={handleClose}
      transitionDuration={{ exit: 0 }}
      PaperProps={{
        role: 'dialog',
        'aria-modal': true,
        'aria-label': 'Applicant Workspace',
        sx: {
          width: { xs: '100%', sm: 720, lg: 860 },
          maxWidth: '100vw',
          overflow: 'hidden',
          overscrollBehavior: 'contain',
        },
      }}
    >
      <Stack sx={{ height: '100%', minHeight: 0, overflow: 'hidden' }}>
        <Box component="header" sx={{ px: { xs: 1.5, sm: 2 }, py: 1.25, flexShrink: 0 }}>
          <Stack direction="row" alignItems="flex-start" justifyContent="space-between" gap={1}>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="overline" color="text.secondary" sx={{ lineHeight: 1.4 }}>
                Applicant workspace
              </Typography>
              <Typography variant="h6" component="h2" noWrap>
                {lead ? getAdmissionCrmLeadName(lead) : 'Loading applicant...'}
              </Typography>
              {lead ? (
                <Typography variant="caption" color="text.secondary" noWrap component="div">
                  {joinEnrollmentMetadata(
                    lead.desiredClassName || 'Class not captured',
                    formatApplicantContact(lead.primaryContactNo, lead.email),
                    lead.inquirySourceSnapshot || getAdmissionCrmChannelLabel(lead.channel)
                  )}
                </Typography>
              ) : null}
            </Box>
            <IconButton
              aria-label="Close applicant workspace"
              title="Close applicant workspace"
              onClick={handleClose}
              edge="end"
            >
              <Iconify icon="solar:close-circle-linear" />
            </IconButton>
          </Stack>
          {lead ? (
            <Stack direction="row" gap={0.75} flexWrap="wrap" mt={1} alignItems="center">
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
          ) : null}
        </Box>
        <Divider />

        {context === 'my-work' && workItem ? (
          <Box sx={{ px: { xs: 1.5, sm: 2 }, py: 1.25, flexShrink: 0, bgcolor: 'action.hover' }}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              justifyContent="space-between"
              gap={1.25}
            >
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="overline" color="text.secondary">
                  Current work
                </Typography>
                <Typography variant="subtitle2">{workItem.title}</Typography>
                {workItem.details ? (
                  <Typography variant="body2" color="text.secondary">
                    {workItem.details}
                  </Typography>
                ) : null}
                <Typography variant="caption" color="text.secondary">
                  {joinEnrollmentMetadata(
                    workItem.dueAt
                      ? `Due ${formatEnrollmentDate(workItem.dueAt, true)}`
                      : 'No due date',
                    `Priority ${workPriorityLabels[workItem.priority]}`,
                    workItem.assignedDisplayName
                      ? `Assigned to ${workItem.assignedDisplayName}`
                      : undefined
                  )}
                </Typography>
              </Box>
              <Button
                size="small"
                variant="contained"
                onClick={() => changeTab(workSectionTabs[workItem.recommendedSection])}
                sx={{ alignSelf: { sm: 'center' }, flexShrink: 0 }}
              >
                {workActionLabels[workItem.recommendedAction]}
              </Button>
            </Stack>
          </Box>
        ) : null}
        {context === 'my-work' && workItem ? <Divider /> : null}

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
              {sections.map((section) => (
                <MenuItem
                  key={section.value}
                  selected={section.value === tab}
                  disabled={tabAvailability[section.value]?.disabled}
                  title={tabAvailability[section.value]?.reason}
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
            onChange={(_, value: ApplicantDrawerTab) => changeTab(value)}
            variant="scrollable"
            scrollButtons="auto"
            aria-label="Applicant workspace sections"
            sx={{ flexShrink: 0 }}
            slotProps={{
              scroller: { px: 1, py: 0.5 },
              tab: { px: 1.25, minHeight: 40 },
            }}
          >
            {sections.map((section) => {
              const disabled = tabAvailability[section.value]?.disabled;
              const reason = tabAvailability[section.value]?.reason || section.label;
              return (
                <Tab
                  key={section.value}
                  value={section.value}
                  disabled={disabled}
                  title={reason}
                  icon={<Iconify icon={section.icon} width={18} />}
                  iconPosition="start"
                  label={
                    disabled ? (
                      <Tooltip title={reason}>
                        <span>{section.label}</span>
                      </Tooltip>
                    ) : (
                      section.label
                    )
                  }
                />
              );
            })}
          </CustomTabs>
        )}
        <Divider />

        <Box
          component="main"
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

          {lead && selectedDisabledReason ? (
            <Alert severity="info" sx={{ mb: 1.5 }}>
              {selectedDisabledReason}
            </Alert>
          ) : null}

          {lead && tab === 'overview' && !selectedDisabledReason ? (
            <ApplicantWorkspaceOverview
              lead={lead}
              academicYearId={academicYearId}
              stages={stagesQuery.data || []}
              slaDueAt={slaDueAt}
              refetchLead={() => leadQuery.refetch()}
            />
          ) : null}

          {leadId && academicYearId && tab === 'exam' && !selectedDisabledReason ? (
            <Stack spacing={2}>
              <ApplicantExamSummary leadId={leadId} academicYearId={academicYearId} />
              <GeneratedDocumentOperations
                leadId={leadId}
                allowedDocumentTypes={examDocumentTypes}
                title="Exam documents"
                description="Generate a hall ticket only when the school uses one for entrance exams."
              />
            </Stack>
          ) : null}
          {leadId && academicYearId && tab === 'registration' && !selectedDisabledReason ? (
            <Stack spacing={2}>
              <ApplicantRegistrationOperations
                leadId={leadId}
                academicYearId={academicYearId}
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
          {leadId && academicYearId && tab === 'offer' && !selectedDisabledReason ? (
            <Stack spacing={2}>
              <ApplicantFinalAdmissionOperations leadId={leadId} academicYearId={academicYearId} />
              <ApplicantFinancialReadiness leadId={leadId} academicYearId={academicYearId} />
              <GeneratedDocumentOperations
                leadId={leadId}
                allowedDocumentTypes={offerDocumentTypes}
                title="Offer documents"
                description="Preview and issue the applicant's approved seat offer letter."
              />
            </Stack>
          ) : null}
          {leadId && academicYearId && tab === 'activation' && !selectedDisabledReason ? (
            <Stack spacing={2}>
              <ApplicantFinancialReadiness leadId={leadId} academicYearId={academicYearId} />
              <ApplicantActivationOperations leadId={leadId} academicYearId={academicYearId} />
              <GeneratedDocumentOperations
                leadId={leadId}
                allowedDocumentTypes={activationDocumentTypes}
                title="Admission documents"
                description="Issue admission or cancellation letters from the activation workflow."
              />
            </Stack>
          ) : null}
          {leadId && academicYearId && tab === 'governance' && !selectedDisabledReason ? (
            <Stack spacing={2}>
              <ApplicantRouteOperations leadId={leadId} academicYearId={academicYearId} />
              <ApplicantPolicyReadiness leadId={leadId} academicYearId={academicYearId} />
              <ApplicantHouseholdIdentityOperations leadId={leadId} />
            </Stack>
          ) : null}
        </Box>
      </Stack>
    </Drawer>
  );
}

export function ApplicantWorkspaceDrawer(props: Props) {
  return (
    <ApplicantWorkspaceDirtyProvider>
      <ApplicantWorkspaceDrawerContent {...props} />
    </ApplicantWorkspaceDirtyProvider>
  );
}
