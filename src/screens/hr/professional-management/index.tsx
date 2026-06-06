'use client';

import dayjs from 'dayjs';
import { toast } from 'sonner';
import { DatePicker } from '@mui/x-date-pickers';
import { Iconify } from 'src/components/iconify';
import CustomDialog from 'src/components/customDialog';
import { CustomTabs } from 'src/components/custom-tabs';
import React, { useMemo, useState, useEffect } from 'react';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import {
  Box,
  Tab,
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
  DialogActions,
  LinearProgress,
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
  useGetPerformanceIncrementRecommendationsQuery,
  useMoveProfessionalReviewCycleToCalibrationMutation,
} from 'src/redux/hr/professional-management-api';

import {
  stageLabels,
  boardTypeLabels,
  sqaaDomainLabels,
  cycleStatusLabels,
  staffCategoryLabels,
  isTemplatePublishable,
  getSectionWeightTotal,
} from './performance-utils';

const tabs = [
  ['setup', 'Guided Setup', 'mdi:school-outline'],
  ['dashboard', 'Dashboard', 'mdi:view-dashboard-outline'],
  ['templates', 'Templates', 'mdi:clipboard-edit-outline'],
  ['cycles', 'Cycles', 'mdi:calendar-sync-outline'],
  ['my-review', 'My Review', 'mdi:account-edit-outline'],
  ['reviews', 'Reviews', 'mdi:account-check-outline'],
  ['observations', 'Observations', 'mdi:school-outline'],
  ['calibration', 'Calibration', 'mdi:scale-balance'],
  ['outcomes', 'Outcomes', 'mdi:trophy-outline'],
  ['development', 'Development', 'mdi:target-arrow'],
  ['reports', 'Reports', 'mdi:chart-box-outline'],
] as const;

const getBackendApiUrl = (path: string) => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
  return `${baseUrl}/api${path}`;
};

const ProfessionalManagementScreen = () => {
  const [tab, setTab] = useState('setup');

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CustomBreadcrumbs
        heading="Performance Management"
        description="Run school-ready appraisals with templates, self-review, reviewer stages, observations, outcomes, and development plans."
        links={[{ name: 'HR' }, { name: 'Performance Management' }]}
      />

      <CustomTabs
        value={tab}
        onChange={(_, value) => setTab(value)}
        sx={{
          mb: 2,
          minHeight: 42,
          '& .MuiTabs-scroller': { overflowX: 'auto !important' },
          '& .MuiTab-root': {
            minHeight: 42,
            px: 1.25,
            gap: 0.75,
            whiteSpace: 'nowrap',
          },
        }}
        variant="scrollable"
        scrollButtons="auto"
      >
        {tabs.map(([value, label, icon]) => (
          <Tab
            key={value}
            value={value}
            label={label}
            iconPosition="start"
            icon={<Iconify icon={icon} width={18} />}
          />
        ))}
      </CustomTabs>

      <Box sx={{ minWidth: 0, flex: 1 }}>
        {tab === 'setup' && <GuidedSetupTab />}
        {tab === 'dashboard' && <DashboardTab />}
        {tab === 'templates' && <TemplatesTab />}
        {tab === 'cycles' && <CyclesTab />}
        {tab === 'my-review' && <MyReviewTab />}
        {tab === 'reviews' && <ReviewsTab />}
        {tab === 'observations' && <ObservationsTab />}
        {tab === 'calibration' && <CalibrationTab />}
        {tab === 'outcomes' && <OutcomesTab />}
        {tab === 'development' && <DevelopmentPlansTab />}
        {tab === 'reports' && <ReportsTab />}
      </Box>
    </Box>
  );
};

export default ProfessionalManagementScreen;

function SectionPanel({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 1 }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems={{ xs: 'stretch', sm: 'center' }}
        justifyContent="space-between"
        spacing={1.5}
        sx={{ mb: 1.5 }}
      >
        <Typography variant="subtitle1">{title}</Typography>
        {action}
      </Stack>
      {children}
    </Paper>
  );
}

function TabHeader({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={1.5}
      alignItems={{ xs: 'stretch', sm: 'center' }}
      justifyContent="space-between"
    >
      <Typography variant="h6">{title}</Typography>
      {action}
    </Stack>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>
      {text}
    </Typography>
  );
}

function MetricCard({
  label,
  value,
  icon,
  tone = 'primary',
}: {
  label: string;
  value?: number;
  icon: string;
  tone?: 'primary' | 'info' | 'warning' | 'success' | 'error';
}) {
  return (
    <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 1, height: '100%' }}>
      <Stack direction="row" alignItems="center" spacing={1.25}>
        <Box
          sx={{
            width: 34,
            height: 34,
            borderRadius: 1,
            display: 'grid',
            placeItems: 'center',
            bgcolor: `${tone}.lighter`,
            color: `${tone}.main`,
            flexShrink: 0,
          }}
        >
          <Iconify icon={icon} width={19} />
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="h5" sx={{ lineHeight: 1.1 }}>
            {value ?? 0}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap>
            {label}
          </Typography>
        </Box>
      </Stack>
    </Paper>
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
    <Stack spacing={2}>
      {(defaultsLoading || templatesLoading || cyclesLoading) && <LinearProgress />}
      <TabHeader title="Indian school appraisal setup" />

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 4 }}>
          <SectionPanel title="1. Choose school board">
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
          <SectionPanel title="2. Start appraisal cycle">
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
          <SectionPanel title="3. Readiness snapshot">
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

      <SectionPanel title="SQAAF evidence coverage">
        <CustomizableTable
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
  );
}

function DashboardTab() {
  const { data, isLoading, isError } = useGetPerformanceDashboardQuery();
  const { data: pending } = useGetPerformanceReviewsQuery({ status: 2 });
  const { data: pendingActions } = useGetPerformancePendingActionsQuery({});
  const rows = pending?.items || [];

  return (
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
            label="Finalized"
            value={data?.finalizedReviews}
            icon="mdi:check-decagram-outline"
            tone="success"
          />
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 7 }}>
          <SectionPanel title="Pending Actions">
            <Stack spacing={1}>
              {(pendingActions || []).slice(0, 7).map((item: any) => (
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
        <Grid size={{ xs: 12, md: 5 }}>
          <Grid container spacing={1.5}>
            <Grid size={{ xs: 12, sm: 6, md: 12 }}>
              <MetricCard
                label="Training Recommendations"
                value={data?.trainingRecommendations}
                icon="mdi:school-outline"
                tone="info"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 12 }}>
              <MetricCard
                label="Increment Recommendations"
                value={data?.incrementRecommendations}
                icon="mdi:cash-plus"
                tone="success"
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      <SectionPanel title="Live Review Queue">
        <ReviewTable rows={rows} />
      </SectionPanel>
    </Stack>
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
    <Stack spacing={2}>
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

      <CustomizableTable
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
    <Stack spacing={2}>
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
      <CustomizableTable
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
    <Stack spacing={2}>
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
    <Stack spacing={2}>
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
    <Stack spacing={2}>
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
    <Stack spacing={2}>
      {isLoading && <LinearProgress />}
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 4 }}>
          <RatingDistributionPanel distribution={distribution || []} />
        </Grid>
        <Grid size={{ xs: 12, md: 8 }}>
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
    <Stack spacing={2}>
      {isLoading && <LinearProgress />}
      <TabHeader title="Development plans and training needs" />
      <CustomizableTable
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
    <Stack spacing={2}>
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
    <Stack spacing={2}>
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
        <CustomizableTable
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
        <CustomizableTable
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
    <CustomizableTable
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
      <Stack spacing={2} sx={{ p: 2, bgcolor: 'background.neutral' }}>
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
    >
      <Stack spacing={2} sx={{ p: 2, bgcolor: 'background.neutral', minWidth: { md: 720 } }}>
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

        <Paper variant="outlined" sx={{ p: 2, borderRadius: 1 }}>
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
                <Typography variant="body2">{criterion.name}</Typography>
                <Rating
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

        <Stack direction="row" flexWrap="wrap" gap={1}>
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
                  observerEmployeeId: review?.employeeId,
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
