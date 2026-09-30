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
  MenuItem,
  TextField,
  IconButton,
  Typography,
  FormControlLabel,
} from '@mui/material';

import { useOnboardingSettings } from '../onboarding-settings-context';
import { useOnboardingAcademicStructure } from './use-onboarding-academic-structure';
import { OnboardingSettingsBreadcrumbInfo } from './onboarding-settings-breadcrumb-info';
import {
  formatGrNumber,
  academicTargetsOverlap,
  getAcademicApplicabilityScore,
  defaultDivisionChangeConfiguration,
} from '../onboarding-settings-model';
import {
  SingleAcademicPathFields,
  getAcademicApplicabilitySummary,
  normalizeSingleAcademicApplicability,
  getSingleAcademicPathValidationError,
  createEmptySingleAcademicApplicability,
  buildOnboardingAcademicStructureOptions,
} from './onboarding-academic-applicability';

import type {
  GrNumberConfiguration,
  RollNumberConfiguration,
  DivisionChangeConfiguration,
} from '../onboarding-settings-model';


const rollNumberScopeOptions = [
  { value: 'class-division', label: 'Class and Division' },
  { value: 'class', label: 'Entire Class' },
];


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
  buttonLabel,
  buttonIcon = 'mdi:plus',
  onClick,
}: {
  title: string;
  icon: string;
  summaries: string[];
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

const academicApplicabilitySchemaFields = {
  boardMode: Yup.string().oneOf(['selected'], 'Select one Board').required(),
  boardIds: Yup.array().of(Yup.string().required()).length(1, 'Select one Board'),
  mediumMode: Yup.string().oneOf(['selected'], 'Select one Medium').required(),
  academicMediumIds: Yup.array().of(Yup.string().required()).length(1, 'Select one Medium'),
  stageMode: Yup.string().oneOf(['selected'], 'Select one School Level').required(),
  academicMediumStageIds: Yup.array()
    .of(Yup.string().required())
    .min(1, 'Select at least one School Level'),
  classMode: Yup.string().oneOf(['selected'], 'Select one Class').required(),
  standardIds: Yup.array().of(Yup.string().required()).min(1, 'Select at least one Standard'),
  divisionMode: Yup.string().oneOf(['all', 'selected']).required(),
  divisionIds: Yup.array().of(Yup.string().required()).when('divisionMode', {
    is: 'selected', then: (schema) => schema.min(1, 'Select at least one Division'),
  }),
  includeFutureStructures: Yup.boolean().required(),
};

const grSchema = Yup.object({
  ...academicApplicabilitySchemaFields,
  name: Yup.string().trim().required('Enter a series name').max(80),
  prefix: Yup.string().max(12, 'Prefix must be 12 characters or fewer'),
  startingNumber: Yup.number().integer().min(1, 'Starting number must be at least 1').required(),
  padding: Yup.number().integer().min(1).max(12, 'Padding must be between 1 and 12').required(),
  suffix: Yup.string().max(12, 'Suffix must be 12 characters or fewer'),
  formatPattern: Yup.string()
    .trim()
    .required('Enter a format pattern')
    .test('sequence-token', 'Use one {SEQUENCE} and only PREFIX, SUFFIX, YEAR or YEAR_SHORT tokens.', (value) =>
      Boolean(value && value.split('{SEQUENCE}').length === 2 && !value.replace(/\{(?:PREFIX|SUFFIX|YEAR|YEAR_SHORT|SEQUENCE)\}/g, '').match(/[{}]/))
    ),
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
  ...academicApplicabilitySchemaFields,
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
  ...createEmptySingleAcademicApplicability(),
  name: '',
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
      getAcademicApplicabilityScore(candidate) === getAcademicApplicabilityScore(existing) &&
      academicTargetsOverlap(candidate, existing) &&
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
                'Review the configured rules and their academic paths.',
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
  const filters = useOnboardingAcademicStructure();
  const { settings, scope, saveGrNumberConfiguration } = useOnboardingSettings();
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingConfigurationId, setEditingConfigurationId] = useState<string | null>(null);
  const { configurations } = settings.grNumber;
  const formik = useFormik<GrNumberFormValues>({
    initialValues: createGrNumberFormValues(),
    validationSchema: grSchema,
    onSubmit: async (values, helpers) => {
      const applicability = normalizeSingleAcademicApplicability(values, filters.boards);
      const configuration: GrNumberConfiguration = {
        ...values,
        ...applicability,
        applicableProfileIds: settings.onboardingProfiles.map((profile) => profile.id),
        id: editingConfigurationId ?? `gr-${Date.now()}`,
      };

      if (hasGrSeriesOverlap(configuration, configurations)) {
        helpers.setStatus(
          'This active series overlaps another series for the same academic path, format, scope, and number range.'
        );
        return;
      }

      await saveGrNumberConfiguration(configuration);
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
        applicableProfileIds: settings.onboardingProfiles.map((profile) => profile.id),
      },
    });
    setEditorOpen(true);
  };

  const openExistingConfiguration = (configuration: GrNumberConfiguration) => {
    const applicability = normalizeSingleAcademicApplicability(configuration, filters.boards);
    setEditingConfigurationId(configuration.id);
    formik.resetForm({
      values: {
        ...configuration,
        ...applicability,
        applicableProfileIds: settings.onboardingProfiles.map((profile) => profile.id),
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
      id: 'academicCoverage',
      label: 'Academic Path',
      width: 360,
      minWidth: 280,
      isFilter: false,
      render: (_value: string, row: IData) => {
        const configuration = configurations.find((item) => item.id === String(row.id));
        return configuration ? getAcademicApplicabilitySummary(configuration, filters.allBoards, filters.campuses) : '—';
      },
    },
    {
      id: 'sequenceScope',
      label: 'Sequence Scope',
      width: 160,
      minWidth: 145,
      render: (value: string) => (value === 'academic-year' ? 'Academic year' : 'School-wide'),
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
          'Saved scope',
        ]}
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
          noDataText={<>No identifier series configurations are available for this scope.</>}
        />
      </Box>
      <SettingsDrawer
        open={editorOpen}
        title={`${editingConfigurationId ? 'Edit' : 'Add'} Identifier Series Configuration`}
        description="Control where the series applies, how it increments, and whether staff can override it."
        icon="mdi:identifier"
        statusLabel={editingConfigurationId ? 'Editing series' : 'New series'}
        footerNote="Saved for the selected scope and reused by Student Setup after reload."
        onClose={() => {
          formik.resetForm();
          setEditingConfigurationId(null);
          setEditorOpen(false);
        }}
        onSubmit={() => formik.submitForm()}
      >
        <Stack spacing={2} component="form" onSubmit={formik.handleSubmit}>

          {formik.status ? <Alert severity="error">{String(formik.status)}</Alert> : null}

          <SettingsSectionCard
            icon="mdi:target-account"
            title="Series details"
            description="Give staff a clear series name and choose a Board, Medium, School Levels, and Standards."
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
              helperText={formik.touched.name ? formik.errors.name : undefined}
            />
            <SingleAcademicPathFields
              value={formik.values}
              boards={filters.boards}
              campuses={filters.campuses}
              campusesLoading={filters.campusesLoading}
              campusesError={filters.campusesError}
              showErrors={formik.submitCount > 0}
              onChange={(applicability) => {
                formik.setValues({ ...formik.values, ...applicability }, false);
                formik.setStatus(undefined);
              }}
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
                  : 'Tokens: {PREFIX}, {SEQUENCE}, {SUFFIX}, {YEAR}, {YEAR_SHORT}. Put your school code in Prefix.'
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
                helperText={formik.touched.prefix ? formik.errors.prefix : undefined}
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
                helperText={formik.touched.padding ? formik.errors.padding : undefined}
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
                helperText={formik.touched.suffix ? formik.errors.suffix : undefined}
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
                helperText={formik.touched.maximumNumber ? formik.errors.maximumNumber : undefined}
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
                <Label color="info">Format example</Label>
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
                    checked
                    disabled
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

type RollNumberFormValues = Omit<
  RollNumberConfiguration,
  'id' | 'classId' | 'className' | 'orderingRules'
> & {
  tieBreakerOne: '' | RollNumberConfiguration['arrangeBy'];
  tieBreakerOneDirection: RollNumberConfiguration['arrangeType'];
  tieBreakerTwo: '' | RollNumberConfiguration['arrangeBy'];
  tieBreakerTwoDirection: RollNumberConfiguration['arrangeType'];
};

const createRollNumberFormValues = (): RollNumberFormValues => ({
  ...createEmptySingleAcademicApplicability(),
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
      getAcademicApplicabilityScore(existing) === getAcademicApplicabilityScore(candidate) &&
      academicTargetsOverlap(existing, candidate)
  );

export function RollNumberSettingsScreen({ embedded = false }: { embedded?: boolean }) {
  const filters = useOnboardingAcademicStructure();
  const { settings, saveRollNumberConfiguration } = useOnboardingSettings();
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingConfigurationId, setEditingConfigurationId] = useState<string | null>(null);
  const { configurations } = settings.rollNumber;
  const formik = useFormik<RollNumberFormValues>({
    initialValues: createRollNumberFormValues(),
    validationSchema: rollSchema,
    onSubmit: async (values, helpers) => {
      const applicability = normalizeSingleAcademicApplicability(values, filters.boards);
      const academicOptions = buildOnboardingAcademicStructureOptions(filters.boards);
      const selectedStandards = academicOptions.standards.filter((item) =>
        applicability.standardIds.includes(item.id)
      );
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
        ...applicability,
        orderingRules,
        id: editingConfigurationId ?? `roll-${Date.now()}`,
        classId:
          applicability.classMode === 'selected' && applicability.standardIds.length === 1
            ? applicability.standardIds[0]
            : '*',
        className:
          applicability.classMode === 'all'
            ? 'All classes'
            : selectedStandards.map((item) => item.name).join(', ') || 'Selected classes',
      };

      if (hasRollConfigurationOverlap(configuration, configurations)) {
        helpers.setStatus(
          'An active Roll Number rule already targets the same Board and Class applicability.'
        );
        return;
      }

      await saveRollNumberConfiguration(configuration);
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
    const applicability = normalizeSingleAcademicApplicability(configuration, filters.boards);
    setEditingConfigurationId(configuration.id);
    formik.resetForm({
      values: {
        ...configuration,
        ...applicability,
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
      id: 'academicCoverage',
      label: 'Academic Path',
      width: 380,
      minWidth: 300,
      isFilter: false,
      render: (_value: unknown, row: IData) => {
        const configuration = configurations.find((item) => item.id === String(row.id));
        return configuration ? getAcademicApplicabilitySummary(configuration, filters.allBoards, filters.campuses) : '—';
      },
    },
    {
      id: 'numberingScope',
      label: 'Scope',
      width: 160,
      render: (value: string) =>
        rollNumberScopeOptions.find((option) => option.value === value)?.label ?? value,
    },
    { id: 'startingNumber', label: 'Starts At', width: 105, filterType: 'number' as const },
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
          description="Configure Roll number scope, starting values, and approval requirements for Student Onboarding."
        />
      ) : null}
      <NumberingWorkspaceBar
        title="Class-wise roll number rules"
        icon="mdi:format-list-numbered"
        summaries={[
          `${configurations.length} configured rules`,
          `${configurations.filter((configuration) => configuration.classMode === 'selected').length} specific academic paths`,
          'Saved scope',
        ]}
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
          noDataText={<>No Roll Number configurations are available for this scope.</>}
        />
      </Box>
      <SettingsDrawer
        open={editorOpen}
        title={`${editingConfigurationId ? 'Edit' : 'Add'} Roll Number Configuration`}
        description="Choose where Roll numbers must be unique, their starting value, and required approvals."
        icon="mdi:format-list-numbered"
        statusLabel={editingConfigurationId ? 'Editing rule' : 'New rule'}
        footerNote="Saved for the selected scope and reused by Student Setup after reload."
        onClose={() => {
          formik.resetForm();
          setEditingConfigurationId(null);
          setEditorOpen(false);
        }}
        onSubmit={() => formik.submitForm()}
      >
        <Stack spacing={2} component="form" onSubmit={formik.handleSubmit}>
          <Alert severity="info">
            Saved rules are checked when staff assign Roll numbers in Student Setup. Duplicate
            numbers within the selected numbering scope are blocked.
          </Alert>
          {formik.status ? <Alert severity="error">{String(formik.status)}</Alert> : null}
          <SettingsSectionCard
            icon="mdi:calendar-account-outline"
            title="Academic path and numbering scope"
            description="Choose a Board and Medium, then select School Levels, Standards, and the numbering scope."
          >
            <SingleAcademicPathFields
              value={formik.values}
              boards={filters.boards}
              campuses={filters.campuses}
              campusesLoading={filters.campusesLoading}
              campusesError={filters.campusesError}
              showErrors={formik.submitCount > 0}
              onChange={(applicability) => {
                formik.setValues({ ...formik.values, ...applicability }, false);
                formik.setStatus(undefined);
              }}
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
            </Box>
          </SettingsSectionCard>

          <Alert severity="info">Roll numbers are entered by authorized staff during identifier preparation. Existing students are not renumbered automatically.</Alert>

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
              helperText={formik.touched.startingNumber ? formik.errors.startingNumber : undefined}
            />
            <Stack spacing={0.5}>
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
                label="Require approval after Roll number preparation"
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
          </SettingsSectionCard>
        </Stack>
      </SettingsDrawer>
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
  ...createEmptySingleAcademicApplicability(),
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
      getAcademicApplicabilityScore(existing) === getAcademicApplicabilityScore(candidate) &&
      academicTargetsOverlap(existing, candidate)
  );

export function DivisionChangesSettingsPanel() {
  const filters = useOnboardingAcademicStructure();
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
    const applicability = normalizeSingleAcademicApplicability(configuration, filters.boards);
    const initial = {
      ...configuration,
      ...applicability,
    };
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
  const applyDraft = async () => {
    if (!draft.name.trim()) {
      setValidationError('Enter a rule name.');
      return;
    }
    const applicability = normalizeSingleAcademicApplicability(draft, filters.boards);
    const applicabilityError = getSingleAcademicPathValidationError(applicability);
    if (applicabilityError) {
      setValidationError(applicabilityError);
      return;
    }
    const academicOptions = buildOnboardingAcademicStructureOptions(filters.boards);
    const selectedStandards = academicOptions.standards.filter((item) =>
      applicability.standardIds.includes(item.id)
    );
    const configuration: DivisionChangeConfiguration = {
      ...draft,
      ...applicability,
      id: editingConfigurationId ?? `division-${Date.now()}`,
      name: draft.name.trim(),
      classId:
        applicability.classMode === 'selected' && applicability.standardIds.length === 1
          ? applicability.standardIds[0]
          : '*',
      className:
        applicability.classMode === 'all'
          ? 'All classes'
          : selectedStandards.map((item) => item.name).join(', ') || 'Selected classes',
    };
    if (hasDivisionConfigurationOverlap(configuration, configurations)) {
      setValidationError(
        'An active Division rule already targets an overlapping academic applicability path.'
      );
      return;
    }
    await saveDivisionChangeConfiguration(configuration);
    setEditorOpen(false);
  };
  const tableData = configurations.map((configuration) => ({
    ...configuration,
    academicCoverage: getAcademicApplicabilitySummary(configuration, filters.allBoards, filters.campuses),
    assignmentMethod: 'Manual placement',
    capacity: 'Live capacity; full divisions blocked',
    approval: configuration.requireApproval ? 'Required for changes' : 'Readiness rule applies',
    effectiveDateLabel: configuration.effectiveDate
      ? dayjs(configuration.effectiveDate).format('DD MMM YYYY')
      : 'Immediate',
  }));
  const columns = [
    { id: 'name', label: 'Rule', width: 190, minWidth: 170 },
    { id: 'academicCoverage', label: 'Academic Path', width: 380, minWidth: 300 },
    { id: 'assignmentMethod', label: 'Assignment Method', width: 175, minWidth: 155 },
    { id: 'capacity', label: 'Capacity', width: 170, minWidth: 150 },
    { id: 'approval', label: 'Approval', width: 170, minWidth: 150 },
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
          `${configurations.filter((item) => getAcademicApplicabilityScore(item) > 0).length} specific academic paths`,
          'Saved scope',
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
        description="Choose where placement rules apply and whether changes need a reason or approval."
        icon="mdi:account-switch-outline"
        statusLabel={editingConfigurationId ? 'Editing rule' : 'New override'}
        footerNote="Saved for the selected scope and reused by Student Setup after reload."
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
            Saved rules apply when authorized staff select or change a Division in Student Setup.
            Full divisions cannot be selected.
          </Alert>
          {validationError ? <Alert severity="error">{validationError}</Alert> : null}
          <SettingsSectionCard
            icon="mdi:target-account"
            title="Academic path"
            description="Choose a Board and Medium, then select the School Levels and Standards where this rule applies."
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
              helperText={validationError && !draft.name.trim() ? validationError : undefined}
            />
            <SingleAcademicPathFields
              value={draft}
              boards={filters.boards}
              campuses={filters.campuses}
              campusesLoading={filters.campusesLoading}
              campusesError={filters.campusesError}
              showErrors={Boolean(validationError && validationError.startsWith('Select one'))}
              onChange={(applicability) => {
                setDraft((current) => ({ ...current, ...applicability }));
                setValidationError('');
              }}
            />
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
          <SettingsSectionCard icon="mdi:account-group-outline" title="Assignment and capacity" description="Staff reserve a division using live capacity.">
            <Alert severity="info">Placement is manual. Full divisions are blocked; automatic balancing and capacity overrides are not available.</Alert>
          </SettingsSectionCard>
          <SettingsSectionCard
            icon="mdi:shield-check-outline"
            title="Change approval"
            description="Choose the reason and approval requirements and when this rule takes effect."
          >
            <DivisionRuleRow
              title="Require a change reason"
              description="Require staff to explain changes to an onboarding student's Division."
              checked={draft.requireReason}
              onChange={setBooleanRule('requireReason')}
            />
            <Divider />
            <DivisionRuleRow
              title="Require approval"
              description="Require onboarding approval after a Division change before activation."
              checked={draft.requireApproval}
              onChange={setBooleanRule('requireApproval')}
            />
            <Divider />
            <DatePicker
              label="Effective date for Division changes"
              value={toDateValue(draft.effectiveDate)}
              onChange={(value) =>
                setDraft((current) => ({ ...current, effectiveDate: toIsoDate(value) }))
              }
              format="DD/MM/YYYY"
              slotProps={{ textField: { fullWidth: true, size: 'small' } }}
            />
          </SettingsSectionCard>
        </Stack>
      </SettingsDrawer>
    </Stack>
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
    </Stack>
  );
}
