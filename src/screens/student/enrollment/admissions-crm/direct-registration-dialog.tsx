'use client';

import type { CreateAdmissionCrmLeadDto } from 'src/redux/student/admissions-crm/core-leads-contracts';

import { shikshaMitraToast } from 'src/components/toast';
import { useRef, useMemo, useState, useEffect } from 'react';
import { LoadingButton } from 'src/components/loading-button';
import {
  Box,
  Step,
  Alert,
  Stack,
  Paper,
  Button,
  Dialog,
  Stepper,
  MenuItem,
  StepLabel,
  TextField,
  Typography,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormHelperText,
  InputAdornment,
  LinearProgress,
} from '@mui/material';
import { AdmissionInquiryChannel } from 'src/redux/student/admissions-crm/core-leads-contracts';

import { AdmissionCrmRegistrationAccessMode, AdmissionCrmRegistrationTemplateStatus } from 'src/redux/student/admissions-crm/registration-documents-contracts';
import {
  useGetAdmissionCrmFormNumberSeriesQuery,
  useGetAdmissionCrmRegistrationTemplatesQuery,
  useCreatePaperAdmissionCrmRegistrationMutation,
} from 'src/redux/student/admissions-crm/registration-documents-api';

import {
  useGetAdmissionCrmQuickInquiryOptionsQuery,
  usePreviewAdmissionCrmLeadDuplicatesMutation,
} from 'src/redux/student/admissions-crm/core-leads-api';

import { useGetAdmissionCrmOperationalStandardOptionsQuery } from 'src/redux/student/admissions-crm/operations-governance-api';

import { useEnrollmentWorkspace } from './enrollment-workspace-context';
import {
  mapQuickInquiryOptions,
  quickInquiryFieldLimits,
  isValidQuickInquiryEmail,
  isValidQuickInquiryPhone,
  getDefaultQuickInquiryOption,
} from './quick-inquiry-options';

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated: (leadId: string) => void;
};

type FormState = {
  firstName: string;
  middleName: string;
  lastName: string;
  dateOfBirth: string;
  parentGuardianName: string;
  primaryContactNo: string;
  email: string;
  inquirySourceId: string;
  inquiryTypeId: string;
  academicBoardId: string;
  academicMediumId: string;
  targetStandardId: string;
  intendedRouteDefinitionId: string;
  registrationTemplateId: string;
  formNumberSeriesId: string;
  manualFormNumber: string;
  physicalFormNumber: string;
  physicalFormReceivedDate: string;
  scannedFormAttachmentReference: string;
  notes: string;
  duplicateContinueReason: string;
};

const todayInputValue = () => new Date().toISOString().slice(0, 10);

const initialForm = (): FormState => ({
  firstName: '',
  middleName: '',
  lastName: '',
  dateOfBirth: '',
  parentGuardianName: '',
  primaryContactNo: '',
  email: '',
  inquirySourceId: '',
  inquiryTypeId: '',
  academicBoardId: '',
  academicMediumId: '',
  targetStandardId: '',
  intendedRouteDefinitionId: '',
  registrationTemplateId: '',
  formNumberSeriesId: '',
  manualFormNumber: '',
  physicalFormNumber: '',
  physicalFormReceivedDate: todayInputValue(),
  scannedFormAttachmentReference: '',
  notes: '',
  duplicateContinueReason: '',
});

const readError = (error: unknown) => {
  if (typeof error === 'object' && error && 'data' in error) {
    const { data } = error as { data?: { detail?: string; errorCode?: string } };
    return data?.detail || data?.errorCode || 'The registration could not be created.';
  }
  return 'The registration could not be created.';
};

const steps = ['Applicant identity', 'Academic target', 'Registration form', 'Duplicate review'];

export function DirectRegistrationDialog({ open, onClose, onCreated }: Props) {
  const { academicYearId, academicYearName } = useEnrollmentWorkspace();
  const [form, setForm] = useState<FormState>(initialForm);
  const [activeStep, setActiveStep] = useState(0);
  const [duplicateReviewed, setDuplicateReviewed] = useState(false);
  const [duplicateCount, setDuplicateCount] = useState(0);
  const createRegistrationInFlightRef = useRef(false);
  const [emailTouched, setEmailTouched] = useState(false);

  const quickInquiryOptionsQuery = useGetAdmissionCrmQuickInquiryOptionsQuery(
    { academicYearId: academicYearId || '' },
    { skip: !open || !academicYearId }
  );
  const admissionYearStandardOptionsQuery = useGetAdmissionCrmOperationalStandardOptionsQuery(
    { academicYearId: academicYearId || '' },
    { skip: !open || !academicYearId }
  );
  const templatesQuery = useGetAdmissionCrmRegistrationTemplatesQuery(
    {
      academicYearId: academicYearId || '',
      status: AdmissionCrmRegistrationTemplateStatus.Published,
      maxResultCount: 100,
    },
    { skip: !open || !academicYearId }
  );
  const seriesQuery = useGetAdmissionCrmFormNumberSeriesQuery(
    { academicYearId: academicYearId || '' },
    { skip: !open || !academicYearId }
  );
  const [previewDuplicates, previewState] = usePreviewAdmissionCrmLeadDuplicatesMutation();
  const [createPaperRegistration, createState] = useCreatePaperAdmissionCrmRegistrationMutation();

  const directRegistrationOptions = useMemo(
    () => mapQuickInquiryOptions(quickInquiryOptionsQuery.data),
    [quickInquiryOptionsQuery.data]
  );
  const selectedRoute = directRegistrationOptions.routes.find(
    (route) => route.id === form.intendedRouteDefinitionId
  );
  const availableSources = useMemo(
    () =>
      directRegistrationOptions.sources.filter((source) =>
        source.allowedChannels.includes(AdmissionInquiryChannel.ManualBackOffice)
      ),
    [directRegistrationOptions.sources]
  );
  const manualEntryEnabled = directRegistrationOptions.channels.some(
    (channel) => channel.value === AdmissionInquiryChannel.ManualBackOffice
  );
  const optionConfigurationLoading =
    quickInquiryOptionsQuery.isLoading ||
    quickInquiryOptionsQuery.isFetching ||
    admissionYearStandardOptionsQuery.isLoading ||
    admissionYearStandardOptionsQuery.isFetching;
  const optionConfigurationMissing =
    !optionConfigurationLoading &&
    !quickInquiryOptionsQuery.isError &&
    !admissionYearStandardOptionsQuery.isError &&
    Boolean(quickInquiryOptionsQuery.data) &&
    (!manualEntryEnabled ||
      !availableSources.length ||
      !directRegistrationOptions.inquiryTypes.length ||
      !directRegistrationOptions.routes.length ||
      !admissionYearStandardOptionsQuery.data?.length);
  const optionConfigurationUnavailable =
    optionConfigurationLoading ||
    quickInquiryOptionsQuery.isError ||
    admissionYearStandardOptionsQuery.isError ||
    optionConfigurationMissing ||
    quickInquiryOptionsQuery.data?.isAdmissionCycleActive === false ||
    !quickInquiryOptionsQuery.data;
  const emailInvalid = !isValidQuickInquiryEmail(form.email);
  const phoneInvalid = !isValidQuickInquiryPhone(form.primaryContactNo);

  const duplicateFingerprint = [
    form.firstName.trim().toLowerCase(),
    form.middleName.trim().toLowerCase(),
    form.lastName.trim().toLowerCase(),
    form.dateOfBirth,
    form.parentGuardianName.trim().toLowerCase(),
    form.primaryContactNo.trim(),
    form.email.trim().toLowerCase(),
  ].join('|');

  useEffect(() => {
    setDuplicateReviewed(false);
    setDuplicateCount(0);
    setForm((current) =>
      current.duplicateContinueReason ? { ...current, duplicateContinueReason: '' } : current
    );
  }, [duplicateFingerprint]);

  const admissionYearStandardOptions = useMemo(
    () => admissionYearStandardOptionsQuery.data || [],
    [admissionYearStandardOptionsQuery.data]
  );
  const boardOptions = useMemo(
    () =>
      Array.from(
        new Map(
          admissionYearStandardOptions.map((option) => [
            option.boardId,
            { id: option.boardId, name: option.boardName },
          ])
        ).values()
      ).sort((left, right) => left.name.localeCompare(right.name)),
    [admissionYearStandardOptions]
  );
  const mediumOptions = useMemo(
    () =>
      Array.from(
        new Map(
          admissionYearStandardOptions
            .filter((option) => option.boardId === form.academicBoardId)
            .map((option) => [option.mediumId, { id: option.mediumId, name: option.mediumName }])
        ).values()
      ).sort((left, right) => left.name.localeCompare(right.name)),
    [admissionYearStandardOptions, form.academicBoardId]
  );
  const standards = useMemo(
    () =>
      admissionYearStandardOptions
        .filter(
          (option) =>
            option.boardId === form.academicBoardId && option.mediumId === form.academicMediumId
        )
        .sort((left, right) => left.standardName.localeCompare(right.standardName)),
    [admissionYearStandardOptions, form.academicBoardId, form.academicMediumId]
  );
  const selectedStandard = standards.find(
    (standard) => standard.standardId === form.targetStandardId
  );

  useEffect(() => {
    if (!open || !quickInquiryOptionsQuery.data) return;

    setForm((current) => {
      const currentRouteIsAvailable = directRegistrationOptions.routes.some(
        (route) => route.id === current.intendedRouteDefinitionId
      );
      const intendedRouteDefinitionId = currentRouteIsAvailable
        ? current.intendedRouteDefinitionId
        : (getDefaultQuickInquiryOption(directRegistrationOptions.routes)?.id ?? '');
      const currentSourceIsAvailable = availableSources.some(
        (source) => source.id === current.inquirySourceId
      );
      const inquirySourceId = currentSourceIsAvailable
        ? current.inquirySourceId
        : (getDefaultQuickInquiryOption(availableSources)?.id ?? '');
      const currentTypeIsAvailable = directRegistrationOptions.inquiryTypes.some(
        (type) => type.id === current.inquiryTypeId
      );
      const inquiryTypeId = currentTypeIsAvailable
        ? current.inquiryTypeId
        : (getDefaultQuickInquiryOption(directRegistrationOptions.inquiryTypes)?.id ?? '');

      return intendedRouteDefinitionId === current.intendedRouteDefinitionId &&
        inquirySourceId === current.inquirySourceId &&
        inquiryTypeId === current.inquiryTypeId
        ? current
        : { ...current, intendedRouteDefinitionId, inquirySourceId, inquiryTypeId };
    });
  }, [
    availableSources,
    directRegistrationOptions.inquiryTypes,
    directRegistrationOptions.routes,
    open,
    quickInquiryOptionsQuery.data,
  ]);

  useEffect(() => {
    if (!open || form.academicBoardId || boardOptions.length !== 1) return;
    setForm((current) => ({ ...current, academicBoardId: boardOptions[0].id }));
  }, [boardOptions, form.academicBoardId, open]);

  useEffect(() => {
    if (!open || form.academicMediumId || mediumOptions.length !== 1) return;
    setForm((current) => ({ ...current, academicMediumId: mediumOptions[0].id }));
  }, [form.academicMediumId, mediumOptions, open]);

  useEffect(() => {
    if (!open || form.targetStandardId || standards.length !== 1) return;
    setForm((current) => ({ ...current, targetStandardId: standards[0].standardId }));
  }, [form.targetStandardId, open, standards]);

  useEffect(() => {
    if (!open) return;
    const published = templatesQuery.data?.items || [];
    if (!form.registrationTemplateId && published.length === 1) {
      setForm((current) => ({ ...current, registrationTemplateId: published[0].id }));
    }
  }, [form.registrationTemplateId, open, templatesQuery.data?.items]);

  const reset = () => {
    setForm(initialForm());
    setActiveStep(0);
    setDuplicateReviewed(false);
    setDuplicateCount(0);
    setEmailTouched(false);
  };

  const close = () => {
    reset();
    onClose();
  };

  const buildApplicant = (): CreateAdmissionCrmLeadDto => {
    if (!selectedStandard || !selectedRoute) {
      throw new Error('Paper registration academic options are incomplete.');
    }

    return {
      channel: AdmissionInquiryChannel.ManualBackOffice,
      inquirySourceId: form.inquirySourceId || null,
      inquiryTypeId: form.inquiryTypeId || null,
      firstName: form.firstName.trim(),
      middleName: form.middleName.trim() || null,
      lastName: form.lastName.trim() || null,
      dateOfBirth: form.dateOfBirth ? `${form.dateOfBirth}T00:00:00.000Z` : null,
      parentGuardianName: form.parentGuardianName.trim() || null,
      primaryContactNo: form.primaryContactNo.trim() || null,
      email: form.email.trim() || null,
      admissionIntent: `${selectedRoute.label} paper registration`,
      intendedRouteDefinitionId: selectedRoute.definitionId || null,
      intendedRouteType: selectedRoute.routeType,
      targetStandardId: selectedStandard.standardId,
      academicBoardId: selectedStandard.boardId,
      academicMediumId: selectedStandard.mediumId,
      academicMediumStageId: selectedStandard.mediumStageId,
      desiredClassName: selectedStandard.standardName,
      notes: form.notes.trim() || null,
      duplicateContinueReason: form.duplicateContinueReason.trim() || null,
    };
  };

  const submit = async () => {
    if (!academicYearId) return;
    setEmailTouched(true);
    if (
      !form.firstName.trim() ||
      !form.parentGuardianName.trim() ||
      !form.primaryContactNo.trim() ||
      !form.academicBoardId ||
      !form.academicMediumId ||
      !selectedStandard ||
      !selectedRoute ||
      (availableSources.length > 0 && !form.inquirySourceId) ||
      (directRegistrationOptions.inquiryTypes.length > 0 && !form.inquiryTypeId) ||
      !form.registrationTemplateId
    ) {
      shikshaMitraToast.error({
        message:
          'Student name, guardian, mobile, inquiry source and type, board, medium, standard, admission pathway, and template are required.',
      });
      return;
    }
    if (!form.primaryContactNo.trim()) {
      shikshaMitraToast.error({ message: 'Parent or guardian mobile number is required.' });
      return;
    }
    if (emailInvalid) {
      shikshaMitraToast.error({
        message: 'Enter a valid email address, for example parent@example.com.',
      });
      return;
    }
    if (phoneInvalid) {
      shikshaMitraToast.error({
        message: 'Enter a valid contact number containing 7 to 15 digits.',
      });
      return;
    }
    if (optionConfigurationUnavailable) {
      shikshaMitraToast.error({
        message: 'Paper registration options are unavailable. Review Enrollment Settings.',
      });
      return;
    }
    if (!form.physicalFormNumber.trim()) {
      shikshaMitraToast.error({
        message: 'Physical form number is required.',
      });
      return;
    }

    const applicant = buildApplicant();
    if (createRegistrationInFlightRef.current) return;
    createRegistrationInFlightRef.current = true;
    try {
      if (!duplicateReviewed) {
        const duplicates = await previewDuplicates({ academicYearId, body: applicant }).unwrap();
        setDuplicateReviewed(true);
        setDuplicateCount(duplicates.length);
        if (duplicates.length) return;
      }
      if (duplicateCount && !form.duplicateContinueReason.trim()) {
        shikshaMitraToast.error({
          message: 'Enter a reason before creating a possible duplicate.',
        });
        return;
      }
      const physicalFormNumber = form.physicalFormNumber.trim().toUpperCase();
      const result = await createPaperRegistration({
        academicYearId,
        body: {
          applicant,
          registration: {
            registrationTemplateId: form.registrationTemplateId,
            accessMode: AdmissionCrmRegistrationAccessMode.StaffAssisted,
            formNumberSeriesId: form.formNumberSeriesId || null,
            manualFormNumber: form.formNumberSeriesId
              ? form.manualFormNumber.trim().toUpperCase() || null
              : physicalFormNumber,
            waiveFee: false,
          },
          physicalFormNumber,
          physicalFormReceivedDate: `${form.physicalFormReceivedDate || todayInputValue()}T00:00:00.000Z`,
          scannedFormAttachmentReference: form.scannedFormAttachmentReference.trim() || null,
        },
      }).unwrap();
      shikshaMitraToast.success({
        message: 'Paper registration created. Enter the form responses next.',
      });
      reset();
      onCreated(result.applicant.id);
    } catch (error) {
      setDuplicateReviewed(false);
      shikshaMitraToast.error({ message: readError(error) });
    } finally {
      createRegistrationInFlightRef.current = false;
    }
  };

  const validateStep = (step: number) => {
    if (step === 0) {
      if (!form.firstName.trim()) return 'Student first name is required.';
      if (!form.parentGuardianName.trim()) return 'Parent or guardian name is required.';
      if (!form.primaryContactNo.trim()) return 'Parent or guardian mobile number is required.';
      if (emailInvalid) {
        return 'Enter a valid email address, for example parent@example.com.';
      }
      if (phoneInvalid) {
        return 'Enter a valid contact number containing 7 to 15 digits.';
      }
    }
    if (step === 1) {
      if (availableSources.length > 0 && !form.inquirySourceId) {
        return 'Inquiry source is required.';
      }
      if (directRegistrationOptions.inquiryTypes.length > 0 && !form.inquiryTypeId) {
        return 'Inquiry type is required.';
      }
      if (!form.academicBoardId) return 'Board is required.';
      if (!form.academicMediumId) return 'Medium is required.';
      if (!selectedStandard) return 'Standard is required.';
      if (!selectedRoute) return 'Admission pathway is required.';
      if (optionConfigurationUnavailable) {
        return 'Paper registration options are unavailable. Review Enrollment Settings.';
      }
    }
    if (step === 2) {
      if (!form.registrationTemplateId) return 'Registration template is required.';
      if (!form.physicalFormNumber.trim()) return 'Physical form number is required.';
    }
    return null;
  };

  const nextStep = () => {
    if (activeStep === 0) setEmailTouched(true);
    const message = validateStep(activeStep);
    if (message) {
      shikshaMitraToast.error({ message });
      return;
    }
    setActiveStep((current) => Math.min(current + 1, steps.length - 1));
  };

  return (
    <Dialog open={open} onClose={close} fullWidth maxWidth="md">
      <DialogTitle>Enter Paper Registration</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={1.5}>
          <Alert severity="info">
            Use this when staff receive a physical registration form and need to create the
            Enrollment record before entering the form responses. OCR is not used in this workflow.
          </Alert>
          <Paper variant="outlined" sx={{ p: 1.25 }}>
            <Typography variant="caption" color="text.secondary">
              Admission year
            </Typography>
            <Typography variant="body2">{academicYearName || 'Selected academic year'}</Typography>
          </Paper>

          {optionConfigurationLoading ? (
            <LinearProgress aria-label="Loading paper registration options" />
          ) : null}
          {quickInquiryOptionsQuery.isError ? (
            <Alert
              severity="error"
              action={
                <Button
                  color="inherit"
                  size="small"
                  onClick={() => quickInquiryOptionsQuery.refetch()}
                >
                  Retry
                </Button>
              }
            >
              Admission capture options could not be loaded.
            </Alert>
          ) : null}
          {optionConfigurationMissing ? (
            <Alert severity="warning">
              Paper registration needs the Manual entry channel, an admission pathway, and at least
              one standard in Admission Year Setup.
            </Alert>
          ) : null}
          {quickInquiryOptionsQuery.data?.isAdmissionCycleActive === false ? (
            <Alert severity="warning">
              Paper registration is unavailable because the admission year is not active.
            </Alert>
          ) : null}

          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {activeStep === 0 ? (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
                gap: 1,
              }}
            >
              <TextField
                required
                label="First name"
                value={form.firstName}
                slotProps={{ htmlInput: { maxLength: quickInquiryFieldLimits.name } }}
                onChange={(event) =>
                  setForm((current) => ({ ...current, firstName: event.target.value }))
                }
              />
              <TextField
                label="Middle name"
                value={form.middleName}
                slotProps={{ htmlInput: { maxLength: quickInquiryFieldLimits.name } }}
                onChange={(event) =>
                  setForm((current) => ({ ...current, middleName: event.target.value }))
                }
              />
              <TextField
                label="Last name"
                value={form.lastName}
                slotProps={{ htmlInput: { maxLength: quickInquiryFieldLimits.name } }}
                onChange={(event) =>
                  setForm((current) => ({ ...current, lastName: event.target.value }))
                }
              />
              <TextField
                type="date"
                label="Date of birth"
                value={form.dateOfBirth}
                onChange={(event) =>
                  setForm((current) => ({ ...current, dateOfBirth: event.target.value }))
                }
                slotProps={{ inputLabel: { shrink: true } }}
              />
              <TextField
                required
                label="Parent or guardian"
                value={form.parentGuardianName}
                slotProps={{ htmlInput: { maxLength: quickInquiryFieldLimits.name } }}
                onChange={(event) =>
                  setForm((current) => ({ ...current, parentGuardianName: event.target.value }))
                }
              />
              <TextField
                required
                type="tel"
                label="Parent or guardian mobile"
                value={form.primaryContactNo}
                error={phoneInvalid}
                helperText={
                  phoneInvalid
                    ? 'Enter a valid contact number containing 7 to 15 digits.'
                    : 'Optional when an email address is provided.'
                }
                slotProps={{
                  htmlInput: {
                    inputMode: 'tel',
                    maxLength: quickInquiryFieldLimits.contact,
                  },
                }}
                onChange={(event) =>
                  setForm((current) => ({ ...current, primaryContactNo: event.target.value }))
                }
              />
              <TextField
                type="email"
                label="Email address"
                name="email"
                autoComplete="email"
                spellCheck={false}
                value={form.email}
                error={emailTouched && emailInvalid}
                helperText={
                  emailTouched && emailInvalid
                    ? 'Enter a valid email address, for example parent@example.com.'
                    : 'Optional when a contact number is provided.'
                }
                InputProps={{
                  startAdornment: <InputAdornment position="start">@</InputAdornment>,
                }}
                slotProps={{ htmlInput: { maxLength: quickInquiryFieldLimits.email } }}
                onBlur={() => setEmailTouched(true)}
                onChange={(event) => {
                  setForm((current) => ({ ...current, email: event.target.value }));
                  setDuplicateReviewed(false);
                }}
              />
            </Box>
          ) : null}

          {activeStep === 1 ? (
            <Stack spacing={1}>
              {admissionYearStandardOptionsQuery.isError ? (
                <Alert
                  severity="error"
                  action={
                    <Button
                      color="inherit"
                      size="small"
                      onClick={() => admissionYearStandardOptionsQuery.refetch()}
                    >
                      Retry
                    </Button>
                  }
                >
                  Boards, mediums, and standards could not be loaded from Admission Year Setup.
                </Alert>
              ) : null}
              {!admissionYearStandardOptionsQuery.isFetching &&
              admissionYearStandardOptionsQuery.data &&
              !admissionYearStandardOptions.length ? (
                <Alert severity="warning">
                  No standards are available in the published Admission Year Setup.
                </Alert>
              ) : null}
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
                  gap: 1,
                }}
              >
                <TextField
                  required={availableSources.length > 0}
                  select
                  label="Inquiry source"
                  value={form.inquirySourceId}
                  disabled={optionConfigurationUnavailable}
                  helperText={
                    availableSources.length
                      ? 'Available for manual back-office entry.'
                      : 'No separate source is configured for manual entry.'
                  }
                  onChange={(event) => {
                    setForm((current) => ({
                      ...current,
                      inquirySourceId: event.target.value,
                    }));
                  }}
                >
                  {availableSources.map((source) => (
                    <MenuItem key={source.id} value={source.id}>
                      {source.label}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  required={directRegistrationOptions.inquiryTypes.length > 0}
                  select
                  label="Inquiry type"
                  value={form.inquiryTypeId}
                  disabled={optionConfigurationUnavailable}
                  helperText={
                    directRegistrationOptions.inquiryTypes.length
                      ? 'Used for filtering and reporting.'
                      : 'No inquiry types are configured.'
                  }
                  onChange={(event) => {
                    setForm((current) => ({
                      ...current,
                      inquiryTypeId: event.target.value,
                    }));
                  }}
                >
                  {directRegistrationOptions.inquiryTypes.map((type) => (
                    <MenuItem key={type.id} value={type.id}>
                      {type.label}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  required
                  select
                  label="Board"
                  value={form.academicBoardId}
                  disabled={admissionYearStandardOptionsQuery.isFetching}
                  helperText="Available in the published Admission Year Setup."
                  onChange={(event) => {
                    setForm((current) => ({
                      ...current,
                      academicBoardId: event.target.value,
                      academicMediumId: '',
                      targetStandardId: '',
                    }));
                    setDuplicateReviewed(false);
                  }}
                >
                  {boardOptions.map((board) => (
                    <MenuItem key={board.id} value={board.id}>
                      {board.name}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  required
                  select
                  label="Medium"
                  value={form.academicMediumId}
                  disabled={!form.academicBoardId || admissionYearStandardOptionsQuery.isFetching}
                  helperText="Available for the selected board."
                  onChange={(event) => {
                    setForm((current) => ({
                      ...current,
                      academicMediumId: event.target.value,
                      targetStandardId: '',
                    }));
                    setDuplicateReviewed(false);
                  }}
                >
                  {mediumOptions.map((medium) => (
                    <MenuItem key={medium.id} value={medium.id}>
                      {medium.name}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  required
                  select
                  label="Standard"
                  value={form.targetStandardId}
                  disabled={!form.academicMediumId || admissionYearStandardOptionsQuery.isFetching}
                  helperText={
                    selectedStandard
                      ? selectedStandard.mediumStageName
                      : 'Available for the selected board and medium.'
                  }
                  onChange={(event) => {
                    setForm((current) => ({
                      ...current,
                      targetStandardId: event.target.value,
                    }));
                    setDuplicateReviewed(false);
                  }}
                >
                  {standards.map((standard) => (
                    <MenuItem key={standard.standardId} value={standard.standardId}>
                      {standard.standardName}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  required
                  select
                  label="Admission pathway"
                  value={form.intendedRouteDefinitionId}
                  disabled={optionConfigurationUnavailable}
                  helperText={
                    selectedRoute?.version
                      ? `Published admission-type version ${selectedRoute.version}.`
                      : 'Allowed by the published Admission Year Setup.'
                  }
                  onChange={(event) => {
                    setForm((current) => ({
                      ...current,
                      intendedRouteDefinitionId: event.target.value,
                    }));
                    setDuplicateReviewed(false);
                  }}
                >
                  {directRegistrationOptions.routes.map((route) => (
                    <MenuItem key={route.id} value={route.id}>
                      {route.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>
              <FormHelperText>
                The selected board, medium, and standard are saved from one Institute Setup record.
              </FormHelperText>
            </Stack>
          ) : null}

          {activeStep === 2 ? (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
                gap: 1,
              }}
            >
              <TextField
                required
                select
                label="Registration template"
                value={form.registrationTemplateId}
                onChange={(event) =>
                  setForm((current) => ({ ...current, registrationTemplateId: event.target.value }))
                }
              >
                {(templatesQuery.data?.items || []).map((template) => (
                  <MenuItem key={template.id} value={template.id}>
                    {template.name} - v{template.version}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label="Form number series"
                value={form.formNumberSeriesId}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    formNumberSeriesId: event.target.value,
                    manualFormNumber: event.target.value ? '' : current.manualFormNumber,
                  }))
                }
              >
                <MenuItem value="">Use paper form number</MenuItem>
                {(seriesQuery.data?.items || [])
                  .filter((item) => item.isActive)
                  .map((item) => (
                    <MenuItem key={item.id} value={item.id}>
                      {item.name} - {item.nextPreview}
                    </MenuItem>
                  ))}
              </TextField>
              <TextField
                label="Paper form number"
                value={form.physicalFormNumber}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    physicalFormNumber: event.target.value.toUpperCase(),
                  }))
                }
              />
              <TextField
                type="date"
                required
                label="Received date"
                value={form.physicalFormReceivedDate}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    physicalFormReceivedDate: event.target.value,
                  }))
                }
                slotProps={{ inputLabel: { shrink: true } }}
              />
              <TextField
                label="Scan reference"
                value={form.scannedFormAttachmentReference}
                helperText="Optional reference only. Upload/OCR handling is future scope."
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    scannedFormAttachmentReference: event.target.value,
                  }))
                }
              />
            </Box>
          ) : null}

          {activeStep === 3 ? (
            <Stack spacing={1.25}>
              <Alert severity="info">
                Confirm this paper registration is operationally valid. It bypasses inquiry and
                entrance exam only when the school accepts that path; document, fee, class
                placement, and admission readiness checks still apply.
              </Alert>
              <TextField
                label="Staff notes"
                value={form.notes}
                slotProps={{ htmlInput: { maxLength: quickInquiryFieldLimits.notes } }}
                onChange={(event) =>
                  setForm((current) => ({ ...current, notes: event.target.value }))
                }
                multiline
                minRows={2}
              />
              {duplicateReviewed && duplicateCount === 0 ? (
                <Alert severity="success">No likely duplicate applicant records found.</Alert>
              ) : null}
              {duplicateCount ? (
                <Alert severity="warning">
                  {duplicateCount} likely duplicate applicant record
                  {duplicateCount === 1 ? '' : 's'} found.
                </Alert>
              ) : null}
              {duplicateCount ? (
                <TextField
                  required
                  label="Reason to continue"
                  value={form.duplicateContinueReason}
                  slotProps={{ htmlInput: { maxLength: quickInquiryFieldLimits.notes } }}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      duplicateContinueReason: event.target.value,
                    }))
                  }
                  multiline
                  minRows={2}
                />
              ) : null}
            </Stack>
          ) : null}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={close}>Cancel</Button>
        <Button disabled={activeStep === 0} onClick={() => setActiveStep((current) => current - 1)}>
          Back
        </Button>
        {activeStep < steps.length - 1 ? (
          <Button variant="contained" onClick={nextStep}>
            Next
          </Button>
        ) : (
          <LoadingButton
            variant="contained"
            loading={previewState.isLoading || createState.isLoading}
            onClick={submit}
          >
            {duplicateReviewed && duplicateCount ? 'Create Anyway' : 'Create From Paper Form'}
          </LoadingButton>
        )}
      </DialogActions>
    </Dialog>
  );
}
