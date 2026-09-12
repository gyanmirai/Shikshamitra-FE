'use client';

import type { ReactNode } from 'react';
import type { TooltipProps } from '@mui/material';
import type { IData } from 'src/components/customizabaleTable/types';

import dayjs from 'dayjs';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { Label } from 'src/components/label';
import { useState, useCallback } from 'react';
import { DatePicker } from '@mui/x-date-pickers';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { CustomTabs } from 'src/components/custom-tabs';
import { studentPaths } from 'src/constants/student-menu';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { useRouter, usePathname, useSearchParams } from 'src/routes/hooks';
import { useFinanceAcademicFilters } from 'src/screens/finance/hooks/useFinanceAcademicFilters';
import {
  Box,
  Tab,
  Card,
  Paper,
  Stack,
  Alert,
  Button,
  Drawer,
  Switch,
  Divider,
  Tooltip,
  Checkbox,
  MenuItem,
  TextField,
  IconButton,
  Typography,
  FormControlLabel,
} from '@mui/material';

import { useOnboardingSettings } from '../onboarding-settings-context';
import { OnboardingConfigurationScopeBar } from '../onboarding-configuration-scope-bar';
import { OnboardingSettingsBreadcrumbInfo } from './onboarding-settings-breadcrumb-info';
import {
  formatGrNumber,
  findRollNumberConfiguration,
  isGrConfigurationApplicable,
  findDivisionChangeConfiguration,
  defaultDivisionChangeConfiguration,
} from '../onboarding-settings-model';

import type {
  DivisionChangeRules,
  AssignmentModePolicy,
  GrNumberConfiguration,
  BoardApplicabilityMode,
  RollNumberConfiguration,
  DivisionChangeConfiguration,
} from '../onboarding-settings-model';

const rollArrangeByOptions = [
  { value: 'studentName', label: 'Student Name' },
  { value: 'admissionDate', label: 'Admission Date' },
  { value: 'admissionNumber', label: 'Admission No.' },
  { value: 'grNumber', label: 'GR No.' },
];

const rollArrangeTypeOptions = [
  { value: 'ascending', label: 'Ascending' },
  { value: 'descending', label: 'Descending' },
];

const rollNumberScopeOptions = [
  { value: 'class-division', label: 'Class and Division' },
  { value: 'class', label: 'Entire Class' },
];

const rollAssignmentTimingOptions = [
  { value: 'after-division', label: 'After Division assignment' },
  { value: 'during-activation', label: 'During activation' },
  { value: 'first-academic-day', label: 'On first academic day' },
  { value: 'manual-bulk', label: 'Manual bulk assignment' },
];

const midYearHandlingOptions = [
  { value: 'next-available', label: 'Next available number' },
  { value: 'insert-without-recalculation', label: 'Insert alphabetically, preserve others' },
  { value: 'insert-and-recalculate', label: 'Insert and recalculate' },
  { value: 'manual', label: 'Manual assignment' },
];

const divisionStrategyOptions = [
  { value: 'next-available', label: 'Next available Division' },
  { value: 'balance-count', label: 'Balance student count' },
  { value: 'balance-tolerance', label: 'Balance within tolerance' },
  { value: 'sequential', label: 'Fill Divisions sequentially' },
  { value: 'preserve-preferred', label: 'Preserve preferred Division' },
];

type BoardOption = { id: string; name: string };

const boardTargetsOverlap = (
  first: { boardMode: BoardApplicabilityMode; boardIds: string[] },
  second: { boardMode: BoardApplicabilityMode; boardIds: string[] }
) =>
  (first.boardMode === 'all' && second.boardMode === 'all') ||
  (first.boardMode === 'selected' &&
    second.boardMode === 'selected' &&
    first.boardIds.some((boardId) => second.boardIds.includes(boardId)));

const getBoardApplicabilityLabel = (
  configuration: { boardMode: BoardApplicabilityMode; boardIds: string[] },
  boards: BoardOption[]
) => {
  if (configuration.boardMode === 'all') return 'All boards';
  const names = boards
    .filter((board) => configuration.boardIds.includes(board.id))
    .map((board) => board.name);
  return names.join(', ') || `${configuration.boardIds.length} selected board(s)`;
};

function BoardApplicabilityFields({
  boardMode,
  boardIds,
  boards,
  onModeChange,
  onBoardIdsChange,
  error,
}: {
  boardMode: BoardApplicabilityMode;
  boardIds: string[];
  boards: BoardOption[];
  onModeChange: (mode: BoardApplicabilityMode) => void;
  onBoardIdsChange: (boardIds: string[]) => void;
  error?: string;
}) {
  const selectedBoardId = boardMode === 'all' ? '__all_boards__' : (boardIds[0] ?? '');
  const selectedBoardName = boards.find((board) => board.id === boardIds[0])?.name;

  return (
    <TextField
      select
      fullWidth
      size="small"
      label="Board"
      value={selectedBoardId}
      onChange={(event) => {
        const nextBoardId = event.target.value;

        if (nextBoardId === '__all_boards__') {
          onModeChange('all');
          onBoardIdsChange([]);
          return;
        }

        onModeChange('selected');
        onBoardIdsChange([nextBoardId]);
      }}
      error={Boolean(error)}
      helperText={
        error ||
        (boardMode === 'selected' && selectedBoardName
          ? `This rule applies only to ${selectedBoardName}.`
          : boards.length
            ? 'All boards is the fallback; choose a Board to create a specific override.'
            : 'No Board options are available for the selected academic year.')
      }
    >
      <MenuItem value="__all_boards__">All boards</MenuItem>
      {boards.map((board) => (
        <MenuItem key={board.id} value={board.id}>
          {board.name}
        </MenuItem>
      ))}
    </TextField>
  );
}

export function SettingsDrawer({
  open,
  title,
  description,
  icon,
  statusLabel,
  footerNote,
  onClose,
  children,
  onSubmit,
  submitLabel = 'Apply configuration',
  submitIcon = 'mdi:content-save-outline',
  submitDisabled = false,
  onReset,
  resetDisabled = false,
  showCancel = true,
}: {
  open: boolean;
  title: string;
  description: string;
  icon: string;
  statusLabel: string;
  footerNote: string;
  onClose: () => void;
  children: ReactNode;
  onSubmit: () => void;
  submitLabel?: string;
  submitIcon?: string;
  submitDisabled?: boolean;
  onReset?: () => void;
  resetDisabled?: boolean;
  showCancel?: boolean;
}) {
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      transitionDuration={{ enter: 300, exit: 250 }}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 'min(760px, 95vw)' },
          maxWidth: '100%',
          display: 'flex',
          flexDirection: 'column',
          overflowX: 'hidden',
          overscrollBehavior: 'contain',
        },
      }}
    >
      <Stack
        component="header"
        direction="row"
        justifyContent="space-between"
        alignItems="flex-start"
        spacing={2}
        sx={{
          p: { xs: 1.5, sm: 2 },
          flexShrink: 0,
          bgcolor: 'background.paper',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Stack direction="row" spacing={1.25} alignItems="center" sx={{ minWidth: 0 }}>
          <Box
            sx={{
              width: 44,
              height: 44,
              flexShrink: 0,
              display: 'grid',
              placeItems: 'center',
              borderRadius: '50%',
              bgcolor: 'action.selected',
              color: 'text.secondary',
            }}
          >
            <Iconify icon={icon} width={22} />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography component="h2" variant="subtitle1" fontWeight={700}>
              {title}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {description}
            </Typography>
          </Box>
        </Stack>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ flexShrink: 0 }}>
          <Label
            color="default"
            variant="outlined"
            sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
          >
            {statusLabel}
          </Label>
          <IconButton
            aria-label={`Close ${title}`}
            onClick={onClose}
            sx={{ minWidth: 44, minHeight: 44 }}
          >
            <Iconify icon="mdi:close" width={20} />
          </IconButton>
        </Stack>
      </Stack>
      <Scrollbar sx={{ flex: 1, minHeight: 0, p: { xs: 1.5, sm: 2 } }}>{children}</Scrollbar>
      <Divider />
      <Stack
        component="footer"
        direction={{ xs: 'column', sm: 'row' }}
        alignItems={{ sm: 'center' }}
        justifyContent="space-between"
        gap={1}
        sx={{ px: 2, py: 1.25, flexShrink: 0, bgcolor: 'background.paper' }}
      >
        <Typography variant="caption" color="text.secondary" sx={{ flex: 1 }}>
          {footerNote}
        </Typography>
        <Stack direction="row" justifyContent="flex-end" gap={1} sx={{ flexShrink: 0 }}>
          {onReset ? (
            <Button
              variant="outlined"
              size="small"
              startIcon={<Iconify icon="mdi:refresh" width={16} />}
              disabled={resetDisabled}
              onClick={onReset}
              sx={{ borderRadius: 1.5 }}
            >
              Reset
            </Button>
          ) : null}
          {showCancel ? (
            <Button variant="outlined" size="small" onClick={onClose} sx={{ borderRadius: 1.5 }}>
              Cancel
            </Button>
          ) : null}
          <Button
            variant="contained"
            size="small"
            startIcon={<Iconify icon={submitIcon} width={16} />}
            disabled={submitDisabled}
            onClick={onSubmit}
            sx={{ borderRadius: 1.5 }}
          >
            {submitLabel}
          </Button>
        </Stack>
      </Stack>
    </Drawer>
  );
}

export function SettingsSectionCard({
  icon,
  title,
  description,
  children,
}: {
  icon: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <Card variant="outlined" sx={{ p: { xs: 1.5, sm: 2 } }}>
      <Stack spacing={1.5}>
        <Stack direction="row" spacing={1} alignItems="flex-start">
          <Box
            sx={{
              width: 36,
              height: 36,
              flexShrink: 0,
              display: 'grid',
              placeItems: 'center',
              borderRadius: 1,
              bgcolor: 'background.neutral',
              color: 'text.secondary',
            }}
          >
            <Iconify icon={icon} width={20} />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography component="h3" variant="subtitle2">
              {title}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {description}
            </Typography>
          </Box>
        </Stack>
        <Stack spacing={1.5}>{children}</Stack>
      </Stack>
    </Card>
  );
}

function NumberingWorkspaceBar({
  title,
  icon,
  summaries,
  assignmentMode,
  onAssignmentModeChange,
  buttonLabel,
  buttonIcon = 'mdi:plus',
  onClick,
}: {
  title: string;
  icon: string;
  summaries: string[];
  assignmentMode?: AssignmentModePolicy;
  onAssignmentModeChange?: (mode: AssignmentModePolicy) => void;
  buttonLabel: string;
  buttonIcon?: string;
  onClick: () => void;
}) {
  return (
    <Paper variant="outlined" sx={{ p: 1.25, flexShrink: 0 }}>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        alignItems={{ md: 'center' }}
        justifyContent="space-between"
        spacing={1.25}
      >
        <Stack direction="row" alignItems="center" spacing={1.25} sx={{ minWidth: 0 }}>
          <Box
            sx={{
              width: 34,
              height: 34,
              display: 'grid',
              placeItems: 'center',
              borderRadius: 1,
              bgcolor: 'action.hover',
              color: 'text.secondary',
            }}
          >
            <Iconify icon={icon} width={20} />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="subtitle2">{title}</Typography>
            <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap" useFlexGap>
              {summaries.map((summary, index) => (
                <Typography key={summary} variant="caption" color="text.secondary" noWrap>
                  {index ? '· ' : ''}
                  {summary}
                </Typography>
              ))}
            </Stack>
          </Box>
        </Stack>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1}
          alignItems={{ sm: 'center' }}
          sx={{ width: { xs: '100%', md: 'auto' }, flexShrink: 0 }}
        >
          {assignmentMode && onAssignmentModeChange ? (
            <TextField
              select
              size="small"
              label="Assignment method"
              value={assignmentMode}
              onChange={(event) =>
                onAssignmentModeChange(event.target.value as AssignmentModePolicy)
              }
              sx={{ minWidth: { xs: '100%', sm: 210 } }}
            >
              <MenuItem value="automatic">Automatic only</MenuItem>
              <MenuItem value="manual">Manual only</MenuItem>
              <MenuItem value="both">Automatic and manual</MenuItem>
            </TextField>
          ) : null}
          <Button
            variant="contained"
            size="small"
            startIcon={<Iconify icon={buttonIcon} width={16} />}
            onClick={onClick}
            sx={{ minHeight: 40, borderRadius: 1.5, whiteSpace: 'nowrap' }}
          >
            {buttonLabel}
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
}

const grSchema = Yup.object({
  name: Yup.string().trim().required('Enter a series name').max(80),
  prefix: Yup.string().max(12, 'Prefix must be 12 characters or fewer'),
  startingNumber: Yup.number().integer().min(1, 'Starting number must be at least 1').required(),
  padding: Yup.number().integer().min(1).max(12, 'Padding must be between 1 and 12').required(),
  suffix: Yup.string().max(12, 'Suffix must be 12 characters or fewer'),
  formatPattern: Yup.string()
    .trim()
    .required('Enter a format pattern')
    .test('sequence-token', 'Format must include {SEQUENCE}', (value) =>
      Boolean(value?.includes('{SEQUENCE}'))
    ),
  applicableProfileIds: Yup.array()
    .of(Yup.string().required())
    .min(1, 'Select at least one onboarding profile'),
  boardMode: Yup.string().oneOf(['all', 'selected']).required(),
  boardIds: Yup.array()
    .of(Yup.string().required())
    .when('boardMode', {
      is: 'selected',
      then: (schema) => schema.length(1, 'Select one specific Board'),
    }),
  sequenceScope: Yup.string().required(),
  resetPolicy: Yup.string().required(),
  maximumNumber: Yup.number()
    .nullable()
    .transform((value, originalValue) => (originalValue === '' ? null : value))
    .integer('Maximum number must be a whole number')
    .test(
      'after-start',
      'Maximum number must be greater than or equal to the starting number',
      function validateMaximum(value) {
        return value === null || value === undefined || value >= Number(this.parent.startingNumber);
      }
    ),
  manualEntryAllowed: Yup.boolean().required(),
  requireManualReason: Yup.boolean().required(),
  requireManualApproval: Yup.boolean().required(),
  effectiveFrom: Yup.string(),
  isActive: Yup.boolean().required(),
});

const rollSchema = Yup.object({
  classId: Yup.string().required('Select a class'),
  boardMode: Yup.string().oneOf(['all', 'selected']).required(),
  boardIds: Yup.array()
    .of(Yup.string().required())
    .when('boardMode', {
      is: 'selected',
      then: (schema) => schema.length(1, 'Select one specific Board'),
    }),
  numberingScope: Yup.string().required('Select a numbering scope'),
  assignmentTiming: Yup.string().required('Select assignment timing'),
  midYearHandling: Yup.string().required('Select mid-year handling'),
  arrangeBy: Yup.string().required('Select an arrange-by option'),
  arrangeType: Yup.string().required('Select an arrange type'),
  tieBreakerOne: Yup.string(),
  tieBreakerOneDirection: Yup.string(),
  tieBreakerTwo: Yup.string(),
  tieBreakerTwoDirection: Yup.string(),
  startingNumber: Yup.number().integer().min(1, 'Starting number must be at least 1').required(),
  preserveExisting: Yup.boolean().required(),
  allowIndividualLocks: Yup.boolean().required(),
  requireChangeReason: Yup.boolean().required(),
  requireApproval: Yup.boolean().required(),
  effectiveFrom: Yup.string(),
  isActive: Yup.boolean().required(),
});

type GrNumberFormValues = Omit<GrNumberConfiguration, 'id'>;

const createGrNumberFormValues = (): GrNumberFormValues => ({
  name: '',
  boardMode: 'all',
  boardIds: [],
  prefix: 'GR-',
  startingNumber: 1,
  padding: 6,
  suffix: '',
  formatPattern: '{PREFIX}{SEQUENCE}{SUFFIX}',
  applicableProfileIds: [],
  sequenceScope: 'school',
  resetPolicy: 'continuous',
  maximumNumber: null,
  manualEntryAllowed: true,
  requireManualReason: true,
  requireManualApproval: true,
  effectiveFrom: '',
  isActive: true,
});

const hasGrSeriesOverlap = (
  candidate: GrNumberConfiguration,
  configurations: GrNumberConfiguration[]
) =>
  configurations.some((existing) => {
    if (existing.id === candidate.id || !existing.isActive || !candidate.isActive) return false;
    const sharesProfile = candidate.applicableProfileIds.some((profileId) =>
      existing.applicableProfileIds.includes(profileId)
    );
    const existingMaximum = existing.maximumNumber ?? Number.POSITIVE_INFINITY;
    const candidateMaximum = candidate.maximumNumber ?? Number.POSITIVE_INFINITY;
    const sharesRange =
      candidate.startingNumber <= existingMaximum && existing.startingNumber <= candidateMaximum;
    const sharesFormat =
      existing.formatPattern === candidate.formatPattern &&
      existing.prefix === candidate.prefix &&
      existing.suffix === candidate.suffix &&
      existing.padding === candidate.padding;

    return (
      boardTargetsOverlap(candidate, existing) &&
      sharesProfile &&
      sharesRange &&
      sharesFormat &&
      existing.sequenceScope === candidate.sequenceScope &&
      existing.resetPolicy === candidate.resetPolicy
    );
  });

function SettingsPageHeader({ title, description }: { title: string; description: string }) {
  return (
    <CustomBreadcrumbs
      heading={title}
      description=" "
      tooltipProps={
        {
          title: (
            <OnboardingSettingsBreadcrumbInfo
              title={`${title} settings`}
              description={description}
              items={[
                'Review the rules for the active configuration scope.',
                'Add or edit a configuration from the settings workspace.',
              ]}
            />
          ),
          sx: { textAlign: 'left' },
        } as TooltipProps
      }
      links={[
        { name: 'Student Management', href: studentPaths.dashboard },
        { name: 'Student Onboarding', href: studentPaths.onboarding.setup },
        { name: 'Settings', href: studentPaths.onboarding.settings },
        { name: title },
      ]}
      slotProps={{
        action: {},
        heading: { overflowWrap: 'normal', textWrap: 'wrap' },
        moreLink: {},
        breadcrumbs: { display: { xs: 'none', md: 'block' } },
      }}
      sx={{
        flexDirection: { xs: 'column !important', md: 'row !important' },
        alignItems: { xs: 'stretch', md: 'center' },
        gap: { xs: 0, md: 2 },
        minHeight: { xs: 'auto', md: 56 },
        py: { xs: 0.75, md: 0 },
        '& .MuiBreadcrumbs-root': { display: { xs: 'none', md: 'block' } },
        '& .MuiTypography-h6': { overflowWrap: 'normal !important' },
      }}
    />
  );
}

export function GrNumberSettingsScreen({ embedded = false }: { embedded?: boolean }) {
  const filters = useFinanceAcademicFilters();
  const { settings, scope, saveGrNumberConfiguration, setGrAssignmentMode } =
    useOnboardingSettings();
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingConfigurationId, setEditingConfigurationId] = useState<string | null>(null);
  const { configurations } = settings.grNumber;
  const formik = useFormik<GrNumberFormValues>({
    initialValues: createGrNumberFormValues(),
    validationSchema: grSchema,
    onSubmit: (values, helpers) => {
      const configuration: GrNumberConfiguration = {
        ...values,
        id: editingConfigurationId ?? `gr-session-${Date.now()}`,
      };

      if (hasGrSeriesOverlap(configuration, configurations)) {
        helpers.setStatus(
          'This active series overlaps another series for the same profiles, format, scope, and number range.'
        );
        return;
      }

      saveGrNumberConfiguration(configuration);
      helpers.resetForm();
      setEditingConfigurationId(null);
      setEditorOpen(false);
    },
  });

  const openNewConfiguration = () => {
    setEditingConfigurationId(null);
    formik.resetForm({
      values: {
        ...createGrNumberFormValues(),
        boardMode: 'all',
        boardIds: [],
        applicableProfileIds: settings.onboardingProfiles.map((profile) => profile.id),
      },
    });
    setEditorOpen(true);
  };

  const openExistingConfiguration = (configuration: GrNumberConfiguration) => {
    setEditingConfigurationId(configuration.id);
    formik.resetForm({
      values: {
        ...configuration,
        boardIds: [...configuration.boardIds],
        applicableProfileIds: [...configuration.applicableProfileIds],
      },
    });
    setEditorOpen(true);
  };

  const activeConfigurations = configurations.filter((configuration) => configuration.isActive);
  const currentPreviewConfiguration = activeConfigurations[0] ?? configurations[0];
  const formatContext = {
    academicYearName: scope.academicYearName,
    schoolCode: scope.schoolCode,
  };

  const columns = [
    { id: 'name', label: 'Series Name', width: 210, minWidth: 180 },
    {
      id: 'boardIds',
      label: 'Board',
      width: 170,
      minWidth: 150,
      isFilter: false,
      render: (_value: string, row: IData) => {
        const configuration = configurations.find((item) => item.id === String(row.id));
        return configuration ? getBoardApplicabilityLabel(configuration, filters.boards) : '—';
      },
    },
    {
      id: 'applicableProfileIds',
      label: 'Applies To',
      isFilter: false,
      width: 280,
      minWidth: 220,
      maxWidth: 320,
      cellSx: { whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
      render: (_value: string, row: IData) => {
        const profileIds = Array.isArray(row.applicableProfileIds)
          ? row.applicableProfileIds.map(String)
          : [];
        const labels = settings.onboardingProfiles
          .filter((profile) => profileIds.includes(profile.id))
          .map((profile) => profile.name);
        return labels.length === settings.onboardingProfiles.length
          ? 'All onboarding profiles'
          : labels.join(', ') || 'No profiles';
      },
    },
    {
      id: 'sequenceScope',
      label: 'Sequence Scope',
      width: 160,
      minWidth: 145,
      render: (value: string) =>
        value === 'academic-year'
            ? 'Academic year'
            : 'School-wide',
    },
    {
      id: 'preview',
      label: 'Preview',
      isFilter: false,
      width: 170,
      minWidth: 150,
      render: (_value: string, row: IData) => {
        const configuration = configurations.find((item) => item.id === String(row.id));
        return configuration ? (
          <Label color="info">{formatGrNumber(configuration, 0, formatContext)}</Label>
        ) : null;
      },
    },
    {
      id: 'status',
      label: 'Status',
      isFilter: false,
      width: 100,
      minWidth: 90,
      render: (_value: string, row: IData) => (
        <Label color={row.isActive ? 'success' : 'default'}>
          {row.isActive ? 'Active' : 'Inactive'}
        </Label>
      ),
    },
    {
      id: 'action',
      label: 'Action',
      isFilter: false,
      width: 105,
      minWidth: 100,
      sticky: true,
      stickyPosition: 'right' as const,
      render: (_value: string, row: IData) => {
        const configuration = configurations.find((item) => item.id === String(row.id));
        return configuration ? (
          <Button
            size="small"
            variant="outlined"
            startIcon={<Iconify icon="mdi:pencil-outline" width={17} />}
            onClick={() => openExistingConfiguration(configuration)}
            sx={{ borderRadius: 1.5 }}
          >
            Edit
          </Button>
        ) : null;
      },
    },
  ];

  return (
    <Stack spacing={1.25} sx={{ minWidth: 0, minHeight: 0, height: '100%' }}>
      {!embedded ? (
        <SettingsPageHeader
          title="Identifier Series"
          description="Define the General Register identifier format used by Student Onboarding."
        />
      ) : null}
      <NumberingWorkspaceBar
        title="Identifier series"
        icon="mdi:identifier"
        summaries={[
          `${activeConfigurations.length} active series`,
          `Preview: ${
            currentPreviewConfiguration
              ? formatGrNumber(currentPreviewConfiguration, 0, formatContext)
              : 'Not configured'
          }`,
          'Current session',
        ]}
        assignmentMode={settings.grNumber.assignmentMode}
        onAssignmentModeChange={setGrAssignmentMode}
        buttonLabel="Add configuration"
        onClick={openNewConfiguration}
      />
      <Box sx={{ minHeight: 0, flex: 1, display: 'flex' }}>
        <CustomizableTable
          tableId="student-onboarding-gr-number-settings"
          tableTitle="Identifier Series Configurations"
          columns={columns}
          data={configurations}
          isFilter={false}
          wrapperProps={{ sx: { minHeight: { xs: 360, md: 320 }, height: '100%' } }}
          noDataText={<>No identifier series configurations are available in this session.</>}
        />
      </Box>
      <SettingsDrawer
        open={editorOpen}
        title={`${editingConfigurationId ? 'Edit' : 'Add'} Identifier Series Configuration`}
        description="Control where the series applies, how it increments, and whether staff can override it."
        icon="mdi:identifier"
        statusLabel={editingConfigurationId ? 'Editing series' : 'New series'}
        footerNote="Applies to Student Setup in this frontend session. Backend persistence is not connected."
        onClose={() => {
          formik.resetForm();
          setEditingConfigurationId(null);
          setEditorOpen(false);
        }}
        onSubmit={() => formik.submitForm()}
      >
        <Stack spacing={2} component="form" onSubmit={formik.handleSubmit}>
          <Alert severity="info">
            Applying this configuration updates automatic GR assignment in Student Setup for this
            frontend session. A full reload restores defaults until the API is connected.
          </Alert>
          {formik.status ? <Alert severity="error">{String(formik.status)}</Alert> : null}

          <SettingsSectionCard
            icon="mdi:target-account"
            title="Series coverage"
            description="Give staff a clear series name and limit it to the admission flows that should use it."
          >
            <TextField
              fullWidth
              size="small"
              name="name"
              label="Series name"
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.name && Boolean(formik.errors.name)}
              helperText={formik.touched.name ? formik.errors.name : 'Example: Fresh admission GR'}
            />
            <TextField
              select
              fullWidth
              size="small"
              name="applicableProfileIds"
              label="Applicable onboarding profiles"
              value={formik.values.applicableProfileIds}
              onChange={(event) => {
                const { value } = event.target;
                formik.setFieldValue(
                  'applicableProfileIds',
                  typeof value === 'string' ? value.split(',') : value
                );
                formik.setStatus(undefined);
              }}
              onBlur={formik.handleBlur}
              error={
                formik.touched.applicableProfileIds && Boolean(formik.errors.applicableProfileIds)
              }
              helperText={
                formik.touched.applicableProfileIds && formik.errors.applicableProfileIds
                  ? String(formik.errors.applicableProfileIds)
                  : 'Only eligible series appear in Student Setup.'
              }
              SelectProps={{
                multiple: true,
                renderValue: (selected) => {
                  const selectedIds = selected as string[];
                  const names = settings.onboardingProfiles
                    .filter((profile) => selectedIds.includes(profile.id))
                    .map((profile) => profile.name);
                  return names.length === settings.onboardingProfiles.length
                    ? 'All onboarding profiles'
                    : names.join(', ');
                },
              }}
            >
              {settings.onboardingProfiles.map((profile) => (
                <MenuItem key={profile.id} value={profile.id}>
                  <Checkbox checked={formik.values.applicableProfileIds.includes(profile.id)} />
                  {profile.name}
                </MenuItem>
              ))}
            </TextField>
            <BoardApplicabilityFields
              boardMode={formik.values.boardMode}
              boardIds={formik.values.boardIds}
              boards={filters.boards}
              onModeChange={(boardMode) => {
                formik.setFieldValue('boardMode', boardMode);
                if (boardMode === 'all') formik.setFieldValue('boardIds', []);
                formik.setStatus(undefined);
              }}
              onBoardIdsChange={(boardIds) => {
                formik.setFieldValue('boardIds', boardIds);
                formik.setStatus(undefined);
              }}
              error={
                formik.touched.boardIds && typeof formik.errors.boardIds === 'string'
                  ? formik.errors.boardIds
                  : undefined
              }
            />
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
                gap: 1.5,
              }}
            >
              <TextField
                select
                fullWidth
                size="small"
                name="sequenceScope"
                label="Sequence scope"
                value={formik.values.sequenceScope}
                onChange={formik.handleChange}
                helperText="Where the sequence must stay unique."
              >
                <MenuItem value="school">School-wide</MenuItem>
                <MenuItem value="academic-year">Academic year</MenuItem>
              </TextField>
              <TextField
                select
                fullWidth
                size="small"
                name="resetPolicy"
                label="Reset policy"
                value={formik.values.resetPolicy}
                onChange={formik.handleChange}
                helperText="When numbering restarts."
              >
                <MenuItem value="continuous">Never reset</MenuItem>
                <MenuItem value="academic-year">Reset each academic year</MenuItem>
              </TextField>
            </Box>
          </SettingsSectionCard>

          <SettingsSectionCard
            icon="mdi:form-textbox"
            title="Number format and range"
            description="Use tokens to create a readable identifier without maintaining separate formats."
          >
            <TextField
              fullWidth
              size="small"
              name="formatPattern"
              label="Format pattern"
              value={formik.values.formatPattern}
              onChange={(event) => {
                formik.handleChange(event);
                formik.setStatus(undefined);
              }}
              onBlur={formik.handleBlur}
              error={formik.touched.formatPattern && Boolean(formik.errors.formatPattern)}
              helperText={
                formik.touched.formatPattern && formik.errors.formatPattern
                  ? formik.errors.formatPattern
                  : 'Tokens: {PREFIX}, {SEQUENCE}, {SUFFIX}, {YEAR}, {YEAR_SHORT}, {SCHOOL_CODE}'
              }
            />
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
                gap: 1.5,
              }}
            >
              <TextField
                fullWidth
                size="small"
                name="prefix"
                label="Prefix"
                value={formik.values.prefix}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.prefix && Boolean(formik.errors.prefix)}
                helperText={formik.touched.prefix ? formik.errors.prefix : 'Example: GR-'}
              />
              <TextField
                fullWidth
                size="small"
                name="startingNumber"
                label="Starting Number"
                type="number"
                value={formik.values.startingNumber}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.startingNumber && Boolean(formik.errors.startingNumber)}
                helperText={
                  formik.touched.startingNumber ? formik.errors.startingNumber : undefined
                }
              />
              <TextField
                fullWidth
                size="small"
                name="padding"
                label="Number Padding"
                type="number"
                value={formik.values.padding}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.padding && Boolean(formik.errors.padding)}
                helperText={
                  formik.touched.padding ? formik.errors.padding : 'Example: 6 produces 000001'
                }
              />
              <TextField
                fullWidth
                size="small"
                name="suffix"
                label="Suffix"
                value={formik.values.suffix}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.suffix && Boolean(formik.errors.suffix)}
                helperText={formik.touched.suffix ? formik.errors.suffix : 'Optional'}
              />
              <TextField
                fullWidth
                size="small"
                name="maximumNumber"
                label="Maximum number"
                type="number"
                value={formik.values.maximumNumber ?? ''}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.maximumNumber && Boolean(formik.errors.maximumNumber)}
                helperText={
                  formik.touched.maximumNumber && formik.errors.maximumNumber
                    ? formik.errors.maximumNumber
                    : 'Optional safety limit.'
                }
              />
            </Box>
            <Card variant="outlined" sx={{ p: 1.5, bgcolor: 'background.neutral' }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Live preview
                  </Typography>
                  <Typography variant="h5" fontFamily="monospace">
                    {formatGrNumber(
                      { ...formik.values, id: editingConfigurationId ?? 'preview' },
                      0,
                      formatContext
                    )}
                  </Typography>
                </Box>
                <Label color="info">Session preview</Label>
              </Stack>
            </Card>
          </SettingsSectionCard>

          <SettingsSectionCard
            icon="mdi:shield-account-outline"
            title="Manual control"
            description="Decide whether authorized staff may override automatic assignment and how it is governed."
          >
            <Stack spacing={0.5}>
              <FormControlLabel
                control={
                  <Switch
                    name="manualEntryAllowed"
                    checked={formik.values.manualEntryAllowed}
                    onChange={(event) => {
                      formik.handleChange(event);
                      if (!event.target.checked) {
                        formik.setFieldValue('requireManualReason', false);
                        formik.setFieldValue('requireManualApproval', false);
                      }
                    }}
                  />
                }
                label="Allow manual GR entry"
              />
              <FormControlLabel
                control={
                  <Switch
                    name="requireManualReason"
                    checked={formik.values.requireManualReason}
                    disabled={!formik.values.manualEntryAllowed}
                    onChange={formik.handleChange}
                  />
                }
                label="Require reason for a manual value"
              />
              <FormControlLabel
                control={
                  <Switch
                    name="requireManualApproval"
                    checked={formik.values.requireManualApproval}
                    disabled={!formik.values.manualEntryAllowed}
                    onChange={formik.handleChange}
                  />
                }
                label="Require approval for a manual value"
              />
            </Stack>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
                gap: 1.5,
              }}
            >
              <TextField
                fullWidth
                size="small"
                name="effectiveFrom"
                label="Effective from"
                type="date"
                value={formik.values.effectiveFrom}
                onChange={formik.handleChange}
                InputLabelProps={{ shrink: true }}
                helperText="Optional activation date."
              />
              <FormControlLabel
                sx={{ m: 0, minHeight: 40 }}
                control={
                  <Switch
                    name="isActive"
                    checked={formik.values.isActive}
                    onChange={formik.handleChange}
                  />
                }
                label="Series is active"
              />
            </Box>
          </SettingsSectionCard>
        </Stack>
      </SettingsDrawer>
    </Stack>
  );
}

type RollNumberFormValues = Omit<RollNumberConfiguration, 'id' | 'className' | 'orderingRules'> & {
  tieBreakerOne: '' | RollNumberConfiguration['arrangeBy'];
  tieBreakerOneDirection: RollNumberConfiguration['arrangeType'];
  tieBreakerTwo: '' | RollNumberConfiguration['arrangeBy'];
  tieBreakerTwoDirection: RollNumberConfiguration['arrangeType'];
};

const createRollNumberFormValues = (): RollNumberFormValues => ({
  boardMode: 'all',
  boardIds: [],
  classId: '*',
  arrangeBy: 'studentName',
  arrangeType: 'ascending',
  startingNumber: 1,
  preserveExisting: true,
  numberingScope: 'class-division',
  assignmentTiming: 'after-division',
  midYearHandling: 'next-available',
  allowIndividualLocks: true,
  requireChangeReason: true,
  requireApproval: false,
  effectiveFrom: '',
  isActive: true,
  tieBreakerOne: 'admissionNumber',
  tieBreakerOneDirection: 'ascending',
  tieBreakerTwo: '',
  tieBreakerTwoDirection: 'ascending',
});

const hasRollConfigurationOverlap = (
  candidate: RollNumberConfiguration,
  configurations: RollNumberConfiguration[]
) =>
  configurations.some(
    (existing) =>
      existing.id !== candidate.id &&
      existing.isActive &&
      candidate.isActive &&
      existing.classId === candidate.classId &&
      boardTargetsOverlap(existing, candidate)
  );

export function RollNumberSettingsScreen({ embedded = false }: { embedded?: boolean }) {
  const filters = useFinanceAcademicFilters();
  const { settings, saveRollNumberConfiguration, setRollAssignmentMode } = useOnboardingSettings();
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingConfigurationId, setEditingConfigurationId] = useState<string | null>(null);
  const { configurations } = settings.rollNumber;
  const formik = useFormik<RollNumberFormValues>({
    initialValues: createRollNumberFormValues(),
    validationSchema: rollSchema,
    onSubmit: (values, helpers) => {
      const selectedClass = filters.classOptions.find((item) => item.id === values.classId);
      const orderingRules = [
        { field: values.arrangeBy, direction: values.arrangeType },
        values.tieBreakerOne
          ? { field: values.tieBreakerOne, direction: values.tieBreakerOneDirection }
          : null,
        values.tieBreakerTwo
          ? { field: values.tieBreakerTwo, direction: values.tieBreakerTwoDirection }
          : null,
      ].filter((rule): rule is NonNullable<typeof rule> => Boolean(rule));
      const {
        tieBreakerOne: _tieBreakerOne,
        tieBreakerOneDirection: _tieBreakerOneDirection,
        tieBreakerTwo: _tieBreakerTwo,
        tieBreakerTwoDirection: _tieBreakerTwoDirection,
        ...configurationValues
      } = values;

      const configuration: RollNumberConfiguration = {
        ...configurationValues,
        orderingRules,
        id: editingConfigurationId ?? `roll-session-${Date.now()}`,
        className: values.classId === '*' ? 'All classes' : selectedClass?.name || values.classId,
      };

      if (hasRollConfigurationOverlap(configuration, configurations)) {
        helpers.setStatus(
          'An active Roll Number rule already targets the same Board and Class applicability.'
        );
        return;
      }

      saveRollNumberConfiguration(configuration);
      helpers.resetForm();
      setEditingConfigurationId(null);
      setEditorOpen(false);
    },
  });

  const openNewConfiguration = () => {
    setEditingConfigurationId(null);
    formik.resetForm({ values: createRollNumberFormValues() });
    setEditorOpen(true);
  };

  const openExistingConfiguration = (configuration: RollNumberConfiguration) => {
    setEditingConfigurationId(configuration.id);
    formik.resetForm({
      values: {
        ...configuration,
        boardIds: [...configuration.boardIds],
        tieBreakerOne: configuration.orderingRules[1]?.field ?? '',
        tieBreakerOneDirection: configuration.orderingRules[1]?.direction ?? 'ascending',
        tieBreakerTwo: configuration.orderingRules[2]?.field ?? '',
        tieBreakerTwoDirection: configuration.orderingRules[2]?.direction ?? 'ascending',
      },
    });
    setEditorOpen(true);
  };

  const columns = [
    {
      id: 'boardIds',
      label: 'Board',
      width: 170,
      minWidth: 150,
      isFilter: false,
      render: (_value: unknown, row: IData) => {
        const configuration = configurations.find((item) => item.id === String(row.id));
        return configuration ? getBoardApplicabilityLabel(configuration, filters.boards) : '—';
      },
    },
    { id: 'className', label: 'Class', width: 160, minWidth: 140 },
    {
      id: 'numberingScope',
      label: 'Scope',
      width: 160,
      render: (value: string) =>
        rollNumberScopeOptions.find((option) => option.value === value)?.label ?? value,
    },
    {
      id: 'assignmentTiming',
      label: 'Timing',
      width: 190,
      render: (value: string) =>
        rollAssignmentTimingOptions.find((option) => option.value === value)?.label ?? value,
    },
    {
      id: 'midYearHandling',
      label: 'Mid-year Rule',
      width: 210,
      render: (value: string) =>
        midYearHandlingOptions.find((option) => option.value === value)?.label ?? value,
    },
    {
      id: 'orderingRules',
      label: 'Ordering',
      width: 220,
      isFilter: false,
      render: (_value: unknown, row: IData) =>
        (row.orderingRules as RollNumberConfiguration['orderingRules'])
          .map(
            (rule) =>
              `${rollArrangeByOptions.find((option) => option.value === rule.field)?.label ?? rule.field} ${rule.direction === 'ascending' ? '↑' : '↓'}`
          )
          .join(' → '),
    },
    { id: 'startingNumber', label: 'Starts At', width: 105, filterType: 'number' as const },
    {
      id: 'preserveExisting',
      label: 'Existing',
      width: 120,
      filterType: 'enum' as const,
      render: (value: boolean) => (
        <Label color={value ? 'success' : 'warning'}>{value ? 'Preserve' : 'Recalculate'}</Label>
      ),
    },
    {
      id: 'status',
      label: 'Status',
      isFilter: false,
      width: 95,
      render: (_value: unknown, row: IData) => (
        <Label color={row.isActive ? 'success' : 'default'}>
          {row.isActive ? 'Active' : 'Inactive'}
        </Label>
      ),
    },
    {
      id: 'action',
      label: 'Action',
      isFilter: false,
      width: 105,
      sticky: true,
      stickyPosition: 'right' as const,
      render: (_value: unknown, row: IData) => {
        const configuration = configurations.find((item) => item.id === String(row.id));
        return configuration ? (
          <Button
            size="small"
            variant="outlined"
            startIcon={<Iconify icon="mdi:pencil-outline" width={17} />}
            onClick={() => openExistingConfiguration(configuration)}
            sx={{ borderRadius: 1.5 }}
          >
            Edit
          </Button>
        ) : null;
      },
    },
  ];

  return (
    <Stack spacing={1.25} sx={{ minWidth: 0, minHeight: 0, height: '100%' }}>
      {!embedded ? (
        <SettingsPageHeader
          title="Roll Number Rules"
          description="Configure class-wise roll number ordering for Student Onboarding."
        />
      ) : null}
      <NumberingWorkspaceBar
        title="Class-wise roll number rules"
        icon="mdi:format-list-numbered"
        summaries={[
          `${configurations.length} configured rules`,
          `${new Set(configurations.map((configuration) => configuration.classId)).size} classes`,
          'Current session',
        ]}
        assignmentMode={settings.rollNumber.assignmentMode}
        onAssignmentModeChange={setRollAssignmentMode}
        buttonLabel="Add configuration"
        onClick={openNewConfiguration}
      />
      <Box sx={{ minHeight: 0, flex: 1, display: 'flex' }}>
        <CustomizableTable
          tableId="student-onboarding-roll-number-settings"
          tableTitle="Roll Number Configurations"
          columns={columns}
          data={configurations}
          isFilter={false}
          wrapperProps={{ sx: { minHeight: { xs: 360, md: 320 }, height: '100%' } }}
          noDataText={<>No Roll Number configurations are available in this session.</>}
        />
      </Box>
      <SettingsDrawer
        open={editorOpen}
        title={`${editingConfigurationId ? 'Edit' : 'Add'} Roll Number Configuration`}
        description="Control numbering scope, timing, mid-year insertion, ordering, locks, and approvals."
        icon="mdi:format-list-numbered"
        statusLabel={editingConfigurationId ? 'Editing rule' : 'New rule'}
        footerNote="Applies to Student Setup in this frontend session. Backend persistence is not connected."
        onClose={() => {
          formik.resetForm();
          setEditingConfigurationId(null);
          setEditorOpen(false);
        }}
        onSubmit={() => formik.submitForm()}
      >
        <Stack spacing={2} component="form" onSubmit={formik.handleSubmit}>
          <Alert severity="info">
            Applying this rule updates automatic roll-number assignment in Student Setup for this
            frontend session. A full reload restores defaults until the API is connected.
          </Alert>
          {formik.status ? <Alert severity="error">{String(formik.status)}</Alert> : null}
          <SettingsSectionCard
            icon="mdi:calendar-account-outline"
            title="Applicability and timing"
            description="Define where the sequence is unique and when assignment becomes eligible."
          >
            <BoardApplicabilityFields
              boardMode={formik.values.boardMode}
              boardIds={formik.values.boardIds}
              boards={filters.boards}
              onModeChange={(boardMode) => {
                formik.setFieldValue('boardMode', boardMode);
                if (boardMode === 'all') formik.setFieldValue('boardIds', []);
                formik.setStatus(undefined);
              }}
              onBoardIdsChange={(boardIds) => {
                formik.setFieldValue('boardIds', boardIds);
                if (boardIds.length === 1) filters.setSelectedBoard(boardIds[0]);
                formik.setStatus(undefined);
              }}
              error={
                formik.touched.boardIds && typeof formik.errors.boardIds === 'string'
                  ? formik.errors.boardIds
                  : undefined
              }
            />
            <TextField
              select
              fullWidth
              size="small"
              name="classId"
              label="Class"
              value={formik.values.classId}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.classId && Boolean(formik.errors.classId)}
              helperText={formik.touched.classId ? formik.errors.classId : undefined}
            >
              <MenuItem value="*">All classes</MenuItem>
              {filters.classOptions.map((item) => (
                <MenuItem key={item.id} value={item.id}>
                  {item.name}
                </MenuItem>
              ))}
            </TextField>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
                gap: 1.5,
              }}
            >
              <TextField
                select
                fullWidth
                size="small"
                name="numberingScope"
                label="Numbering scope"
                value={formik.values.numberingScope}
                onChange={formik.handleChange}
              >
                {rollNumberScopeOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                fullWidth
                size="small"
                name="assignmentTiming"
                label="Assignment timing"
                value={formik.values.assignmentTiming}
                onChange={formik.handleChange}
              >
                {rollAssignmentTimingOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
            <TextField
              select
              fullWidth
              size="small"
              name="midYearHandling"
              label="Mid-year student handling"
              value={formik.values.midYearHandling}
              onChange={formik.handleChange}
            >
              {midYearHandlingOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </SettingsSectionCard>

          <SettingsSectionCard
            icon="mdi:sort-variant"
            title="Ordering and tie-breakers"
            description="Rules are evaluated from primary ordering to the last configured tie-breaker."
          >
            <TextField
              select
              fullWidth
              size="small"
              name="arrangeBy"
              label="Arrange By"
              value={formik.values.arrangeBy}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.arrangeBy && Boolean(formik.errors.arrangeBy)}
              helperText={formik.touched.arrangeBy ? formik.errors.arrangeBy : undefined}
            >
              {rollArrangeByOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              fullWidth
              size="small"
              name="arrangeType"
              label="Arrange Type"
              value={formik.values.arrangeType}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.arrangeType && Boolean(formik.errors.arrangeType)}
              helperText={formik.touched.arrangeType ? formik.errors.arrangeType : undefined}
            >
              {rollArrangeTypeOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
                gap: 1.5,
              }}
            >
              <TextField
                select
                fullWidth
                size="small"
                name="tieBreakerOne"
                label="First tie-breaker"
                value={formik.values.tieBreakerOne}
                onChange={formik.handleChange}
              >
                <MenuItem value="">None</MenuItem>
                {rollArrangeByOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                fullWidth
                size="small"
                name="tieBreakerOneDirection"
                label="First tie-breaker direction"
                value={formik.values.tieBreakerOneDirection}
                onChange={formik.handleChange}
                disabled={!formik.values.tieBreakerOne}
              >
                {rollArrangeTypeOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                fullWidth
                size="small"
                name="tieBreakerTwo"
                label="Second tie-breaker"
                value={formik.values.tieBreakerTwo}
                onChange={formik.handleChange}
                disabled={!formik.values.tieBreakerOne}
              >
                <MenuItem value="">None</MenuItem>
                {rollArrangeByOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                fullWidth
                size="small"
                name="tieBreakerTwoDirection"
                label="Second tie-breaker direction"
                value={formik.values.tieBreakerTwoDirection}
                onChange={formik.handleChange}
                disabled={!formik.values.tieBreakerTwo}
              >
                {rollArrangeTypeOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
          </SettingsSectionCard>

          <SettingsSectionCard
            icon="mdi:shield-lock-outline"
            title="Preservation and governance"
            description="Protect existing numbers and control changes that need explanation or approval."
          >
            <TextField
              fullWidth
              size="small"
              name="startingNumber"
              label="Starting Number"
              type="number"
              value={formik.values.startingNumber}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.startingNumber && Boolean(formik.errors.startingNumber)}
              helperText={
                formik.touched.startingNumber
                  ? formik.errors.startingNumber
                  : 'The first available roll number for this class.'
              }
            />
            <TextField
              select
              fullWidth
              size="small"
              name="preserveExisting"
              label="When rules change"
              value={String(formik.values.preserveExisting)}
              onChange={(event) =>
                formik.setFieldValue('preserveExisting', event.target.value === 'true')
              }
            >
              <MenuItem value="true">Preserve existing roll numbers</MenuItem>
              <MenuItem value="false">Preview recalculation for all students</MenuItem>
            </TextField>
            <Stack spacing={0.5}>
              <FormControlLabel
                control={
                  <Switch
                    name="allowIndividualLocks"
                    checked={formik.values.allowIndividualLocks}
                    onChange={formik.handleChange}
                  />
                }
                label="Allow individual Roll number locks"
              />
              <FormControlLabel
                control={
                  <Switch
                    name="requireChangeReason"
                    checked={formik.values.requireChangeReason}
                    onChange={formik.handleChange}
                  />
                }
                label="Require reason for Roll number changes"
              />
              <FormControlLabel
                control={
                  <Switch
                    name="requireApproval"
                    checked={formik.values.requireApproval}
                    onChange={formik.handleChange}
                  />
                }
                label="Require approval for recalculation or manual changes"
              />
            </Stack>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
                gap: 1.5,
              }}
            >
              <TextField
                fullWidth
                size="small"
                name="effectiveFrom"
                label="Effective from"
                type="date"
                value={formik.values.effectiveFrom}
                onChange={formik.handleChange}
                InputLabelProps={{ shrink: true }}
              />
              <FormControlLabel
                sx={{ m: 0, minHeight: 40 }}
                control={
                  <Switch
                    name="isActive"
                    checked={formik.values.isActive}
                    onChange={formik.handleChange}
                  />
                }
                label="Rule is active"
              />
            </Box>
            <Card variant="outlined" sx={{ p: 1.5, bgcolor: 'background.neutral' }}>
              <Typography variant="subtitle2" gutterBottom>
                Effective Roll policy preview
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {
                  rollNumberScopeOptions.find(
                    (option) => option.value === formik.values.numberingScope
                  )?.label
                }{' '}
                ·{' '}
                {
                  rollAssignmentTimingOptions.find(
                    (option) => option.value === formik.values.assignmentTiming
                  )?.label
                }{' '}
                ·{' '}
                {
                  midYearHandlingOptions.find(
                    (option) => option.value === formik.values.midYearHandling
                  )?.label
                }
              </Typography>
            </Card>
          </SettingsSectionCard>
        </Stack>
      </SettingsDrawer>
    </Stack>
  );
}

function DivisionInfoTooltip({ title }: { title: string }) {
  return (
    <Tooltip title={title} arrow placement="top">
      <IconButton
        size="small"
        aria-label={`More information: ${title}`}
        sx={{ width: 24, height: 24, color: 'text.secondary' }}
      >
        <Iconify icon="mdi:information-outline" width={18} />
      </IconButton>
    </Tooltip>
  );
}

function DivisionControlHeading({ title, description }: { title: string; description: string }) {
  return (
    <Stack direction="row" spacing={0.5} alignItems="center">
      <Typography variant="subtitle2">{title}</Typography>
      <DivisionInfoTooltip title={description} />
    </Stack>
  );
}

function DivisionRuleRow({
  title,
  description,
  checked,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      alignItems={{ sm: 'flex-start' }}
      justifyContent="space-between"
      spacing={1.5}
      sx={{ py: 1.5 }}
    >
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography variant="subtitle2">{title}</Typography>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      </Box>
      <FormControlLabel
        control={
          <Switch
            checked={checked}
            onChange={(event) => onChange(event.target.checked)}
            slotProps={{ input: { 'aria-label': title } }}
          />
        }
        label={checked ? 'Enabled' : 'Disabled'}
        labelPlacement="start"
        sx={{ m: 0, minHeight: 44, flexShrink: 0 }}
      />
    </Stack>
  );
}

const createDivisionChangeConfiguration = (): DivisionChangeConfiguration => ({
  ...defaultDivisionChangeConfiguration,
  id: '',
  name: '',
  boardIds: [],
});

const hasDivisionConfigurationOverlap = (
  candidate: DivisionChangeConfiguration,
  configurations: DivisionChangeConfiguration[]
) =>
  configurations.some(
    (existing) =>
      existing.id !== candidate.id &&
      existing.isActive &&
      candidate.isActive &&
      existing.classId === candidate.classId &&
      boardTargetsOverlap(existing, candidate)
  );

export function DivisionChangesSettingsPanel() {
  const filters = useFinanceAcademicFilters();
  const { settings, saveDivisionChangeConfiguration } = useOnboardingSettings();
  const { configurations } = settings.divisionChange;
  const [baseline, setBaseline] = useState<DivisionChangeConfiguration>(
    createDivisionChangeConfiguration()
  );
  const [draft, setDraft] = useState<DivisionChangeConfiguration>(
    createDivisionChangeConfiguration()
  );
  const [editingConfigurationId, setEditingConfigurationId] = useState<string | null>(null);
  const [validationError, setValidationError] = useState('');
  const [editorOpen, setEditorOpen] = useState(false);
  const isDirty = JSON.stringify(baseline) !== JSON.stringify(draft);
  const activeConfigurations = configurations.filter((configuration) => configuration.isActive);
  const setBooleanRule =
    (
      key:
        | 'capacityRequired'
        | 'requireReason'
        | 'requireApproval'
        | 'recalculateRollNumber'
        | 'notifyClassTeacher'
    ) =>
    (value: boolean) =>
      setDraft((current) => ({ ...current, [key]: value }));

  const toDateValue = (value: string) => (value ? dayjs(value) : null);
  const toIsoDate = (value: ReturnType<typeof dayjs> | null) =>
    value?.isValid() ? value.format('YYYY-MM-DD') : '';
  const openNewConfiguration = () => {
    const initial = createDivisionChangeConfiguration();
    setEditingConfigurationId(null);
    setBaseline(initial);
    setDraft(initial);
    setValidationError('');
    setEditorOpen(true);
  };
  const openExistingConfiguration = (configuration: DivisionChangeConfiguration) => {
    const initial = { ...configuration, boardIds: [...configuration.boardIds] };
    setEditingConfigurationId(configuration.id);
    setBaseline(initial);
    setDraft(initial);
    setValidationError('');
    setEditorOpen(true);
  };
  const closeEditor = () => {
    setDraft(baseline);
    setValidationError('');
    setEditorOpen(false);
  };
  const applyDraft = () => {
    if (!draft.name.trim()) {
      setValidationError('Enter a rule name.');
      return;
    }
    if (draft.boardMode === 'selected' && draft.boardIds.length !== 1) {
      setValidationError('Select one specific Board.');
      return;
    }
    const selectedClass = filters.classOptions.find((item) => item.id === draft.classId);
    const configuration: DivisionChangeConfiguration = {
      ...draft,
      id: editingConfigurationId ?? `division-session-${Date.now()}`,
      name: draft.name.trim(),
      className: draft.classId === '*' ? 'All classes' : selectedClass?.name || draft.classId,
    };
    if (hasDivisionConfigurationOverlap(configuration, configurations)) {
      setValidationError(
        'An active Division rule already targets the same Board and Class applicability.'
      );
      return;
    }
    saveDivisionChangeConfiguration(configuration);
    setEditorOpen(false);
  };
  const tableData = configurations.map((configuration) => ({
    ...configuration,
    board: getBoardApplicabilityLabel(configuration, filters.boards),
    assignmentMethod:
      configuration.assignmentMode === 'both'
        ? 'Automatic and manual'
        : configuration.assignmentMode === 'automatic'
          ? 'Automatic only'
          : 'Manual only',
    strategy:
      divisionStrategyOptions.find(
        (option) => option.value === configuration.automaticStrategy
      )?.label ?? configuration.automaticStrategy,
    capacity: `${configuration.capacityRequired ? 'Required' : 'Optional'} · Warn at ${configuration.capacityWarningThreshold}`,
    approval: configuration.requireApproval
      ? 'Always required'
      : configuration.approvalRequiredAfter
        ? `From ${dayjs(configuration.approvalRequiredAfter).format('DD MMM YYYY')}`
        : configuration.overCapacityBehavior === 'approval'
          ? 'Capacity exceptions'
          : 'Not required',
    rollImpact: configuration.recalculateRollNumber ? 'Recalculate' : 'Preserve',
    effectiveDateLabel: configuration.effectiveDate
      ? dayjs(configuration.effectiveDate).format('DD MMM YYYY')
      : 'Immediate',
  }));
  const columns = [
    { id: 'name', label: 'Rule', width: 190, minWidth: 170 },
    { id: 'board', label: 'Board', width: 170, minWidth: 150 },
    { id: 'className', label: 'Class', width: 150, minWidth: 135 },
    { id: 'assignmentMethod', label: 'Assignment Method', width: 175, minWidth: 155 },
    { id: 'strategy', label: 'Strategy', width: 190, minWidth: 170 },
    { id: 'capacity', label: 'Capacity', width: 170, minWidth: 150 },
    { id: 'approval', label: 'Approval', width: 170, minWidth: 150 },
    {
      id: 'rollImpact',
      label: 'Roll No. Impact',
      width: 135,
      minWidth: 120,
      render: (value: string) => (
        <Label color={value === 'Recalculate' ? 'warning' : 'default'}>{value}</Label>
      ),
    },
    { id: 'effectiveDateLabel', label: 'Effective Date', width: 135, minWidth: 120 },
    {
      id: 'status',
      label: 'Status',
      width: 100,
      minWidth: 90,
      isFilter: false,
      render: (_value: string, row: IData) => (
        <Label color={row.isActive ? 'success' : 'default'}>
          {row.isActive ? 'Active' : 'Inactive'}
        </Label>
      ),
    },
    {
      id: 'action',
      label: 'Action',
      width: 105,
      minWidth: 100,
      isFilter: false,
      sticky: true,
      stickyPosition: 'right' as const,
      render: (_value: unknown, row: IData) => {
        const configuration = configurations.find((item) => item.id === String(row.id));
        return configuration ? (
          <Button
            size="small"
            variant="outlined"
            startIcon={<Iconify icon="mdi:pencil-outline" width={17} />}
            onClick={() => openExistingConfiguration(configuration)}
            sx={{ borderRadius: 1.5 }}
          >
            Edit
          </Button>
        ) : null;
      },
    },
  ];

  return (
    <Stack spacing={1.25} sx={{ minWidth: 0, minHeight: 0, height: '100%', flex: 1 }}>
      <NumberingWorkspaceBar
        title="Division assignment rules"
        icon="mdi:account-switch-outline"
        summaries={[
          `${activeConfigurations.length} active rules`,
          `${configurations.filter((item) => item.boardMode === 'selected').length} Board overrides`,
          'Current session',
        ]}
        buttonLabel="Add override"
        buttonIcon="mdi:plus"
        onClick={openNewConfiguration}
      />
      <Box sx={{ minHeight: 0, flex: 1, display: 'flex' }}>
        <CustomizableTable
          tableId="student-onboarding-division-settings"
          tableTitle="Division Assignment Rules"
          columns={columns}
          data={tableData}
          isFilter={false}
          wrapperProps={{ sx: { minHeight: { xs: 360, md: 320 }, height: '100%' } }}
          noDataText={<>No Division assignment rule is available for this scope.</>}
        />
      </Box>
      <SettingsDrawer
        open={editorOpen}
        title={`${editingConfigurationId ? 'Edit' : 'Add'} Division Assignment Rule`}
        description="Configure placement strategy, capacity protection, approvals, and record impact."
        icon="mdi:account-switch-outline"
        statusLabel={editingConfigurationId ? 'Editing rule' : 'New override'}
        footerNote="Applies to Division assignment in Student Setup for this frontend session."
        onClose={closeEditor}
        onReset={() => {
          setDraft(baseline);
          setValidationError('');
        }}
        resetDisabled={!isDirty}
        onSubmit={applyDraft}
        submitLabel="Apply to Setup"
        submitDisabled={!isDirty}
      >
        <Stack spacing={2}>
          <Alert severity="info">
            Student records remain unchanged until the backend Division workflow is connected.
          </Alert>
          {validationError ? <Alert severity="error">{validationError}</Alert> : null}
          <SettingsSectionCard
            icon="mdi:target-account"
            title="Applicability"
            description="Use All boards as the fallback, then add Board or Class-specific overrides only where needed."
          >
            <TextField
              fullWidth
              size="small"
              label="Rule name"
              value={draft.name}
              onChange={(event) => {
                setDraft((current) => ({ ...current, name: event.target.value }));
                setValidationError('');
              }}
              error={Boolean(validationError && !draft.name.trim())}
              helperText="Example: CBSE Division placement"
            />
            <BoardApplicabilityFields
              boardMode={draft.boardMode}
              boardIds={draft.boardIds}
              boards={filters.boards}
              onModeChange={(boardMode) => {
                setDraft((current) => ({
                  ...current,
                  boardMode,
                  boardIds: boardMode === 'all' ? [] : current.boardIds,
                }));
                setValidationError('');
              }}
              onBoardIdsChange={(boardIds) => {
                setDraft((current) => ({ ...current, boardIds }));
                if (boardIds.length === 1) filters.setSelectedBoard(boardIds[0]);
                setValidationError('');
              }}
              error={
                validationError &&
                draft.boardMode === 'selected' &&
                draft.boardIds.length !== 1
                  ? 'Select one specific Board'
                  : undefined
              }
            />
            <TextField
              select
              fullWidth
              size="small"
              label="Class applicability"
              value={draft.classId}
              onChange={(event) =>
                setDraft((current) => ({ ...current, classId: event.target.value }))
              }
              helperText="Exact Class rules take priority over Board-wide and All-boards rules."
            >
              <MenuItem value="*">All classes</MenuItem>
              {filters.classOptions
                .filter((item) => item.id !== 'All Classes')
                .map((item) => (
                  <MenuItem key={item.id} value={item.id}>
                    {item.name}
                  </MenuItem>
                ))}
            </TextField>
            <FormControlLabel
              sx={{ m: 0 }}
              control={
                <Switch
                  checked={draft.isActive}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, isActive: event.target.checked }))
                  }
                />
              }
              label="Rule is active"
            />
          </SettingsSectionCard>
          <SettingsSectionCard
            icon="mdi:account-group-outline"
            title="Assignment and capacity"
            description="Configure how Student Setup places students and handles available seats."
          >
            <Stack spacing={1}>
              <DivisionControlHeading
                title="Assignment method"
                description="Choose whether staff can use automatic placement, manual selection, or both."
              />
              <TextField
                select
                fullWidth
                size="small"
                label="Allowed assignment method"
                value={draft.assignmentMode}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    assignmentMode: event.target.value as DivisionChangeRules['assignmentMode'],
                  }))
                }
              >
                <MenuItem value="automatic">Automatic only</MenuItem>
                <MenuItem value="manual">Manual only</MenuItem>
                <MenuItem value="both">Automatic and manual</MenuItem>
              </TextField>
            </Stack>
            <Divider />
            <Stack spacing={1}>
              <DivisionControlHeading
                title="Automatic assignment strategy"
                description="Choose how Student Setup proposes a Division when automatic placement is allowed."
              />
              <TextField
                select
                fullWidth
                size="small"
                label="Division strategy"
                value={draft.automaticStrategy}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    automaticStrategy: event.target
                      .value as DivisionChangeRules['automaticStrategy'],
                  }))
                }
              >
                {divisionStrategyOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
              {draft.automaticStrategy === 'balance-tolerance' ? (
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  label="Balance tolerance"
                  value={draft.balanceTolerance}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      balanceTolerance: Math.max(0, Number(event.target.value) || 0),
                    }))
                  }
                  inputProps={{ min: 0 }}
                  helperText="Maximum allowed student-count difference between Divisions."
                />
              ) : null}
            </Stack>
            <Divider />
            <DivisionRuleRow
              title="Capacity data required"
              description="Block automatic placement when the target Division has no connected capacity data."
              checked={draft.capacityRequired}
              onChange={setBooleanRule('capacityRequired')}
            />
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
                gap: 1.5,
              }}
            >
              <TextField
                fullWidth
                size="small"
                type="number"
                label="Capacity warning threshold"
                value={draft.capacityWarningThreshold}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    capacityWarningThreshold: Math.max(0, Number(event.target.value) || 0),
                  }))
                }
                inputProps={{ min: 0 }}
                helperText="Warn when remaining seats reach this number."
              />
              <TextField
                select
                fullWidth
                size="small"
                label="Over-capacity behavior"
                value={draft.overCapacityBehavior}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    overCapacityBehavior: event.target
                      .value as DivisionChangeRules['overCapacityBehavior'],
                  }))
                }
              >
                <MenuItem value="block">Block assignment</MenuItem>
                <MenuItem value="approval">Allow with approval</MenuItem>
              </TextField>
            </Box>
          </SettingsSectionCard>
          <SettingsSectionCard
            icon="mdi:shield-check-outline"
            title="Approval and record impact"
            description="Define the checks, timing, and follow-up actions for a Division change."
          >
            <DivisionRuleRow
              title="Require a change reason"
              description="Require staff to explain every individual or bulk Division change."
              checked={draft.requireReason}
              onChange={setBooleanRule('requireReason')}
            />
            <Divider />
            <DivisionRuleRow
              title="Require approval"
              description="Keep Division changes pending until an authorized user approves them."
              checked={draft.requireApproval}
              onChange={setBooleanRule('requireApproval')}
            />
            <DatePicker
              label="Require approval on or after"
              value={toDateValue(draft.approvalRequiredAfter)}
              onChange={(value) =>
                setDraft((current) => ({
                  ...current,
                  approvalRequiredAfter: toIsoDate(value),
                }))
              }
              format="DD/MM/YYYY"
              slotProps={{
                textField: {
                  fullWidth: true,
                  size: 'small',
                  helperText: 'Optional date-based approval threshold.',
                },
              }}
            />
            <Divider />
            <DivisionRuleRow
              title="Recalculate roll number after division change"
              description="Preview a new Division-scoped Roll number and preserve the previous value in audit history."
              checked={draft.recalculateRollNumber}
              onChange={setBooleanRule('recalculateRollNumber')}
            />
            <DivisionRuleRow
              title="Notify class teacher"
              description="Include the affected class teacher in the change notification after approval."
              checked={draft.notifyClassTeacher}
              onChange={setBooleanRule('notifyClassTeacher')}
            />
            <DatePicker
              label="Effective date for Division changes"
              value={toDateValue(draft.effectiveDate)}
              onChange={(value) =>
                setDraft((current) => ({ ...current, effectiveDate: toIsoDate(value) }))
              }
              format="DD/MM/YYYY"
              slotProps={{ textField: { fullWidth: true, size: 'small' } }}
            />
            <Card variant="outlined" sx={{ p: 1.5, bgcolor: 'background.neutral' }}>
              <Typography variant="subtitle2" gutterBottom>
                Effective Division policy preview
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {
                  divisionStrategyOptions.find((option) => option.value === draft.automaticStrategy)
                    ?.label
                }{' '}
                · {draft.capacityRequired ? 'capacity required' : 'capacity optional'} ·{' '}
                {draft.overCapacityBehavior === 'block'
                  ? 'over-capacity blocked'
                  : 'over-capacity needs approval'}
                {draft.recalculateRollNumber
                  ? ' · recalculate Roll number'
                  : ' · preserve Roll number'}
                {' · '}
                {getBoardApplicabilityLabel(draft, filters.boards)}
              </Typography>
            </Card>
          </SettingsSectionCard>
        </Stack>
      </SettingsDrawer>
    </Stack>
  );
}

function EffectivePolicyPreview({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { settings, scope } = useOnboardingSettings();
  const filters = useFinanceAcademicFilters();
  const [profileId, setProfileId] = useState(settings.onboardingProfiles[0]?.id ?? '');
  const [boardId, setBoardId] = useState('');
  const [classId, setClassId] = useState('*');
  const profile =
    settings.onboardingProfiles.find((item) => item.id === profileId) ??
    settings.onboardingProfiles[0];
  const selectedClass = filters.classOptions.find((item) => item.id === classId);
  const grConfiguration = [...settings.grNumber.configurations]
    .filter((configuration) =>
      isGrConfigurationApplicable(configuration, profile?.id, undefined, boardId || undefined)
    )
    .sort((first, second) => Number(second.boardMode === 'selected') - Number(first.boardMode === 'selected'))[0];
  const rollConfiguration = findRollNumberConfiguration(
    settings.rollNumber.configurations,
    selectedClass?.name ?? 'All classes',
    undefined,
    boardId || undefined,
    classId === '*' ? undefined : classId
  );
  const divisionConfiguration = findDivisionChangeConfiguration(
    settings.divisionChange.configurations,
    selectedClass?.name ?? 'All classes',
    undefined,
    boardId || undefined,
    classId === '*' ? undefined : classId
  );
  const approvalSummary =
    profile?.rules.approvalMode === 'always' ||
    rollConfiguration.requireApproval ||
    divisionConfiguration.requireApproval
      ? 'Required by at least one effective policy'
      : profile?.rules.approvalMode === 'conditional'
        ? 'Required only for configured exceptions'
        : 'Not required by the selected policies';

  return (
    <SettingsDrawer
      open={open}
      title="Effective policy preview"
      description="Review the combined profile, numbering, placement, and approval behavior."
      icon="mdi:tune-variant"
      statusLabel="Applied policy"
      footerNote="Read-only summary of policies currently applied to Student Setup."
      onClose={onClose}
      onSubmit={onClose}
      submitLabel="Done"
      submitIcon="mdi:check"
      showCancel={false}
    >
      <Stack spacing={2}>
        <Alert severity="info">
          This preview reflects policies applied to Student Setup in the current frontend session.
        </Alert>
        <SettingsSectionCard
          icon="mdi:clipboard-text-search-outline"
          title="Resolved onboarding policy"
          description="Select a profile to inspect the effective numbering, placement, and approval result."
        >
          <TextField
            select
            fullWidth
            size="small"
            label="Onboarding profile"
            value={profileId}
            onChange={(event) => setProfileId(event.target.value)}
          >
            {settings.onboardingProfiles.map((item) => (
              <MenuItem key={item.id} value={item.id}>
                {item.name}
              </MenuItem>
            ))}
          </TextField>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
              gap: 1.25,
            }}
          >
            <TextField
              select
              fullWidth
              size="small"
              label="Board context"
              value={boardId}
              onChange={(event) => {
                const nextBoardId = event.target.value;
                setBoardId(nextBoardId);
                setClassId('*');
                if (nextBoardId) filters.setSelectedBoard(nextBoardId);
              }}
              helperText="Choose a Board to resolve its override."
            >
              <MenuItem value="">All Boards fallback</MenuItem>
              {filters.boards.map((item) => (
                <MenuItem key={item.id} value={item.id}>
                  {item.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              fullWidth
              size="small"
              label="Class context"
              value={classId}
              onChange={(event) => setClassId(event.target.value)}
              helperText="Choose a Class to resolve its most specific rule."
            >
              <MenuItem value="*">All classes fallback</MenuItem>
              {filters.classOptions
                .filter((item) => item.id !== 'All Classes')
                .map((item) => (
                  <MenuItem key={item.id} value={item.id}>
                    {item.name}
                  </MenuItem>
                ))}
            </TextField>
          </Box>
          <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
            {[
              ['Profile', profile?.name ?? 'No profile'],
              ['Scope', scope.label],
              [
                'Board',
                boardId
                  ? filters.boards.find((item) => item.id === boardId)?.name ?? boardId
                  : 'All Boards fallback',
              ],
              ['Class', selectedClass?.name ?? 'All classes fallback'],
              [
                'GR rule',
                grConfiguration
                  ? `${grConfiguration.name}: ${formatGrNumber(grConfiguration, 0, {
                      academicYearName: scope.academicYearName,
                      schoolCode: scope.schoolCode,
                    })}`
                  : 'No applicable active series',
              ],
              [
                'Roll timing',
                rollAssignmentTimingOptions.find(
                  (option) => option.value === rollConfiguration.assignmentTiming
                )?.label ?? rollConfiguration.assignmentTiming,
              ],
              [
                'Mid-year rule',
                midYearHandlingOptions.find(
                  (option) => option.value === rollConfiguration.midYearHandling
                )?.label ?? rollConfiguration.midYearHandling,
              ],
              [
                'Division strategy',
                divisionStrategyOptions.find(
                  (option) => option.value === divisionConfiguration.automaticStrategy
                )?.label ?? divisionConfiguration.automaticStrategy,
              ],
              ['Approval', approvalSummary],
            ].map(([label, value], index) => (
              <Stack
                key={label}
                direction={{ xs: 'column', sm: 'row' }}
                spacing={0.5}
                sx={{
                  px: 1.5,
                  py: 1.25,
                  borderTop: index ? 1 : 0,
                  borderColor: 'divider',
                }}
              >
                <Typography variant="caption" color="text.secondary" sx={{ width: 130 }}>
                  {label}
                </Typography>
                <Typography variant="body2" fontWeight={600} sx={{ flex: 1 }}>
                  {value}
                </Typography>
              </Stack>
            ))}
          </Paper>
          <Typography variant="caption" color="text.secondary">
            Final capacity, uniqueness, scheduling, permission, and notification decisions remain
            backend-owned when persistence is connected.
          </Typography>
        </SettingsSectionCard>
      </Stack>
    </SettingsDrawer>
  );
}

const numberingPlacementTabs = [
  { value: 'gr-number', label: 'GR Number', icon: 'mdi:identifier' },
  { value: 'roll-number', label: 'Roll Number', icon: 'mdi:format-list-numbered' },
  { value: 'division-changes', label: 'Division Changes', icon: 'mdi:account-switch-outline' },
] as const;

export function NumberingPlacementSettingsScreen() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [policyPreviewOpen, setPolicyPreviewOpen] = useState(false);
  const requestedTab = searchParams.get('tab');
  const activeTab = numberingPlacementTabs.some((tab) => tab.value === requestedTab)
    ? requestedTab
    : 'gr-number';
  const handleTabChange = useCallback(
    (_event: unknown, value: string) => {
      if (value === requestedTab) return;

      const nextSearchParams = new URLSearchParams(searchParams.toString());
      nextSearchParams.set('tab', value);
      router.push(`${pathname}?${nextSearchParams.toString()}`, { scroll: false });
    },
    [pathname, requestedTab, router, searchParams]
  );

  return (
    <Stack spacing={1.25} sx={{ minWidth: 0, minHeight: 0, height: '100%' }}>
      <CustomBreadcrumbs
        heading="Numbering & Placement"
        description=" "
        tooltipProps={
          {
            title: (
              <OnboardingSettingsBreadcrumbInfo
                title="Numbering & Placement settings"
                description="Configure GR and roll numbering together with safe division-change behavior."
                items={[
                  'Maintain GR identifier series and class-wise Roll number rules.',
                  'Configure Division assignment, capacity, and approval behavior.',
                ]}
              />
            ),
            sx: { textAlign: 'left' },
          } as TooltipProps
        }
        links={[
          { name: 'Student Management', href: studentPaths.dashboard },
          { name: 'Student Onboarding', href: studentPaths.onboarding.setup },
          { name: 'Settings', href: studentPaths.onboarding.settings },
          { name: 'Numbering & Placement' },
        ]}
        slotProps={{
          action: {},
          heading: { overflowWrap: 'normal', textWrap: 'wrap' },
          moreLink: {},
          breadcrumbs: { display: { xs: 'none', md: 'block' } },
        }}
        sx={{
          flexDirection: { xs: 'column !important', md: 'row !important' },
          alignItems: { xs: 'stretch', md: 'center' },
          gap: { xs: 0, md: 2 },
          minHeight: { xs: 'auto', md: 56 },
          py: { xs: 0.75, md: 0 },
          '& .MuiBreadcrumbs-root': { display: { xs: 'none', md: 'block' } },
          '& .MuiTypography-h6': { overflowWrap: 'normal !important' },
        }}
      />
      <OnboardingConfigurationScopeBar compact />
      <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          alignItems={{ xs: 'stretch', sm: 'center' }}
          sx={{ pr: { sm: 1 }, pb: { xs: 1, sm: 0 } }}
        >
          <Box sx={{ minWidth: 0, flex: 1, overflow: 'hidden' }}>
            <CustomTabs
              value={activeTab}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              allowScrollButtonsMobile
            >
              {numberingPlacementTabs.map((tab) => (
                <Tab
                  key={tab.value}
                  value={tab.value}
                  label={tab.label}
                  icon={<Iconify icon={tab.icon} width={20} />}
                  iconPosition="start"
                  sx={{ minHeight: 44, py: 1 }}
                />
              ))}
            </CustomTabs>
          </Box>
          <Button
            size="small"
            variant="outlined"
            startIcon={<Iconify icon="mdi:eye-outline" width={16} />}
            onClick={() => setPolicyPreviewOpen(true)}
            sx={{
              mx: { xs: 1, sm: 0 },
              borderRadius: 1.5,
              whiteSpace: 'nowrap',
            }}
          >
            Policy preview
          </Button>
        </Stack>
      </Paper>
      <Box
        role="tabpanel"
        id={`numbering-placement-panel-${activeTab}`}
        aria-label={numberingPlacementTabs.find((tab) => tab.value === activeTab)?.label}
        sx={{ minWidth: 0, minHeight: 0, flex: 1, display: 'flex', flexDirection: 'column' }}
      >
        {activeTab === 'gr-number' ? <GrNumberSettingsScreen embedded /> : null}
        {activeTab === 'roll-number' ? <RollNumberSettingsScreen embedded /> : null}
        {activeTab === 'division-changes' ? <DivisionChangesSettingsPanel /> : null}
      </Box>
      <EffectivePolicyPreview
        open={policyPreviewOpen}
        onClose={() => setPolicyPreviewOpen(false)}
      />
    </Stack>
  );
}
