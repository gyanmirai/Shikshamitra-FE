'use client';

import type { CreateAdmissionCrmLeadDto } from 'src/redux/student/admissions-crm/admissions-crm-api';

import { useMemo, useState, useEffect } from 'react';
import { shikshaMitraToast } from 'src/components/toast';
import { LoadingButton } from 'src/components/loading-button';
import { useGetAcademicOrganizationOptionsQuery } from 'src/redux/academicOrganizationOptions/academicOrganizationOptionsApi';
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
import {
  AdmissionInquiryChannel,
  AdmissionCrmRegistrationTemplateStatus,
  useGetAdmissionCrmStandardOptionsQuery,
  useGetAdmissionCrmFormNumberSeriesQuery,
  useGetAdmissionCrmQuickInquiryOptionsQuery,
  useGetAdmissionCrmRegistrationTemplatesQuery,
  usePreviewAdmissionCrmLeadDuplicatesMutation,
  useCreatePaperAdmissionCrmRegistrationMutation,
} from 'src/redux/student/admissions-crm/admissions-crm-api';

import { useEnrollmentWorkspace } from './enrollment-workspace-context';
import {
  mapQuickInquiryOptions,
  isValidQuickInquiryEmail,
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
  mediumStageId: string;
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
  mediumStageId: '',
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
  const {
    academicYearId,
    academicYearName,
    academicBoardId,
    academicBoardName,
    academicMediumId,
    academicMediumName,
  } = useEnrollmentWorkspace();
  const [form, setForm] = useState<FormState>(initialForm);
  const [activeStep, setActiveStep] = useState(0);
  const [duplicateReviewed, setDuplicateReviewed] = useState(false);
  const [duplicateCount, setDuplicateCount] = useState(0);
  const [emailTouched, setEmailTouched] = useState(false);

  const quickInquiryOptionsQuery = useGetAdmissionCrmQuickInquiryOptionsQuery(
    { academicYearId: academicYearId || '' },
    { skip: !open || !academicYearId }
  );
  const organizationOptionsQuery = useGetAcademicOrganizationOptionsQuery(
    { academicYearId: academicYearId || '' },
    { skip: !open || !academicYearId }
  );
  const standardOptionsQuery = useGetAdmissionCrmStandardOptionsQuery(
    { mediumId: academicMediumId || '' },
    { skip: !open || !academicMediumId }
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
  const manualEntryEnabled = directRegistrationOptions.channels.some(
    (channel) => channel.value === AdmissionInquiryChannel.ManualBackOffice
  );
  const optionConfigurationLoading =
    quickInquiryOptionsQuery.isLoading || quickInquiryOptionsQuery.isFetching;
  const optionConfigurationMissing =
    !optionConfigurationLoading &&
    !quickInquiryOptionsQuery.isError &&
    Boolean(quickInquiryOptionsQuery.data) &&
    (!manualEntryEnabled || !directRegistrationOptions.routes.length);
  const optionConfigurationUnavailable =
    optionConfigurationLoading ||
    quickInquiryOptionsQuery.isError ||
    optionConfigurationMissing ||
    quickInquiryOptionsQuery.data?.isAdmissionCycleActive === false ||
    !quickInquiryOptionsQuery.data;
  const emailInvalid = !isValidQuickInquiryEmail(form.email);

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

  const mediumStages = useMemo(
    () =>
      (organizationOptionsQuery.data?.items || []).filter(
        (option) =>
          option.mediumId === academicMediumId &&
          (!academicBoardId || option.boardId === academicBoardId)
      ),
    [academicBoardId, academicMediumId, organizationOptionsQuery.data?.items]
  );
  const standards = useMemo(
    () =>
      (standardOptionsQuery.data || []).filter(
        (standard) => standard.educationMediumStageId === form.mediumStageId
      ),
    [form.mediumStageId, standardOptionsQuery.data]
  );
  const selectedStandard = standards.find((standard) => standard.id === form.targetStandardId);

  useEffect(() => {
    if (!open || !quickInquiryOptionsQuery.data) return;

    setForm((current) => {
      const currentRouteIsAvailable = directRegistrationOptions.routes.some(
        (route) => route.id === current.intendedRouteDefinitionId
      );
      const intendedRouteDefinitionId = currentRouteIsAvailable
        ? current.intendedRouteDefinitionId
        : (getDefaultQuickInquiryOption(directRegistrationOptions.routes)?.id ?? '');

      return intendedRouteDefinitionId === current.intendedRouteDefinitionId
        ? current
        : { ...current, intendedRouteDefinitionId };
    });
  }, [directRegistrationOptions.routes, open, quickInquiryOptionsQuery.data]);

  useEffect(() => {
    if (!open || form.mediumStageId || mediumStages.length !== 1) return;
    setForm((current) => ({ ...current, mediumStageId: mediumStages[0].id }));
  }, [form.mediumStageId, mediumStages, open]);

  useEffect(() => {
    if (!open || form.targetStandardId || standards.length !== 1) return;
    setForm((current) => ({ ...current, targetStandardId: standards[0].id }));
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
      firstName: form.firstName.trim(),
      middleName: form.middleName.trim() || null,
      lastName: form.lastName.trim() || null,
      dateOfBirth: form.dateOfBirth ? `${form.dateOfBirth}T00:00:00.000Z` : null,
      parentGuardianName: form.parentGuardianName.trim() || null,
      primaryContactNo: form.primaryContactNo.trim() || null,
      email: form.email.trim() || null,
      admissionIntent: `${selectedRoute.label} paper registration`,
      intendedRouteDefinitionId: selectedRoute.id,
      targetStandardId: selectedStandard.id,
      academicBoardId: academicBoardId || null,
      academicMediumId: academicMediumId || null,
      academicMediumStageId: form.mediumStageId,
      desiredClassName: selectedStandard.name,
      notes: form.notes.trim() || null,
      duplicateContinueReason: form.duplicateContinueReason.trim() || null,
    };
  };

  const submit = async () => {
    if (!academicYearId) return;
    setEmailTouched(true);
    if (
      !form.firstName.trim() ||
      !form.mediumStageId ||
      !selectedStandard ||
      !selectedRoute ||
      !form.registrationTemplateId
    ) {
      shikshaMitraToast.error({
        message:
          'Student name, academic stage, target class, admission pathway, and template are required.',
      });
      return;
    }
    if (!form.primaryContactNo.trim() && !form.email.trim()) {
      shikshaMitraToast.error({ message: 'Contact number or email is required.' });
      return;
    }
    if (emailInvalid) {
      shikshaMitraToast.error({
        message: 'Enter a valid email address, for example parent@example.com.',
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
      shikshaMitraToast.error({ message: readError(error) });
    }
  };

  const validateStep = (step: number) => {
    if (step === 0) {
      if (!form.firstName.trim()) return 'Student first name is required.';
      if (!form.primaryContactNo.trim() && !form.email.trim()) {
        return 'Contact number or email is required.';
      }
      if (emailInvalid) {
        return 'Enter a valid email address, for example parent@example.com.';
      }
    }
    if (step === 1) {
      if (!form.mediumStageId) return 'Academic stage is required.';
      if (!selectedStandard) return 'Target class is required.';
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
            <Stack direction={{ xs: 'column', sm: 'row' }} gap={2}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  Academic year
                </Typography>
                <Typography variant="body2">
                  {academicYearName || 'Selected academic year'}
                </Typography>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  Board
                </Typography>
                <Typography variant="body2">{academicBoardName || 'Selected board'}</Typography>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  Medium
                </Typography>
                <Typography variant="body2">{academicMediumName || 'Selected medium'}</Typography>
              </Box>
            </Stack>
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
              Admission pathways and channel settings could not be loaded.
            </Alert>
          ) : null}
          {optionConfigurationMissing ? (
            <Alert severity="warning">
              Paper registration needs the Manual entry channel and at least one published
              admission pathway. Ask an administrator to update Enrollment Settings.
            </Alert>
          ) : null}
          {quickInquiryOptionsQuery.data?.isAdmissionCycleActive === false ? (
            <Alert severity="warning">
              Paper registration is unavailable because the admission cycle is not active.
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
                onChange={(event) =>
                  setForm((current) => ({ ...current, firstName: event.target.value }))
                }
              />
              <TextField
                label="Middle name"
                value={form.middleName}
                onChange={(event) =>
                  setForm((current) => ({ ...current, middleName: event.target.value }))
                }
              />
              <TextField
                label="Last name"
                value={form.lastName}
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
                label="Parent or guardian"
                value={form.parentGuardianName}
                onChange={(event) =>
                  setForm((current) => ({ ...current, parentGuardianName: event.target.value }))
                }
              />
              <TextField
                type="tel"
                label="Contact number"
                value={form.primaryContactNo}
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
              {organizationOptionsQuery.isError ? (
                <Alert
                  severity="error"
                  action={
                    <Button
                      color="inherit"
                      size="small"
                      onClick={() => organizationOptionsQuery.refetch()}
                    >
                      Retry
                    </Button>
                  }
                >
                  Academic stages could not be loaded for the selected board and medium.
                </Alert>
              ) : null}
              {!organizationOptionsQuery.isFetching &&
              organizationOptionsQuery.data &&
              !mediumStages.length ? (
                <Alert severity="warning">
                  No academic stages are configured for the selected board and medium.
                </Alert>
              ) : null}
              {form.mediumStageId && standardOptionsQuery.isError ? (
                <Alert
                  severity="error"
                  action={
                    <Button
                      color="inherit"
                      size="small"
                      onClick={() => standardOptionsQuery.refetch()}
                    >
                      Retry
                    </Button>
                  }
                >
                  Classes could not be loaded for the selected academic stage.
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
                  required
                  select
                  label="Academic stage"
                  value={form.mediumStageId}
                  disabled={organizationOptionsQuery.isFetching}
                  helperText="Derived from the selected board and medium."
                  onChange={(event) => {
                    setForm((current) => ({
                      ...current,
                      mediumStageId: event.target.value,
                      targetStandardId: '',
                    }));
                    setDuplicateReviewed(false);
                  }}
                >
                  {mediumStages.map((stage) => (
                    <MenuItem key={stage.id} value={stage.id}>
                      {stage.stageName || stage.label}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  required
                  select
                  label="Target class"
                  value={form.targetStandardId}
                  disabled={!form.mediumStageId || standardOptionsQuery.isFetching}
                  helperText="Available within the selected academic stage."
                  onChange={(event) => {
                    setForm((current) => ({
                      ...current,
                      targetStandardId: event.target.value,
                    }));
                    setDuplicateReviewed(false);
                  }}
                >
                  {standards.map((standard) => (
                    <MenuItem key={standard.id} value={standard.id}>
                      {standard.name}
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
                    selectedRoute
                      ? `Published pathway version ${selectedRoute.version}.`
                      : 'Loaded from the active enrollment configuration.'
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
                The selected academic stage and class are saved with the registration so the same
                placement can be reused through activation.
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
