'use client';

import type { IData, IColumn } from 'src/components/customizabaleTable/types';
import type { AdmissionCrmStaffLookupDto } from 'src/redux/student/admissions-crm/core-leads-contracts';
import type { AdmissionCrmAdmissionYearSetupDto } from 'src/redux/student/admissions-crm/setup-playbooks-contracts';
import type { AdmissionCrmAdmissionYearStandardOptionDto } from 'src/redux/student/admissions-crm/operations-governance-contracts';

import dayjs from 'dayjs';
import { toast } from 'sonner';
import { useFormik } from 'formik';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { DatePicker } from '@mui/x-date-pickers';
import { Scrollbar } from 'src/components/scrollbar';
import { fDate, fDateTime } from 'src/utils/format-time';
import ThreeDotsActions from 'src/components/three-dots-actions';
import { useMemo, useState, useEffect, useCallback } from 'react';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { useGetAdmissionCrmStaffQuery } from 'src/redux/student/admissions-crm/core-leads-api';
import { AdmissionCrmAdmissionYearSetupStatus } from 'src/redux/student/admissions-crm/setup-playbooks-contracts';
import { useGetAdmissionCrmAdmissionYearStandardOptionsQuery } from 'src/redux/student/admissions-crm/operations-governance-api';
import {
  AdmissionCrmRouteType,
  AdmissionCrmPlacementTiming,
} from 'src/redux/student/admissions-crm/final-admission-contracts';
import {
  useCloseAdmissionCrmAdmissionYearMutation,
  usePublishAdmissionCrmAdmissionYearMutation,
  useGetAdmissionCrmAdmissionYearVersionsQuery,
  useUpdateAdmissionCrmAdmissionYearDraftMutation,
  useCreateAdmissionCrmAdmissionYearDraftMutation,
} from 'src/redux/student/admissions-crm/setup-playbooks-api';
import {
  Box,
  Chip,
  Step,
  Alert,
  Stack,
  Paper,
  Button,
  Dialog,
  Drawer,
  Switch,
  Divider,
  Stepper,
  Checkbox,
  ListItem,
  TextField,
  StepButton,
  StepLabel,
  Typography,
  IconButton,
  ListItemButton,
  DialogTitle,
  Autocomplete,
  ToggleButton,
  DialogActions,
  DialogContent,
  LinearProgress,
  FormControlLabel,
  ToggleButtonGroup,
} from '@mui/material';

import { EnrollmentSettingsPage } from './enrollment-settings-page';
import { useEnrollmentSettingsDirtyState } from './enrollment-settings-dirty-state';
import { useEnrollmentWorkspace } from '../admissions-crm/enrollment-workspace-context';
import {
  enrollmentTableWrapperSx,
  EnrollmentTableEmptyState,
  enrollmentTableContainerSx,
} from '../admissions-crm/workspace-table-patterns';
import {
  toAdmissionYearSetupForm,
  type AdmissionYearSetupStep,
  type AdmissionYearSetupForm,
  emptyAdmissionYearSetupForm,
  getValidationSchemaForStep,
  admissionYearSetupPublishSchema,
} from './admission-year-setup-model';

const setupSteps = ['Admission scope', 'Dates and gates', 'Ownership', 'Review and publish'];
const workflowSteps = [
  { key: 'inquiry', label: 'Inquiry' },
  { key: 'exam', label: 'Entrance Exam' },
  { key: 'registration', label: 'Registration' },
  { key: 'finance', label: 'Finance' },
  { key: 'placement', label: 'Class Placement' },
  { key: 'activation', label: 'Activation' },
] as const;

const routeTypeLabels: Record<AdmissionCrmRouteType, string> = {
  [AdmissionCrmRouteType.Fresh]: 'Fresh admission',
  [AdmissionCrmRouteType.SiblingPriority]: 'Sibling priority',
  [AdmissionCrmRouteType.AlumniPreference]: 'Alumni preference',
  [AdmissionCrmRouteType.StaffChild]: 'Staff child',
  [AdmissionCrmRouteType.RteEws]: 'RTE / EWS',
  [AdmissionCrmRouteType.Transfer]: 'Transfer',
  [AdmissionCrmRouteType.Lateral]: 'Lateral entry',
  [AdmissionCrmRouteType.MidYear]: 'Mid-year',
  [AdmissionCrmRouteType.ReturningStudent]: 'Returning student',
  [AdmissionCrmRouteType.Interstate]: 'Interstate transfer',
  [AdmissionCrmRouteType.OverseasReturn]: 'Overseas return',
  [AdmissionCrmRouteType.Direct]: 'Direct admission',
  [AdmissionCrmRouteType.ManagementApproved]: 'Management approved',
  [AdmissionCrmRouteType.SchoolDefined]: 'School defined',
};

const routeTypeOptions = Object.values(AdmissionCrmRouteType)
  .filter((value): value is AdmissionCrmRouteType => typeof value === 'number')
  .map((value) => ({ value, label: routeTypeLabels[value] }));
const statusLabels: Record<AdmissionCrmAdmissionYearSetupStatus, string> = {
  [AdmissionCrmAdmissionYearSetupStatus.Draft]: 'Draft',
  [AdmissionCrmAdmissionYearSetupStatus.Published]: 'Published',
  [AdmissionCrmAdmissionYearSetupStatus.Closed]: 'Closed',
  [AdmissionCrmAdmissionYearSetupStatus.Superseded]: 'Superseded',
};
const statusColor = (status: AdmissionCrmAdmissionYearSetupStatus) => {
  if (status === AdmissionCrmAdmissionYearSetupStatus.Published) return 'success';
  if (status === AdmissionCrmAdmissionYearSetupStatus.Draft) return 'warning';
  return 'default';
};
const getErrorMessage = (error: unknown, fallback: string) => {
  const response = error as {
    data?: { error?: { message?: string; code?: string }; message?: string };
  };
  return response.data?.error?.message || response.data?.message || fallback;
};
const standardLabel = (option: AdmissionCrmAdmissionYearStandardOptionDto) =>
  `${option.standardName} | ${option.mediumName} | ${option.boardName}`;

const standardGroup = (option: AdmissionCrmAdmissionYearStandardOptionDto) =>
  `${option.boardName} | ${option.mediumName} | ${option.mediumStageName}`;

const staffLabel = (staff: AdmissionCrmStaffLookupDto) =>
  staff.employeeCode ? `${staff.displayName} (${staff.employeeCode})` : staff.displayName;

const AdmissionYearSetupUserGuide = (
  <Stack spacing={1.5} sx={{ p: 0.5, maxWidth: 320 }}>
    <Box>
      <Typography variant="subtitle2" fontWeight={700} color="text.primary">
        Admission Year Setup — Overview
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontSize: '13px' }}>
        Configure and publish admission parameters for the selected academic year.
      </Typography>
    </Box>

    <Box>
      <Typography
        variant="caption"
        fontWeight={700}
        color="text.primary"
        sx={{ display: 'block', mb: 0.5 }}
      >
        How to use:
      </Typography>
      <Stack spacing={0.75} sx={{ pl: 0.5 }}>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', gap: 0.75 }}>
          •{' '}
          <span>
            Click <strong>+ Setup Academic Process</strong> to open the multi-step setup wizard.
          </span>
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', gap: 0.75 }}>
          •{' '}
          <span>
            Use <strong>Version History</strong> to track draft, published, and superseded setups.
          </span>
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', gap: 0.75 }}>
          •{' '}
          <span>
            Click the <strong>View (eye)</strong> icon on any version row to inspect its full
            details.
          </span>
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', gap: 0.75 }}>
          •{' '}
          <span>
            Click <strong>Close Admission Year</strong> when the academic session setup concludes.
          </span>
        </Typography>
      </Stack>
    </Box>
  </Stack>
);

const FormSetupUserGuide = (
  <Stack spacing={1.5} sx={{ p: 0.5, maxWidth: 320 }}>
    <Box>
      <Typography variant="subtitle2" fontWeight={700} color="text.primary">
        Continue Setup — Overview
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontSize: '13px' }}>
        Complete the remaining decisions, save draft progress, and publish when ready.
      </Typography>
    </Box>

    <Box>
      <Typography
        variant="caption"
        fontWeight={700}
        color="text.primary"
        sx={{ display: 'block', mb: 0.5 }}
      >
        How to use:
      </Typography>
      <Stack spacing={0.75} sx={{ pl: 0.5 }}>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', gap: 0.75 }}>
          •{' '}
          <span>
            <strong>Admission Scope</strong>: Select open standards and accepted admission routes.
          </span>
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', gap: 0.75 }}>
          •{' '}
          <span>
            <strong>Dates & Gates</strong>: Configure inquiry, registration, and activation dates.
          </span>
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', gap: 0.75 }}>
          •{' '}
          <span>
            <strong>Ownership</strong>: Assign staff responsible for setup steps.
          </span>
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', gap: 0.75 }}>
          •{' '}
          <span>
            <strong>Review & Publish</strong>: Check configuration summary and publish live setup.
          </span>
        </Typography>
      </Stack>
    </Box>
  </Stack>
);

const formSignature = (form: AdmissionYearSetupForm) =>
  JSON.stringify({
    ...form,
    targetStandardIds: [...form.targetStandardIds].sort(),
    routeTypes: [...form.routeTypes].sort((left, right) => left - right),
    stepOwners: Object.fromEntries(
      Object.entries(form.stepOwners).sort(([a], [b]) => a.localeCompare(b))
    ),
  });

function DateField({
  label,
  value,
  minDate,
  maxDate,
  onChange,
  error,
  helperText,
}: {
  label: string;
  value: string;
  minDate?: dayjs.Dayjs;
  maxDate?: dayjs.Dayjs;
  onChange: (value: string) => void;
  error?: boolean;
  helperText?: string;
}) {
  return (
    <DatePicker
      label={label}
      value={value ? dayjs(value) : null}
      minDate={minDate}
      maxDate={maxDate}
      onChange={(newValue) => onChange(newValue ? newValue.format('YYYY-MM-DD') : '')}
      format="DD-MM-YYYY"
      slotProps={{
        textField: {
          size: 'small',
          fullWidth: true,
          error,
          helperText,
          inputProps: {
            placeholder: 'DD-MM-YYYY',
          },
        },
      }}
    />
  );
}

function StaffSelect({
  label,
  value,
  options,
  disabled,
  onChange,
}: {
  label: string;
  value?: string | null;
  options: AdmissionCrmStaffLookupDto[];
  disabled?: boolean;
  onChange: (value: string | null) => void;
}) {
  return (
    <Autocomplete
      options={options}
      value={options.find((option) => option.id === value) || null}
      getOptionLabel={staffLabel}
      isOptionEqualToValue={(option, selected) => option.id === selected.id}
      disabled={disabled}
      onChange={(_event, selected) => onChange(selected?.id || null)}
      renderInput={(params) => <TextField {...params} size="small" label={label} />}
    />
  );
}

function SetupReview({
  form,
  standardOptions,
  staffOptions,
}: {
  form: AdmissionYearSetupForm;
  standardOptions: AdmissionCrmAdmissionYearStandardOptionDto[];
  staffOptions: AdmissionCrmStaffLookupDto[];
}) {
  const selectedStandards = standardOptions.filter((option) =>
    form.targetStandardIds.includes(option.standardId)
  );
  const ownerName = staffOptions.find((staff) => staff.id === form.defaultOwnerUserId);

  return (
    <Stack spacing={2}>
      {/* 1. Academic Scope & Routes */}
      <Paper variant="outlined" sx={{ p: 2, borderRadius: 1.5, bgcolor: 'background.neutral' }}>
        <Stack spacing={1.5}>
          <Stack direction="row" alignItems="center" gap={1}>
            <Iconify
              icon="solar:book-bookmark-bold-duotone"
              width={20}
              sx={{ color: 'primary.main' }}
            />
            <Typography variant="subtitle2" fontWeight={700}>
              Academic Scope & Routes
            </Typography>
          </Stack>

          <Divider />

          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              fontWeight={600}
              sx={{ display: 'block', mb: 0.75 }}
            >
              OPEN STANDARDS ({selectedStandards.length})
            </Typography>
            {selectedStandards.length ? (
              <Stack direction="row" flexWrap="wrap" gap={0.75}>
                {selectedStandards.map((option) => (
                  <Chip
                    key={option.standardId}
                    label={`${option.standardName} (${option.boardName} · ${option.mediumName})`}
                    size="small"
                    variant="soft"
                    color="primary"
                  />
                ))}
              </Stack>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No standards selected
              </Typography>
            )}
          </Box>

          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              fontWeight={600}
              sx={{ display: 'block', mb: 0.75 }}
            >
              ADMISSION ROUTES ({form.routeTypes.length})
            </Typography>
            {form.routeTypes.length ? (
              <Stack direction="row" flexWrap="wrap" gap={0.75}>
                {form.routeTypes.map((route) => (
                  <Chip
                    key={route}
                    label={routeTypeLabels[route] || `Route ${route}`}
                    size="small"
                    variant="soft"
                    color="info"
                  />
                ))}
              </Stack>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No routes selected
              </Typography>
            )}
          </Box>
        </Stack>
      </Paper>

      {/* 2. Timeline & Schedule */}
      <Paper variant="outlined" sx={{ p: 2, borderRadius: 1.5 }}>
        <Stack spacing={1.5}>
          <Stack direction="row" alignItems="center" gap={1}>
            <Iconify
              icon="solar:calendar-date-bold-duotone"
              width={20}
              sx={{ color: 'primary.main' }}
            />
            <Typography variant="subtitle2" fontWeight={700}>
              Admission Timeline
            </Typography>
          </Stack>

          <Divider />

          <Stack spacing={1.25}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="body2" color="text.secondary">
                Inquiry Window
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {form.inquiryOpenDate && form.inquiryCloseDate
                  ? `${fDate(form.inquiryOpenDate)} — ${fDate(form.inquiryCloseDate)}`
                  : 'Not configured'}
              </Typography>
            </Stack>

            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="body2" color="text.secondary">
                Registration Closes
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {form.registrationCloseDate ? fDate(form.registrationCloseDate) : 'Not configured'}
              </Typography>
            </Stack>

            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="body2" color="text.secondary">
                Activation Target
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {form.activationTargetDate ? fDate(form.activationTargetDate) : 'Not configured'}
              </Typography>
            </Stack>
          </Stack>
        </Stack>
      </Paper>

      {/* 3. Rules & Requirements */}
      <Paper variant="outlined" sx={{ p: 2, borderRadius: 1.5 }}>
        <Stack spacing={1.5}>
          <Stack direction="row" alignItems="center" gap={1}>
            <Iconify
              icon="solar:shield-check-bold-duotone"
              width={20}
              sx={{ color: 'primary.main' }}
            />
            <Typography variant="subtitle2" fontWeight={700}>
              Rules & Requirements
            </Typography>
          </Stack>

          <Divider />

          <Stack spacing={1.25}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="body2" color="text.secondary">
                Entrance Exam
              </Typography>
              <Chip
                label={form.entranceExamRequired ? 'Required' : 'Skipped'}
                size="small"
                color={form.entranceExamRequired ? 'warning' : 'default'}
                variant="soft"
              />
            </Stack>

            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="body2" color="text.secondary">
                Finance Verification
              </Typography>
              <Chip
                label={form.financeVerificationRequired ? 'Required' : 'Skipped'}
                size="small"
                color={form.financeVerificationRequired ? 'warning' : 'default'}
                variant="soft"
              />
            </Stack>

            <Box sx={{ pt: 0.5 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                Placement Timing
              </Typography>
              <Typography
                variant="caption"
                sx={{ p: 1, borderRadius: 1, bgcolor: 'action.hover', display: 'block' }}
              >
                {form.placementTiming === AdmissionCrmPlacementTiming.DivisionBeforeActivation
                  ? 'Division assigned before activation'
                  : 'Standard assigned before activation; division may follow'}
              </Typography>
            </Box>
          </Stack>
        </Stack>
      </Paper>

      {/* 4. Process Owner */}
      <Paper variant="outlined" sx={{ p: 2, borderRadius: 1.5 }}>
        <Stack spacing={1.5}>
          <Stack direction="row" alignItems="center" gap={1}>
            <Iconify icon="solar:user-id-bold-duotone" width={20} sx={{ color: 'primary.main' }} />
            <Typography variant="subtitle2" fontWeight={700}>
              Default Process Owner
            </Typography>
          </Stack>

          <Divider />

          <Stack direction="row" alignItems="center" gap={1}>
            <Iconify icon="lucide:user" width={18} sx={{ color: 'text.secondary' }} />
            <Typography variant="body2" fontWeight={600}>
              {ownerName ? staffLabel(ownerName) : 'No default owner assigned'}
            </Typography>
          </Stack>
        </Stack>
      </Paper>
    </Stack>
  );
}

export function AdmissionYearSetup() {
  const { academicYearId, academicYearName } = useEnrollmentWorkspace();

  const [isFormOpen, setFormOpen] = useState(false);

  const [activeStep, setActiveStep] = useState<AdmissionYearSetupStep>(0);
  const [loadedDraftId, setLoadedDraftId] = useState<string>();
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [closeDialogOpen, setCloseDialogOpen] = useState(false);
  const [closeReason, setCloseReason] = useState('');
  const [viewVersion, setViewVersion] = useState<AdmissionCrmAdmissionYearSetupDto | null>(null);

  const formik = useFormik<AdmissionYearSetupForm>({
    initialValues: emptyAdmissionYearSetupForm,
    validationSchema: getValidationSchemaForStep(activeStep),
    onSubmit: () => {},
  });
  const form = formik.values;

  const versionsQuery = useGetAdmissionCrmAdmissionYearVersionsQuery(
    { academicYearId: academicYearId || '' },
    { skip: !academicYearId }
  );
  const standardsQuery = useGetAdmissionCrmAdmissionYearStandardOptionsQuery(
    { academicYearId: academicYearId || '' },
    { skip: !academicYearId }
  );
  const staffQuery = useGetAdmissionCrmStaffQuery(
    {
      academicYearId: academicYearId || '',
      ownerOnly: true,
      maxResultCount: 250,
    },
    { skip: !academicYearId }
  );
  const [createDraft, createState] = useCreateAdmissionCrmAdmissionYearDraftMutation();
  const [updateDraft, updateState] = useUpdateAdmissionCrmAdmissionYearDraftMutation();
  const [publish, publishState] = usePublishAdmissionCrmAdmissionYearMutation();
  const [close, closeState] = useCloseAdmissionCrmAdmissionYearMutation();

  const versions = useMemo(() => versionsQuery.data || [], [versionsQuery.data]);
  const draft = versions.find(
    (version) => version.status === AdmissionCrmAdmissionYearSetupStatus.Draft
  );
  const published = versions.find(
    (version) => version.status === AdmissionCrmAdmissionYearSetupStatus.Published
  );
  const standardOptions = useMemo(() => standardsQuery.data || [], [standardsQuery.data]);
  const staffOptions = useMemo(() => staffQuery.data || [], [staffQuery.data]);
  const selectedStandards = useMemo(
    () => standardOptions.filter((option) => form.targetStandardIds.includes(option.standardId)),
    [form.targetStandardIds, standardOptions]
  );
  const selectedRoutes = routeTypeOptions.filter((option) =>
    form.routeTypes.includes(option.value)
  );
  const isBusy =
    createState.isLoading ||
    updateState.isLoading ||
    publishState.isLoading ||
    closeState.isLoading;
  const isDirty = draft
    ? formSignature(form) !== formSignature(toAdmissionYearSetupForm(draft))
    : false;
  const hasRequiredQueryError =
    versionsQuery.isError || standardsQuery.isError || staffQuery.isError;
  const hasRequiredQueryPending =
    versionsQuery.isLoading || standardsQuery.isLoading || staffQuery.isLoading;

  useEnrollmentSettingsDirtyState({
    source: 'admission-year-setup',
    dirty: isDirty,
    onDiscard: () => {
      if (!draft) return;
      formik.setValues(toAdmissionYearSetupForm(draft));
      setValidationErrors([]);
    },
  });

  useEffect(() => {
    if (draft && draft.id !== loadedDraftId) {
      formik.setValues(toAdmissionYearSetupForm(draft));
      setLoadedDraftId(draft.id);
      setActiveStep(0);
      setValidationErrors([]);
    }
    if (!draft && loadedDraftId) {
      setLoadedDraftId(undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft, loadedDraftId]);

  const updateForm = useCallback(
    <K extends keyof AdmissionYearSetupForm>(key: K, value: AdmissionYearSetupForm[K]) => {
      formik.setFieldValue(key as string, value);
      formik.setFieldTouched(key as string, true, false);
      setValidationErrors([]);
    },
    [formik]
  );

  const saveDraft = useCallback(
    async (showSuccess = true) => {
      if (!draft || hasRequiredQueryError || hasRequiredQueryPending) return undefined;
      try {
        const saved = await updateDraft({ id: draft.id, body: form }).unwrap();
        formik.setValues(toAdmissionYearSetupForm(saved));
        if (showSuccess) toast.success('Admission Year draft saved.');
        return saved;
      } catch (error) {
        toast.error(getErrorMessage(error, 'Admission Year draft could not be saved.'));
        return undefined;
      }
    },
    [draft, form, formik, hasRequiredQueryError, hasRequiredQueryPending, updateDraft]
  );

  const handleCreateDraft = async () => {
    if (!academicYearId || hasRequiredQueryError || hasRequiredQueryPending) return;
    try {
      const created = await createDraft({ academicYearId }).unwrap();
      formik.setValues(toAdmissionYearSetupForm(created));
      setLoadedDraftId(created.id);
      setActiveStep(0);
      toast.success(
        created.version === 1
          ? 'Admission Year setup started.'
          : `Version ${created.version} created.`
      );
    } catch (error) {
      toast.error(getErrorMessage(error, 'Admission Year draft could not be created.'));
    }
  };

  const handleNext = async () => {
    const errors = await formik.validateForm();
    if (Object.keys(errors).length) {
      const errorMessages = Object.values(errors).flat() as string[];
      setValidationErrors(errorMessages);
      return;
    }
    setValidationErrors([]);
    setActiveStep((current) => Math.min(3, current + 1) as AdmissionYearSetupStep);
  };

  const handlePublish = async () => {
    if (hasRequiredQueryError || hasRequiredQueryPending) return;
    try {
      await admissionYearSetupPublishSchema.validate(form, { abortEarly: false });
    } catch (err: any) {
      setValidationErrors(err.errors || ['Validation failed']);
      setPublishDialogOpen(false);
      return;
    }
    const saved = isDirty ? await saveDraft(false) : draft;
    if (!saved) return;
    try {
      await publish({ id: saved.id, concurrencyStamp: saved.concurrencyStamp }).unwrap();
      setPublishDialogOpen(false);
      setValidationErrors([]);
      toast.success(`Admission Year version ${saved.version} published.`);
      setFormOpen(false);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Admission Year could not be published.'));
    }
  };

  const handleClose = async () => {
    if (!published || !closeReason.trim()) return;
    try {
      await close({
        id: published.id,
        reason: closeReason.trim(),
        concurrencyStamp: published.concurrencyStamp,
      }).unwrap();
      setCloseDialogOpen(false);
      setCloseReason('');
      toast.success('Admission Year closed.');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Admission Year could not be closed.'));
    }
  };

  const columns = useMemo<IColumn[]>(
    () => [
      {
        id: 'version',
        label: 'Version',
        isSort: true,
        filterType: 'number',
        sticky: true,
        minWidth: 100,
        render: (value) => `v${value}`,
      },
      {
        id: 'inquiryOpenDate',
        label: 'Inquiry Opens',
        isSort: true,
        filterType: 'date',
        minWidth: 140,
        render: (value) => fDate(value as string),
      },
      {
        id: 'inquiryCloseDate',
        label: 'Inquiry Closes',
        isSort: true,
        filterType: 'date',
        minWidth: 140,
        render: (value) => fDate(value as string),
      },
      {
        id: 'targetStandardIds',
        label: 'Standards',
        align: 'right',
        minWidth: 100,
        render: (value) => (value as string[]).length,
      },
      {
        id: 'entranceExamRequired',
        label: 'Exam',
        isFilter: true,
        filterType: 'enum',
        enumOptions: [
          { value: true, label: 'Required' },
          { value: false, label: 'Skipped' },
        ],
        minWidth: 110,
        render: (value) => (value ? 'Required' : 'Skipped'),
      },
      {
        id: 'publishedAt',
        label: 'Published',
        isSort: true,
        filterType: 'dateTime',
        minWidth: 170,
        render: (value) => (!value || value === '-' ? '-' : fDateTime(value as string)),
      },
      {
        id: 'status',
        label: 'Status',
        align: 'center',
        width: 130,
        minWidth: 130,
        isSort: true,
        isFilter: true,
        filterType: 'enum',
        enumOptions: Object.entries(statusLabels).map(([value, label]) => ({
          value: Number(value),
          label,
        })),
        sticky: true,
        stickyPosition: 'right',
        render: (value) => (
          <Label color={statusColor(value as AdmissionCrmAdmissionYearSetupStatus)}>
            {statusLabels[value as AdmissionCrmAdmissionYearSetupStatus]}
          </Label>
        ),
      },
      {
        id: 'actions',
        label: 'Actions',
        align: 'center',
        isSort: false,
        sticky: true,
        stickyPosition: 'right',
        isFilter: false,
        width: 104,
        minWidth: 90,
        headerSx: { px: 1.5 },
        cellSx: { px: 1.5 },
        render: (_value, row) => (
          <ThreeDotsActions
            showThreeDots={false}
            showEditIcon
            showViewIcon
            disableEditIcon={row.status !== AdmissionCrmAdmissionYearSetupStatus.Draft}
            handleEditClick={() => {
              // Since there's only one draft, editing it just opens the form
              setFormOpen(true);
            }}
            handleViewClick={() => {
              setViewVersion(row as unknown as AdmissionCrmAdmissionYearSetupDto);
            }}
          />
        ),
      },
    ],
    []
  );

  const renderStep = () => {
    if (activeStep === 0) {
      return (
        <Stack spacing={2}>
          <Box>
            <Typography variant="subtitle1">Standards open for admission</Typography>
            <Typography variant="body2" color="text.secondary">
              These standards come from Institute Setup for the selected academic year.
            </Typography>
          </Box>
          <Autocomplete
            multiple
            disableCloseOnSelect
            options={standardOptions}
            value={selectedStandards}
            groupBy={standardGroup}
            getOptionLabel={standardLabel}
            isOptionEqualToValue={(option, selected) => option.standardId === selected.standardId}
            loading={standardsQuery.isLoading || standardsQuery.isFetching}
            onChange={(_event, selected) =>
              updateForm(
                'targetStandardIds',
                selected.map((option) => option.standardId)
              )
            }
            ListboxProps={{ style: { maxHeight: 200, overflow: 'auto' } }}
            renderTags={(val, getTagProps) =>
              val.map((option, index) => {
                const { key, ...tagProps } = getTagProps({ index });
                return (
                  <Chip
                    key={key}
                    {...tagProps}
                    label={standardLabel(option)}
                    size="small"
                    variant="soft"
                    sx={{ ml: 0.5 }}
                  />
                );
              })
            }
            renderOption={(props, option, { selected }) => {
              const { key, ...restProps } = props as any;
              return (
                <ListItem disablePadding key={key} {...restProps}>
                  <ListItemButton
                    disableTouchRipple
                    disableRipple
                    sx={{
                      py: 0.5,
                      px: 1,
                      minHeight: 'auto',
                      '&:hover': { backgroundColor: 'transparent' },
                    }}
                  >
                    <Checkbox
                      size="small"
                      checked={selected}
                      disableRipple
                      sx={{ mr: 1, p: 0.5 }}
                    />
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        width: '100%',
                      }}
                    >
                      <Typography variant="body2">{option.standardName}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {option.mediumName} | {option.boardName}
                      </Typography>
                    </Box>
                  </ListItemButton>
                </ListItem>
              );
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                size="small"
                label="Open standards"
                placeholder={selectedStandards.length ? undefined : 'Select standards'}
                error={formik.touched.targetStandardIds && Boolean(formik.errors.targetStandardIds)}
                helperText={
                  formik.touched.targetStandardIds
                    ? (formik.errors.targetStandardIds as string)
                    : ''
                }
              />
            )}
          />
          <Box>
            <Typography variant="subtitle1">Admission routes</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Keep only routes that the school will accept during this admission year.
            </Typography>
            <Autocomplete
              multiple
              disableCloseOnSelect
              options={routeTypeOptions}
              value={selectedRoutes}
              isOptionEqualToValue={(option, selected) => option.value === selected.value}
              onChange={(_event, selected) =>
                updateForm(
                  'routeTypes',
                  selected.map((option) => option.value)
                )
              }
              ListboxProps={{ style: { maxHeight: 200, overflow: 'auto' } }}
              renderTags={(val, getTagProps) =>
                val.map((option, index) => {
                  const { key, ...tagProps } = getTagProps({ index });
                  return (
                    <Chip
                      key={key}
                      {...tagProps}
                      label={option.label}
                      size="small"
                      variant="soft"
                      sx={{ ml: 0.5 }}
                    />
                  );
                })
              }
              renderOption={(props, option, { selected }) => {
                const { key, ...restProps } = props as any;
                return (
                  <ListItem disablePadding key={key} {...restProps}>
                    <ListItemButton
                      disableTouchRipple
                      disableRipple
                      sx={{
                        py: 0.5,
                        px: 1,
                        minHeight: 'auto',
                        '&:hover': { backgroundColor: 'transparent' },
                      }}
                    >
                      <Checkbox
                        size="small"
                        checked={selected}
                        disableRipple
                        sx={{ mr: 1, p: 0.5 }}
                      />
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          width: '100%',
                          alignItems: 'center',
                        }}
                      >
                        {option.label}
                      </Box>
                    </ListItemButton>
                  </ListItem>
                );
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  size="small"
                  label="Accepted admission routes"
                  error={formik.touched.routeTypes && Boolean(formik.errors.routeTypes)}
                  helperText={formik.touched.routeTypes ? (formik.errors.routeTypes as string) : ''}
                />
              )}
            />
          </Box>
        </Stack>
      );
    }

    if (activeStep === 1) {
      return (
        <Stack spacing={2.5}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
              gap: 1.5,
            }}
          >
            <DateField
              label="Inquiry opens"
              value={form.inquiryOpenDate}
              onChange={(value) => updateForm('inquiryOpenDate', value)}
              error={formik.touched.inquiryOpenDate && Boolean(formik.errors.inquiryOpenDate)}
              helperText={
                formik.touched.inquiryOpenDate ? (formik.errors.inquiryOpenDate as string) : ''
              }
            />
            <DateField
              label="Inquiry closes"
              value={form.inquiryCloseDate}
              minDate={form.inquiryOpenDate ? dayjs(form.inquiryOpenDate) : undefined}
              onChange={(value) => updateForm('inquiryCloseDate', value)}
              error={formik.touched.inquiryCloseDate && Boolean(formik.errors.inquiryCloseDate)}
              helperText={
                formik.touched.inquiryCloseDate ? (formik.errors.inquiryCloseDate as string) : ''
              }
            />
            <DateField
              label="Registration closes"
              value={form.registrationCloseDate}
              minDate={form.inquiryCloseDate ? dayjs(form.inquiryCloseDate) : undefined}
              onChange={(value) => updateForm('registrationCloseDate', value)}
              error={
                formik.touched.registrationCloseDate && Boolean(formik.errors.registrationCloseDate)
              }
              helperText={
                formik.touched.registrationCloseDate
                  ? (formik.errors.registrationCloseDate as string)
                  : ''
              }
            />
            <DateField
              label="Activation target"
              value={form.activationTargetDate}
              minDate={form.registrationCloseDate ? dayjs(form.registrationCloseDate) : undefined}
              onChange={(value) => updateForm('activationTargetDate', value)}
              error={
                formik.touched.activationTargetDate && Boolean(formik.errors.activationTargetDate)
              }
              helperText={
                formik.touched.activationTargetDate
                  ? (formik.errors.activationTargetDate as string)
                  : ''
              }
            />
          </Box>
          <Divider />
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
              gap: 1,
            }}
          >
            <FormControlLabel
              control={
                <Switch
                  checked={form.entranceExamRequired}
                  onChange={(event) => updateForm('entranceExamRequired', event.target.checked)}
                />
              }
              label="Entrance exam required"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={form.financeVerificationRequired}
                  onChange={(event) =>
                    updateForm('financeVerificationRequired', event.target.checked)
                  }
                />
              }
              label="Finance verification required"
            />
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Placement required before activation
            </Typography>
            <ToggleButtonGroup
              exclusive
              size="small"
              value={form.placementTiming}
              onChange={(_event, value: AdmissionCrmPlacementTiming | null) => {
                if (value !== null) updateForm('placementTiming', value);
              }}
              sx={{ flexWrap: 'wrap' }}
            >
              <ToggleButton value={AdmissionCrmPlacementTiming.StandardBeforeActivation}>
                Standard
              </ToggleButton>
              <ToggleButton value={AdmissionCrmPlacementTiming.DivisionBeforeActivation}>
                Standard and division
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>
        </Stack>
      );
    }

    if (activeStep === 2) {
      return (
        <Stack spacing={2}>
          <Box>
            <Typography variant="subtitle1">Default inquiry owner</Typography>
            <Typography variant="body2" color="text.secondary">
              New inquiries use this owner when no routing rule selects another eligible staff
              member.
            </Typography>
          </Box>
          <StaffSelect
            label="Default owner"
            value={form.defaultOwnerUserId}
            options={staffOptions}
            disabled={staffQuery.isLoading || staffQuery.isFetching}
            onChange={(value) => updateForm('defaultOwnerUserId', value)}
          />
          <Divider />
          <Box>
            <Typography variant="subtitle1">Step owners</Typography>
            <Typography variant="body2" color="text.secondary">
              Optional defaults keep responsibility clear without creating a separate assignment for
              every checklist item.
            </Typography>
          </Box>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
              gap: 1.25,
            }}
          >
            {workflowSteps.map((step) => (
              <StaffSelect
                key={step.key}
                label={`${step.label} owner`}
                value={form.stepOwners[step.key]}
                options={staffOptions}
                disabled={staffQuery.isLoading || staffQuery.isFetching}
                onChange={(value) =>
                  updateForm('stepOwners', { ...form.stepOwners, [step.key]: value })
                }
              />
            ))}
          </Box>
        </Stack>
      );
    }

    return (
      <Stack spacing={2}>
        <Alert severity="info">
          Publishing freezes this version for applicants captured under it. Future changes require a
          new version.
        </Alert>
        <SetupReview form={form} standardOptions={standardOptions} staffOptions={staffOptions} />
      </Stack>
    );
  };

  const loadingOrErrorAlerts = (
    <>
      {!academicYearId ? (
        <Alert severity="warning">Select an academic year before configuring admissions.</Alert>
      ) : null}
      {versionsQuery.isFetching || standardsQuery.isFetching || staffQuery.isFetching ? (
        <LinearProgress aria-label="Loading Admission Year Setup" />
      ) : null}
      {hasRequiredQueryError ? (
        <Alert
          severity="error"
          action={
            <Button
              color="inherit"
              onClick={() => {
                versionsQuery.refetch();
                standardsQuery.refetch();
                staffQuery.refetch();
              }}
            >
              Retry
            </Button>
          }
        >
          Admission Year Setup could not be loaded.
        </Alert>
      ) : null}
    </>
  );

  const contextPaper = (
    <Paper
      data-testid="admission-year-context"
      variant="outlined"
      sx={{ p: { xs: 1.5, md: 2 }, borderRadius: 1.5 }}
    >
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        gap={2}
        alignItems={{ md: 'center' }}
        justifyContent="space-between"
      >
        <Stack spacing={0.75} sx={{ minWidth: 0 }}>
          <Stack direction="row" gap={1} alignItems="center" flexWrap="wrap">
            <Typography variant="overline" color="text.secondary">
              Selected academic year
            </Typography>
            {draft ? (
              <Chip
                size="small"
                color="warning"
                variant="outlined"
                label={`Draft v${draft.version}`}
              />
            ) : published ? (
              <Chip
                size="small"
                color="success"
                variant="outlined"
                label={`Published v${published.version}`}
                icon={<Iconify icon="mdi:check-decagram-outline" />}
              />
            ) : (
              <Chip size="small" variant="outlined" label="Not published" />
            )}
          </Stack>
          <Typography component="h2" variant="h5" sx={{ textWrap: 'balance' }}>
            {draft
              ? `Continue setup for ${academicYearName || academicYearId}`
              : published
                ? `${academicYearName || academicYearId} is accepting governed admissions`
                : `Prepare admissions for ${academicYearName || academicYearId}`}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ textWrap: 'pretty' }}>
            {draft
              ? 'Complete the remaining decisions, save the draft, and publish when the school is ready.'
              : published
                ? 'The published version governs new inquiries. Create a new version to change future admissions.'
                : 'Choose the standards, dates, gates, and owners that will govern every new applicant.'}
          </Typography>
          {!draft && !published ? (
            <Stack direction="row" gap={0.75} flexWrap="wrap" sx={{ pt: 0.25 }}>
              {['Choose standards', 'Set dates & gates', 'Assign owners'].map((item) => (
                <Chip
                  key={item}
                  size="small"
                  variant="outlined"
                  icon={<Iconify icon="mdi:check-circle-outline" />}
                  label={item}
                />
              ))}
            </Stack>
          ) : null}
        </Stack>
      </Stack>
    </Paper>
  );

  const dialogs = (
    <>
      <Dialog
        open={publishDialogOpen && !hasRequiredQueryError && !hasRequiredQueryPending}
        onClose={() => !isBusy && setPublishDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Publish Admission Year version {draft?.version}?</DialogTitle>
        <DialogContent>
          <Alert severity="warning">
            Applicants captured after publication retain this version even when a newer version is
            published.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button disabled={isBusy} onClick={() => setPublishDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="success"
            disabled={isBusy || hasRequiredQueryError || hasRequiredQueryPending}
            onClick={handlePublish}
          >
            Publish
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={closeDialogOpen && !hasRequiredQueryError && !hasRequiredQueryPending}
        onClose={() => !isBusy && setCloseDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Close Admission Year?</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Alert severity="warning">
              Closing blocks new inquiries under this published version. Existing applicant records
              remain available.
            </Alert>
            <TextField
              fullWidth
              multiline
              minRows={3}
              label="Reason"
              value={closeReason}
              onChange={(event) => setCloseReason(event.target.value)}
              inputProps={{ maxLength: 2000 }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button disabled={isBusy} onClick={() => setCloseDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="warning"
            disabled={isBusy || !closeReason.trim()}
            onClick={handleClose}
          >
            Close Admission Year
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );

  if (isFormOpen) {
    return (
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <CustomBreadcrumbs
          heading={draft ? 'Continue Setup' : 'New Setup'}
          description={FormSetupUserGuide}
          isBack
          onBack={() => setFormOpen(false)}
          links={[
            { name: 'Student', href: '/student/dashboard' },
            { name: 'Student Enrollment', href: '/student/enrollment/my-work' },
            { name: 'Settings', href: '/student/enrollment/setting' },
            { name: 'Admission Year Setup' },
          ]}
        />
        <Stack spacing={1.5} sx={{ minWidth: 0, minHeight: 0, flex: 1 }}>
          {loadingOrErrorAlerts}

          {draft && !hasRequiredQueryError && !hasRequiredQueryPending ? (
            <Paper
              variant="outlined"
              sx={{
                borderRadius: 1.5,
                display: 'flex',
                flexDirection: 'column',
                flex: 1,
                minHeight: 0,
                overflow: 'hidden',
              }}
            >
              {/* Sticky Stepper Header */}
              <Box
                sx={{
                  pt: { xs: 2, md: 2.5 },
                  pb: 1.5,
                  px: { xs: 1.5, md: 2 },
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  bgcolor: 'background.paper',
                  flexShrink: 0,
                }}
              >
                <Stepper nonLinear activeStep={activeStep} alternativeLabel>
                  {setupSteps.map((label, index) => (
                    <Step key={label} completed={activeStep > index}>
                      <StepButton
                        color="inherit"
                        disableRipple
                        disableTouchRipple
                        sx={{
                          '& .MuiTouchRipple-root': { display: 'none' },
                        }}
                        onClick={() => {
                          if (index < activeStep) {
                            setActiveStep(index as AdmissionYearSetupStep);
                            setValidationErrors([]);
                          }
                        }}
                      >
                        {label}
                      </StepButton>
                    </Step>
                  ))}
                </Stepper>
              </Box>

              {/* Scrollable Form Content */}
              <Scrollbar sx={{ p: { xs: 1.5, md: 2 }, flex: 1 }}>
                {validationErrors.length ? (
                  <Alert severity="warning" sx={{ mb: 2 }}>
                    {validationErrors.map((error) => (
                      <Typography key={error} variant="body2">
                        {error}
                      </Typography>
                    ))}
                  </Alert>
                ) : null}

                <Box sx={{ minHeight: 280, pb: 2, maxWidth: 960, mx: 'auto', width: '100%' }}>
                  {renderStep()}
                </Box>
              </Scrollbar>

              <Divider />
              <Stack
                direction="row"
                justifyContent="space-between"
                gap={1}
                sx={{ p: { xs: 1.5, md: 2 }, bgcolor: 'background.paper', flexShrink: 0 }}
              >
                <Button
                  startIcon={<Iconify icon="eva:arrow-back-fill" />}
                  disabled={activeStep === 0 || isBusy}
                  onClick={() =>
                    setActiveStep((current) => Math.max(0, current - 1) as AdmissionYearSetupStep)
                  }
                >
                  Back
                </Button>
                <Stack direction="row" gap={1}>
                  <Button
                    variant="outlined"
                    startIcon={<Iconify icon="mdi:content-save-outline" />}
                    disabled={
                      isBusy || !isDirty || hasRequiredQueryError || hasRequiredQueryPending
                    }
                    onClick={() => saveDraft()}
                  >
                    Save draft
                  </Button>
                  {activeStep < 3 ? (
                    <Button
                      variant="contained"
                      endIcon={<Iconify icon="eva:arrow-forward-fill" />}
                      disabled={isBusy || hasRequiredQueryError || hasRequiredQueryPending}
                      onClick={handleNext}
                    >
                      Continue
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      color="success"
                      startIcon={<Iconify icon="mdi:publish" />}
                      disabled={isBusy || hasRequiredQueryError || hasRequiredQueryPending}
                      onClick={async () => {
                        try {
                          await admissionYearSetupPublishSchema.validate(form, {
                            abortEarly: false,
                          });
                          setValidationErrors([]);
                          setPublishDialogOpen(true);
                        } catch (err: any) {
                          setValidationErrors(err.errors || ['Validation failed']);
                        }
                      }}
                    >
                      Publish version
                    </Button>
                  )}
                </Stack>
              </Stack>
            </Paper>
          ) : null}
        </Stack>
        {dialogs}
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CustomBreadcrumbs
        heading="Admission Year Setup"
        description={AdmissionYearSetupUserGuide}
        links={[
          { name: 'Student', href: '/student/dashboard' },
          { name: 'Student Enrollment', href: '/student/enrollment/my-work' },
          { name: 'Settings', href: '/student/enrollment/setting' },
          { name: 'Admission Year Setup' },
        ]}
        action={
          <Stack direction="row" gap={1}>
            {published && !draft ? (
              <Button
                color="warning"
                size="small"
                startIcon={<Iconify icon="mdi:lock-outline" />}
                disabled={isBusy}
                onClick={() => setCloseDialogOpen(true)}
              >
                Close admission year
              </Button>
            ) : null}
            <Button
              variant="contained"
              size="small"
              startIcon={<Iconify icon="mdi:cog-outline" />}
              disabled={
                !academicYearId || hasRequiredQueryError || hasRequiredQueryPending || isBusy
              }
              onClick={async () => {
                if (!draft) {
                  await handleCreateDraft();
                }
                setFormOpen(true);
              }}
            >
              {draft
                ? 'Continue Setup'
                : versions.length
                  ? 'Create new version'
                  : 'Setup Academic Process'}
            </Button>
          </Stack>
        }
      />
      <Stack spacing={1} sx={{ minWidth: 0, minHeight: 0, flex: 1 }}>
        {loadingOrErrorAlerts}

        {academicYearId && !hasRequiredQueryError ? contextPaper : null}

        {!hasRequiredQueryError ? (
          <Box
            component="section"
            aria-labelledby="admission-year-version-history-title"
            sx={{
              display: 'flex',
              flexDirection: 'column',
              flex: 1,
              minHeight: 0,
            }}
          >
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="baseline"
              sx={{ mb: 1 }}
            >
              <Typography id="admission-year-version-history-title" component="h2" variant="h6">
                Version history
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {versions.length} {versions.length === 1 ? 'version' : 'versions'}
              </Typography>
            </Stack>
            <CustomizableTable
              tableId="student-enrollment-admission-year-versions"
              tableTitle="Admission Year Versions"
              columns={columns}
              data={versions as unknown as IData[]}
              isLoading={versionsQuery.isLoading}
              isFilter
              isPagination
              defaultRowsPerPage={10}
              rowsPerPageOptions={[10, 25]}
              noDataText={
                <EnrollmentTableEmptyState
                  title="No Admission Year versions"
                  description="Start setup to create the first version for this academic year."
                />
              }
              rowProps={(row) => {
                const version = row as unknown as AdmissionCrmAdmissionYearSetupDto;
                return {
                  'data-testid': 'student-enrollment-admission-year-version-row',
                  'data-version': version.version,
                };
              }}
              wrapperProps={{ sx: enrollmentTableWrapperSx }}
              tableContainerProps={{
                sx: enrollmentTableContainerSx,
              }}
            />
          </Box>
        ) : null}
      </Stack>

      <Drawer
        anchor="right"
        open={Boolean(viewVersion)}
        onClose={() => setViewVersion(null)}
        PaperProps={{
          sx: { width: { xs: '100%', sm: 540 }, display: 'flex', flexDirection: 'column' },
        }}
      >
        <Box
          sx={{
            px: 2.5,
            py: 1.75,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid',
            borderColor: 'divider',
            flexShrink: 0,
          }}
        >
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="h6" fontWeight={600}>
              Version Details
            </Typography>
            {viewVersion && (
              <Chip
                label={
                  viewVersion.version === 1 &&
                  viewVersion.status === AdmissionCrmAdmissionYearSetupStatus.Draft
                    ? 'Draft'
                    : `v${viewVersion.version}`
                }
                size="small"
                color="primary"
                sx={{ height: 20, fontSize: '11px', fontWeight: 700 }}
              />
            )}
            {viewVersion && (
              <Label color={statusColor(viewVersion.status)}>
                {statusLabels[viewVersion.status]}
              </Label>
            )}
          </Box>
          <IconButton
            size="small"
            aria-label="Close admission year version details"
            onClick={() => setViewVersion(null)}
          >
            <Iconify icon="lucide:x" aria-hidden="true" />
          </IconButton>
        </Box>

        <Scrollbar sx={{ p: 2.5, flex: 1 }}>
          {viewVersion ? (
            <SetupReview
              form={toAdmissionYearSetupForm(viewVersion)}
              standardOptions={standardOptions}
              staffOptions={staffOptions}
            />
          ) : null}
        </Scrollbar>
      </Drawer>

      {dialogs}
    </Box>
  );
}
