'use client';

import type { ReactNode } from 'react';
import type { TooltipProps } from '@mui/material';
import type { IData, IColumn } from 'src/components/customizabaleTable/types';

import dayjs from 'dayjs';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { Label } from 'src/components/label';
import { LoadingButton } from '@mui/lab';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { CustomTabs } from 'src/components/custom-tabs';
import CustomTooltip from 'src/components/custom-tooltip';
import { studentPaths } from 'src/constants/student-menu';
import { useRef, useState, useEffect, useCallback } from 'react';
import ThreeDotsActions from 'src/components/three-dots-actions';
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
  CircularProgress,
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
  { value: 'class-division', label: 'Class and division' },
  { value: 'class', label: 'Entire class' },
];


export function SettingsDrawer({
  open,
  title,
  description,
  descriptionDisplay = 'inline',
  icon,
  statusLabel,
  footerNote,
  onClose,
  children,
  onSubmit,
  submitLabel = 'Apply configuration',
  submitIcon = GlobalIcons.submit,
  submitDisabled = false,
  onReset,
  resetDisabled = false,
  showCancel = true,
  busy = false,
}: {
  open: boolean;
  title: string;
  description: string;
  descriptionDisplay?: 'inline' | 'tooltip';
  icon: string;
  statusLabel: string;
  footerNote?: string;
  onClose: () => void;
  children: ReactNode;
  onSubmit: () => void;
  submitLabel?: string;
  submitIcon?: string | null;
  submitDisabled?: boolean;
  onReset?: () => void;
  resetDisabled?: boolean;
  showCancel?: boolean;
  busy?: boolean;
}) {
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={busy ? undefined : onClose}
      transitionDuration={{ enter: 300, exit: 250 }}
      PaperProps={{
        role: 'dialog',
        'aria-modal': true,
        'aria-label': title,
        sx: {
          width: { xs: '100%', sm: descriptionDisplay === 'tooltip' ? 'min(840px, 96vw)' : 'min(760px, 95vw)' },
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
          {descriptionDisplay === 'inline' && (
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
          )}
          <Box sx={{ minWidth: 0 }}>
            <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap" useFlexGap>
              <Typography component="h2" variant="subtitle1" fontWeight={700}>
                {title}
              </Typography>
              {descriptionDisplay === 'tooltip' && (
                <>
                  {statusLabel && <Label color="default" variant="outlined">{statusLabel}</Label>}
                  <CustomTooltip arrow placement="bottom" title={description}>
                    <IconButton size="small" aria-label={`${title} information`}>
                      <Iconify icon="lucide:info" width={16} sx={{ color: 'info.main' }} aria-hidden />
                    </IconButton>
                  </CustomTooltip>
                </>
              )}
            </Stack>
            {descriptionDisplay === 'inline' && (
              <Typography variant="caption" color="text.secondary">{description}</Typography>
            )}
          </Box>
        </Stack>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ flexShrink: 0 }}>
          {descriptionDisplay === 'inline' && (
            <Label
              color="default"
              variant="outlined"
              sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
            >
              {statusLabel}
            </Label>
          )}
          <IconButton
            aria-label={`Close ${title}`}
            onClick={onClose}
            disabled={busy}
            sx={{ minWidth: 44, minHeight: 44 }}
          >
            <Iconify icon="mdi:close" width={20} />
          </IconButton>
        </Stack>
      </Stack>
      <Box sx={{ flex: 1, minHeight: 0, position: 'relative' }}>
        <Scrollbar sx={{ height: 1, p: { xs: 1.5, sm: 2 }, bgcolor: descriptionDisplay === 'tooltip' ? 'background.neutral' : 'background.paper' }}>
          <Box component="fieldset" disabled={busy} sx={{ border: 0, m: 0, p: 0, minWidth: 0 }}>
            {children}
          </Box>
        </Scrollbar>
        {busy && (
          <Stack
            role="status"
            alignItems="center"
            justifyContent="center"
            spacing={1}
            sx={{ position: 'absolute', inset: 0, bgcolor: 'background.paper', opacity: 0.9 }}
          >
            <CircularProgress size={26} />
            <Typography variant="body2">Saving configuration…</Typography>
          </Stack>
        )}
      </Box>
      <Divider />
      <Stack
        component="footer"
        direction={{ xs: 'column', sm: 'row' }}
        alignItems={{ sm: 'center' }}
        justifyContent="space-between"
        gap={1}
        sx={{ px: 2, py: 1.75, flexShrink: 0, bgcolor: 'background.paper' }}
      >
        {footerNote ? (
          <Typography variant="caption" color="text.secondary" sx={{ flex: 1 }}>
            {footerNote}
          </Typography>
        ) : <Box sx={{ flex: 1 }} />}
        <Stack direction="row" justifyContent="flex-end" spacing={1} sx={{ flexShrink: 0 }}>
          {onReset ? (
            <Button
              variant="outlined"
              size="small"
              startIcon={<Iconify icon={GlobalIcons.resetIcon} width={18} />}
              disabled={busy || resetDisabled}
              onClick={onReset}
            >
              Reset
            </Button>
          ) : null}
          {showCancel ? (
            <Button
              variant="outlined"
              size="small"
              startIcon={<Iconify icon={GlobalIcons.cancel} width={18} />}
              disabled={busy}
              onClick={onClose}
            >
              Cancel
            </Button>
          ) : null}
          <LoadingButton
            variant="contained"
            size="small"
            startIcon={submitIcon ? <Iconify icon={submitIcon} width={18} /> : undefined}
            loading={busy}
            disabled={busy || submitDisabled}
            onClick={onSubmit}
          >
            {submitLabel}
          </LoadingButton>
        </Stack>
      </Stack>
    </Drawer>
  );
}

export function SettingsSectionCard({
  icon,
  title,
  description,
  descriptionDisplay = 'inline',
  children,
}: {
  icon: string;
  title: string;
  description: string;
  descriptionDisplay?: 'inline' | 'tooltip';
  children: ReactNode;
}) {
  return (
    <Card variant="outlined" sx={{ p: { xs: 1.5, sm: 2 }, borderRadius: descriptionDisplay === 'tooltip' ? 2 : undefined }}>
      <Stack spacing={1.5}>
        <Stack direction="row" spacing={1} alignItems={descriptionDisplay === 'tooltip' ? 'center' : 'flex-start'}>
          <Box
            sx={{
              width: descriptionDisplay === 'tooltip' ? 24 : 36,
              height: descriptionDisplay === 'tooltip' ? 24 : 36,
              flexShrink: 0,
              display: 'grid',
              placeItems: 'center',
              borderRadius: 1,
              bgcolor: descriptionDisplay === 'tooltip' ? 'transparent' : 'background.neutral',
              color: 'text.secondary',
            }}
          >
            <Iconify icon={icon} width={20} />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Stack direction="row" spacing={0.5} alignItems="center">
              <Typography component="h3" variant="subtitle2">{title}</Typography>
              {descriptionDisplay === 'tooltip' && (
                <CustomTooltip arrow placement="right" title={description}>
                  <IconButton size="small" aria-label={`${title} information`}>
                    <Iconify icon="lucide:info" width={16} sx={{ color: 'info.main' }} aria-hidden />
                  </IconButton>
                </CustomTooltip>
              )}
            </Stack>
            {descriptionDisplay === 'inline' && (
              <Typography variant="caption" color="text.secondary">{description}</Typography>
            )}
          </Box>
        </Stack>
        <Stack spacing={descriptionDisplay === 'tooltip' ? 2 : 1.5}>{children}</Stack>
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
  name: Yup.string().trim().required('Series name is required').max(80, 'Series name must be 80 characters or fewer'),
  prefix: Yup.string().max(12, 'Prefix must be 12 characters or fewer'),
  startingNumber: Yup.number()
    .typeError('Starting number must be a whole number')
    .integer('Starting number must be a whole number')
    .min(1, 'Starting number must be at least 1')
    .max(Number.MAX_SAFE_INTEGER, 'Starting number is too large')
    .required('Starting number is required'),
  padding: Yup.number()
    .typeError('Number padding must be a whole number')
    .integer('Number padding must be a whole number')
    .min(1, 'Number padding must be between 1 and 12')
    .max(12, 'Number padding must be between 1 and 12')
    .required('Number padding is required'),
  suffix: Yup.string().max(12, 'Suffix must be 12 characters or fewer'),
  formatPattern: Yup.string()
    .trim()
    .required('Enter a format pattern')
    .test('sequence-token', 'Use one {SEQUENCE} and only PREFIX, SUFFIX, YEAR or YEAR_SHORT tokens.', (value) =>
      Boolean(value && value.split('{SEQUENCE}').length === 2 && !value.replace(/\{(?:PREFIX|SUFFIX|YEAR|YEAR_SHORT|SEQUENCE)\}/g, '').match(/[{}]/))
    ),
  sequenceScope: Yup.string().oneOf(['school', 'academic-year'], 'Select a sequence scope').required('Select a sequence scope'),
  resetPolicy: Yup.string().oneOf(['continuous', 'academic-year'], 'Select a reset policy').required('Select a reset policy'),
  maximumNumber: Yup.number()
    .nullable()
    .transform((value, originalValue) => (originalValue === '' ? null : value))
    .typeError('Maximum number must be a whole number')
    .integer('Maximum number must be a whole number')
    .min(1, 'Maximum number must be at least 1')
    .max(Number.MAX_SAFE_INTEGER, 'Maximum number is too large')
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
  effectiveFrom: Yup.string().test('valid-date', 'Enter a valid effective date', (value) =>
    !value || /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value
  ),
  isActive: Yup.boolean().required(),
});

const rollSchema = Yup.object({
  ...academicApplicabilitySchemaFields,
  numberingScope: Yup.string()
    .oneOf(['class-division', 'class'], 'Select a numbering scope')
    .required('Select a numbering scope'),
  assignmentTiming: Yup.string().required('Select assignment timing'),
  midYearHandling: Yup.string().required('Select mid-year handling'),
  arrangeBy: Yup.string().required('Select an arrange-by option'),
  arrangeType: Yup.string().required('Select an arrange type'),
  tieBreakerOne: Yup.string(),
  tieBreakerOneDirection: Yup.string(),
  tieBreakerTwo: Yup.string(),
  tieBreakerTwoDirection: Yup.string(),
  startingNumber: Yup.number()
    .typeError('Starting number must be a whole number')
    .integer('Starting number must be a whole number')
    .min(1, 'Starting number must be at least 1')
    .max(Number.MAX_SAFE_INTEGER, 'Starting number is too large')
    .required('Starting number is required'),
  preserveExisting: Yup.boolean().required(),
  allowIndividualLocks: Yup.boolean().required(),
  requireChangeReason: Yup.boolean().required(),
  requireApproval: Yup.boolean().required(),
  effectiveFrom: Yup.string().test('valid-date', 'Enter a valid effective date', (value) =>
    !value || /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value
  ),
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
      description={description}
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
        { name: 'Student', href: studentPaths.dashboard },
        { name: 'Onboarding', href: studentPaths.onboarding.setup },
        { name: 'Settings', href: studentPaths.onboarding.settings },
        { name: title },
      ]}
    />
  );
}

type CreateActionRef = { current: (() => void) | null };

export function GrNumberSettingsScreen({
  embedded = false,
  showWorkspaceBar = true,
  createActionRef,
}: {
  embedded?: boolean;
  showWorkspaceBar?: boolean;
  createActionRef?: CreateActionRef;
}) {
  const filters = useOnboardingAcademicStructure();
  const { settings, scope, saveGrNumberConfiguration } = useOnboardingSettings();
  const formRef = useRef<HTMLFormElement>(null);
  const focusedSubmitCount = useRef(0);
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
        requireManualReason: values.manualEntryAllowed,
        requireManualApproval: values.manualEntryAllowed && values.requireManualApproval,
        applicableProfileIds: settings.onboardingProfiles.map((profile) => profile.id),
        id: editingConfigurationId ?? `gr-${Date.now()}`,
      };

      if (hasGrSeriesOverlap(configuration, configurations)) {
        helpers.setStatus(
          'This active series overlaps another series for the same academic path, format, scope, and number range.'
        );
        return;
      }

      try {
        await saveGrNumberConfiguration(configuration);
        helpers.resetForm();
        setEditingConfigurationId(null);
        setEditorOpen(false);
      } catch {
        helpers.setStatus('The series could not be saved. Review the values and try again.');
      }
    },
  });

  useEffect(() => {
    if (!editorOpen || !formik.submitCount || formik.isValid ||
      focusedSubmitCount.current === formik.submitCount) return;
    focusedSubmitCount.current = formik.submitCount;
    formRef.current?.querySelector<HTMLElement>('.Mui-error input, .Mui-error [role="combobox"]')?.focus();
  }, [editorOpen, formik.submitCount, formik.isValid]);

  const closeEditor = () => {
    if (formik.isSubmitting) return;
    if (formik.dirty && !window.confirm('Discard unsaved identifier-series changes?')) return;
    formik.resetForm();
    setEditingConfigurationId(null);
    setEditorOpen(false);
  };

  const openNewConfiguration = () => {
    setEditingConfigurationId(null);
    focusedSubmitCount.current = 0;
    formik.resetForm({
      values: {
        ...createGrNumberFormValues(),
        applicableProfileIds: settings.onboardingProfiles.map((profile) => profile.id),
      },
    });
    setEditorOpen(true);
  };

  useEffect(() => {
    if (!createActionRef) return undefined;
    createActionRef.current = openNewConfiguration;
    return () => { createActionRef.current = null; };
  });

  const openExistingConfiguration = (configuration: GrNumberConfiguration) => {
    const applicability = normalizeSingleAcademicApplicability(configuration, filters.boards);
    setEditingConfigurationId(configuration.id);
    focusedSubmitCount.current = 0;
    formik.resetForm({
      values: {
        ...configuration,
        ...applicability,
        requireManualReason: configuration.manualEntryAllowed,
        requireManualApproval: configuration.manualEntryAllowed && configuration.requireManualApproval,
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

  const tableData = configurations.map((configuration) => ({
    ...configuration,
    academicCoverage: getAcademicApplicabilitySummary(
      configuration, filters.allBoards, filters.campuses
    ),
    sequenceScope: configuration.sequenceScope === 'academic-year' ? 'Academic year' : 'School-wide',
    preview: formatGrNumber(configuration, 0, formatContext),
    status: configuration.isActive ? 'Active' : 'Inactive',
  }));
  const columns: IColumn[] = [
    {
      id: 'name',
      label: 'Series name',
      minWidth: 250,
      filterType: 'string',
      sticky: true,
      stickyPosition: 'left',
      render: (value: string, row: IData) => (
        <Stack direction="row" spacing={1.25} alignItems="center" sx={{ minWidth: 0, py: 0.25 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              flexShrink: 0,
              display: 'grid',
              placeItems: 'center',
              borderRadius: '50%',
              bgcolor: 'info.lighter',
              color: 'info.dark',
            }}
          >
            <Typography variant="caption" fontWeight={700} aria-hidden>GR</Typography>
          </Box>
          <Stack spacing={0.25} sx={{ minWidth: 0 }}>
            <Typography variant="subtitle2" sx={{ overflowWrap: 'anywhere' }}>{value}</Typography>
            <Typography variant="caption" color="text.secondary">
              Starts at {row.startingNumber} · {row.padding}-digit sequence
            </Typography>
          </Stack>
        </Stack>
      ),
    },
    {
      id: 'academicCoverage',
      label: 'Academic coverage',
      minWidth: 300,
      filterType: 'string',
      cellSx: { whiteSpace: 'normal', overflowWrap: 'anywhere' },
    },
    {
      id: 'sequenceScope',
      label: 'Sequence scope',
      minWidth: 150,
      filterType: 'enum',
      enumOptions: [
        { label: 'School-wide', value: 'School-wide' },
        { label: 'Academic year', value: 'Academic year' },
      ],
    },
    {
      id: 'preview',
      label: 'Preview',
      minWidth: 150,
      filterType: 'string',
      render: (value: string) => <Label color="info">{value}</Label>,
    },
    {
      id: 'status',
      label: 'Status',
      width: 100,
      minWidth: 100,
      filterType: 'enum',
      enumOptions: [
        { label: 'Active', value: 'Active' },
        { label: 'Inactive', value: 'Inactive' },
      ],
      sticky: true,
      stickyPosition: 'right',
      render: (value: string) => (
        <Label color={value === 'Active' ? 'success' : 'default'} variant="soft">
          {value}
        </Label>
      ),
    },
    {
      id: 'actions',
      label: 'Actions',
      isFilter: false,
      isSort: false,
      align: 'right',
      width: 80,
      minWidth: 80,
      sticky: true,
      stickyPosition: 'right',
      excludeFromExport: true,
      render: (_value: string, row: IData) => {
        const configuration = configurations.find((item) => item.id === String(row.id));
        return configuration ? (
          <ThreeDotsActions sx={{ justifyContent: 'flex-end' }} showEditIcon showThreeDots={false}
            editLabel={`Edit ${configuration.name}`}
            handleEditClick={() => openExistingConfiguration(configuration)} />
        ) : null;
      },
    },
  ];

  return (
    <Stack spacing={1.25} sx={{ minWidth: 0, minHeight: 0, height: '100%' }}>
      {!embedded ? (
        <SettingsPageHeader
          title="Identifier Series"
          description="Define the General Register identifier format used by Onboarding."
        />
      ) : null}
      {showWorkspaceBar && (
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
          buttonLabel="Add series"
          onClick={openNewConfiguration}
        />
      )}
      <Box sx={{ minHeight: 0, minWidth: 0, flex: 1, display: 'flex', overflow: 'hidden' }}>
        <CustomizableTable
          tableId="student-onboarding-gr-number-settings"
          tableTitle="Identifier series"
          columns={columns}
          data={tableData}
          isFilter
          searchFieldProps={{ placeholder: 'Search...' }}
          wrapperProps={{ sx: { flex: 1, minHeight: { xs: 360, md: 0 }, minWidth: 0 } }}
          tableContainerProps={{ sx: { height: 1, minHeight: 0 } }}
          noDataText={<>No identifier series have been added yet.</>}
        />
      </Box>
      <SettingsDrawer
        open={editorOpen}
        title={`${editingConfigurationId ? 'Edit' : 'Add'} identifier series`}
        description="Control where the series applies, how it increments, and whether staff can override it."
        descriptionDisplay="tooltip"
        icon="mdi:identifier"
        statusLabel={formik.dirty ? 'Unsaved changes' : ''}
        onClose={closeEditor}
        onSubmit={() => formik.submitForm()}
        submitLabel="Submit"
        busy={formik.isSubmitting}
      >
        <Stack ref={formRef} spacing={2} component="form" onSubmit={formik.handleSubmit}>

          {formik.status ? <Alert severity="error">{String(formik.status)}</Alert> : null}

          <SettingsSectionCard
            icon="mdi:target-account"
            title="Series Details"
            description="Give staff a clear series name and choose a Board, Medium, School Levels, and Standards."
            descriptionDisplay="tooltip"
          >
            <TextField
              fullWidth
              size="small"
              required
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
              compactHelp
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
                required
                name="sequenceScope"
                label="Sequence scope"
                value={formik.values.sequenceScope}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.sequenceScope && Boolean(formik.errors.sequenceScope)}
                helperText={formik.touched.sequenceScope ? formik.errors.sequenceScope : undefined}
              >
                <MenuItem value="school">School-wide</MenuItem>
                <MenuItem value="academic-year">Academic year</MenuItem>
              </TextField>
              <TextField
                select
                fullWidth
                size="small"
                required
                name="resetPolicy"
                label="Reset policy"
                value={formik.values.resetPolicy}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.resetPolicy && Boolean(formik.errors.resetPolicy)}
                helperText={formik.touched.resetPolicy ? formik.errors.resetPolicy : undefined}
              >
                <MenuItem value="continuous">Never reset</MenuItem>
                <MenuItem value="academic-year">Reset each academic year</MenuItem>
              </TextField>
            </Box>
          </SettingsSectionCard>

          <SettingsSectionCard
            icon="mdi:form-textbox"
            title="Number Format And Range"
            description="Use exactly one {SEQUENCE} token. Available tokens: {PREFIX}, {SUFFIX}, {YEAR}, and {YEAR_SHORT}. Put the school code in Prefix if needed."
            descriptionDisplay="tooltip"
          >
            <TextField
              fullWidth
              size="small"
              required
              name="formatPattern"
              label="Format pattern"
              value={formik.values.formatPattern}
              onChange={(event) => {
                formik.handleChange(event);
                formik.setStatus(undefined);
              }}
              onBlur={formik.handleBlur}
              error={formik.touched.formatPattern && Boolean(formik.errors.formatPattern)}
              helperText={formik.touched.formatPattern ? formik.errors.formatPattern : undefined}
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
                required
                name="startingNumber"
                label="Starting number"
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
                required
                name="padding"
                label="Number padding"
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
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ p: 1.5, borderRadius: 1, bgcolor: 'background.neutral' }}>
              <Typography variant="caption" color="text.secondary">Preview</Typography>
              <Typography variant="subtitle2" fontFamily="monospace" sx={{ overflowWrap: 'anywhere' }}>
                {formatGrNumber(
                  { ...formik.values, id: editingConfigurationId ?? 'preview' },
                  0,
                  formatContext
                )}
              </Typography>
            </Stack>
          </SettingsSectionCard>

          <SettingsSectionCard
            icon="mdi:shield-account-outline"
            title="Manual Control"
            description="Authorized staff can enter a GR manually. A reason is always required; approval can be configured."
            descriptionDisplay="tooltip"
          >
            <Stack spacing={0.5}>
              <FormControlLabel
                control={
                  <Switch
                    name="manualEntryAllowed"
                    checked={formik.values.manualEntryAllowed}
                    onChange={(event) => {
                      formik.handleChange(event);
                      formik.setFieldValue('requireManualReason', event.target.checked);
                      if (!event.target.checked) {
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
                onBlur={formik.handleBlur}
                error={formik.touched.effectiveFrom && Boolean(formik.errors.effectiveFrom)}
                helperText={formik.touched.effectiveFrom ? formik.errors.effectiveFrom : undefined}
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

export function RollNumberSettingsScreen({
  embedded = false,
  showWorkspaceBar = true,
  createActionRef,
}: {
  embedded?: boolean;
  showWorkspaceBar?: boolean;
  createActionRef?: CreateActionRef;
}) {
  const filters = useOnboardingAcademicStructure();
  const { settings, saveRollNumberConfiguration } = useOnboardingSettings();
  const formRef = useRef<HTMLFormElement>(null);
  const focusedSubmitCount = useRef(0);
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
        startingNumber: Number(values.startingNumber),
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

      try {
        await saveRollNumberConfiguration(configuration);
        helpers.resetForm();
        setEditingConfigurationId(null);
        setEditorOpen(false);
      } catch {
        helpers.setStatus('The Roll Number Rule could not be saved. Review the values and try again.');
      }
    },
  });

  useEffect(() => {
    if (!editorOpen || !formik.submitCount || formik.isValid ||
      focusedSubmitCount.current === formik.submitCount) return;
    focusedSubmitCount.current = formik.submitCount;
    formRef.current?.querySelector<HTMLElement>('.Mui-error input, .Mui-error [role="combobox"]')?.focus();
  }, [editorOpen, formik.submitCount, formik.isValid]);

  const closeEditor = () => {
    if (formik.isSubmitting) return;
    if (formik.dirty && !window.confirm('Discard unsaved Roll Number Rule changes?')) return;
    formik.resetForm();
    setEditingConfigurationId(null);
    setEditorOpen(false);
  };

  const openNewConfiguration = () => {
    setEditingConfigurationId(null);
    focusedSubmitCount.current = 0;
    formik.resetForm({ values: createRollNumberFormValues() });
    setEditorOpen(true);
  };

  useEffect(() => {
    if (!createActionRef) return undefined;
    createActionRef.current = openNewConfiguration;
    return () => { createActionRef.current = null; };
  });

  const openExistingConfiguration = (configuration: RollNumberConfiguration) => {
    const applicability = normalizeSingleAcademicApplicability(configuration, filters.boards);
    setEditingConfigurationId(configuration.id);
    focusedSubmitCount.current = 0;
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

  const tableData = configurations.map((configuration) => ({
    ...configuration,
    academicCoverage: getAcademicApplicabilitySummary(
      configuration, filters.allBoards, filters.campuses
    ),
    numberingScope: rollNumberScopeOptions.find(
      (option) => option.value === configuration.numberingScope
    )?.label ?? configuration.numberingScope,
    status: configuration.isActive ? 'Active' : 'Inactive',
  }));
  const columns: IColumn[] = [
    {
      id: 'academicCoverage',
      label: 'Academic coverage',
      minWidth: 320,
      filterType: 'string',
      sticky: true,
      stickyPosition: 'left',
      cellSx: { whiteSpace: 'normal', overflowWrap: 'anywhere' },
    },
    {
      id: 'numberingScope',
      label: 'Numbering scope',
      minWidth: 160,
      filterType: 'enum',
      enumOptions: rollNumberScopeOptions.map((option) => ({
        label: option.label, value: option.label,
      })),
    },
    { id: 'startingNumber', label: 'Starts at', minWidth: 110, align: 'right', filterType: 'number' },
    {
      id: 'status',
      label: 'Status',
      width: 100,
      minWidth: 100,
      filterType: 'enum',
      enumOptions: [
        { label: 'Active', value: 'Active' },
        { label: 'Inactive', value: 'Inactive' },
      ],
      sticky: true,
      stickyPosition: 'right',
      render: (value: string) => (
        <Label color={value === 'Active' ? 'success' : 'default'} variant="soft">
          {value}
        </Label>
      ),
    },
    {
      id: 'actions',
      label: 'Actions',
      isFilter: false,
      isSort: false,
      align: 'right',
      width: 80,
      minWidth: 80,
      sticky: true,
      stickyPosition: 'right',
      excludeFromExport: true,
      render: (_value: unknown, row: IData) => {
        const configuration = configurations.find((item) => item.id === String(row.id));
        return configuration ? (
          <ThreeDotsActions sx={{ justifyContent: 'flex-end' }} showEditIcon showThreeDots={false}
            editLabel={`Edit roll number rule for ${configuration.className || 'all classes'}`}
            handleEditClick={() => openExistingConfiguration(configuration)} />
        ) : null;
      },
    },
  ];

  return (
    <Stack spacing={1.25} sx={{ minWidth: 0, minHeight: 0, height: '100%' }}>
      {!embedded ? (
        <SettingsPageHeader
          title="Roll Number Rules"
          description="Configure Roll number scope, starting values, and approval requirements for Onboarding."
        />
      ) : null}
      {showWorkspaceBar && (
        <NumberingWorkspaceBar
          title="Class-wise roll number rules"
          icon="mdi:format-list-numbered"
          summaries={[
            `${configurations.length} configured rules`,
            `${configurations.filter((configuration) => configuration.classMode === 'selected').length} specific academic paths`,
            'Saved scope',
          ]}
          buttonLabel="Add roll number rule"
          onClick={openNewConfiguration}
        />
      )}
      <Box sx={{ minHeight: 0, minWidth: 0, flex: 1, display: 'flex', overflow: 'hidden' }}>
        <CustomizableTable
          tableId="student-onboarding-roll-number-settings"
          tableTitle="Roll number configurations"
          columns={columns}
          data={tableData}
          isFilter
          searchFieldProps={{ placeholder: 'Search...' }}
          wrapperProps={{ sx: { flex: 1, minHeight: { xs: 360, md: 0 }, minWidth: 0 } }}
          tableContainerProps={{ sx: { height: 1, minHeight: 0 } }}
          noDataText={<>No roll number configurations have been added yet.</>}
        />
      </Box>
      <SettingsDrawer
        open={editorOpen}
        title={`${editingConfigurationId ? 'Edit' : 'Add'} Roll Number Rule`}
        description="Choose where Roll numbers must be unique, their starting value, and required approvals."
        descriptionDisplay="tooltip"
        icon="mdi:format-list-numbered"
        statusLabel={formik.dirty ? 'Unsaved changes' : ''}
        onClose={closeEditor}
        onSubmit={() => formik.submitForm()}
        submitLabel="Submit"
        submitIcon={GlobalIcons.submit}
        busy={formik.isSubmitting}
      >
        <Stack ref={formRef} spacing={2} component="form" onSubmit={formik.handleSubmit}>
          {formik.status ? <Alert severity="error">{String(formik.status)}</Alert> : null}
          <SettingsSectionCard
            icon="mdi:calendar-account-outline"
            title="Academic Path And Numbering Scope"
            description="Choose the academic path and scope used to prevent duplicate Roll numbers when staff assign them in Student Setup."
            descriptionDisplay="tooltip"
          >
            <SingleAcademicPathFields
              value={formik.values}
              boards={filters.boards}
              campuses={filters.campuses}
              campusesLoading={filters.campusesLoading}
              campusesError={filters.campusesError}
              showErrors={formik.submitCount > 0}
              compactHelp
              onChange={(applicability) => {
                formik.setValues({ ...formik.values, ...applicability }, false);
                formik.setStatus(undefined);
              }}
            />
            <TextField
              select
              fullWidth
              size="small"
              required
              name="numberingScope"
              label="Numbering scope"
              value={formik.values.numberingScope}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={(formik.touched.numberingScope || formik.submitCount > 0) && Boolean(formik.errors.numberingScope)}
              helperText={formik.touched.numberingScope || formik.submitCount > 0 ? formik.errors.numberingScope : undefined}
            >
              {rollNumberScopeOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </SettingsSectionCard>

          <SettingsSectionCard
            icon="mdi:shield-lock-outline"
            title="Preservation And Governance"
            description="Authorized staff enter Roll numbers during identifier preparation. Existing students are not renumbered automatically. Set the starting value and controls for later changes."
            descriptionDisplay="tooltip"
          >
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' }, gap: 2 }}>
              <TextField
                fullWidth
                size="small"
                required
                name="startingNumber"
                label="Starting number"
                type="number"
                value={formik.values.startingNumber}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={(formik.touched.startingNumber || formik.submitCount > 0) && Boolean(formik.errors.startingNumber)}
                helperText={formik.touched.startingNumber || formik.submitCount > 0 ? formik.errors.startingNumber : undefined}
                slotProps={{ htmlInput: { min: 1, step: 1 } }}
              />
              <TextField
                fullWidth
                size="small"
                name="effectiveFrom"
                label="Effective from"
                type="date"
                value={formik.values.effectiveFrom}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={(formik.touched.effectiveFrom || formik.submitCount > 0) && Boolean(formik.errors.effectiveFrom)}
                helperText={formik.touched.effectiveFrom || formik.submitCount > 0 ? formik.errors.effectiveFrom : undefined}
                InputLabelProps={{ shrink: true }}
              />
            </Box>
            <Stack spacing={1}>
              <FormControlLabel
                sx={{ m: 0 }}
                control={
                  <Switch
                    size="small"
                    name="requireChangeReason"
                    checked={formik.values.requireChangeReason}
                    onChange={formik.handleChange}
                  />
                }
                label="Require reason for Roll number changes"
              />
              <FormControlLabel
                sx={{ m: 0 }}
                control={
                  <Switch
                    size="small"
                    name="requireApproval"
                    checked={formik.values.requireApproval}
                    onChange={formik.handleChange}
                  />
                }
                label="Require approval after Roll number preparation"
              />
              <FormControlLabel
                sx={{ m: 0 }}
                control={
                  <Switch
                    size="small"
                    name="isActive"
                    checked={formik.values.isActive}
                    onChange={formik.handleChange}
                  />
                }
                label="Rule is active"
              />
            </Stack>
          </SettingsSectionCard>
        </Stack>
      </SettingsDrawer>
    </Stack>
  );
}


function DivisionRuleRow({
  title,
  checked,
  onChange,
}: {
  title: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <FormControlLabel
      label={title}
      labelPlacement="start"
      control={
        <Switch
          size="small"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          slotProps={{ input: { 'aria-label': title } }}
        />
      }
      sx={{ m: 0, width: '100%', minHeight: 40, justifyContent: 'space-between' }}
    />
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

export function DivisionChangesSettingsPanel({
  showWorkspaceBar = true,
  createActionRef,
}: {
  showWorkspaceBar?: boolean;
  createActionRef?: CreateActionRef;
} = {}) {
  const filters = useOnboardingAcademicStructure();
  const { settings, saveDivisionChangeConfiguration } = useOnboardingSettings();
  const { configurations } = settings.divisionChange;
  const formRef = useRef<HTMLDivElement>(null);
  const focusedSubmitAttempt = useRef(0);
  const [baseline, setBaseline] = useState<DivisionChangeConfiguration>(
    createDivisionChangeConfiguration()
  );
  const [draft, setDraft] = useState<DivisionChangeConfiguration>(
    createDivisionChangeConfiguration()
  );
  const [editingConfigurationId, setEditingConfigurationId] = useState<string | null>(null);
  const [validationError, setValidationError] = useState('');
  const [nameTouched, setNameTouched] = useState(false);
  const [dateTouched, setDateTouched] = useState(false);
  const [submitAttempt, setSubmitAttempt] = useState(0);
  const [saving, setSaving] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const isDirty = JSON.stringify(baseline) !== JSON.stringify(draft);
  const activeConfigurations = configurations.filter((configuration) => configuration.isActive);
  const nameError = !draft.name.trim()
    ? 'Rule name is required.'
    : draft.name.trim().length > 100
      ? 'Rule name must be 100 characters or fewer.' : '';
  const applicabilityError = getSingleAcademicPathValidationError(draft);
  const dateError = draft.effectiveDate && (!/^\d{4}-\d{2}-\d{2}$/.test(draft.effectiveDate) ||
    Number.isNaN(Date.parse(draft.effectiveDate)) ||
    new Date(draft.effectiveDate).toISOString().slice(0, 10) !== draft.effectiveDate)
    ? 'Enter a valid effective date.' : '';
  const setBooleanRule =
    (key: 'requireReason' | 'requireApproval' | 'isActive') =>
    (value: boolean) => {
      setValidationError('');
      setDraft((current) => ({ ...current, [key]: value }));
    };

  useEffect(() => {
    if (!editorOpen || !submitAttempt || focusedSubmitAttempt.current === submitAttempt ||
      !(nameError || applicabilityError || dateError)) return;
    focusedSubmitAttempt.current = submitAttempt;
    formRef.current?.querySelector<HTMLElement>('.Mui-error input, .Mui-error [role="combobox"]')?.focus();
  }, [editorOpen, submitAttempt, nameError, applicabilityError, dateError]);
  const openNewConfiguration = () => {
    const initial = createDivisionChangeConfiguration();
    setEditingConfigurationId(null);
    setBaseline(initial);
    setDraft(initial);
    setValidationError('');
    setNameTouched(false);
    setDateTouched(false);
    setSubmitAttempt(0);
    focusedSubmitAttempt.current = 0;
    setEditorOpen(true);
  };
  useEffect(() => {
    if (!createActionRef) return undefined;
    createActionRef.current = openNewConfiguration;
    return () => { createActionRef.current = null; };
  });
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
    setNameTouched(false);
    setDateTouched(false);
    setSubmitAttempt(0);
    focusedSubmitAttempt.current = 0;
    setEditorOpen(true);
  };
  const closeEditor = () => {
    if (saving) return;
    if (isDirty && !window.confirm('Discard unsaved division-assignment rule changes?')) return;
    setDraft(baseline);
    setValidationError('');
    setEditorOpen(false);
  };
  const applyDraft = async () => {
    if (saving) return;
    setSubmitAttempt((current) => current + 1);
    if (nameError || applicabilityError || dateError) return;
    const applicability = normalizeSingleAcademicApplicability(draft, filters.boards);
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
    setSaving(true);
    try {
      await saveDivisionChangeConfiguration(configuration);
      setEditorOpen(false);
    } catch {
      setValidationError('The division assignment rule could not be saved. Review the values and try again.');
    } finally {
      setSaving(false);
    }
  };
  const tableData = configurations.map((configuration) => ({
    ...configuration,
    academicCoverage: getAcademicApplicabilitySummary(configuration, filters.allBoards, filters.campuses),
    approval: configuration.requireApproval ? 'Required for changes' : 'Readiness rule applies',
    effectiveDateLabel: configuration.effectiveDate
      ? dayjs(configuration.effectiveDate).format('DD MMM YYYY')
      : 'Immediate',
    status: configuration.isActive ? 'Active' : 'Inactive',
  }));
  const columns: IColumn[] = [
    { id: 'name', label: 'Rule', minWidth: 190, filterType: 'string', sticky: true, stickyPosition: 'left' },
    {
      id: 'academicCoverage',
      label: 'Academic coverage',
      minWidth: 320,
      filterType: 'string',
      cellSx: { whiteSpace: 'normal', overflowWrap: 'anywhere' },
    },
    {
      id: 'approval',
      label: 'Approval',
      minWidth: 180,
      filterType: 'enum',
      enumOptions: [
        { label: 'Required for changes', value: 'Required for changes' },
        { label: 'Readiness rule applies', value: 'Readiness rule applies' },
      ],
    },
    {
      id: 'effectiveDateLabel',
      label: 'Effective date',
      minWidth: 150,
      filterType: 'string',
      isSort: false,
    },
    {
      id: 'status',
      label: 'Status',
      width: 100,
      minWidth: 100,
      filterType: 'enum',
      enumOptions: [
        { label: 'Active', value: 'Active' },
        { label: 'Inactive', value: 'Inactive' },
      ],
      sticky: true,
      stickyPosition: 'right',
      render: (value: string) => (
        <Label color={value === 'Active' ? 'success' : 'default'} variant="soft">
          {value}
        </Label>
      ),
    },
    {
      id: 'actions',
      label: 'Actions',
      width: 80,
      minWidth: 80,
      align: 'right',
      isFilter: false,
      isSort: false,
      sticky: true,
      stickyPosition: 'right',
      excludeFromExport: true,
      render: (_value: unknown, row: IData) => {
        const configuration = configurations.find((item) => item.id === String(row.id));
        return configuration ? (
          <ThreeDotsActions sx={{ justifyContent: 'flex-end' }} showEditIcon showThreeDots={false}
            editLabel={`Edit ${configuration.name}`}
            handleEditClick={() => openExistingConfiguration(configuration)} />
        ) : null;
      },
    },
  ];

  return (
    <Stack spacing={1.25} sx={{ minWidth: 0, minHeight: 0, height: '100%', flex: 1 }}>
      {showWorkspaceBar && (
        <NumberingWorkspaceBar
          title="Division assignment rules"
          icon="mdi:account-switch-outline"
          summaries={[
            `${activeConfigurations.length} active rules`,
            `${configurations.filter((item) => getAcademicApplicabilityScore(item) > 0).length} specific academic paths`,
            'Saved scope',
          ]}
          buttonLabel="Add division rule"
          buttonIcon="mdi:plus"
          onClick={openNewConfiguration}
        />
      )}
      <Box sx={{ minHeight: 0, minWidth: 0, flex: 1, display: 'flex', overflow: 'hidden' }}>
        <CustomizableTable
          tableId="student-onboarding-division-settings"
          tableTitle="Division assignment rules"
          columns={columns}
          data={tableData}
          isFilter
          searchFieldProps={{ placeholder: 'Search...' }}
          wrapperProps={{ sx: { flex: 1, minHeight: { xs: 360, md: 0 }, minWidth: 0 } }}
          tableContainerProps={{ sx: { height: 1, minHeight: 0 } }}
          noDataText={<>No division assignment rules have been added yet.</>}
        />
      </Box>
      <SettingsDrawer
        open={editorOpen}
        title={`${editingConfigurationId ? 'Edit' : 'Add'} Division Assignment Rule`}
        description="Choose where placement rules apply and whether changes need a reason or approval."
        descriptionDisplay="tooltip"
        icon="mdi:account-switch-outline"
        statusLabel={isDirty ? 'Unsaved changes' : ''}
        onClose={closeEditor}
        onReset={() => {
          setDraft(baseline);
          setValidationError('');
          setNameTouched(false);
          setDateTouched(false);
          setSubmitAttempt(0);
        }}
        resetDisabled={!isDirty}
        onSubmit={applyDraft}
        submitLabel="Submit"
        submitIcon={GlobalIcons.submit}
        busy={saving}
      >
        <Stack ref={formRef} spacing={2}>
          {validationError ? <Alert severity="error">{validationError}</Alert> : null}
          <SettingsSectionCard
            icon="mdi:target-account"
            title="Academic Path"
            description="Choose where this rule applies. Staff select divisions manually in Student Setup; full divisions cannot be selected."
            descriptionDisplay="tooltip"
          >
            <TextField
              fullWidth
              size="small"
              required
              label="Rule name"
              value={draft.name}
              onChange={(event) => {
                setDraft((current) => ({ ...current, name: event.target.value }));
                setValidationError('');
              }}
              onBlur={() => setNameTouched(true)}
              error={(nameTouched || submitAttempt > 0) && Boolean(nameError)}
              helperText={nameTouched || submitAttempt > 0 ? nameError : undefined}
              slotProps={{ htmlInput: { maxLength: 100 } }}
            />
            <SingleAcademicPathFields
              value={draft}
              boards={filters.boards}
              campuses={filters.campuses}
              campusesLoading={filters.campusesLoading}
              campusesError={filters.campusesError}
              showErrors={submitAttempt > 0}
              compactHelp
              onChange={(applicability) => {
                setDraft((current) => ({ ...current, ...applicability }));
                setValidationError('');
              }}
            />
          </SettingsSectionCard>
          <SettingsSectionCard
            icon="mdi:shield-check-outline"
            title="Change Approval"
            description="Require an explanation or approval for division changes. The effective date is optional; an active rule applies when its date arrives."
            descriptionDisplay="tooltip"
          >
            <DivisionRuleRow
              title="Require a change reason"
              checked={draft.requireReason}
              onChange={setBooleanRule('requireReason')}
            />
            <DivisionRuleRow
              title="Require approval"
              checked={draft.requireApproval}
              onChange={setBooleanRule('requireApproval')}
            />
            <DivisionRuleRow
              title="Rule is active"
              checked={draft.isActive}
              onChange={setBooleanRule('isActive')}
            />
            <TextField
              fullWidth
              size="small"
              label="Effective date"
              type="date"
              value={draft.effectiveDate}
              onChange={(event) => {
                setDraft((current) => ({ ...current, effectiveDate: event.target.value }));
                setValidationError('');
              }}
              onBlur={() => setDateTouched(true)}
              error={(dateTouched || submitAttempt > 0) && Boolean(dateError)}
              helperText={dateTouched || submitAttempt > 0 ? dateError : undefined}
              InputLabelProps={{ shrink: true }}
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
  const createActionRef = useRef<(() => void) | null>(null);
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
        description="Configure GR and roll numbering together with safe division-change behavior."
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
          { name: 'Student', href: studentPaths.dashboard },
          { name: 'Onboarding', href: studentPaths.onboarding.setup },
          { name: 'Settings', href: studentPaths.onboarding.settings },
          { name: 'Numbering & Placement' },
        ]}
      />
      <Paper variant="outlined" sx={{ overflow: 'hidden', flexShrink: 0 }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          alignItems={{ xs: 'stretch', sm: 'center' }}
        >
          <Box sx={{ minWidth: 0, flex: 1, overflow: 'hidden' }}>
            <CustomTabs
              value={activeTab}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              allowScrollButtonsMobile
              sx={{ '& .MuiTabs-flexContainer': { gap: 1 } }}
            >
              {numberingPlacementTabs.map((tab) => (
                <Tab
                  key={tab.value}
                  value={tab.value}
                  label={tab.label}
                  icon={<Iconify icon={tab.icon} width={20} />}
                  iconPosition="start"
                  sx={{ minHeight: 44, py: 1 }}
                  id={`numbering-placement-tab-${tab.value}`}
                  aria-controls={`numbering-placement-panel-${tab.value}`}
                />
              ))}
            </CustomTabs>
          </Box>
          <Box
            sx={{
              display: 'flex',
              justifyContent: { xs: 'flex-end', sm: 'initial' },
              p: 1,
              flexShrink: 0,
            }}
          >
            <Button
              variant="contained"
              size="small"
              startIcon={<Iconify icon="mdi:plus" width={18} />}
              onClick={() => createActionRef.current?.()}
              sx={{ minWidth: 160, whiteSpace: 'nowrap' }}
            >
              {activeTab === 'gr-number'
                ? 'Add series'
                : activeTab === 'roll-number'
                  ? 'Add roll number rule'
                  : 'Add division rule'}
            </Button>
          </Box>
        </Stack>
      </Paper>
      <Box
        role="tabpanel"
        id={`numbering-placement-panel-${activeTab}`}
        aria-labelledby={`numbering-placement-tab-${activeTab}`}
        aria-label={numberingPlacementTabs.find((tab) => tab.value === activeTab)?.label}
        sx={{ minWidth: 0, minHeight: 0, flex: 1, display: 'flex', flexDirection: 'column' }}
      >
        {activeTab === 'gr-number' ? (
          <GrNumberSettingsScreen embedded showWorkspaceBar={false} createActionRef={createActionRef} />
        ) : null}
        {activeTab === 'roll-number' ? (
          <RollNumberSettingsScreen embedded showWorkspaceBar={false} createActionRef={createActionRef} />
        ) : null}
        {activeTab === 'division-changes' ? (
          <DivisionChangesSettingsPanel showWorkspaceBar={false} createActionRef={createActionRef} />
        ) : null}
      </Box>
    </Stack>
  );
}
