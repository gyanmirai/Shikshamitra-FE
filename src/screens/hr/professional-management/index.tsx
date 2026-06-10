'use client';

import dayjs from 'dayjs';
import { toast } from 'sonner';
import { DatePicker } from '@mui/x-date-pickers';
import { Iconify } from 'src/components/iconify';
import CustomDialog from 'src/components/customDialog';
import React, { useMemo, useState, useEffect } from 'react';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import {
  Box,
  Chip,
  Grid,
  Stack,
  Paper,
  Button,
  Rating,
  Divider,
  MenuItem,
  TextField,
  Typography,
  ToggleButton,
  DialogActions,
  LinearProgress,
  ToggleButtonGroup,
} from '@mui/material';
import {
  PerformanceBoardType,
  type ProfessionalReview,
  type PerformanceTemplate,
  PerformanceStaffCategory,
  useGetPerformanceReviewQuery,
  useGetPerformanceReviewsQuery,
  useGetPerformanceDashboardQuery,
  useGetPerformanceTemplatesQuery,
  useAddPerformanceEvidenceMutation,
  useAddPerformanceFeedbackMutation,
  useSavePerformanceOutcomeMutation,
  useSubmitPerformanceStageMutation,
  useGetPerformanceSqaaEvidenceQuery,
  useGetPerformanceSqaaAuditPackQuery,
  useClonePerformanceTemplateMutation,
  useGetPerformanceTrainingNeedsQuery,
  useGetProfessionalReviewCyclesQuery,
  useAddPerformanceObservationMutation,
  useCreatePerformanceTemplateMutation,
  useGetPerformancePendingActionsQuery,
  useArchivePerformanceTemplateMutation,
  usePublishPerformanceTemplateMutation,
  useGetDefaultPerformanceTemplatesQuery,
  useSavePerformanceReviewerStageMutation,
  useSavePerformanceSelfAppraisalMutation,
  useAddPerformanceDevelopmentPlanMutation,
  useCreateProfessionalReviewCycleMutation,
  useGetPerformanceRatingDistributionQuery,
  usePublishProfessionalReviewCycleMutation,
  useFinalizeProfessionalReviewCycleMutation,
  useAssignProfessionalReviewEmployeesMutation,
  useLazyGetPerformanceSqaaAuditPackExportQuery,
  useGetPerformanceIncrementRecommendationsQuery,
  useMoveProfessionalReviewCycleToCalibrationMutation,
} from 'src/redux/hr/professional-management-api';

import { summarizeSqaaAuditPack } from './performance-sqaa-utils';
import {
  type PerformanceWorkspaceTab,
  performanceWorkspaceSubmodules,
} from './components/performance-workspace-config';
import {
  stageLabels,
  boardTypeLabels,
  sqaaDomainLabels,
  cycleStatusLabels,
  staffCategoryLabels,
  isTemplatePublishable,
  getSectionWeightTotal,
} from './performance-utils';
import {
  PerformanceSurface,
  PerformanceEmptyState,
  PerformanceMetricCard,
  PerformanceTablePanel,
  PerformanceSectionHeader,
  PerformanceWorkspaceShell,
  PerformanceWorkflowStepper,
  PerformanceScrollableContent,
} from './components/PerformanceWorkspaceUI';

const getBackendApiUrl = (path: string) => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
  return `${baseUrl}/api${path}`;
};

const tablePanelProps = {
  wrapperProps: {
    sx: {
      height: '100%',
      minHeight: 0,
      flex: 1,
      display: 'flex',
      flexDirection: 'column' as const,
      overflow: 'hidden',
    },
  },
  tableContainerProps: {
    sx: {
      minHeight: 0,
      flex: 1,
    },
  },
};

function PerformanceDataTable({
  wrapperProps,
  tableContainerProps,
  ...other
}: React.ComponentProps<typeof CustomizableTable>) {
  return (
    <PerformanceTablePanel>
      <CustomizableTable
        {...other}
        wrapperProps={{
          ...tablePanelProps.wrapperProps,
          ...wrapperProps,
          sx: {
            ...tablePanelProps.wrapperProps.sx,
            ...wrapperProps?.sx,
          },
        }}
        tableContainerProps={{
          ...tablePanelProps.tableContainerProps,
          ...tableContainerProps,
          sx: {
            ...tablePanelProps.tableContainerProps.sx,
            ...tableContainerProps?.sx,
          },
        }}
      />
    </PerformanceTablePanel>
  );
}

type ProfessionalManagementScreenProps = {
  workspace?: PerformanceWorkspaceTab;
};

const ProfessionalManagementScreen = ({
  workspace = 'overview',
}: ProfessionalManagementScreenProps) => {
  const currentWorkspace =
    performanceWorkspaceSubmodules.find((item) => item.value === workspace) ||
    performanceWorkspaceSubmodules[0];
  const breadcrumbLinks = [
    { name: 'HR' },
    { name: 'Performance Management' },
    ...('parentLabel' in currentWorkspace ? [{ name: currentWorkspace.parentLabel }] : []),
    { name: currentWorkspace.label },
  ];

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.default',
      }}
    >
      <CustomBreadcrumbs
        heading="Performance Management"
        description={currentWorkspace.description}
        links={breadcrumbLinks}
      />

      <PerformanceWorkspaceShell>
        {workspace === 'overview' && <OverviewWorkspace />}
        {workspace === 'setup-readiness' && <SetupReadinessWorkspace />}
        {workspace === 'reviews' && <ReviewsWorkspace />}
        {workspace === 'cycles-templates' && <CyclesTemplatesWorkspace />}
        {workspace === 'outcomes' && <OutcomesWorkspace />}
        {workspace === 'reports' && <ReportsTab />}
        {workspace === 'settings' && <SettingsWorkspace />}
      </PerformanceWorkspaceShell>
    </Box>
  );
};

export default ProfessionalManagementScreen;

function SectionPanel({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <PerformanceSurface
      title={title}
      description={description}
      action={action}
      sx={{ flex: 1, width: '100%' }}
      contentSx={{ minWidth: 0, overflow: 'hidden' }}
    >
      {children}
    </PerformanceSurface>
  );
}

function TabHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return <PerformanceSectionHeader title={title} description={description} action={action} />;
}

function EmptyState({ text }: { text: string }) {
  return <PerformanceEmptyState text={text} />;
}

function MetricCard({
  label,
  value,
  icon,
  tone = 'primary',
  helper,
}: {
  label: string;
  value?: number;
  icon: string;
  tone?: 'primary' | 'info' | 'warning' | 'success' | 'error';
  helper?: string;
}) {
  return (
    <PerformanceMetricCard label={label} value={value} icon={icon} tone={tone} helper={helper} />
  );
}

const setupSteps = [
  {
    label: 'Select board and staff group',
    description: 'Choose CBSE, GSEB, or generic presets for teachers and admin teams.',
  },
  {
    label: 'Add board presets',
    description: 'Seed SQAAF-aligned Indian school templates without rebuilding them manually.',
  },
  {
    label: 'Create appraisal cycle',
    description: 'Set the review window and connect the right published template.',
  },
  {
    label: 'Assign staff',
    description: 'Publish the cycle and assign eligible employees for review.',
  },
  {
    label: 'Check evidence readiness',
    description: 'Review SQAAF coverage before audits and affiliation checkpoints.',
  },
];

function SetupReadinessWorkspace() {
  return (
    <PerformanceScrollableContent>
      <Grid container spacing={2} alignItems="stretch">
        <Grid size={{ xs: 12, md: 2 }}>
          <PerformanceWorkflowStepper steps={setupSteps} activeStep={0} />
        </Grid>
        <Grid size={{ xs: 12, md: 10 }}>
          <GuidedSetupTab />
        </Grid>
      </Grid>
    </PerformanceScrollableContent>
  );
}

const settingsCards = [
  {
    title: 'Setup & Readiness',
    description: 'Prepare board presets, start cycles, assign active staff, and review SQAAF gaps.',
    icon: 'mdi:shield-check-outline',
    href: '/hr/professional-management/settings/setup',
    action: 'Open setup',
  },
  {
    title: 'Board Presets / SQAAF Mapping',
    description: 'Seed CBSE/GSEB defaults and confirm evidence coverage by SQAAF domain.',
    icon: 'mdi:school-outline',
    href: '/hr/professional-management/settings/setup',
    action: 'Manage presets',
  },
  {
    title: 'Template Defaults',
    description: 'Use role-based Indian school appraisal templates as the starting point.',
    icon: 'mdi:clipboard-edit-outline',
    href: '/hr/professional-management/cycles',
    action: 'Open templates',
  },
  {
    title: 'Cycle Configuration',
    description: 'Create, publish, and monitor appraisal cycles for the academic year.',
    icon: 'mdi:calendar-sync-outline',
    href: '/hr/professional-management/cycles',
    action: 'Open cycles',
  },
  {
    title: 'Assignment Rules',
    description: 'Assign published cycles to active staff through the guided readiness setup.',
    icon: 'mdi:account-switch-outline',
    href: '/hr/professional-management/settings/setup',
    action: 'Assign staff',
  },
];

function SettingsWorkspace() {
  return (
    <PerformanceScrollableContent>
      <Stack spacing={2}>
        <SectionPanel
          title="Performance settings"
          description="Configuration lives here so the daily review, outcomes, and reporting pages stay focused."
        >
          <Grid container spacing={1.5} alignItems="stretch">
            {settingsCards.map((item, index) => (
              <Grid
                key={item.title}
                size={{ xs: 12, sm: index === 0 ? 12 : 6, lg: index === 0 ? 4 : 2 }}
              >
                <Button
                  fullWidth
                  component="a"
                  href={item.href}
                  variant={index === 0 ? 'contained' : 'outlined'}
                  startIcon={<Iconify icon={item.icon} />}
                  sx={{
                    height: '100%',
                    minHeight: { xs: 118, sm: 148 },
                    alignItems: 'flex-start',
                    justifyContent: 'flex-start',
                    p: 2,
                    textAlign: 'left',
                    whiteSpace: 'normal',
                    borderRadius: 1,
                    '& .MuiButton-startIcon': {
                      mt: 0.25,
                      mr: 1.25,
                      flexShrink: 0,
                    },
                  }}
                >
                  <Stack spacing={0.75} sx={{ minWidth: 0 }}>
                    <Typography variant="subtitle2" sx={{ lineHeight: 1.3 }}>
                      {item.title}
                    </Typography>
                    <Typography
                      variant="caption"
                      color={index === 0 ? 'primary.contrastText' : 'text.secondary'}
                      sx={{ opacity: index === 0 ? 0.88 : 1 }}
                    >
                      {item.description}
                    </Typography>
                    <Typography
                      variant="caption"
                      color={index === 0 ? 'primary.contrastText' : 'primary.main'}
                      sx={{ fontWeight: 700, pt: 0.5 }}
                    >
                      {item.action}
                    </Typography>
                  </Stack>
                </Button>
              </Grid>
            ))}
          </Grid>
        </SectionPanel>
      </Stack>
    </PerformanceScrollableContent>
  );
}

function ReviewsWorkspace() {
  const [view, setView] = useState<'my' | 'queue' | 'observations'>('my');

  return (
    <PerformanceSurface
      sx={{
        flex: 1,
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
      }}
      contentSx={{ minHeight: 0, flex: 1, display: 'flex', flexDirection: 'column' }}
    >
      <Box
        sx={{
          flexShrink: 0,
          '& .MuiToggleButtonGroup-root': {
            maxWidth: '100%',
            overflowX: 'auto',
          },
        }}
      >
        <PerformanceSectionHeader
          title="Review workspace"
          description="Keep daily review work focused: self appraisal, reviewer queue, or classroom observations."
          action={
            <ToggleButtonGroup
              exclusive
              size="small"
              value={view}
              onChange={(_, nextView) => nextView && setView(nextView)}
              sx={{
                '& .MuiToggleButton-root': {
                  px: 1.5,
                  whiteSpace: 'nowrap',
                },
              }}
            >
              <ToggleButton value="my">My Reviews</ToggleButton>
              <ToggleButton value="queue">Reviewer Queue</ToggleButton>
              <ToggleButton value="observations">Observations</ToggleButton>
            </ToggleButtonGroup>
          }
        />
      </Box>
      <Box sx={{ minHeight: 0, flex: 1, display: 'flex', flexDirection: 'column' }}>
        {view === 'my' && <MyReviewTab />}
        {view === 'queue' && <ReviewsTab />}
        {view === 'observations' && <ObservationsTab />}
      </Box>
    </PerformanceSurface>
  );
}

function CyclesTemplatesWorkspace() {
  const [view, setView] = useState<'cycles' | 'templates'>('cycles');

  return (
    <PerformanceSurface
      sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}
      contentSx={{ minHeight: 0, flex: 1, display: 'flex', flexDirection: 'column' }}
    >
      <PerformanceSectionHeader
        title="Cycles & templates"
        description="Manage one operational surface at a time: cycle execution or appraisal design."
        action={
          <ToggleButtonGroup
            exclusive
            size="small"
            value={view}
            onChange={(_, nextView) => nextView && setView(nextView)}
          >
            <ToggleButton value="cycles">Review Cycles</ToggleButton>
            <ToggleButton value="templates">Templates</ToggleButton>
          </ToggleButtonGroup>
        }
      />
      <Box sx={{ minHeight: 0, flex: 1, display: 'flex', flexDirection: 'column' }}>
        {view === 'cycles' && <CyclesTab />}
        {view === 'templates' && <TemplatesTab />}
      </Box>
    </PerformanceSurface>
  );
}

function OutcomesWorkspace() {
  const [view, setView] = useState<'calibration' | 'outcomes' | 'plans'>('calibration');

  return (
    <Grid container spacing={2} alignItems="stretch" sx={{ minHeight: 0, flex: 1, height: '100%' }}>
      <Grid size={{ xs: 12, md: 2 }} sx={{ display: 'flex', minHeight: 0 }}>
        <PerformanceWorkflowStepper
          steps={[
            { label: 'Review', description: 'Complete self and reviewer stages.' },
            { label: 'Calibration', description: 'Normalize ratings before closure.' },
            { label: 'Outcome', description: 'Finalize recommendations.' },
            { label: 'Development Plan', description: 'Track follow-up growth actions.' },
          ]}
          activeStep={view === 'calibration' ? 1 : view === 'outcomes' ? 2 : 3}
        />
      </Grid>
      <Grid
        size={{ xs: 12, md: 10 }}
        sx={{ minHeight: 0, display: 'flex', flexDirection: 'column', height: '100%' }}
      >
        <PerformanceSurface
          sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}
          contentSx={{ minHeight: 0, flex: 1, display: 'flex', flexDirection: 'column' }}
        >
          <PerformanceSectionHeader
            title="Outcome workspace"
            description="Move from calibration to final outcomes and development follow-up."
            action={
              <ToggleButtonGroup
                exclusive
                size="small"
                value={view}
                onChange={(_, nextView) => nextView && setView(nextView)}
              >
                <ToggleButton value="calibration">Calibration</ToggleButton>
                <ToggleButton value="outcomes">Outcomes</ToggleButton>
                <ToggleButton value="plans">Plans</ToggleButton>
              </ToggleButtonGroup>
            }
          />
          <Box
            sx={{
              minHeight: 0,
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {view === 'calibration' && <CalibrationTab />}
            {view === 'outcomes' && <OutcomesTab />}
            {view === 'plans' && <DevelopmentPlansTab />}
          </Box>
        </PerformanceSurface>
      </Grid>
    </Grid>
  );
}

function GuidedSetupTab() {
  const { data: defaults, isLoading: defaultsLoading } = useGetDefaultPerformanceTemplatesQuery();
  const { data: templateData, isLoading: templatesLoading } = useGetPerformanceTemplatesQuery({});
  const { data: cycleData, isLoading: cyclesLoading } = useGetProfessionalReviewCyclesQuery({});
  const [createTemplate, createTemplateState] = useCreatePerformanceTemplateMutation();
  const [publishTemplate] = usePublishPerformanceTemplateMutation();
  const [createCycle, createCycleState] = useCreateProfessionalReviewCycleMutation();
  const [publishCycle] = usePublishProfessionalReviewCycleMutation();
  const [assignEmployees] = useAssignProfessionalReviewEmployeesMutation();
  const [boardType, setBoardType] = useState(PerformanceBoardType.CBSE);
  const [staffCategory, setStaffCategory] = useState(PerformanceStaffCategory.Teacher);
  const [cycleName, setCycleName] = useState('Annual Appraisal');
  const [periodStart, setPeriodStart] = useState(dayjs());
  const [periodEnd, setPeriodEnd] = useState(dayjs().add(1, 'year'));
  const isCyclePeriodInvalid = !periodEnd.isAfter(periodStart, 'day');
  const { data: sqaaEvidence } = useGetPerformanceSqaaEvidenceQuery({ boardType, staffCategory });

  const templates: PerformanceTemplate[] = templateData?.items || [];
  const cycles: any[] = cycleData?.items || [];
  const defaultItems = defaults?.items || [];
  const boardTemplates = templates.filter(
    (template) =>
      (Number(template.boardType ?? 0) === boardType || Number(template.boardType ?? 0) === 0) &&
      Number(template.staffCategory) === staffCategory
  );
  const selectedTemplate =
    boardTemplates.find(
      (template) => Number(template.boardType ?? 0) === boardType && Number(template.status) === 1
    ) ||
    boardTemplates.find((template) => Number(template.boardType ?? 0) === boardType) ||
    boardTemplates.find((template) => Number(template.status) === 1) ||
    boardTemplates[0];

  const addPresets = async () => {
    const items = defaultItems.filter((item: any) => {
      const itemBoard = Number(item.boardType ?? 0);
      return itemBoard === boardType || itemBoard === PerformanceBoardType.GenericIndian;
    });
    const existingNames = new Set(templates.map((template) => template.name.toLowerCase()));
    const candidates = items.filter(
      (item: any) => !existingNames.has(String(item.name).toLowerCase())
    );
    if (!candidates.length) {
      toast.info('Board presets are already available');
      return;
    }

    await Promise.all(
      candidates.map(async (item: any) => {
        const created = await createTemplate(item).unwrap();
        await publishTemplate(created.id).unwrap();
      })
    );
    toast.success(`${boardTypeLabels[boardType]} appraisal presets added`);
  };

  const createAndStartCycle = async () => {
    if (!selectedTemplate?.id) {
      toast.error('Add and publish a board preset before starting a cycle');
      return;
    }
    if (isCyclePeriodInvalid) {
      toast.error('Period end must be after period start');
      return;
    }

    let templateId = selectedTemplate.id;
    if (Number(selectedTemplate.status) !== 1) {
      const published = await publishTemplate(selectedTemplate.id).unwrap();
      templateId = published.id;
    }

    const cycle = await createCycle({
      name: `${boardTypeLabels[boardType]} ${cycleName}`.trim(),
      cycleType: 0,
      periodStart: periodStart.startOf('day').toISOString(),
      periodEnd: periodEnd.startOf('day').toISOString(),
      selfReviewDueDate: periodStart.add(14, 'day').toISOString(),
      reviewerDueDate: periodStart.add(28, 'day').toISOString(),
      finalizationDueDate: periodStart.add(42, 'day').toISOString(),
      ratingScaleMax: 5,
      allowNotApplicable: true,
      status: 0,
    }).unwrap();
    await publishCycle(cycle.id).unwrap();
    await assignEmployees({
      id: cycle.id,
      body: {
        templateId,
        employeeIds: [],
        activeEmployeesOnly: true,
        staffCategory,
      },
    }).unwrap();
    toast.success('Cycle created, published, and assigned to active staff');
  };

  const evidenceTotals = (sqaaEvidence || []).reduce(
    (totals, item) => ({
      mappedCriteria: totals.mappedCriteria + Number(item.mappedCriteria || 0),
      evidenceSubmitted: totals.evidenceSubmitted + Number(item.evidenceSubmitted || 0),
      missingEvidence: totals.missingEvidence + Number(item.missingEvidence || 0),
    }),
    { mappedCriteria: 0, evidenceSubmitted: 0, missingEvidence: 0 }
  );

  return (
    <PerformanceScrollableContent>
      <Stack spacing={2}>
        {(defaultsLoading || templatesLoading || cyclesLoading) && <LinearProgress />}
        <TabHeader
          title="Setup & readiness"
          description="Prepare CBSE/GSEB appraisal presets, start cycles, and track SQAAF evidence readiness from one workspace."
        />

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 4 }}>
            <SectionPanel
              title="1. Choose board"
              description="Load appraisal presets that match the school's board and staff group."
            >
              <Stack spacing={1.5}>
                <TextField
                  select
                  size="small"
                  label="Board preset"
                  value={boardType}
                  onChange={(event) => setBoardType(Number(event.target.value))}
                >
                  {[PerformanceBoardType.CBSE, PerformanceBoardType.GSEB].map((value) => (
                    <MenuItem key={value} value={value}>
                      {boardTypeLabels[value]}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  select
                  size="small"
                  label="Staff group"
                  value={staffCategory}
                  onChange={(event) => setStaffCategory(Number(event.target.value))}
                >
                  {Object.entries(staffCategoryLabels).map(([value, label]) => (
                    <MenuItem key={value} value={Number(value)}>
                      {label}
                    </MenuItem>
                  ))}
                </TextField>
                <Button
                  variant="contained"
                  disabled={createTemplateState.isLoading}
                  startIcon={<Iconify icon="mdi:playlist-plus" />}
                  onClick={addPresets}
                >
                  Add Board Presets
                </Button>
              </Stack>
            </SectionPanel>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <SectionPanel
              title="2. Start cycle"
              description="Create, publish, and assign the selected appraisal template to active staff."
            >
              <Stack spacing={1.5}>
                <TextField
                  size="small"
                  label="Cycle name"
                  value={cycleName}
                  onChange={(event) => setCycleName(event.target.value)}
                />
                <DatePicker
                  label="Period start"
                  value={periodStart}
                  onChange={(value) => value && setPeriodStart(value)}
                />
                <DatePicker
                  label="Period end"
                  value={periodEnd}
                  onChange={(value) => value && setPeriodEnd(value)}
                />
                <Button
                  variant="contained"
                  color="success"
                  disabled={
                    !selectedTemplate?.id || isCyclePeriodInvalid || createCycleState.isLoading
                  }
                  startIcon={<Iconify icon="mdi:rocket-launch-outline" />}
                  onClick={createAndStartCycle}
                >
                  Create & Assign
                </Button>
              </Stack>
            </SectionPanel>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <SectionPanel
              title="3. Readiness snapshot"
              description="A quick view of setup progress for the selected board and staff group."
            >
              <Stack spacing={1.25}>
                <MetricCard
                  label="Matching Templates"
                  value={boardTemplates.length}
                  icon="mdi:clipboard-check-outline"
                  tone="info"
                />
                <MetricCard
                  label="Review Cycles"
                  value={cycles.length}
                  icon="mdi:calendar-sync-outline"
                  tone="success"
                />
                <MetricCard
                  label="SQAAF Criteria"
                  value={evidenceTotals.mappedCriteria}
                  icon="mdi:shield-check-outline"
                  tone="warning"
                />
              </Stack>
            </SectionPanel>
          </Grid>
        </Grid>

        <SectionPanel
          title="SQAAF evidence coverage"
          description="Evidence gaps are grouped by SQAAF domain so administrators can prepare audit-ready records."
        >
          <PerformanceDataTable
            tableId="performance-sqaaf-evidence-setup"
            columns={[
              {
                id: 'domain',
                label: 'Domain',
                minWidth: '240px',
                render: (value) => sqaaDomainLabels[Number(value)] || '-',
              },
              { id: 'mappedCriteria', label: 'Criteria', minWidth: '100px' },
              { id: 'evidenceRequiredCriteria', label: 'Required', minWidth: '110px' },
              { id: 'evidenceSubmitted', label: 'Evidence', minWidth: '110px' },
              {
                id: 'missingEvidence',
                label: 'Missing',
                minWidth: '110px',
                render: (value) => (
                  <Chip
                    size="small"
                    color={Number(value) > 0 ? 'warning' : 'success'}
                    label={Number(value)}
                  />
                ),
              },
            ]}
            data={sqaaEvidence || []}
            noDataText="Add board presets and run reviews to build SQAAF evidence coverage."
          />
        </SectionPanel>
      </Stack>
    </PerformanceScrollableContent>
  );
}

function OverviewWorkspace() {
  const { data, isLoading, isError } = useGetPerformanceDashboardQuery();
  const { data: pending } = useGetPerformanceReviewsQuery({ status: 2 });
  const { data: pendingActions } = useGetPerformancePendingActionsQuery({});
  const { data: sqaaAuditPack } = useGetPerformanceSqaaAuditPackQuery({});
  const { data: templateData } = useGetPerformanceTemplatesQuery({});
  const rows = pending?.items || [];
  const templates: PerformanceTemplate[] = templateData?.items || [];
  const publishedTemplates = templates.filter((template) => Number(template.status) === 1).length;
  const sqaaSummary = summarizeSqaaAuditPack(sqaaAuditPack);
  const missingEvidence = sqaaSummary.totalMissingEvidence;
  const actionItems = [
    {
      title: 'Prepare SQAAF Audit Pack',
      description: 'Check readiness, gaps, and export evidence for CBSE review.',
      path: '/hr/professional-management/reports',
      icon: 'mdi:file-certificate-outline',
    },
    {
      title: 'Work review queues',
      description: 'Open self reviews, reviewer tasks, and observations.',
      path: '/hr/professional-management/reviews',
      icon: 'mdi:account-check-outline',
    },
    {
      title: 'Manage cycles and templates',
      description: 'Update appraisal templates and publish review cycles.',
      path: '/hr/professional-management/cycles',
      icon: 'mdi:calendar-sync-outline',
    },
    {
      title: 'Review settings readiness',
      description: 'Seed presets, assign staff, and check board mappings.',
      path: '/hr/professional-management/settings/setup',
      icon: 'mdi:cog-outline',
    },
  ];

  return (
    <PerformanceScrollableContent>
      <Stack spacing={2}>
        {isLoading && <LinearProgress />}
        {isError && <EmptyState text="Performance dashboard could not be loaded." />}

        <Grid container spacing={1.5}>
          <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
            <MetricCard label="Active Cycles" value={data?.activeCycles} icon="mdi:calendar-star" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
            <MetricCard
              label="Self Reviews"
              value={data?.pendingSelfReviews}
              icon="mdi:account-edit"
              tone="info"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
            <MetricCard
              label="Reviewer Actions"
              value={data?.pendingReviewerReviews}
              icon="mdi:account-check"
              tone="warning"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
            <MetricCard
              label="Overdue"
              value={data?.overdueReviews}
              icon="mdi:clock-alert-outline"
              tone="error"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
            <MetricCard
              label="SQAAF Ready"
              value={sqaaSummary.overallReadinessPercentage}
              icon="mdi:shield-check-outline"
              tone={sqaaSummary.totalMissingEvidence > 0 ? 'warning' : 'success'}
              helper="% readiness"
            />
          </Grid>
        </Grid>

        <Grid container spacing={2} alignItems="stretch">
          <Grid size={{ xs: 12, lg: 7 }} sx={{ display: 'flex' }}>
            <SectionPanel
              title="Next best actions"
              description="Start from the most common school-admin workflows without hunting through tabs."
            >
              <Grid container spacing={1.5}>
                {actionItems.map((item) => (
                  <Grid key={item.path} size={{ xs: 12, sm: 6 }}>
                    <Button
                      fullWidth
                      component="a"
                      href={item.path}
                      variant="outlined"
                      startIcon={<Iconify icon={item.icon} />}
                      sx={{
                        minHeight: 72,
                        justifyContent: 'flex-start',
                        alignItems: 'flex-start',
                        p: 1.5,
                        textAlign: 'left',
                        whiteSpace: 'normal',
                      }}
                    >
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="subtitle2">{item.title}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {item.description}
                        </Typography>
                      </Box>
                    </Button>
                  </Grid>
                ))}
              </Grid>
            </SectionPanel>
          </Grid>
          <Grid size={{ xs: 12, lg: 5 }} sx={{ display: 'flex' }}>
            <SectionPanel title="Pending Actions">
              <Stack spacing={1}>
                {(pendingActions || []).slice(0, 5).map((item: any) => (
                  <Stack
                    key={`${item.reviewId}-${item.action}`}
                    direction={{ xs: 'column', sm: 'row' }}
                    justifyContent="space-between"
                    alignItems={{ xs: 'flex-start', sm: 'center' }}
                    spacing={1}
                  >
                    <Typography variant="body2">{item.employeeName}</Typography>
                    <Chip
                      size="small"
                      label={`${item.action}${item.dueDate ? ` by ${dayjs(item.dueDate).format('DD MMM')}` : ''}`}
                    />
                  </Stack>
                ))}
                {!pendingActions?.length && <EmptyState text="No pending actions right now." />}
              </Stack>
            </SectionPanel>
          </Grid>
        </Grid>

        <SectionPanel
          title="Recommendations"
          description="Performance cycle outcomes and suggested actions."
        >
          <Grid container spacing={1.5}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  borderRadius: 1,
                }}
              >
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'info.lighter',
                    color: 'info.main',
                  }}
                >
                  <Iconify icon="mdi:school-outline" width={24} />
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="h4" sx={{ lineHeight: 1.2 }}>
                    {data?.trainingRecommendations ?? 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Training Recommendations
                  </Typography>
                </Box>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  borderRadius: 1,
                }}
              >
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'success.lighter',
                    color: 'success.main',
                  }}
                >
                  <Iconify icon="mdi:cash-plus" width={24} />
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="h4" sx={{ lineHeight: 1.2 }}>
                    {data?.incrementRecommendations ?? 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Increment Recommendations
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </SectionPanel>

        <Grid container spacing={2} alignItems="stretch">
          <Grid size={{ xs: 12, md: 6 }} sx={{ display: 'flex' }}>
            <SectionPanel
              title="SQAAF readiness"
              description="Principal/admin snapshot for CBSE/GSEB evidence review."
              action={
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  <Button
                    size="small"
                    variant="contained"
                    component="a"
                    href="/hr/professional-management/reports"
                    startIcon={<Iconify icon="mdi:file-certificate-outline" />}
                  >
                    Audit Pack
                  </Button>
                  <Button
                    size="small"
                    component="a"
                    href="/hr/professional-management/settings/setup"
                    startIcon={<Iconify icon="mdi:cog-outline" />}
                  >
                    Settings
                  </Button>
                </Stack>
              }
            >
              <Stack spacing={1.5}>
                <Grid container spacing={1.5}>
                  <Grid size={{ xs: 6 }}>
                    <MetricCard
                      label="Readiness"
                      value={sqaaSummary.overallReadinessPercentage}
                      icon="mdi:shield-check-outline"
                      tone={missingEvidence > 0 ? 'warning' : 'success'}
                      helper="% ready"
                    />
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <MetricCard
                      label="Gaps"
                      value={missingEvidence}
                      icon="mdi:file-alert-outline"
                      tone={missingEvidence > 0 ? 'warning' : 'success'}
                    />
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <MetricCard
                      label="Domains"
                      value={sqaaSummary.readyDomainCount}
                      icon="mdi:domain"
                      tone="info"
                      helper={`${sqaaSummary.totalDomainCount} tracked`}
                    />
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <MetricCard
                      label="Templates"
                      value={publishedTemplates}
                      icon="mdi:clipboard-check-outline"
                      tone="info"
                    />
                  </Grid>
                </Grid>
                <Stack spacing={1}>
                  <Typography variant="subtitle2">Top gaps</Typography>
                  {sqaaSummary.topGaps.map((domain) => (
                    <Stack
                      key={domain.domain}
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                      spacing={1}
                    >
                      <Typography variant="body2" color="text.secondary">
                        {sqaaDomainLabels[Number(domain.domain)] || 'SQAAF domain'}
                      </Typography>
                      <Chip size="small" color="warning" label={`${domain.missingEvidence} gaps`} />
                    </Stack>
                  ))}
                  {!sqaaSummary.topGaps.length && (
                    <EmptyState text="No SQAAF evidence gaps found for the current data." />
                  )}
                </Stack>
              </Stack>
            </SectionPanel>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }} sx={{ display: 'flex' }}>
            <SectionPanel title="Live Review Queue">
              <ReviewTable rows={rows.slice(0, 5)} />
            </SectionPanel>
          </Grid>
        </Grid>
      </Stack>
    </PerformanceScrollableContent>
  );
}

function TemplatesTab() {
  const { data, isLoading } = useGetPerformanceTemplatesQuery({});
  const { data: defaults } = useGetDefaultPerformanceTemplatesQuery();
  const [createTemplate, createState] = useCreatePerformanceTemplateMutation();
  const [publishTemplate] = usePublishPerformanceTemplateMutation();
  const [cloneTemplate] = useClonePerformanceTemplateMutation();
  const [archiveTemplate] = useArchivePerformanceTemplateMutation();
  const [builderOpen, setBuilderOpen] = useState(false);
  const templates: PerformanceTemplate[] = data?.items || [];

  const seedDefaults = async () => {
    const items = defaults?.items || [];
    const existingNames = new Set(templates.map((template) => template.name.toLowerCase()));
    const candidates = items.filter(
      (item: any) => !existingNames.has(String(item.name).toLowerCase())
    );
    if (!candidates.length) {
      toast.info('Default Indian school templates are already available');
      return;
    }

    await Promise.all(
      candidates.map(async (item: any) => {
        const created = await createTemplate(item).unwrap();
        await publishTemplate(created.id).unwrap();
      })
    );
    toast.success('Default Indian school templates created and published');
  };

  return (
    <Stack spacing={2} sx={{ minHeight: 0, flex: 1 }}>
      {isLoading && <LinearProgress />}
      <TabHeader
        title="Role-based appraisal templates"
        action={
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Button
              variant="outlined"
              size="small"
              startIcon={<Iconify icon="mdi:school-outline" />}
              disabled={createState.isLoading}
              onClick={seedDefaults}
            >
              Add Defaults
            </Button>
            <Button
              variant="contained"
              size="small"
              startIcon={<Iconify icon="mdi:plus" />}
              onClick={() => setBuilderOpen(true)}
            >
              New Template
            </Button>
          </Stack>
        }
      />

      <PerformanceDataTable
        tableId="performance-templates"
        columns={[
          { id: 'name', label: 'Template', minWidth: '220px' },
          {
            id: 'boardType',
            label: 'Board',
            minWidth: '120px',
            render: (value) => boardTypeLabels[Number(value ?? 0)] || '-',
          },
          {
            id: 'staffCategory',
            label: 'Category',
            minWidth: '150px',
            render: (value) => staffCategoryLabels[Number(value)] || '-',
          },
          {
            id: 'sections',
            label: 'Sections',
            minWidth: '260px',
            render: (value) => (
              <Stack spacing={0.75}>
                {(value || []).slice(0, 3).map((section: any) => (
                  <Stack
                    key={section.id || section.name}
                    direction="row"
                    spacing={1}
                    alignItems="center"
                  >
                    <Typography variant="caption" sx={{ minWidth: 120 }} noWrap>
                      {section.name}
                    </Typography>
                    <Chip
                      size="small"
                      label={sqaaDomainLabels[Number(section.sqaaDomain ?? 2)] || 'SQAAF'}
                    />
                    <LinearProgress
                      variant="determinate"
                      value={Number(section.weight || 0)}
                      sx={{ flex: 1, minWidth: 72 }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {section.weight}%
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            ),
          },
          {
            id: 'status',
            label: 'Status',
            minWidth: '110px',
            render: (value) => (
              <Chip
                size="small"
                color={
                  Number(value) === 1 ? 'success' : Number(value) === 2 ? 'warning' : 'default'
                }
                label={
                  Number(value) === 1 ? 'Published' : Number(value) === 2 ? 'Archived' : 'Draft'
                }
              />
            ),
          },
          {
            id: 'weight',
            label: 'Weight',
            minWidth: '100px',
            render: (_value, row) => `${getSectionWeightTotal(row.sections || [])}%`,
          },
          {
            id: 'actions',
            label: 'Actions',
            isSort: false,
            isFilter: false,
            sticky: true,
            minWidth: '80px',
            render: (_value, row) => (
              <ThreeDotsActions
                actions={({ popover }) => (
                  <Stack sx={{ minWidth: 150 }}>
                    <MenuItem
                      disabled={row.status === 1 || !isTemplatePublishable(row.sections || [])}
                      onClick={async () => {
                        popover.onClose();
                        await publishTemplate(row.id).unwrap();
                        toast.success('Template published');
                      }}
                    >
                      Publish
                    </MenuItem>
                    <MenuItem
                      onClick={async () => {
                        popover.onClose();
                        await cloneTemplate(row.id).unwrap();
                        toast.success('Template cloned');
                      }}
                    >
                      Clone
                    </MenuItem>
                    <MenuItem
                      disabled={row.status === 2}
                      onClick={async () => {
                        popover.onClose();
                        await archiveTemplate(row.id).unwrap();
                        toast.success('Template archived');
                      }}
                    >
                      Archive
                    </MenuItem>
                  </Stack>
                )}
              />
            ),
          },
        ]}
        data={templates}
        noDataText="No appraisal templates found."
      />

      <TemplateBuilderDialog
        open={builderOpen}
        onClose={() => setBuilderOpen(false)}
        onCreate={async (body) => {
          await createTemplate(body).unwrap();
          toast.success('Template saved as draft');
          setBuilderOpen(false);
        }}
      />
    </Stack>
  );
}

function TemplateBuilderDialog({
  open,
  onClose,
  onCreate,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (body: any) => Promise<void>;
}) {
  const [name, setName] = useState('Teacher Annual Appraisal');
  const [boardType, setBoardType] = useState(PerformanceBoardType.CBSE);
  const [staffCategory, setStaffCategory] = useState(PerformanceStaffCategory.Teacher);
  const [sections, setSections] = useState<any[]>([
    {
      name: 'Classroom practice',
      sqaaDomain: 0,
      weight: 50,
      displayOrder: 1,
      criteria: [
        {
          name: 'Lesson planning and delivery',
          weight: 50,
          evidenceRequired: true,
          displayOrder: 1,
        },
        { name: 'Student engagement', weight: 50, evidenceRequired: false, displayOrder: 2 },
      ],
    },
    {
      name: 'Professional conduct',
      sqaaDomain: 2,
      weight: 50,
      displayOrder: 2,
      criteria: [
        {
          name: 'Attendance and parent communication',
          weight: 100,
          evidenceRequired: false,
          displayOrder: 1,
        },
      ],
    },
  ]);

  const updateSection = (index: number, patch: any) =>
    setSections((current) =>
      current.map((section, idx) => (idx === index ? { ...section, ...patch } : section))
    );

  const updateCriterion = (sectionIndex: number, criterionIndex: number, patch: any) =>
    setSections((current) =>
      current.map((section, idx) =>
        idx === sectionIndex
          ? {
              ...section,
              criteria: section.criteria.map((criterion: any, cIdx: number) =>
                cIdx === criterionIndex ? { ...criterion, ...patch } : criterion
              ),
            }
          : section
      )
    );

  const totalWeight = getSectionWeightTotal(sections);

  return (
    <CustomDialog
      open={open}
      maxWidth="md"
      handleClose={onClose}
      title="Template builder"
      paperProps={{
        sx: {
          width: { xs: 'calc(100% - 24px)', md: 920 },
          maxHeight: 'min(86vh, 860px)',
          backgroundImage: 'none',
          bgcolor: 'background.paper',
        },
      }}
    >
      <Stack
        spacing={2}
        sx={{
          p: { xs: 2, md: 2.5 },
          overflow: 'auto',
          bgcolor: 'background.default',
        }}
      >
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
          <TextField
            fullWidth
            size="small"
            label="Template Name"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          <TextField
            select
            fullWidth
            size="small"
            label="Board"
            value={boardType}
            onChange={(event) => setBoardType(Number(event.target.value))}
            sx={{ minWidth: { md: 180 } }}
          >
            {Object.entries(boardTypeLabels).map(([value, label]) => (
              <MenuItem key={value} value={Number(value)}>
                {label}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            fullWidth
            size="small"
            label="Staff Category"
            value={staffCategory}
            onChange={(event) => setStaffCategory(Number(event.target.value))}
            sx={{ minWidth: { md: 260 } }}
          >
            {Object.entries(staffCategoryLabels).map(([value, label]) => (
              <MenuItem key={value} value={Number(value)}>
                {label}
              </MenuItem>
            ))}
          </TextField>
        </Stack>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          spacing={1}
        >
          <Box>
            <Typography variant="subtitle1">Sections and criteria</Typography>
            <Typography variant="caption" color="text.secondary">
              Keep section weights at 100% before publishing the template.
            </Typography>
          </Box>
          <Chip
            size="small"
            color={totalWeight === 100 ? 'success' : 'warning'}
            label={`Total weight ${totalWeight}%`}
          />
        </Stack>

        {sections.map((section, sectionIndex) => (
          <Paper
            key={section.displayOrder}
            variant="outlined"
            sx={{
              p: 1.5,
              borderRadius: 1,
              bgcolor: 'background.paper',
            }}
          >
            <Stack spacing={1.25}>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.25} alignItems="flex-start">
                <TextField
                  fullWidth
                  size="small"
                  label="Section"
                  value={section.name}
                  onChange={(event) => updateSection(sectionIndex, { name: event.target.value })}
                />
                <TextField
                  select
                  size="small"
                  label="SQAAF Domain"
                  value={section.sqaaDomain ?? 2}
                  onChange={(event) =>
                    updateSection(sectionIndex, { sqaaDomain: Number(event.target.value) })
                  }
                  sx={{ width: { xs: 1, md: 240 }, flexShrink: 0 }}
                >
                  {Object.entries(sqaaDomainLabels).map(([value, label]) => (
                    <MenuItem key={value} value={Number(value)}>
                      {label}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  size="small"
                  type="number"
                  label="Weight"
                  value={section.weight}
                  onChange={(event) =>
                    updateSection(sectionIndex, { weight: Number(event.target.value) })
                  }
                  sx={{ width: { xs: 1, md: 140 }, flexShrink: 0 }}
                />
              </Stack>

              <Stack spacing={1}>
                {section.criteria.map((criterion: any, criterionIndex: number) => (
                  <Stack
                    key={criterion.displayOrder}
                    direction={{ xs: 'column', md: 'row' }}
                    spacing={1.25}
                    alignItems={{ xs: 'stretch', md: 'center' }}
                    sx={{
                      p: 1,
                      borderRadius: 1,
                      border: (theme) => `1px solid ${theme.palette.divider}`,
                      bgcolor: 'background.default',
                    }}
                  >
                    <TextField
                      fullWidth
                      size="small"
                      label="Criterion"
                      value={criterion.name}
                      onChange={(event) =>
                        updateCriterion(sectionIndex, criterionIndex, { name: event.target.value })
                      }
                    />
                    <TextField
                      size="small"
                      type="number"
                      label="Weight"
                      value={criterion.weight}
                      onChange={(event) =>
                        updateCriterion(sectionIndex, criterionIndex, {
                          weight: Number(event.target.value),
                        })
                      }
                      sx={{ width: { xs: 1, md: 120 }, flexShrink: 0 }}
                    />
                    <Button
                      size="small"
                      color={criterion.evidenceRequired ? 'primary' : 'inherit'}
                      variant={criterion.evidenceRequired ? 'contained' : 'outlined'}
                      startIcon={
                        <Iconify
                          icon={
                            criterion.evidenceRequired
                              ? 'mdi:checkbox-marked-circle-outline'
                              : 'mdi:checkbox-blank-circle-outline'
                          }
                        />
                      }
                      onClick={() =>
                        updateCriterion(sectionIndex, criterionIndex, {
                          evidenceRequired: !criterion.evidenceRequired,
                        })
                      }
                      sx={{
                        minWidth: { xs: 1, md: 128 },
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      Evidence
                    </Button>
                  </Stack>
                ))}
              </Stack>

              <Stack direction="row" justifyContent="flex-end">
                <Button
                  size="small"
                  startIcon={<Iconify icon="mdi:plus" />}
                  onClick={() =>
                    updateSection(sectionIndex, {
                      criteria: [
                        ...section.criteria,
                        {
                          name: 'New criterion',
                          sqaaDomain: section.sqaaDomain ?? 2,
                          weight: 0,
                          evidenceRequired: false,
                          displayOrder: section.criteria.length + 1,
                        },
                      ],
                    })
                  }
                >
                  Add Criterion
                </Button>
              </Stack>
            </Stack>
          </Paper>
        ))}

        <Button
          variant="outlined"
          startIcon={<Iconify icon="mdi:plus" />}
          sx={{
            borderStyle: 'dashed',
            bgcolor: 'background.paper',
            py: 1.2,
          }}
          onClick={() =>
            setSections((current) => [
              ...current,
              {
                name: 'New section',
                sqaaDomain: 2,
                weight: 0,
                displayOrder: current.length + 1,
                criteria: [],
              },
            ])
          }
        >
          Add Section
        </Button>
      </Stack>
      <DialogActions
        sx={{
          px: 2.5,
          py: 1.75,
          borderTop: (theme) => `1px solid ${theme.palette.divider}`,
          bgcolor: 'background.paper',
        }}
      >
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          disabled={
            !name.trim() ||
            totalWeight !== 100 ||
            sections.some((section) => !section.criteria.length)
          }
          onClick={() =>
            onCreate({
              name,
              boardType,
              staffCategory,
              ratingScaleMax: 5,
              allowNotApplicable: true,
              sections: sections.map((section) => ({
                ...section,
                criteria: section.criteria.map((criterion: any) => ({
                  ...criterion,
                  sqaaDomain: criterion.sqaaDomain ?? section.sqaaDomain ?? 2,
                })),
              })),
            })
          }
        >
          Save Draft
        </Button>
      </DialogActions>
    </CustomDialog>
  );
}

function CyclesTab() {
  const { data: cycleData, isLoading } = useGetProfessionalReviewCyclesQuery({});
  const { data: templateData } = useGetPerformanceTemplatesQuery({});
  const [createCycle] = useCreateProfessionalReviewCycleMutation();
  const [publishCycle] = usePublishProfessionalReviewCycleMutation();
  const [assignEmployees] = useAssignProfessionalReviewEmployeesMutation();
  const [moveToCalibration] = useMoveProfessionalReviewCycleToCalibrationMutation();
  const [finalizeCycle] = useFinalizeProfessionalReviewCycleMutation();
  const [open, setOpen] = useState(false);
  const templates = templateData?.items || [];
  const cycles = cycleData?.items || [];

  return (
    <Stack spacing={2} sx={{ minHeight: 0, flex: 1 }}>
      {isLoading && <LinearProgress />}
      <TabHeader
        title="Review cycles"
        action={
          <Button
            variant="contained"
            size="small"
            onClick={() => setOpen(true)}
            startIcon={<Iconify icon="mdi:plus" />}
          >
            New Cycle
          </Button>
        }
      />
      <PerformanceDataTable
        tableId="performance-cycles"
        columns={[
          { id: 'name', label: 'Cycle', minWidth: '220px' },
          {
            id: 'periodStart',
            label: 'Period',
            minWidth: '220px',
            render: (_value, row) =>
              `${dayjs(row.periodStart).format('DD MMM YYYY')} - ${dayjs(row.periodEnd).format('DD MMM YYYY')}`,
          },
          {
            id: 'status',
            label: 'Status',
            minWidth: '120px',
            render: (value) => (
              <Chip size="small" label={cycleStatusLabels[Number(value)] || 'Draft'} />
            ),
          },
          { id: 'assignedCount', label: 'Assigned', minWidth: '110px' },
          { id: 'finalizedCount', label: 'Finalized', minWidth: '110px' },
          {
            id: 'actions',
            label: 'Actions',
            isSort: false,
            isFilter: false,
            sticky: true,
            minWidth: '80px',
            render: (_value, row) => (
              <ThreeDotsActions
                actions={({ popover }) => (
                  <Stack sx={{ minWidth: 160 }}>
                    <MenuItem
                      disabled={row.status !== 0}
                      onClick={async () => {
                        popover.onClose();
                        await publishCycle(row.id).unwrap();
                        toast.success('Cycle published');
                      }}
                    >
                      Publish
                    </MenuItem>
                    <MenuItem
                      disabled={(row.status !== 1 && row.status !== 2) || !templates[0]?.id}
                      onClick={async () => {
                        popover.onClose();
                        await assignEmployees({
                          id: row.id,
                          body: {
                            templateId: templates[0]?.id,
                            employeeIds: [],
                            activeEmployeesOnly: true,
                          },
                        }).unwrap();
                        toast.success('Eligible employees assigned to cycle');
                      }}
                    >
                      Assign Employees
                    </MenuItem>
                    <MenuItem
                      disabled={row.status !== 2}
                      onClick={async () => {
                        popover.onClose();
                        await moveToCalibration(row.id).unwrap();
                        toast.success('Cycle moved to calibration');
                      }}
                    >
                      Move to Calibration
                    </MenuItem>
                    <MenuItem
                      disabled={row.status !== 3}
                      onClick={async () => {
                        popover.onClose();
                        await finalizeCycle(row.id).unwrap();
                        toast.success('Cycle finalized');
                      }}
                    >
                      Finalize
                    </MenuItem>
                  </Stack>
                )}
              />
            ),
          },
        ]}
        data={cycles}
        noDataText="No performance cycles found."
      />
      <CycleDialog
        open={open}
        onClose={() => setOpen(false)}
        onCreate={async (body) => {
          await createCycle(body).unwrap();
          toast.success('Cycle created');
          setOpen(false);
        }}
      />
    </Stack>
  );
}

function ReviewsTab() {
  const { data, isLoading } = useGetPerformanceReviewsQuery({});
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const rows = data?.items || [];

  return (
    <Stack spacing={2} sx={{ minHeight: 0, flex: 1 }}>
      {isLoading && <LinearProgress />}
      <ReviewTable rows={rows} onOpen={(row) => setSelectedId(row.id)} />
      <ReviewWorkspace reviewId={selectedId} onClose={() => setSelectedId(null)} />
    </Stack>
  );
}

function MyReviewTab() {
  const { data, isLoading } = useGetPerformanceReviewsQuery({});
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const rows = (data?.items || []).filter((row: ProfessionalReview) => row.status !== 3);

  return (
    <Stack spacing={2} sx={{ minHeight: 0, flex: 1 }}>
      {isLoading && <LinearProgress />}
      <TabHeader title="Self-appraisal drafts and submissions" />
      <ReviewTable rows={rows} onOpen={(row) => setSelectedId(row.id)} actionLabel="Self Review" />
      <ReviewWorkspace
        reviewId={selectedId}
        onClose={() => setSelectedId(null)}
        initialPanel="self"
      />
    </Stack>
  );
}

function ObservationsTab() {
  const { data, isLoading } = useGetPerformanceReviewsQuery({});
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const rows = (data?.items || []).filter(
    (row: ProfessionalReview) =>
      (row.templateName || '').toLowerCase().includes('teacher') ||
      (row.employeeRole || '').toLowerCase().includes('teacher')
  );

  return (
    <Stack spacing={2} sx={{ minHeight: 0, flex: 1 }}>
      {isLoading && <LinearProgress />}
      <TabHeader title="Classroom observations" />
      <ReviewTable rows={rows} onOpen={(row) => setSelectedId(row.id)} actionLabel="Observe" />
      <ReviewWorkspace
        reviewId={selectedId}
        onClose={() => setSelectedId(null)}
        initialPanel="observation"
      />
    </Stack>
  );
}

function CalibrationTab() {
  const { data: distribution } = useGetPerformanceRatingDistributionQuery({});
  const { data, isLoading } = useGetPerformanceReviewsQuery({});
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const rows = (data?.items || []).filter((row: ProfessionalReview) => row.status !== 3);

  return (
    <Stack spacing={2} sx={{ minHeight: 0, flex: 1, height: '100%', overflow: 'hidden' }}>
      {isLoading && <LinearProgress />}
      <Grid
        container
        spacing={2}
        sx={{ minHeight: 0, flex: 1, height: '100%', overflow: 'hidden' }}
      >
        <Grid size={{ xs: 12, md: 3 }} sx={{ display: 'flex', minHeight: 0, overflow: 'hidden' }}>
          <RatingDistributionPanel distribution={distribution || []} />
        </Grid>
        <Grid
          size={{ xs: 12, md: 9 }}
          sx={{
            minHeight: 0,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          <ReviewTable
            rows={rows}
            onOpen={(row) => setSelectedId(row.id)}
            actionLabel="Calibrate"
          />
        </Grid>
      </Grid>
      <ReviewWorkspace
        reviewId={selectedId}
        onClose={() => setSelectedId(null)}
        initialPanel="outcome"
      />
    </Stack>
  );
}

function DevelopmentPlansTab() {
  const { data: training, isLoading } = useGetPerformanceTrainingNeedsQuery({});

  return (
    <Stack spacing={2} sx={{ minHeight: 0, flex: 1, height: '100%' }}>
      {isLoading && <LinearProgress />}
      <TabHeader title="Development plans and training needs" />
      <PerformanceDataTable
        tableId="performance-development-plans"
        columns={[
          { id: 'goal', label: 'Goal', minWidth: '220px' },
          { id: 'actionPlan', label: 'Action Plan', minWidth: '260px' },
          {
            id: 'targetDate',
            label: 'Target',
            minWidth: '140px',
            render: (value) => (value ? dayjs(value).format('DD MMM YYYY') : '-'),
          },
          {
            id: 'status',
            label: 'Status',
            minWidth: '130px',
            render: (value) => (
              <Chip
                size="small"
                label={['Open', 'In Progress', 'Completed', 'Deferred'][Number(value)] || 'Open'}
              />
            ),
          },
        ]}
        data={training || []}
        noDataText="No development plans found."
      />
    </Stack>
  );
}

function OutcomesTab() {
  const { data, isLoading } = useGetPerformanceReviewsQuery({});
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const rows = (data?.items || []).filter((row: ProfessionalReview) => row.status !== 3);
  return (
    <Stack spacing={2} sx={{ minHeight: 0, flex: 1, height: '100%' }}>
      {isLoading && <LinearProgress />}
      <TabHeader title="Calibration and final outcomes" />
      <ReviewTable rows={rows} onOpen={(row) => setSelectedId(row.id)} actionLabel="Finalize" />
      <ReviewWorkspace
        reviewId={selectedId}
        onClose={() => setSelectedId(null)}
        initialPanel="outcome"
      />
    </Stack>
  );
}

function ReportsTab() {
  const { data: distribution } = useGetPerformanceRatingDistributionQuery({});
  const { data: training } = useGetPerformanceTrainingNeedsQuery({});
  const { data: increments } = useGetPerformanceIncrementRecommendationsQuery({});
  const { data: pendingActions } = useGetPerformancePendingActionsQuery({});
  const { data: sqaaEvidence } = useGetPerformanceSqaaEvidenceQuery({});

  return (
    <PerformanceScrollableContent>
      <Stack spacing={2}>
        <SqaaAuditPackSection />

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 4 }}>
            <RatingDistributionPanel distribution={distribution || []} />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <SectionPanel title="Training Needs">
              <Stack spacing={1}>
                {(training || []).slice(0, 6).map((item: any) => (
                  <Typography key={item.id} variant="body2">
                    {item.goal}
                  </Typography>
                ))}
                {!training?.length && <EmptyState text="No training recommendations found." />}
              </Stack>
            </SectionPanel>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <SectionPanel title="Increment Recommendations">
              <Stack spacing={1}>
                {(increments || []).slice(0, 6).map((item: any) => (
                  <Stack key={item.id} direction="row" justifyContent="space-between" spacing={1}>
                    <Typography variant="body2">{item.finalRating || 'Recommended'}</Typography>
                    <Chip size="small" label={`Score ${item.finalScore}`} />
                  </Stack>
                ))}
                {!increments?.length && <EmptyState text="No increment recommendations found." />}
              </Stack>
            </SectionPanel>
          </Grid>
        </Grid>

        <SectionPanel title="SQAAF Evidence Coverage">
          <PerformanceDataTable
            tableId="performance-report-sqaaf-evidence"
            columns={[
              {
                id: 'domain',
                label: 'SQAAF Domain',
                minWidth: '260px',
                render: (value) => sqaaDomainLabels[Number(value)] || '-',
              },
              { id: 'templateCount', label: 'Templates', minWidth: '110px' },
              { id: 'assignedReviewCount', label: 'Reviews', minWidth: '110px' },
              { id: 'mappedCriteria', label: 'Criteria', minWidth: '110px' },
              { id: 'evidenceSubmitted', label: 'Evidence', minWidth: '110px' },
              {
                id: 'missingEvidence',
                label: 'Missing',
                minWidth: '110px',
                render: (value) => (
                  <Chip
                    size="small"
                    color={Number(value) > 0 ? 'warning' : 'success'}
                    label={Number(value)}
                  />
                ),
              },
            ]}
            data={sqaaEvidence || []}
            noDataText="No SQAAF evidence coverage found."
          />
        </SectionPanel>

        <SectionPanel title="Pending Reviews">
          <PerformanceDataTable
            tableId="performance-report-pending-actions"
            columns={[
              { id: 'employeeName', label: 'Employee', minWidth: '220px' },
              { id: 'action', label: 'Action', minWidth: '220px' },
              {
                id: 'dueDate',
                label: 'Due Date',
                minWidth: '140px',
                render: (value) => (value ? dayjs(value).format('DD MMM YYYY') : '-'),
              },
              {
                id: 'reviewId',
                label: 'PDF',
                isSort: false,
                isFilter: false,
                minWidth: '90px',
                render: (value) => (
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() =>
                      window.open(
                        getBackendApiUrl(`/hr/professional-management/reviews/${value}/pdf`),
                        '_blank'
                      )
                    }
                  >
                    Export
                  </Button>
                ),
              },
            ]}
            data={pendingActions || []}
            noDataText="No pending actions found."
          />
        </SectionPanel>
      </Stack>
    </PerformanceScrollableContent>
  );
}

function SqaaAuditPackSection() {
  const [boardType, setBoardType] = useState<PerformanceBoardType | ''>(PerformanceBoardType.CBSE);
  const [staffCategory, setStaffCategory] = useState<PerformanceStaffCategory | ''>(
    PerformanceStaffCategory.Teacher
  );
  const queryParams = {
    boardType: boardType === '' ? undefined : boardType,
    staffCategory: staffCategory === '' ? undefined : staffCategory,
  };
  const { data: auditPack, isFetching } = useGetPerformanceSqaaAuditPackQuery(queryParams);
  const [exportAuditPack, exportState] = useLazyGetPerformanceSqaaAuditPackExportQuery();
  const summary = summarizeSqaaAuditPack(auditPack);

  const handleExport = async () => {
    try {
      const file = await exportAuditPack(queryParams).unwrap();
      const binary = window.atob(file.contentBase64);
      const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
      const url = window.URL.createObjectURL(
        new Blob([bytes], { type: file.contentType || 'text/csv' })
      );
      const link = document.createElement('a');
      link.href = url;
      link.download = file.fileName || 'sqaaf-audit-pack.csv';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('SQAAF audit pack export is ready');
    } catch {
      toast.error('Unable to export SQAAF audit pack');
    }
  };

  return (
    <SectionPanel
      title="SQAAF Audit Pack"
      description="Principal/admin readiness view for Indian school audits, affiliation reviews, and evidence follow-up."
      action={
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1}
          flexWrap="wrap"
          useFlexGap
          sx={{
            width: '100%',
            '& .MuiTextField-root': { width: { xs: '100%', sm: 'auto' } },
            '& .MuiButton-root': { width: { xs: '100%', sm: 'auto' } },
          }}
        >
          <TextField
            select
            size="small"
            label="Board"
            value={boardType}
            onChange={(event) =>
              setBoardType(
                event.target.value === ''
                  ? ''
                  : (Number(event.target.value) as PerformanceBoardType)
              )
            }
            sx={{ minWidth: { xs: 0, sm: 140 } }}
          >
            <MenuItem value="">All boards</MenuItem>
            <MenuItem value={PerformanceBoardType.CBSE}>CBSE</MenuItem>
            <MenuItem value={PerformanceBoardType.GSEB}>GSEB</MenuItem>
            <MenuItem value={PerformanceBoardType.GenericIndian}>Generic</MenuItem>
          </TextField>
          <TextField
            select
            size="small"
            label="Staff"
            value={staffCategory}
            onChange={(event) =>
              setStaffCategory(
                event.target.value === ''
                  ? ''
                  : (Number(event.target.value) as PerformanceStaffCategory)
              )
            }
            sx={{ minWidth: { xs: 0, sm: 170 } }}
          >
            <MenuItem value="">All staff</MenuItem>
            {Object.entries(staffCategoryLabels).map(([value, label]) => (
              <MenuItem key={value} value={Number(value)}>
                {label}
              </MenuItem>
            ))}
          </TextField>
          <Button
            variant="contained"
            onClick={handleExport}
            disabled={exportState.isFetching}
            startIcon={<Iconify icon="mdi:download-outline" />}
          >
            Export Audit Pack
          </Button>
        </Stack>
      }
    >
      <Stack spacing={2}>
        {isFetching && <LinearProgress />}
        <Grid container spacing={1.5}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <MetricCard
              label="Readiness"
              value={summary.overallReadinessPercentage}
              icon="mdi:shield-check-outline"
              tone={summary.totalMissingEvidence > 0 ? 'warning' : 'success'}
              helper="% ready"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <MetricCard
              label="Missing Evidence"
              value={summary.totalMissingEvidence}
              icon="mdi:file-alert-outline"
              tone={summary.totalMissingEvidence > 0 ? 'warning' : 'success'}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <MetricCard
              label="Submitted Evidence"
              value={summary.totalEvidenceSubmitted}
              icon="mdi:file-check-outline"
              tone="info"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <MetricCard
              label="Domains Ready"
              value={summary.readyDomainCount}
              icon="mdi:domain"
              tone="success"
              helper={`${summary.totalDomainCount} tracked`}
            />
          </Grid>
        </Grid>

        <PerformanceDataTable
          tableId="performance-report-sqaaf-audit-pack-domains"
          columns={[
            {
              id: 'domain',
              label: 'SQAAF Domain',
              minWidth: '260px',
              render: (value) => sqaaDomainLabels[Number(value)] || '-',
            },
            {
              id: 'readinessPercentage',
              label: 'Ready',
              minWidth: '120px',
              render: (value) => (
                <Chip
                  size="small"
                  color={
                    Number(value) >= 80 ? 'success' : Number(value) > 0 ? 'warning' : 'default'
                  }
                  label={`${Number(value || 0)}%`}
                />
              ),
            },
            { id: 'templateCount', label: 'Templates', minWidth: '110px' },
            { id: 'assignedReviewCount', label: 'Reviews', minWidth: '110px' },
            { id: 'mappedCriteria', label: 'Criteria', minWidth: '110px' },
            { id: 'evidenceRequiredCriteria', label: 'Required', minWidth: '110px' },
            { id: 'evidenceSubmitted', label: 'Submitted', minWidth: '110px' },
            {
              id: 'missingEvidence',
              label: 'Missing',
              minWidth: '110px',
              render: (value) => (
                <Chip
                  size="small"
                  color={Number(value) > 0 ? 'warning' : 'success'}
                  label={Number(value)}
                />
              ),
            },
          ]}
          data={auditPack?.domains || []}
          noDataText="No SQAAF readiness domains found."
        />

        <PerformanceDataTable
          tableId="performance-report-sqaaf-audit-pack-missing-evidence"
          columns={[
            {
              id: 'domain',
              label: 'Domain',
              minWidth: '230px',
              render: (value) => sqaaDomainLabels[Number(value)] || '-',
            },
            { id: 'cycleName', label: 'Cycle', minWidth: '180px' },
            { id: 'employeeName', label: 'Staff', minWidth: '180px' },
            { id: 'employeeIdentifier', label: 'Code', minWidth: '120px' },
            { id: 'templateName', label: 'Template', minWidth: '220px' },
            { id: 'criterionName', label: 'Missing Evidence', minWidth: '260px' },
          ]}
          data={auditPack?.missingEvidenceItems || []}
          noDataText="No missing SQAAF evidence found for the selected filters."
        />
      </Stack>
    </SectionPanel>
  );
}

function RatingDistributionPanel({ distribution }: { distribution: any[] }) {
  const total = distribution.reduce((sum, item) => sum + Number(item.count || 0), 0);

  return (
    <SectionPanel title="Rating Distribution">
      <Stack spacing={1.25}>
        {distribution.map((item: any) => {
          const value = total ? (Number(item.count || 0) / total) * 100 : 0;
          return (
            <Box key={item.rating}>
              <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                <Typography variant="body2">{item.rating}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {item.count}
                </Typography>
              </Stack>
              <LinearProgress variant="determinate" value={value} />
            </Box>
          );
        })}
        {!distribution.length && <EmptyState text="No finalized ratings found." />}
      </Stack>
    </SectionPanel>
  );
}

function ReviewTable({
  rows,
  onOpen,
  actionLabel = 'Open',
}: {
  rows: ProfessionalReview[];
  onOpen?: (row: ProfessionalReview) => void;
  actionLabel?: string;
}) {
  return (
    <PerformanceDataTable
      tableId="performance-reviews"
      columns={[
        { id: 'employeeName', label: 'Employee', minWidth: '220px', sticky: true },
        { id: 'employeeIdentifier', label: 'Code', minWidth: '110px' },
        { id: 'cycleName', label: 'Cycle', minWidth: '200px' },
        { id: 'templateName', label: 'Template', minWidth: '190px' },
        {
          id: 'finalScore',
          label: 'Score',
          minWidth: '100px',
          render: (value) => (value ? `${Number(value).toFixed(2)}%` : '-'),
        },
        {
          id: 'status',
          label: 'Status',
          minWidth: '120px',
          render: (value) => (
            <Chip
              size="small"
              color={Number(value) === 3 ? 'success' : Number(value) === 4 ? 'warning' : 'default'}
              label={
                Number(value) === 3 ? 'Finalized' : Number(value) === 4 ? 'Reopened' : 'In Progress'
              }
            />
          ),
        },
        {
          id: 'actions',
          label: 'Actions',
          isSort: false,
          isFilter: false,
          sticky: true,
          minWidth: '90px',
          render: (_value, row) => (
            <Button
              size="small"
              variant="outlined"
              disabled={!onOpen}
              onClick={() => onOpen?.(row as ProfessionalReview)}
            >
              {actionLabel}
            </Button>
          ),
        },
      ]}
      data={rows}
      noDataText="No performance reviews found."
    />
  );
}

function CycleDialog({
  open,
  onClose,
  onCreate,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (body: any) => Promise<void>;
}) {
  const [name, setName] = useState('Annual Appraisal');
  const [periodStart, setPeriodStart] = useState(dayjs());
  const [periodEnd, setPeriodEnd] = useState(dayjs().add(1, 'year'));
  const isCyclePeriodInvalid = !periodEnd.isAfter(periodStart, 'day');

  return (
    <CustomDialog open={open} handleClose={onClose} title="New performance cycle">
      <Stack spacing={2} sx={{ p: 2, bgcolor: 'background.default' }}>
        <TextField
          label="Cycle Name"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        <DatePicker
          label="Period Start"
          value={periodStart}
          onChange={(value) => value && setPeriodStart(value)}
        />
        <DatePicker
          label="Period End"
          value={periodEnd}
          onChange={(value) => value && setPeriodEnd(value)}
        />
      </Stack>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          disabled={!name.trim() || isCyclePeriodInvalid}
          onClick={() => {
            if (isCyclePeriodInvalid) {
              toast.error('Period end must be after period start');
              return;
            }

            onCreate({
              name,
              cycleType: 0,
              periodStart: periodStart.startOf('day').toISOString(),
              periodEnd: periodEnd.startOf('day').toISOString(),
              selfReviewDueDate: periodStart.add(14, 'day').toISOString(),
              reviewerDueDate: periodStart.add(28, 'day').toISOString(),
              finalizationDueDate: periodStart.add(42, 'day').toISOString(),
              ratingScaleMax: 5,
              allowNotApplicable: true,
              status: 0,
            });
          }}
        >
          Create
        </Button>
      </DialogActions>
    </CustomDialog>
  );
}

function ReviewWorkspace({
  reviewId,
  onClose,
  initialPanel = 'review',
}: {
  reviewId: string | null;
  onClose: () => void;
  initialPanel?: 'review' | 'self' | 'observation' | 'outcome';
}) {
  const { data: review } = useGetPerformanceReviewQuery(reviewId || '', { skip: !reviewId });
  const [saveSelfAppraisal] = useSavePerformanceSelfAppraisalMutation();
  const [saveReviewerStage] = useSavePerformanceReviewerStageMutation();
  const [submitStage] = useSubmitPerformanceStageMutation();
  const [saveOutcome] = useSavePerformanceOutcomeMutation();
  const [addObservation] = useAddPerformanceObservationMutation();
  const [addEvidence] = useAddPerformanceEvidenceMutation();
  const [addFeedback] = useAddPerformanceFeedbackMutation();
  const [addDevelopmentPlan] = useAddPerformanceDevelopmentPlanMutation();
  const [stageType, setStageType] = useState<number>(initialPanel === 'outcome' ? 3 : 0);
  const [summary, setSummary] = useState('');
  const [ratings, setRatings] = useState<Record<string, number>>({});

  const criteria = useMemo(
    () => review?.template?.sections?.flatMap((section) => section.criteria || []) || [],
    [review?.template?.sections]
  );
  const evidenceCriterion =
    criteria.find((criterion: any) => criterion.evidenceRequired) || criteria[0];
  const responses = criteria.map((criterion: any) => ({
    criterionId: criterion.id,
    rating: ratings[criterion.id] ?? 4,
    isNotApplicable: false,
    comment: summary,
  }));
  const averageRating = responses.length
    ? responses.reduce((sum, response) => sum + Number(response.rating || 0), 0) / responses.length
    : 0;

  useEffect(() => {
    if (!criteria.length) return;

    setRatings((current) => {
      const next = { ...current };
      criteria.forEach((criterion: any) => {
        if (criterion.id && next[criterion.id] === undefined) {
          next[criterion.id] = 4;
        }
      });
      return next;
    });
  }, [criteria]);

  if (!reviewId) return null;

  return (
    <CustomDialog
      open={Boolean(reviewId)}
      handleClose={onClose}
      title="Performance review workspace"
      maxWidth="sm"
    >
      <Stack
        spacing={2}
        sx={{
          p: 2,
          bgcolor: 'background.default',
          maxWidth: '100%',
          maxHeight: 'calc(100vh - 160px)',
          overflow: 'auto',
        }}
      >
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={1.5}>
          <Box>
            <Typography variant="h6">{review?.employeeName}</Typography>
            <Typography variant="body2" color="text.secondary">
              {review?.cycleName} - {review?.templateName || 'Template pending'}
            </Typography>
          </Box>
          <Chip label={review?.finalRating || 'Not finalized'} />
        </Stack>

        <TextField
          select
          label="Review Stage"
          value={stageType}
          onChange={(event) => setStageType(Number(event.target.value))}
        >
          {Object.entries(stageLabels).map(([value, label]) => (
            <MenuItem key={value} value={Number(value)}>
              {label}
            </MenuItem>
          ))}
        </TextField>

        <Paper
          variant="outlined"
          sx={{
            p: 2,
            borderRadius: 1,
            bgcolor: 'background.paper',
            borderColor: (theme) =>
              theme.palette.mode === 'dark' ? 'rgba(145, 158, 171, 0.24)' : 'divider',
          }}
        >
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Criteria Ratings
          </Typography>
          <Stack spacing={1.5}>
            {criteria.slice(0, 8).map((criterion: any) => (
              <Stack
                key={criterion.id}
                direction={{ xs: 'column', sm: 'row' }}
                alignItems={{ xs: 'flex-start', sm: 'center' }}
                justifyContent="space-between"
                spacing={1}
              >
                <Typography variant="body2" sx={{ minWidth: 0, flex: 1 }}>
                  {criterion.name}
                </Typography>
                <Rating
                  sx={{ flexShrink: 0 }}
                  value={ratings[criterion.id] ?? 4}
                  onChange={(_, value) =>
                    setRatings((current) => ({ ...current, [criterion.id]: value || 0 }))
                  }
                />
              </Stack>
            ))}
            {!criteria.length && <EmptyState text="No criteria are available for this review." />}
          </Stack>
        </Paper>

        <TextField
          label="Stage comment"
          multiline
          minRows={3}
          value={summary}
          onChange={(event) => setSummary(event.target.value)}
        />

        <Divider />

        <Stack
          direction="row"
          flexWrap="wrap"
          gap={1}
          sx={{ '& .MuiButton-root': { flexShrink: 0 } }}
        >
          <Button
            variant="outlined"
            onClick={async () => {
              const body = {
                stageType,
                summaryComment: summary,
                responses,
              };
              if (stageType === 0) {
                await saveSelfAppraisal({ id: reviewId, body }).unwrap();
              } else {
                await saveReviewerStage({ id: reviewId, body }).unwrap();
              }
              toast.success('Draft saved');
            }}
          >
            Save Draft
          </Button>
          <Button
            variant="contained"
            onClick={async () => {
              await submitStage({
                id: reviewId,
                body: {
                  stageType,
                  summaryComment: summary,
                  responses,
                },
              }).unwrap();
              toast.success(`${stageLabels[stageType]} submitted`);
            }}
          >
            Submit Stage
          </Button>
          <Button
            variant="outlined"
            onClick={async () => {
              await addObservation({
                id: reviewId,
                body: {
                  observationDate: new Date().toISOString(),
                  className: 'Class Observation',
                  subjectName: 'Subject',
                  lessonObjectiveScore: 4,
                  studentEngagementScore: 4,
                  classroomManagementScore: 4,
                  assessmentScore: 4,
                  notes: summary || 'Classroom observation recorded.',
                },
              }).unwrap();
              toast.success('Observation added');
            }}
          >
            Add Observation
          </Button>
          <Button
            variant="outlined"
            onClick={async () => {
              await addEvidence({
                id: reviewId,
                body: {
                  criterionId: evidenceCriterion?.id,
                  title: 'Review evidence',
                  notes: summary || 'Evidence noted.',
                },
              }).unwrap();
              toast.success('Evidence added');
            }}
          >
            Add Evidence
          </Button>
          <Button
            variant="outlined"
            onClick={async () => {
              await addFeedback({
                id: reviewId,
                body: { source: 3, feedbackText: summary || 'Qualitative feedback recorded.' },
              }).unwrap();
              toast.success('Feedback added');
            }}
          >
            Add Feedback
          </Button>
          <Button
            variant="outlined"
            onClick={async () => {
              await addDevelopmentPlan({
                id: reviewId,
                body: {
                  goal: 'Professional development follow-up',
                  actionPlan: summary || 'Training or mentoring action to be tracked.',
                  status: 0,
                },
              }).unwrap();
              toast.success('Development plan added');
            }}
          >
            Add Development Plan
          </Button>
          <Button
            color="success"
            variant="contained"
            onClick={async () => {
              await saveOutcome({
                id: reviewId,
                body: {
                  finalRating: averageRating >= 4 ? 'Very Good' : 'Good',
                  strengths: summary,
                  improvementAreas: '',
                  recommendation: averageRating >= 4 ? 1 : 6,
                  recommendationNotes: 'Recommendation only; payroll is not updated automatically.',
                  incrementRecommended: averageRating >= 4,
                  promotionRecommended: false,
                },
              }).unwrap();
              toast.success('Outcome finalized');
              onClose();
            }}
          >
            Finalize Outcome
          </Button>
        </Stack>
      </Stack>
    </CustomDialog>
  );
}
