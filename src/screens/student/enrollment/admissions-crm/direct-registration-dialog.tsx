'use client';

import type { CreateAdmissionCrmLeadDto } from 'src/redux/student/admissions-crm/admissions-crm-api';

import { useMemo, useState, useEffect } from 'react';
import { shikshaMitraToast } from 'src/components/toast';
import { LoadingButton } from 'src/components/loading-button';
import { useGetAcademicOrganizationOptionsQuery } from 'src/redux/academicOrganizationOptions/academicOrganizationOptionsApi';
import {
  Box,
  Alert,
  Stack,
  Paper,
  Button,
  Dialog,
  MenuItem,
  TextField,
  Typography,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  AdmissionCrmRouteType,
  AdmissionInquiryChannel,
  AdmissionCrmRegistrationTemplateStatus,
  useGetAdmissionCrmStandardOptionsQuery,
  useGetAdmissionCrmFormNumberSeriesQuery,
  useGetAdmissionCrmRegistrationTemplatesQuery,
  usePreviewAdmissionCrmLeadDuplicatesMutation,
  useCreateDirectAdmissionCrmRegistrationMutation,
} from 'src/redux/student/admissions-crm/admissions-crm-api';

import { useEnrollmentWorkspace } from './enrollment-workspace-context';

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
  intendedRouteType: AdmissionCrmRouteType;
  registrationTemplateId: string;
  formNumberSeriesId: string;
  manualFormNumber: string;
  notes: string;
  duplicateContinueReason: string;
};

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
  intendedRouteType: AdmissionCrmRouteType.RteEws,
  registrationTemplateId: '',
  formNumberSeriesId: '',
  manualFormNumber: '',
  notes: '',
  duplicateContinueReason: '',
});

const routeLabel = (value: AdmissionCrmRouteType) =>
  AdmissionCrmRouteType[value]?.replace(/([a-z])([A-Z])/g, '$1 $2') || 'Admission pathway';

const readError = (error: unknown) => {
  if (typeof error === 'object' && error && 'data' in error) {
    const { data } = error as { data?: { detail?: string; errorCode?: string } };
    return data?.detail || data?.errorCode || 'The registration could not be created.';
  }
  return 'The registration could not be created.';
};

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
  const [duplicateReviewed, setDuplicateReviewed] = useState(false);
  const [duplicateCount, setDuplicateCount] = useState(0);

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
  const [createDirectRegistration, createState] = useCreateDirectAdmissionCrmRegistrationMutation();

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

  useEffect(() => {
    if (!open) return;
    const published = templatesQuery.data?.items || [];
    if (!form.registrationTemplateId && published.length === 1) {
      setForm((current) => ({ ...current, registrationTemplateId: published[0].id }));
    }
  }, [form.registrationTemplateId, open, templatesQuery.data?.items]);

  const reset = () => {
    setForm(initialForm());
    setDuplicateReviewed(false);
    setDuplicateCount(0);
  };

  const close = () => {
    reset();
    onClose();
  };

  const buildApplicant = (): CreateAdmissionCrmLeadDto => {
    const standard = standards.find((item) => item.id === form.targetStandardId);
    return {
      channel: AdmissionInquiryChannel.ManualBackOffice,
      firstName: form.firstName.trim(),
      middleName: form.middleName.trim() || null,
      lastName: form.lastName.trim() || null,
      dateOfBirth: form.dateOfBirth ? `${form.dateOfBirth}T00:00:00.000Z` : null,
      parentGuardianName: form.parentGuardianName.trim() || null,
      primaryContactNo: form.primaryContactNo.trim() || null,
      email: form.email.trim() || null,
      admissionIntent: `${routeLabel(form.intendedRouteType)} direct registration`,
      intendedRouteType: form.intendedRouteType,
      targetStandardId: standard?.id || null,
      academicBoardId: academicBoardId || null,
      academicMediumId: academicMediumId || null,
      desiredClassName: standard?.name || null,
      notes: form.notes.trim() || null,
      duplicateContinueReason: form.duplicateContinueReason.trim() || null,
    };
  };

  const submit = async () => {
    if (!academicYearId) return;
    if (!form.firstName.trim() || !form.targetStandardId || !form.registrationTemplateId) {
      shikshaMitraToast.error({
        message: 'Student name, target class, and template are required.',
      });
      return;
    }
    if (!form.primaryContactNo.trim() && !form.email.trim()) {
      shikshaMitraToast.error({ message: 'Contact number or email is required.' });
      return;
    }
    if (!form.formNumberSeriesId && !form.manualFormNumber.trim()) {
      shikshaMitraToast.error({
        message: 'Select a form number series or enter the paper form number.',
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
      const result = await createDirectRegistration({
        academicYearId,
        body: {
          applicant,
          registration: {
            registrationTemplateId: form.registrationTemplateId,
            formNumberSeriesId: form.formNumberSeriesId || null,
            manualFormNumber: form.manualFormNumber.trim().toUpperCase() || null,
            waiveFee: false,
          },
        },
      }).unwrap();
      shikshaMitraToast.success({
        message: 'Direct registration created. Enter the paper form details next.',
      });
      reset();
      onCreated(result.applicant.id);
    } catch (error) {
      shikshaMitraToast.error({ message: readError(error) });
    }
  };

  const routeTypes = Object.values(AdmissionCrmRouteType).filter(
    (value): value is AdmissionCrmRouteType => typeof value === 'number'
  );

  return (
    <Dialog open={open} onClose={close} fullWidth maxWidth="md">
      <DialogTitle>Create direct registration</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={1.5}>
          <Alert severity="info">
            Use this for RTE, walk-in, or paper registrations that legitimately bypass inquiry and
            entrance-exam steps. The applicant still follows document, payment, offer, and admission
            checks.
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
              label="Email"
              value={form.email}
              onChange={(event) =>
                setForm((current) => ({ ...current, email: event.target.value }))
              }
            />
            <TextField
              required
              select
              label="Medium stage"
              value={form.mediumStageId}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  mediumStageId: event.target.value,
                  targetStandardId: '',
                }))
              }
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
              disabled={!form.mediumStageId}
              onChange={(event) =>
                setForm((current) => ({ ...current, targetStandardId: event.target.value }))
              }
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
              value={form.intendedRouteType}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  intendedRouteType: Number(event.target.value),
                }))
              }
            >
              {routeTypes.map((route) => (
                <MenuItem key={route} value={route}>
                  {routeLabel(route)}
                </MenuItem>
              ))}
            </TextField>
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
              value={form.manualFormNumber}
              disabled={Boolean(form.formNumberSeriesId)}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  manualFormNumber: event.target.value.toUpperCase(),
                }))
              }
            />
          </Box>
          <TextField
            label="Staff notes"
            value={form.notes}
            onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
            multiline
            minRows={2}
          />
          {duplicateCount ? (
            <Alert severity="warning">
              {duplicateCount} likely duplicate applicant record{duplicateCount === 1 ? '' : 's'}{' '}
              found.
            </Alert>
          ) : null}
          {duplicateCount ? (
            <TextField
              required
              label="Reason to continue"
              value={form.duplicateContinueReason}
              onChange={(event) =>
                setForm((current) => ({ ...current, duplicateContinueReason: event.target.value }))
              }
              multiline
              minRows={2}
            />
          ) : null}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={close}>Cancel</Button>
        <LoadingButton
          variant="contained"
          loading={previewState.isLoading || createState.isLoading}
          onClick={submit}
        >
          {duplicateReviewed && duplicateCount ? 'Create Anyway' : 'Create and Enter Paper Form'}
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}
