'use client';

import { useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Iconify } from 'src/components/iconify';
import { RouterLink } from 'src/routes/components';
import { fDateTime } from 'src/utils/format-time';
import { studentPaths } from 'src/constants/student-menu';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { isPlainPrimaryNavigationClick } from 'src/components/nav-section/path-utils';
import {
  Box,
  Tab,
  Tabs,
  Step,
  Chip,
  Alert,
  Stack,
  Paper,
  Button,
  Stepper,
  Divider,
  StepLabel,
  Typography,
  LinearProgress,
} from '@mui/material';
import {
  AdmissionCrmMeritRankingMode,
  AdmissionCrmApplicationStageKey,
  type AdmissionCrmCycleSummaryDto,
  useGetAdmissionCrmCycleSummaryQuery,
} from 'src/redux/student/admissions-crm/admissions-crm-api';

import { ApplicationStagePolicyPanel } from '../setting/application-stage-policy-panel';
import {
  readinessColor,
  getSettingsHref,
  readinessLabels,
  formatDateRange,
  cycleStatusColor,
  cycleStatusLabels,
  getAdmissionCycleWorkspaceHref,
} from './admission-cycles-workspace';

type CycleWorkspaceTab = 'overview' | 'setup' | 'journey-rules' | 'activity';
type SetupStepState = 'Not started' | 'Needs attention' | 'Ready' | 'Locked' | 'Skipped';

const tabs: Array<{ value: CycleWorkspaceTab; label: string }> = [
  { value: 'overview', label: 'Overview' },
  { value: 'setup', label: 'Setup' },
  { value: 'journey-rules', label: 'Journey rules' },
  { value: 'activity', label: 'Activity' },
];

const meritModeLabels: Record<AdmissionCrmMeritRankingMode, string> = {
  [AdmissionCrmMeritRankingMode.MarksThenInquiryDate]: 'Marks, then inquiry date',
  [AdmissionCrmMeritRankingMode.MarksThenLeadScore]: 'Marks, then lead score',
  [AdmissionCrmMeritRankingMode.LeadScoreThenMarks]: 'Lead score, then marks',
};

const stateColor = (state: SetupStepState) => {
  if (state === 'Ready') return 'success';
  if (state === 'Needs attention') return 'warning';
  if (state === 'Locked') return 'default';
  return 'info';
};

const stageEnabled = (
  summary: AdmissionCrmCycleSummaryDto,
  keys: AdmissionCrmApplicationStageKey[]
) =>
  summary.applicationStagePolicy.stages.some(
    (stage) => keys.includes(stage.stageKey) && stage.isEnabled
  );

const actionMatches = (path: string, paths: string[]) =>
  paths.some((candidate) => path === candidate || path.startsWith(`${candidate}?`));

const getStepState = (
  summary: AdmissionCrmCycleSummaryDto,
  paths: string[],
  stageKeys: AdmissionCrmApplicationStageKey[],
  skipped = false
): SetupStepState => {
  if (skipped) return 'Skipped';
  if (summary.policy.journeyLocked || summary.cycle.status === 4 || summary.cycle.status === 5) {
    return 'Locked';
  }
  if (summary.cycle.requiredActions.some((action) => actionMatches(action.path, paths))) {
    return 'Needs attention';
  }
  if (stageKeys.length > 0 && !stageEnabled(summary, stageKeys)) return 'Not started';
  return 'Ready';
};

const withPanel = (path: string, academicYearId: string, settingsPanel?: string) => {
  const params = new URLSearchParams({ cycle: academicYearId });
  if (settingsPanel) params.set('settingsPanel', settingsPanel);
  return `${path}?${params.toString()}`;
};

function buildSetupSteps(summary: AdmissionCrmCycleSummaryDto, academicYearId: string) {
  const examSkipped = !summary.policy.entranceExamRequired;

  return [
    {
      label: 'Cycle basics',
      description: 'Academic year, admission window, service targets, and cycle ownership.',
      paths: [studentPaths.enrollment.settingsSections.journey],
      stageKeys: [],
      href: withPanel(studentPaths.enrollment.settingsSections.journey, academicYearId, 'cycle'),
      nextAction: 'Review dates, owner, SLA, and cycle readiness.',
    },
    {
      label: 'Inquiry intake',
      description: 'Forms, sources, acknowledgement, priority, and staff assignment.',
      paths: [
        studentPaths.enrollment.settingsSections.inquiryCapture,
        studentPaths.enrollment.settingsSections.routingScoring,
      ],
      stageKeys: [
        AdmissionCrmApplicationStageKey.Inquiry,
        AdmissionCrmApplicationStageKey.QualificationFollowUp,
      ],
      href: withPanel(
        studentPaths.enrollment.settingsSections.inquiryCapture,
        academicYearId,
        'capture'
      ),
      nextAction: 'Confirm intake forms, priority rules, and assignment ownership.',
    },
    {
      label: 'Assessment',
      description: 'Optional entrance exam, eligibility, slots, and result handling.',
      paths: [studentPaths.enrollment.settingsSections.entranceExams],
      stageKeys: [
        AdmissionCrmApplicationStageKey.ExamScheduling,
        AdmissionCrmApplicationStageKey.ExamResultEligibility,
      ],
      href: withPanel(studentPaths.enrollment.settingsSections.entranceExams, academicYearId),
      nextAction: examSkipped
        ? 'No entrance exam is required for this cycle.'
        : 'Check exam mode, slot ownership, passing rules, and result workflow.',
      skipped: examSkipped,
    },
    {
      label: 'Registration and documents',
      description: 'Digital or staff-entered registration, document checklist, and verification.',
      paths: [studentPaths.enrollment.settingsSections.registrationDocuments],
      stageKeys: [
        AdmissionCrmApplicationStageKey.RegistrationDataEntry,
        AdmissionCrmApplicationStageKey.DocumentsVerification,
      ],
      href: withPanel(
        studentPaths.enrollment.settingsSections.registrationDocuments,
        academicYearId,
        'registration'
      ),
      nextAction: 'Review registration templates, paper-entry handling, and required documents.',
    },
    {
      label: 'Fees and Class Placement Plan',
      description: 'Fee evidence, offers, class placement capacity, and waitlist decisions.',
      paths: [studentPaths.enrollment.settingsSections.offersSeats],
      stageKeys: [
        AdmissionCrmApplicationStageKey.FeeVerification,
        AdmissionCrmApplicationStageKey.ClassPlacement,
        AdmissionCrmApplicationStageKey.AdmissionConfirmation,
      ],
      href: withPanel(studentPaths.enrollment.settingsSections.offersSeats, academicYearId),
      nextAction: 'Confirm fee evidence expectations, offers, and Class Placement Plan wording.',
    },
    {
      label: 'Confirm and activate',
      description: 'Final admission confirmation, GR expectations, welcome, and automation.',
      paths: [
        studentPaths.enrollment.settingsSections.activation,
        studentPaths.enrollment.settingsSections.communications,
        studentPaths.enrollment.settingsSections.automation,
      ],
      stageKeys: [AdmissionCrmApplicationStageKey.Activation],
      href: withPanel(studentPaths.enrollment.settingsSections.activation, academicYearId),
      nextAction: 'Review activation checks, welcome package, and follow-up automation.',
    },
  ].map((step) => ({
    ...step,
    state: getStepState(summary, step.paths, step.stageKeys, step.skipped),
  }));
}

function SummaryStat({ label, value }: { label: string; value: string }) {
  return (
    <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 1 }}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={700} sx={{ mt: 0.5 }}>
        {value}
      </Typography>
    </Paper>
  );
}

function CycleHeader({ summary }: { summary: AdmissionCrmCycleSummaryDto }) {
  return (
    <Paper variant="outlined" sx={{ p: { xs: 2, md: 2.5 }, borderRadius: 2 }}>
      <Stack direction={{ xs: 'column', md: 'row' }} gap={2} justifyContent="space-between">
        <Box>
          <Typography variant="overline" color="text.secondary">
            Selected admission cycle
          </Typography>
          <Typography variant="h5">{summary.cycle.cycleName}</Typography>
          <Typography variant="body2" color="text.secondary">
            {summary.cycle.academicYearName} | Academic year{' '}
            {formatDateRange(
              summary.cycle.academicYearStartDate,
              summary.cycle.academicYearEndDate
            )}
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Chip
            color={cycleStatusColor(summary.cycle.status)}
            label={cycleStatusLabels[summary.cycle.status]}
          />
          <Chip
            color={readinessColor(summary.cycle.readiness)}
            label={readinessLabels[summary.cycle.readiness]}
          />
          <Chip label={`${summary.cycle.applicantCount} applicants`} />
        </Stack>
      </Stack>
    </Paper>
  );
}

function CompactJourneyMap({ summary }: { summary: AdmissionCrmCycleSummaryDto }) {
  const stages = [...summary.applicationStagePolicy.stages].sort(
    (left, right) => left.displayOrder - right.displayOrder
  );

  return (
    <Paper variant="outlined" sx={{ p: { xs: 2, md: 2.5 }, borderRadius: 2 }}>
      <Stack spacing={1.5}>
        <Box>
          <Typography variant="overline" color="text.secondary">
            Configured journey
          </Typography>
          <Typography variant="h6">Progress map</Typography>
        </Box>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          {stages.map((stage) => (
            <Chip
              key={stage.stageKey}
              size="small"
              color={
                stage.isEnabled ? (stage.isOperationallyBacked ? 'info' : 'default') : 'default'
              }
              variant={stage.isEnabled ? 'filled' : 'outlined'}
              label={`${stage.displayOrder}. ${stage.displayName}${
                stage.isEnabled ? '' : ' (disabled)'
              }`}
            />
          ))}
        </Stack>
        <Button
          component={RouterLink}
          href={`${getAdmissionCycleWorkspaceHref(summary.cycle.academicYearId)}&tab=journey-rules`}
          size="small"
          sx={{ alignSelf: 'flex-start' }}
          endIcon={<Iconify icon="mdi:arrow-right" />}
        >
          Open advanced journey rules
        </Button>
      </Stack>
    </Paper>
  );
}

function OverviewTab({ summary }: { summary: AdmissionCrmCycleSummaryDto }) {
  return (
    <Stack spacing={2}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' },
          gap: 1.25,
        }}
      >
        <SummaryStat
          label="Admission window"
          value={formatDateRange(
            summary.cycle.admissionWindowStart,
            summary.cycle.admissionWindowEnd
          )}
        />
        <SummaryStat label="Owner" value={summary.cycle.ownerDisplayName || 'Not assigned'} />
        <SummaryStat
          label="Last updated"
          value={summary.cycle.lastUpdatedAt ? fDateTime(summary.cycle.lastUpdatedAt) || '-' : '-'}
        />
        <SummaryStat
          label="Entrance exam"
          value={summary.policy.entranceExamRequired ? 'Required' : 'Skipped'}
        />
        <SummaryStat
          label="Merit ranking"
          value={meritModeLabels[summary.policy.meritRankingMode]}
        />
        <SummaryStat
          label="Message rules"
          value={`${summary.communications.templateBackedRuleCount} template-backed`}
        />
      </Box>

      <CompactJourneyMap summary={summary} />

      {summary.cycle.requiredActions.length > 0 ? (
        <Stack spacing={1}>
          <Typography variant="subtitle2">Needs attention</Typography>
          {summary.cycle.requiredActions.map((action) => (
            <Alert
              key={action.key}
              severity="warning"
              action={
                <Button
                  component={RouterLink}
                  href={getSettingsHref(action.path, summary.cycle.academicYearId)}
                  color="inherit"
                  size="small"
                >
                  Open
                </Button>
              }
            >
              {action.title}
            </Alert>
          ))}
        </Stack>
      ) : (
        <Alert severity="success">Core readiness checks are clear for this cycle.</Alert>
      )}
    </Stack>
  );
}

function SetupTab({ summary }: { summary: AdmissionCrmCycleSummaryDto }) {
  const steps = buildSetupSteps(summary, summary.cycle.academicYearId);
  const activeStep = Math.max(
    0,
    steps.findIndex((step) => step.state !== 'Ready' && step.state !== 'Skipped')
  );

  return (
    <Paper variant="outlined" sx={{ p: { xs: 2, md: 2.5 }, borderRadius: 2 }}>
      <Stack spacing={2}>
        <Box>
          <Typography variant="overline" color="text.secondary">
            Guided setup
          </Typography>
          <Typography variant="h6">Complete these steps before daily admissions work</Typography>
        </Box>
        <Stepper
          activeStep={activeStep}
          orientation="vertical"
          aria-label="Admission cycle setup steps"
        >
          {steps.map((step) => (
            <Step
              key={step.label}
              expanded
              completed={step.state === 'Ready' || step.state === 'Skipped'}
            >
              <StepLabel
                optional={
                  <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap sx={{ mt: 0.5 }}>
                    <Chip size="small" color={stateColor(step.state)} label={step.state} />
                    {step.skipped ? (
                      <Chip size="small" variant="outlined" label="Disabled" />
                    ) : null}
                  </Stack>
                }
              >
                <Typography variant="subtitle2">{step.label}</Typography>
              </StepLabel>
              <Box sx={{ pl: { xs: 0, sm: 4 }, pb: 2 }}>
                <Stack spacing={1}>
                  <Typography variant="body2" color="text.secondary">
                    {step.description}
                  </Typography>
                  <Typography variant="body2">{step.nextAction}</Typography>
                  <Button
                    component={RouterLink}
                    href={step.href}
                    size="small"
                    disabled={step.state === 'Skipped'}
                    sx={{ alignSelf: 'flex-start' }}
                    endIcon={<Iconify icon="mdi:arrow-right" />}
                  >
                    {step.state === 'Ready' ? 'Review' : 'Open setup'}
                  </Button>
                </Stack>
              </Box>
            </Step>
          ))}
        </Stepper>
      </Stack>
    </Paper>
  );
}

function ActivityTab({ summary }: { summary: AdmissionCrmCycleSummaryDto }) {
  return (
    <Stack spacing={2}>
      <Alert severity="info">
        Detailed audit history stays in the owning settings and applicant timelines. This workspace
        shows the cycle evidence currently available from the setup summary.
      </Alert>
      <Paper variant="outlined" sx={{ p: { xs: 2, md: 2.5 }, borderRadius: 2 }}>
        <Stack spacing={1.5}>
          <Typography variant="h6">Cycle evidence</Typography>
          <Divider />
          <SummaryStat
            label="Last updated"
            value={
              summary.cycle.lastUpdatedAt ? fDateTime(summary.cycle.lastUpdatedAt) || '-' : '-'
            }
          />
          <SummaryStat
            label="Journey rules"
            value={`${summary.communications.journeyRuleCount} configured`}
          />
          <SummaryStat
            label="Active message rules"
            value={`${summary.communications.activeMessageRuleCount} active`}
          />
          <SummaryStat
            label="Provider-backed templates"
            value={`${summary.communications.templateBackedRuleCount} template-backed`}
          />
        </Stack>
      </Paper>
    </Stack>
  );
}

export function AdmissionCycleDetailWorkspace({ academicYearId }: { academicYearId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = useGetAdmissionCrmCycleSummaryQuery({ academicYearId }, { skip: !academicYearId });
  const summary = query.data;
  const requestedTab = searchParams.get('tab') as CycleWorkspaceTab | null;
  const defaultTab: CycleWorkspaceTab =
    summary?.cycle.status === 2 && (summary.cycle.readiness === 2 || summary.cycle.readiness === 3)
      ? 'overview'
      : 'setup';
  const activeTab = tabs.some((tab) => tab.value === requestedTab) ? requestedTab! : defaultTab;
  const tabHref = useMemo(
    () => (tab: CycleWorkspaceTab) =>
      `${getAdmissionCycleWorkspaceHref(academicYearId)}&tab=${encodeURIComponent(tab)}`,
    [academicYearId]
  );

  return (
    <Stack spacing={2} sx={{ minWidth: 0 }}>
      <CustomBreadcrumbs
        heading="Admission Cycle Setup"
        description="Configure the selected cycle first, then run daily admissions work in that cycle."
        links={[
          { name: 'Student', href: studentPaths.dashboard },
          { name: 'Student Enrollment', href: studentPaths.enrollment.overview },
          { name: 'Settings', href: studentPaths.enrollment.settings },
          {
            name: 'Admission Cycles',
            href: studentPaths.enrollment.settingsSections.admissionCycles,
          },
          { name: summary?.cycle.cycleName || 'Cycle setup' },
        ]}
        action={
          <Button
            component={RouterLink}
            href={getSettingsHref(studentPaths.enrollment.overview, academicYearId)}
            variant="outlined"
            startIcon={<Iconify icon="mdi:briefcase-outline" />}
          >
            Go to My Work
          </Button>
        }
        sx={{ px: 2 }}
      />

      {query.isFetching && !summary ? (
        <LinearProgress aria-label="Loading admission cycle setup" />
      ) : null}
      {query.isError ? (
        <Alert
          severity="error"
          action={
            <Button color="inherit" onClick={() => query.refetch()}>
              Retry
            </Button>
          }
        >
          Admission cycle setup could not be loaded.
        </Alert>
      ) : null}

      {summary ? (
        <>
          <CycleHeader summary={summary} />

          <Paper variant="outlined" sx={{ borderRadius: 2 }}>
            <Tabs
              value={activeTab}
              variant="scrollable"
              scrollButtons="auto"
              allowScrollButtonsMobile
              aria-label="Admission cycle workspace"
            >
              {tabs.map((tab) => (
                <Tab
                  key={tab.value}
                  component={RouterLink}
                  href={tabHref(tab.value)}
                  value={tab.value}
                  label={tab.label}
                  onClick={(event) => {
                    if (!isPlainPrimaryNavigationClick(event)) return;
                    event.preventDefault();
                    router.push(tabHref(tab.value));
                  }}
                />
              ))}
            </Tabs>
          </Paper>

          {activeTab === 'overview' ? <OverviewTab summary={summary} /> : null}
          {activeTab === 'setup' ? <SetupTab summary={summary} /> : null}
          {activeTab === 'journey-rules' ? (
            <ApplicationStagePolicyPanel academicYearId={academicYearId} />
          ) : null}
          {activeTab === 'activity' ? <ActivityTab summary={summary} /> : null}
        </>
      ) : null}
    </Stack>
  );
}
