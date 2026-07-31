'use client';

import type { IData, IColumn } from 'src/components/customizabaleTable/types';
import type {
  AdmissionCrmStaffLookupDto,
  AdmissionCrmAdmissionYearSetupDto,
  AdmissionCrmAdmissionYearStandardOptionDto,
} from 'src/redux/student/admissions-crm/admissions-crm-api';

import { toast } from 'sonner';
import { Iconify } from 'src/components/iconify';
import { fDate, fDateTime } from 'src/utils/format-time';
import { studentPaths } from 'src/constants/student-menu';
import { useMemo, useState, useEffect, useCallback } from 'react';
import CustomizableTable from 'src/components/customizabaleTable';
import {
  Box,
  Chip,
  Step,
  Alert,
  Stack,
  Button,
  Dialog,
  Switch,
  Divider,
  Stepper,
  Checkbox,
  TextField,
  StepLabel,
  Typography,
  DialogTitle,
  Autocomplete,
  ToggleButton,
  DialogActions,
  DialogContent,
  LinearProgress,
  FormControlLabel,
  ToggleButtonGroup,
} from '@mui/material';
import {
  AdmissionCrmRouteType,
  AdmissionCrmPlacementTiming,
  useGetAdmissionCrmStaffQuery,
  AdmissionCrmAdmissionYearSetupStatus,
  useCloseAdmissionCrmAdmissionYearMutation,
  usePublishAdmissionCrmAdmissionYearMutation,
  useGetAdmissionCrmAdmissionYearVersionsQuery,
  useUpdateAdmissionCrmAdmissionYearDraftMutation,
  useCreateAdmissionCrmAdmissionYearDraftMutation,
  useGetAdmissionCrmAdmissionYearStandardOptionsQuery,
} from 'src/redux/student/admissions-crm/admissions-crm-api';

import { EnrollmentWorkspaceHeader } from '../admissions-crm/workspace-header';
import { useEnrollmentSettingsDirtyState } from './enrollment-settings-dirty-state';
import { useEnrollmentWorkspace } from '../admissions-crm/enrollment-workspace-context';
import {
  enrollmentTableWrapperSx,
  EnrollmentTableEmptyState,
  enrollmentEmbeddedTableContainerSx,
} from '../admissions-crm/workspace-table-patterns';
import {
  toAdmissionYearSetupForm,
  type AdmissionYearSetupStep,
  type AdmissionYearSetupForm,
  emptyAdmissionYearSetupForm,
  validateAdmissionYearSetupStep,
  validateAdmissionYearSetupForPublish,
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
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <TextField
      type="date"
      size="small"
      fullWidth
      label={label}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      slotProps={{ inputLabel: { shrink: true } }}
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

  const rows = [
    {
      label: 'Open standards',
      value: selectedStandards.length
        ? selectedStandards.map((option) => standardLabel(option)).join(', ')
        : 'None selected',
    },
    {
      label: 'Admission routes',
      value: form.routeTypes.map((route) => routeTypeLabels[route]).join(', ') || 'None selected',
    },
    {
      label: 'Inquiry window',
      value:
        form.inquiryOpenDate && form.inquiryCloseDate
          ? `${fDate(form.inquiryOpenDate)} - ${fDate(form.inquiryCloseDate)}`
          : 'Not configured',
    },
    {
      label: 'Registration closes',
      value: form.registrationCloseDate ? fDate(form.registrationCloseDate) : 'Not configured',
    },
    {
      label: 'Activation target',
      value: form.activationTargetDate ? fDate(form.activationTargetDate) : 'Not configured',
    },
    {
      label: 'Entrance exam',
      value: form.entranceExamRequired ? 'Required' : 'Skipped',
    },
    {
      label: 'Finance verification',
      value: form.financeVerificationRequired ? 'Required' : 'Skipped',
    },
    {
      label: 'Placement timing',
      value:
        form.placementTiming === AdmissionCrmPlacementTiming.DivisionBeforeActivation
          ? 'Division assigned before activation'
          : 'Standard assigned before activation; division may follow',
    },
    {
      label: 'Default owner',
      value: ownerName ? staffLabel(ownerName) : 'No default owner',
    },
  ];

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: 'minmax(180px, 0.35fr) minmax(0, 1fr)' },
        columnGap: 2,
      }}
    >
      {rows.map((row) => (
        <Box key={row.label} sx={{ display: 'contents' }}>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ py: 1.25, borderBottom: 1, borderColor: 'divider' }}
          >
            {row.label}
          </Typography>
          <Typography
            variant="body2"
            sx={{ py: 1.25, borderBottom: 1, borderColor: 'divider', overflowWrap: 'anywhere' }}
          >
            {row.value}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}

export function AdmissionYearSetup() {
  const { academicYearId, academicYearName } = useEnrollmentWorkspace();
  const [activeStep, setActiveStep] = useState<AdmissionYearSetupStep>(0);
  const [form, setForm] = useState<AdmissionYearSetupForm>(emptyAdmissionYearSetupForm);
  const [loadedDraftId, setLoadedDraftId] = useState<string>();
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [closeDialogOpen, setCloseDialogOpen] = useState(false);
  const [closeReason, setCloseReason] = useState('');

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
      setForm(toAdmissionYearSetupForm(draft));
      setValidationErrors([]);
    },
  });

  useEffect(() => {
    if (draft && draft.id !== loadedDraftId) {
      setForm(toAdmissionYearSetupForm(draft));
      setLoadedDraftId(draft.id);
      setActiveStep(0);
      setValidationErrors([]);
    }
    if (!draft && loadedDraftId) {
      setLoadedDraftId(undefined);
    }
  }, [draft, loadedDraftId]);

  const updateForm = useCallback(
    <K extends keyof AdmissionYearSetupForm>(key: K, value: AdmissionYearSetupForm[K]) => {
      setForm((current) => ({ ...current, [key]: value }));
      setValidationErrors([]);
    },
    []
  );

  const saveDraft = useCallback(
    async (showSuccess = true) => {
      if (!draft || hasRequiredQueryError || hasRequiredQueryPending) return undefined;
      try {
        const saved = await updateDraft({ id: draft.id, body: form }).unwrap();
        setForm(toAdmissionYearSetupForm(saved));
        if (showSuccess) toast.success('Admission Year draft saved.');
        return saved;
      } catch (error) {
        toast.error(getErrorMessage(error, 'Admission Year draft could not be saved.'));
        return undefined;
      }
    },
    [draft, form, hasRequiredQueryError, hasRequiredQueryPending, updateDraft]
  );

  const handleCreateDraft = async () => {
    if (!academicYearId || hasRequiredQueryError || hasRequiredQueryPending) return;
    try {
      const created = await createDraft({ academicYearId }).unwrap();
      setForm(toAdmissionYearSetupForm(created));
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

  const handleNext = () => {
    const errors = validateAdmissionYearSetupStep(form, activeStep);
    if (errors.length) {
      setValidationErrors(errors);
      return;
    }
    setValidationErrors([]);
    setActiveStep((current) => Math.min(3, current + 1) as AdmissionYearSetupStep);
  };

  const handlePublish = async () => {
    if (hasRequiredQueryError || hasRequiredQueryPending) return;
    const errors = validateAdmissionYearSetupForPublish(form);
    if (errors.length) {
      setValidationErrors(errors);
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
        minWidth: 100,
        render: (value) => `v${value}`,
      },
      {
        id: 'status',
        label: 'Status',
        isSort: true,
        isFilter: true,
        filterType: 'enum',
        enumOptions: Object.entries(statusLabels).map(([value, label]) => ({
          value: Number(value),
          label,
        })),
        minWidth: 130,
        render: (value) => (
          <Chip
            size="small"
            color={statusColor(value as AdmissionCrmAdmissionYearSetupStatus)}
            label={statusLabels[value as AdmissionCrmAdmissionYearSetupStatus]}
          />
        ),
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
            renderOption={(props, option, { selected }) => (
              <li {...props}>
                <Checkbox checked={selected} sx={{ mr: 1 }} />
                <Box>
                  <Typography variant="body2">{option.standardName}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {option.mediumName} | {option.boardName}
                  </Typography>
                </Box>
              </li>
            )}
            renderInput={(params) => (
              <TextField
                {...params}
                size="small"
                label="Open standards"
                placeholder={selectedStandards.length ? undefined : 'Select standards'}
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
              renderInput={(params) => (
                <TextField {...params} size="small" label="Accepted admission routes" />
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
            />
            <DateField
              label="Inquiry closes"
              value={form.inquiryCloseDate}
              onChange={(value) => updateForm('inquiryCloseDate', value)}
            />
            <DateField
              label="Registration closes"
              value={form.registrationCloseDate}
              onChange={(value) => updateForm('registrationCloseDate', value)}
            />
            <DateField
              label="Activation target"
              value={form.activationTargetDate}
              onChange={(value) => updateForm('activationTargetDate', value)}
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

  return (
    <Stack spacing={2} sx={{ minWidth: 0 }}>
      <EnrollmentWorkspaceHeader
        title="Admission Year Setup"
        description="Define the admission scope and publish one versioned setup for the selected academic year."
        section={{ name: 'Settings', href: studentPaths.enrollment.settings }}
        actions={
          draft ? (
            <Button
              variant="contained"
              startIcon={<Iconify icon="mdi:content-save-outline" />}
              disabled={isBusy || !isDirty || hasRequiredQueryError || hasRequiredQueryPending}
              onClick={() => saveDraft()}
            >
              Save draft
            </Button>
          ) : (
            <Button
              variant="contained"
              startIcon={<Iconify icon="mdi:file-document-plus-outline" />}
              disabled={
                isBusy || !academicYearId || hasRequiredQueryError || hasRequiredQueryPending
              }
              onClick={handleCreateDraft}
            >
              {versions.length ? 'Create new version' : 'Start setup'}
            </Button>
          )
        }
      />

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

      {academicYearId && !hasRequiredQueryError && !hasRequiredQueryPending ? (
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          gap={1}
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          justifyContent="space-between"
          sx={{ px: 2 }}
        >
          <Box>
            <Typography variant="overline" color="text.secondary">
              Selected academic year
            </Typography>
            <Typography variant="h6">{academicYearName || academicYearId}</Typography>
          </Box>
          <Stack direction="row" gap={1} alignItems="center">
            {published ? (
              <Chip
                color="success"
                label={`Published v${published.version}`}
                icon={<Iconify icon="mdi:check-decagram-outline" />}
              />
            ) : (
              <Chip label="Not published" />
            )}
            {published ? (
              <Button
                size="small"
                color="warning"
                startIcon={<Iconify icon="mdi:lock-outline" />}
                disabled={isBusy}
                onClick={() => setCloseDialogOpen(true)}
              >
                Close
              </Button>
            ) : null}
          </Stack>
        </Stack>
      ) : null}

      {draft && !hasRequiredQueryError && !hasRequiredQueryPending ? (
        <Box sx={{ px: { xs: 1, md: 2 } }}>
          <Stepper
            activeStep={activeStep}
            alternativeLabel
            sx={{ mb: 3, minWidth: 0, overflowX: 'auto' }}
          >
            {setupSteps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {validationErrors.length ? (
            <Alert severity="warning" sx={{ mb: 2 }}>
              {validationErrors.map((error) => (
                <Typography key={error} variant="body2">
                  {error}
                </Typography>
              ))}
            </Alert>
          ) : null}

          <Box sx={{ minHeight: 280 }}>{renderStep()}</Box>

          <Divider sx={{ my: 2 }} />
          <Stack direction="row" justifyContent="space-between" gap={1}>
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
                disabled={isBusy || !isDirty || hasRequiredQueryError || hasRequiredQueryPending}
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
                  onClick={() => {
                    const errors = validateAdmissionYearSetupForPublish(form);
                    setValidationErrors(errors);
                    if (!errors.length) setPublishDialogOpen(true);
                  }}
                >
                  Publish version
                </Button>
              )}
            </Stack>
          </Stack>
        </Box>
      ) : academicYearId && !hasRequiredQueryError && !hasRequiredQueryPending ? (
        <Alert severity={published ? 'info' : 'warning'}>
          {published
            ? 'The published setup is immutable. Create a new version to make changes.'
            : 'Start setup to define when and where the school will accept applications.'}
        </Alert>
      ) : null}

      {!hasRequiredQueryError ? (
        <Box sx={{ pt: 1 }}>
          <Typography component="h2" variant="h6" sx={{ px: 2, mb: 1 }}>
            Version history
          </Typography>
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
            tableContainerProps={{ sx: enrollmentEmbeddedTableContainerSx }}
          />
        </Box>
      ) : null}

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
              autoFocus
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
    </Stack>
  );
}
