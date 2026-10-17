'use client';

import type { Board } from 'src/types/school';
import type { RootState } from 'src/redux/store';
import type { IData, IColumn } from 'src/components/customizabaleTable/types';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useSelector } from 'react-redux';
import { uuidv4 } from 'src/utils/uuidv4';
import { Label } from 'src/components/label';
import { useRouter } from 'src/routes/hooks';
import { Iconify } from 'src/components/iconify';
import { useRef, useState, useEffect } from 'react';
import { hasGrantedPermission } from 'src/utils/permissions';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { useUnsavedNavigation } from 'src/hooks/use-unsaved-navigation';
import { studentPaths, studentPermissions } from 'src/constants/student-menu';
import {
  Box,
  Stack,
  Alert,
  Button,
  Switch,
  TextField,
  Typography,
  FormControlLabel,
} from '@mui/material';

import RollOrderingFields from './roll-ordering-fields';
import { useOnboardingSettings } from '../onboarding-settings-context';
import { SettingsDrawer, SettingsSectionCard } from './onboarding-settings-drawer';
import { useOnboardingAcademicStructure } from './use-onboarding-academic-structure';
import {
  formatGrNumber,
  getNumberingRuleStatus,
  createNumberingDraftVersion,
  defaultGrNumberConfiguration,
  defaultRollNumberConfiguration,
} from '../onboarding-settings-model';
import {
  SingleAcademicPathFields,
  normalizeSingleAcademicApplicability,
  createEmptySingleAcademicApplicability,
  buildOnboardingAcademicStructureOptions,
} from './onboarding-academic-applicability';

import type { GrNumberConfiguration, RollNumberConfiguration } from '../onboarding-settings-model';

type ScreenProps = {
  embedded?: boolean;
  showWorkspaceBar?: boolean;
  createActionRef?: { current: (() => void) | null };
};
type Configuration = GrNumberConfiguration | RollNumberConfiguration;

const academicSchema = {
  boardIds: Yup.array().of(Yup.string().required()).length(1, 'Select one Board'),
  academicMediumIds: Yup.array().of(Yup.string().required()).length(1, 'Select one Medium'),
  academicMediumStageIds: Yup.array()
    .of(Yup.string().required())
    .when('stageMode', {
      is: 'selected',
      then: (schema) => schema.min(1, 'Select at least one School Level'),
    }),
  standardIds: Yup.array().of(Yup.string().required()).min(1, 'Select at least one Class'),
};
const grSchema = Yup.object({
  ...academicSchema,
  name: Yup.string()
    .trim()
    .required('Series name is required')
    .max(80, 'Series name must be 80 characters or fewer'),
  prefix: Yup.string().max(12),
  suffix: Yup.string().max(12),
  startingNumber: Yup.number()
    .integer('Enter a whole number')
    .min(1)
    .max(Number.MAX_SAFE_INTEGER)
    .required(),
  padding: Yup.number().integer('Enter a whole number').min(1).max(12).required(),
  maximumNumber: Yup.number()
    .nullable()
    .transform((value, original) => (original === '' ? null : value))
    .integer('Enter a whole number')
    .min(1)
    .max(Number.MAX_SAFE_INTEGER)
    .test(
      'after-start',
      'Maximum number must be greater than or equal to the starting number',
      function validateMaximum(value) {
        return value == null || value >= Number(this.parent.startingNumber);
      }
    ),
});
const rollSchema = Yup.object({
  ...academicSchema,
  grouping: Yup.string().oneOf(['mixed', 'boys-first', 'girls-first']),
  nameFormat: Yup.string().oneOf(['first-name-first', 'surname-first']),
  arrangeBy: Yup.string()
    .oneOf(['studentName', 'grNumber', 'admissionDate', 'admissionNumber'])
    .required(),
  arrangeType: Yup.string().oneOf(['ascending', 'descending']).required(),
});

function academicTableValues(configuration: Configuration, boards: Board[]) {
  const options = buildOnboardingAcademicStructureOptions(boards);
  const names = (ids: string[], choices: typeof options.boards) =>
    ids.map((id) => choices.find((item) => item.id === id)?.label ?? 'Unavailable').join(', ');
  return {
    board:
      configuration.boardMode === 'all'
        ? 'All boards'
        : names(configuration.boardIds, options.boards),
    medium:
      configuration.mediumMode === 'all'
        ? 'All media'
        : names(configuration.academicMediumIds, options.mediums),
    schoolLevel:
      configuration.stageMode === 'all'
        ? '—'
        : names(configuration.academicMediumStageIds, options.stages),
    class:
      configuration.classMode === 'all'
        ? 'All classes'
        : names(configuration.standardIds, options.standards),
    status: getNumberingRuleStatus(configuration),
    version: configuration.version ?? 1,
  };
}

const academicColumns = (includeLevel: boolean): IColumn[] => [
  { id: 'board', label: 'Board', minWidth: 120, filterType: 'string' },
  { id: 'medium', label: 'Medium', minWidth: 130, filterType: 'string' },
  ...(includeLevel
    ? [{ id: 'schoolLevel', label: 'School level', minWidth: 150, filterType: 'string' as const }]
    : []),
  { id: 'class', label: 'Class', minWidth: 150, filterType: 'string' },
];

function NumberingRulesScreen({
  kind,
  embedded = false,
  showWorkspaceBar = true,
  createActionRef,
}: ScreenProps & { kind: 'gr' | 'roll' }) {
  const isGr = kind === 'gr';
  const { permissions } = useSelector((state: RootState) => state.auth);
  const canConfigure = hasGrantedPermission(permissions, studentPermissions.onboarding.configure);
  const router = useRouter();
  const filters = useOnboardingAcademicStructure({ includeCampuses: false });
  const { settings, scope, saveGrNumberConfiguration, saveRollNumberConfiguration } =
    useOnboardingSettings();
  const configurations = isGr
    ? settings.grNumber.configurations
    : settings.rollNumber.configurations;
  const save = (configuration: Configuration) =>
    isGr
      ? saveGrNumberConfiguration(configuration as GrNumberConfiguration)
      : saveRollNumberConfiguration(configuration as RollNumberConfiguration);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [publishingId, setPublishingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const formRef = useRef<HTMLFormElement>(null);
  const focusedSubmit = useRef(0);
  const initialValues = (): Configuration => ({
    ...(isGr ? defaultGrNumberConfiguration : defaultRollNumberConfiguration),
    ...createEmptySingleAcademicApplicability(),
    stageMode: 'all',
    id: '',
    ...(isGr ? { name: '', requireManualApproval: false } : {}),
    startingNumber: 1,
    effectiveFrom: '',
    isActive: false,
    status: 'draft',
    version: 1,
  });
  const formik = useFormik<Configuration>({
    initialValues: initialValues(),
    validationSchema: isGr ? grSchema : rollSchema,
    onSubmit: async (values, helpers) => {
      if (!canConfigure) return;
      const applicability = normalizeSingleAcademicApplicability(
        values,
        filters.allBoards,
        isGr ? 'gseb' : 'none'
      );
      const options = buildOnboardingAcademicStructureOptions(filters.allBoards);
      const common = {
        ...values,
        ...applicability,
        campusMode: 'all' as const,
        campusIds: [],
        divisionMode: 'all' as const,
        divisionIds: [],
        id: values.id || `${kind}-${Date.now()}`,
        status: 'draft' as const,
        isActive: false,
        effectiveFrom: '',
      };
      const configuration: Configuration = isGr
        ? {
            ...(common as GrNumberConfiguration),
            name: (values as GrNumberConfiguration).name.trim(),
            formatPattern: '{PREFIX}{SEQUENCE}{SUFFIX}',
            sequenceScope: 'school',
            resetPolicy: 'continuous',
            requireManualReason: true,
            requireManualApproval: false,
          }
        : {
            ...(common as RollNumberConfiguration),
            classId: applicability.standardIds.length === 1 ? applicability.standardIds[0] : '*',
            className: options.standards
              .filter((item) => applicability.standardIds.includes(item.id))
              .map((item) => item.name)
              .join(', '),
            startingNumber: 1,
            numberingScope: 'class-division',
            requireApproval: false,
            preserveExisting: true,
            assignmentTiming: 'after-division',
            midYearHandling: 'next-available',
            arrangeBy:
              (values as RollNumberConfiguration).orderingRules?.[0]?.field ??
              (values as RollNumberConfiguration).arrangeBy,
            arrangeType:
              (values as RollNumberConfiguration).orderingRules?.[0]?.direction ??
              (values as RollNumberConfiguration).arrangeType,
            orderingRules: [
              {
                field:
                  (values as RollNumberConfiguration).orderingRules?.[0]?.field ??
                  (values as RollNumberConfiguration).arrangeBy,
                direction:
                  (values as RollNumberConfiguration).orderingRules?.[0]?.direction ??
                  (values as RollNumberConfiguration).arrangeType,
              },
            ],
            allowIndividualLocks: true,
          };
      try {
        await save(configuration);
        helpers.resetForm();
        setEditorOpen(false);
      } catch {
        helpers.setStatus('The draft could not be saved. Review the values and try again.');
      }
    },
  });
  const navigationGuard = useUnsavedNavigation(editorOpen && formik.dirty, {
    push: router.push,
    blockNavigation: formik.isSubmitting || Boolean(publishingId),
  });
  const openNew = () => {
    if (!canConfigure) return;
    setEditingId(null);
    focusedSubmit.current = 0;
    formik.resetForm({ values: initialValues() });
    setEditorOpen(true);
  };
  useEffect(() => {
    if (!createActionRef) return undefined;
    createActionRef.current = openNew;
    return () => {
      createActionRef.current = null;
    };
  });
  useEffect(() => {
    if (!formik.submitCount || formik.isValid || focusedSubmit.current === formik.submitCount)
      return;
    focusedSubmit.current = formik.submitCount;
    formRef.current
      ?.querySelector<HTMLElement>('.Mui-error input, .Mui-error [role="combobox"]')
      ?.focus();
  }, [formik.submitCount, formik.isValid]);
  const openExisting = (configuration: Configuration) => {
    if (!canConfigure) return;
    setEditingId(configuration.id);
    focusedSubmit.current = 0;
    const normalized = normalizeSingleAcademicApplicability(
      configuration,
      filters.allBoards,
      isGr ? 'gseb' : 'none'
    );
    const value = {
      ...createNumberingDraftVersion({ ...configuration, ...normalized }, `${kind}-${uuidv4()}`),
      campusMode: 'all' as const,
      campusIds: [],
      divisionMode: 'all' as const,
      divisionIds: [],
      effectiveFrom: '',
    };
    formik.resetForm({
      values: isGr
        ? {
            ...(value as GrNumberConfiguration),
            formatPattern: '{PREFIX}{SEQUENCE}{SUFFIX}',
            sequenceScope: 'school',
            resetPolicy: 'continuous',
            requireManualApproval: false,
          }
        : {
            ...(value as RollNumberConfiguration),
            startingNumber: 1,
            numberingScope: 'class-division',
            requireApproval: false,
          },
    });
    setEditorOpen(true);
  };
  const close = () => {
    navigationGuard.requestNavigation(() => {
      setEditorOpen(false);
      formik.resetForm();
    });
  };
  const publish = async (configuration: Configuration) => {
    if (!canConfigure || publishingId) return;
    setPublishingId(configuration.id);
    setError('');
    try {
      await save({ ...configuration, status: 'published', isActive: true });
    } catch {
      setError(
        'The rule could not be published. Review its academic path and number range, then try again.'
      );
    } finally {
      setPublishingId(null);
    }
  };
  const rowName = (configuration: Configuration) =>
    'name' in configuration ? configuration.name : configuration.className;
  const columns: IColumn[] = [
    ...(isGr
      ? [
          {
            id: 'name',
            label: 'Series name',
            minWidth: 200,
            filterType: 'string' as const,
            sticky: true,
            stickyPosition: 'left' as const,
          },
        ]
      : []),
    ...academicColumns(isGr),
    ...(isGr
      ? [{ id: 'preview', label: 'Preview', minWidth: 150, filterType: 'string' as const }]
      : []),
    { id: 'version', label: 'Version', minWidth: 90, filterType: 'number' },
    {
      id: 'status',
      label: 'Status',
      minWidth: 110,
      filterType: 'enum',
      sticky: true,
      stickyPosition: 'right',
      enumOptions: ['draft', 'published', 'superseded'].map((value) => ({
        value,
        label: value[0].toUpperCase() + value.slice(1),
      })),
      render: (value: string) => (
        <Label color={value === 'published' ? 'success' : 'default'}>
          {value[0].toUpperCase() + value.slice(1)}
        </Label>
      ),
    },
    {
      id: 'actions',
      label: 'Actions',
      minWidth: 90,
      align: 'right',
      isFilter: false,
      isSort: false,
      sticky: true,
      stickyPosition: 'right',
      excludeFromExport: true,
      render: (_: unknown, row: IData) => {
        const configuration = configurations.find((item) => item.id === row.id);
        if (!canConfigure || !configuration || getNumberingRuleStatus(configuration) === 'superseded') return null;
        return (
          <ThreeDotsActions
            showEditIcon
            showThreeDots={false}
            sx={{ justifyContent: 'flex-end' }}
            editLabel={
              getNumberingRuleStatus(configuration) === 'published'
                ? `Create draft version of ${rowName(configuration)}`
                : `Edit ${rowName(configuration)}`
            }
            disableEditIcon={Boolean(publishingId)}
            handleEditClick={() => openExisting(configuration)}
            directActions={
              getNumberingRuleStatus(configuration) === 'draft'
                ? [
                    {
                      id: 'publish',
                      label: `Publish ${rowName(configuration)}`,
                      icon: 'mdi:publish',
                      disabled: Boolean(publishingId),
                      onClick: () => publish(configuration),
                    },
                  ]
                : []
            }
          />
        );
      },
    },
  ];
  const title = isGr ? 'GR Number Settings' : 'Roll Number Settings';
  const drawerTitle = `${editingId ? 'Edit' : 'Add'} ${isGr ? 'GR Number Series' : 'Roll Number Rule'}`;
  const touched = formik.touched as Record<string, boolean | undefined>;
  const errors = formik.errors as Record<string, string | undefined>;
  const gr = formik.values as GrNumberConfiguration;
  const roll = formik.values as RollNumberConfiguration;
  const formatContext = { academicYearName: scope.academicYearName, schoolCode: scope.schoolCode };
  return (
    <Stack spacing={1.25} sx={{ minWidth: 0, minHeight: 0, height: 1, flex: 1 }}>
      {!embedded && (
        <CustomBreadcrumbs
          heading={title}
          description="Create draft rules, then publish them for Onboarding. Existing numbers are preserved when rules change."
          links={[
            { name: 'Student', href: studentPaths.dashboard },
            { name: 'Onboarding', href: studentPaths.onboarding.setup },
            { name: 'Settings', href: studentPaths.onboarding.settings },
            { name: title },
          ]}
          action={
            <Button variant="contained" disabled={!canConfigure} onClick={openNew} startIcon={<Iconify icon="mdi:plus" />}>
              {isGr ? 'Add series' : 'Add roll number rule'}
            </Button>
          }
        />
      )}
      {embedded && showWorkspaceBar && (
        <Button
          variant="contained"
          disabled={!canConfigure}
          sx={{ alignSelf: 'flex-end' }}
          onClick={openNew}
          startIcon={<Iconify icon="mdi:plus" />}
        >
          {isGr ? 'Add series' : 'Add roll number rule'}
        </Button>
      )}
      {error && <Alert severity="error">{error}</Alert>}
      <Box sx={{ flex: 1, minHeight: 0, minWidth: 0, overflow: 'hidden', display: 'flex' }}>
        <CustomizableTable
          tableId={`student-onboarding-${isGr ? 'gr' : 'roll'}-number-settings`}
          tableTitle={isGr ? 'GR number series' : 'Roll number rules'}
          columns={columns}
          data={configurations.map((item) => ({
            ...item,
            ...academicTableValues(item, filters.allBoards),
            ...(isGr
              ? { preview: formatGrNumber(item as GrNumberConfiguration, 0, formatContext) }
              : {}),
          }))}
          isFilter
          searchFieldProps={{ placeholder: 'Search...' }}
          wrapperProps={{ sx: { height: 1, flex: 1, minHeight: 0 } }}
          tableContainerProps={{ sx: { height: 1, minHeight: 0 } }}
          noDataText={<>No rules yet. Add a draft rule to get started.</>}
        />
      </Box>
      <SettingsDrawer
        open={editorOpen && canConfigure}
        title={drawerTitle}
        description="Save a draft, then publish it from the table. Published changes create a new version and preserve assigned numbers."
        descriptionDisplay="tooltip"
        icon={isGr ? 'mdi:identifier' : 'mdi:format-list-numbered'}
        statusLabel="Draft"
        onClose={close}
        onSubmit={() => formik.submitForm()}
        submitLabel="Save draft"
        submitDisabled={!canConfigure}
        busy={formik.isSubmitting}
      >
        <Stack component="form" noValidate ref={formRef} onSubmit={formik.handleSubmit} spacing={2}>
          {formik.status && <Alert severity="error">{String(formik.status)}</Alert>}
          <SettingsSectionCard
            icon="mdi:target-account"
            title={isGr ? 'Series Details' : 'Academic Path'}
            description={
              isGr
                ? 'Choose board, medium and classes. GSEB series also select school levels.'
                : 'Choose board, medium and classes. Each division has its own sequence starting at 1.'
            }
            descriptionDisplay="tooltip"
          >
            {isGr && (
              <TextField
                fullWidth
                size="small"
                required
                name="name"
                label="Series name"
                value={gr.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={Boolean(touched.name && errors.name)}
                helperText={touched.name && errors.name}
              />
            )}
            <SingleAcademicPathFields
              value={formik.values}
              boards={filters.allBoards}
              schoolLevels={isGr ? 'gseb' : 'none'}
              showDivisions={false}
              showCampuses={false}
              compactHelp
              showErrors={formik.submitCount > 0}
              onChange={(value) => {
                formik.setValues({ ...formik.values, ...value }, false);
                formik.setStatus(undefined);
              }}
            />
          </SettingsSectionCard>
          {!isGr && (
            <>
              <SettingsSectionCard
                icon="mdi:account-group-outline"
                title="Student Ordering"
                description=""
                descriptionDisplay="tooltip"
              >
                <RollOrderingFields
                  value={roll}
                  errors={errors}
                  touched={touched}
                  onBlur={(field) => {
                    formik.setFieldTouched(field, true);
                  }}
                  onChange={(values) => {
                    formik.setValues({ ...formik.values, ...values }, true);
                    formik.setStatus(undefined);
                  }}
                />
              </SettingsSectionCard>
              <SettingsSectionCard
                icon="mdi:cog-outline"
                title="Change Control"
                description=""
                descriptionDisplay="tooltip"
              >
                <FormControlLabel
                  label="Require reason for roll number changes"
                  control={
                    <Switch
                      size="small"
                      name="requireChangeReason"
                      checked={roll.requireChangeReason}
                      onChange={formik.handleChange}
                    />
                  }
                />
                <Stack divider={<Box sx={{ borderTop: 1, borderColor: 'divider' }} />} spacing={1}>
                  <Stack direction="row" justifyContent="space-between" spacing={1}>
                    <Typography variant="body2" color="text.secondary">
                      Sequence
                    </Typography>
                    <Typography variant="body2">Each division starts at 1</Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between" spacing={1}>
                    <Typography variant="body2" color="text.secondary">
                      New students
                    </Typography>
                    <Typography variant="body2">Continue after last issued number</Typography>
                  </Stack>
                </Stack>
              </SettingsSectionCard>
            </>
          )}
          {isGr ? (
            <>
              <SettingsSectionCard
                icon="mdi:form-textbox"
                title="Number Format And Range"
                description="Numbers combine the prefix, padded sequence and suffix."
                descriptionDisplay="tooltip"
              >
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
                    gap: 2,
                  }}
                >
                  {(
                    ['prefix', 'startingNumber', 'padding', 'suffix', 'maximumNumber'] as const
                  ).map((name) => (
                    <TextField
                      key={name}
                      fullWidth
                      size="small"
                      name={name}
                      label={
                        {
                          prefix: 'Prefix',
                          startingNumber: 'Starting number',
                          padding: 'Number padding',
                          suffix: 'Suffix',
                          maximumNumber: 'Maximum number',
                        }[name]
                      }
                      type={['prefix', 'suffix'].includes(name) ? 'text' : 'number'}
                      required={name === 'startingNumber' || name === 'padding'}
                      value={gr[name] ?? ''}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={Boolean(touched[name] && errors[name])}
                      helperText={touched[name] && errors[name]}
                    />
                  ))}
                </Box>
                <Typography variant="body2">
                  Preview: {formatGrNumber(gr, 0, formatContext)}
                </Typography>
              </SettingsSectionCard>
              <SettingsSectionCard
                icon="mdi:shield-account-outline"
                title="Manual Control"
                description="Allow a first manual assignment. Changing an assigned GR number always requires a reason."
                descriptionDisplay="tooltip"
              >
                <FormControlLabel
                  label="Allow manual GR entry"
                  control={
                    <Switch
                      name="manualEntryAllowed"
                      checked={gr.manualEntryAllowed}
                      onChange={formik.handleChange}
                    />
                  }
                />
              </SettingsSectionCard>
            </>
          ) : null}
        </Stack>
      </SettingsDrawer>
      {navigationGuard.confirmation}
    </Stack>
  );
}

export function GrNumberSettingsScreen(props: ScreenProps) {
  return <NumberingRulesScreen {...props} kind="gr" />;
}
export function RollNumberSettingsScreen(props: ScreenProps) {
  return <NumberingRulesScreen {...props} kind="roll" />;
}
