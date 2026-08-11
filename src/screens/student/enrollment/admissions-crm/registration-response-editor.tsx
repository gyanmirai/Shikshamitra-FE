'use client';

import type { RootState } from 'src/redux/store';
import type {
  AdmissionCrmRegistrationFieldDto,
  AdmissionCrmRegistrationApplicationDto,
} from 'src/redux/student/admissions-crm/registration-documents-contracts';

import { useSelector } from 'react-redux';
import { useMemo, useState, useEffect } from 'react';
import { shikshaMitraToast } from 'src/components/toast';
import SaveOutlined from '@mui/icons-material/SaveOutlined';
import { hasGrantedPermission } from 'src/utils/permissions';
import { LoadingButton } from 'src/components/loading-button';
import TaskAltOutlined from '@mui/icons-material/TaskAltOutlined';
import {
  Box,
  Chip,
  Stack,
  Paper,
  Alert,
  Button,
  Step,
  Stepper,
  Checkbox,
  StepButton,
  StepContent,
  MenuItem,
  TextField,
  Typography,
  FormHelperText,
  FormControlLabel,
} from '@mui/material';
import { AdmissionCrmFormFieldType } from 'src/redux/student/admissions-crm/core-leads-contracts';

import { AdmissionCrmRegistrationStatus } from 'src/redux/student/admissions-crm/registration-documents-contracts';

import {
  useSaveAdmissionCrmStaffRegistrationResponsesMutation,
  useSubmitAdmissionCrmStaffRegistrationResponsesMutation,
} from 'src/redux/student/admissions-crm/registration-documents-api';

import { useApplicantWorkspaceDirtyState } from './applicant-workspace-dirty-context';
import {
  isRegistrationFieldVisible,
  getEffectiveRegistrationValue,
  validateRegistrationResponses,
  calculateRegistrationCompletion,
} from './registration-response-validation';

type Props = {
  registration: AdmissionCrmRegistrationApplicationDto;
};

const editableStatuses = new Set<AdmissionCrmRegistrationStatus>([
  AdmissionCrmRegistrationStatus.Issued,
  AdmissionCrmRegistrationStatus.Opened,
  AdmissionCrmRegistrationStatus.Started,
  AdmissionCrmRegistrationStatus.PartiallyCompleted,
  AdmissionCrmRegistrationStatus.ReturnedForCorrection,
]);

const readError = (error: unknown, fallback: string) => {
  if (typeof error === 'object' && error && 'data' in error) {
    const { data } = error as { data?: { detail?: string; errorCode?: string } };
    return data?.detail || data?.errorCode || fallback;
  }
  return fallback;
};

const sameResponses = (left: Record<string, unknown>, right: Record<string, unknown>) =>
  JSON.stringify(left) === JSON.stringify(right);

const textValue = (value: unknown) => {
  if (value == null) return '';
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  return '';
};

export function RegistrationResponseEditor({ registration }: Props) {
  const permissions = useSelector((root: RootState) => root.auth.permissions);
  const [responses, setResponses] = useState<Record<string, unknown>>(registration.responses || {});
  const [savedResponses, setSavedResponses] = useState<Record<string, unknown>>(
    registration.responses || {}
  );
  const [concurrencyStamp, setConcurrencyStamp] = useState(registration.concurrencyStamp);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [activeSection, setActiveSection] = useState(0);
  const [saveResponses, saveState] = useSaveAdmissionCrmStaffRegistrationResponsesMutation();
  const [submitResponses, submitState] = useSubmitAdmissionCrmStaffRegistrationResponsesMutation();
  const dirty = !sameResponses(responses, savedResponses);
  const canEnterResponses = hasGrantedPermission(
    permissions,
    'Students.Enrollment.AdmissionsCrm.IssueRegistrationForm'
  );
  const canEdit = canEnterResponses && editableStatuses.has(registration.status);

  useEffect(() => {
    const next = registration.responses || {};
    setResponses(next);
    setSavedResponses(next);
    setConcurrencyStamp(registration.concurrencyStamp);
    setFieldErrors({});
  }, [
    registration.concurrencyStamp,
    registration.id,
    registration.lastSavedAt,
    registration.responses,
  ]);

  useApplicantWorkspaceDirtyState(`registration-responses-${registration.id}`, dirty);

  const visibleSections = useMemo(
    () =>
      [...registration.sections]
        .filter((section) => section.parentVisible)
        .sort((left, right) => left.displayOrder - right.displayOrder),
    [registration.sections]
  );

  const allVisibleSectionFields = useMemo(
    () => visibleSections.flatMap((section) => section.fields),
    [visibleSections]
  );

  const completionPercentage = useMemo(
    () => calculateRegistrationCompletion(registration.sections, responses, registration.prefill),
    [registration.prefill, registration.sections, responses]
  );

  const sectionCompletion = useMemo(
    () =>
      visibleSections.map((section) => {
        const errors = validateRegistrationResponses(
          [{ ...section, fields: section.fields.filter((field) => field.required) }],
          responses,
          registration.prefill
        );
        return Object.keys(errors).length === 0;
      }),
    [registration.prefill, responses, visibleSections]
  );

  const getEffectiveValue = (field: AdmissionCrmRegistrationFieldDto) =>
    getEffectiveRegistrationValue(field, responses, registration.prefill);

  const isVisible = (field: AdmissionCrmRegistrationFieldDto) =>
    isRegistrationFieldVisible(field, allVisibleSectionFields, responses, registration.prefill);

  const updateResponse = (field: AdmissionCrmRegistrationFieldDto, value: unknown) => {
    setResponses((current) => ({ ...current, [field.key]: value }));
    setFieldErrors((current) => {
      if (!current[field.key]) return current;
      const next = { ...current };
      delete next[field.key];
      return next;
    });
  };

  const run = async (
    action: () => Promise<AdmissionCrmRegistrationApplicationDto>,
    success: string
  ) => {
    try {
      const updated = await action();
      setResponses(updated.responses || {});
      setSavedResponses(updated.responses || {});
      setConcurrencyStamp(updated.concurrencyStamp);
      setFieldErrors({});
      shikshaMitraToast.success({ message: success });
    } catch (error) {
      const message = readError(error, 'Registration details could not be saved.');
      shikshaMitraToast.error({
        message: message.includes('AdmissionCrm:RegistrationConcurrencyConflict')
          ? 'This registration changed in another tab. Your entries are preserved here; refresh the applicant and review the latest version before saving again.'
          : message,
      });
    }
  };

  const submitRegistration = () => {
    const errors = validateRegistrationResponses(
      registration.sections,
      responses,
      registration.prefill
    );
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    run(
      () =>
        submitResponses({
          applicationId: registration.id,
          body: { concurrencyStamp, responses },
        }).unwrap(),
      'Registration submitted for verification.'
    );
  };

  const renderField = (field: AdmissionCrmRegistrationFieldDto) => {
    if (!isVisible(field)) return null;
    const value = getEffectiveValue(field);
    const error = fieldErrors[field.key];
    const systemManaged = Boolean(field.systemField && !field.parentEditable);
    const disabled = !canEdit || systemManaged || saveState.isLoading || submitState.isLoading;
    const helperText = systemManaged
      ? 'Copied from the applicant record. Update it from Overview.'
      : field.helpText || (!field.parentEditable ? 'Staff-only field' : undefined);

    if (field.fieldType === AdmissionCrmFormFieldType.Checkbox) {
      return (
        <Box key={field.key}>
          <FormControlLabel
            control={
              <Checkbox
                checked={Boolean(value)}
                disabled={disabled}
                onChange={(event) => updateResponse(field, event.target.checked)}
              />
            }
            label={`${field.label}${field.required ? ' *' : ''}`}
          />
          {error ? <FormHelperText error>{error}</FormHelperText> : null}
        </Box>
      );
    }

    const isMultiSelect = field.fieldType === AdmissionCrmFormFieldType.MultiSelect;
    const isSelect = field.fieldType === AdmissionCrmFormFieldType.Select || isMultiSelect;
    return (
      <TextField
        key={field.key}
        fullWidth
        size="small"
        label={field.label}
        required={field.required}
        disabled={disabled}
        error={Boolean(error)}
        value={isMultiSelect ? (Array.isArray(value) ? value : []) : textValue(value)}
        onChange={(event) => updateResponse(field, event.target.value)}
        type={
          field.fieldType === AdmissionCrmFormFieldType.Number
            ? 'number'
            : field.fieldType === AdmissionCrmFormFieldType.Date
              ? 'date'
              : field.fieldType === AdmissionCrmFormFieldType.Email
                ? 'email'
                : field.fieldType === AdmissionCrmFormFieldType.Phone
                  ? 'tel'
                  : 'text'
        }
        select={isSelect}
        multiline={field.fieldType === AdmissionCrmFormFieldType.TextArea}
        minRows={field.fieldType === AdmissionCrmFormFieldType.TextArea ? 3 : undefined}
        helperText={error || helperText}
        slotProps={{
          inputLabel:
            field.fieldType === AdmissionCrmFormFieldType.Date ? { shrink: true } : undefined,
          select: isMultiSelect ? { multiple: true } : undefined,
          htmlInput: {
            min: field.minimumValue ?? undefined,
            max: field.maximumValue ?? undefined,
            minLength: field.minimumLength ?? undefined,
            maxLength: field.maximumLength ?? undefined,
          },
        }}
      >
        {isSelect
          ? field.options.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))
          : undefined}
      </TextField>
    );
  };

  return (
    <Paper component="section" variant="outlined" sx={{ p: 1.5 }}>
      <Stack spacing={1.5}>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" gap={1}>
          <Box>
            <Typography variant="subtitle2">Registration details</Typography>
            <Typography variant="caption" color="text.secondary">
              Review what has been received and complete the remaining template sections.
            </Typography>
          </Box>
          <Chip size="small" label={`${completionPercentage.toFixed(0)}% complete`} />
        </Stack>

        {!canEnterResponses ? (
          <Alert severity="info">
            You can view this paper registration, but your role cannot enter or submit responses.
          </Alert>
        ) : !canEdit ? (
          <Alert severity="info">
            This registration is {AdmissionCrmRegistrationStatus[registration.status]}. Reopen or
            return it for correction before changing responses.
          </Alert>
        ) : null}

        {Object.keys(fieldErrors).length > 0 ? (
          <Alert severity="error" role="alert">
            Review the {Object.keys(fieldErrors).length} highlighted required field
            {Object.keys(fieldErrors).length === 1 ? '' : 's'} before submitting.
          </Alert>
        ) : null}

        <Stepper activeStep={activeSection} orientation="vertical" nonLinear>
          {visibleSections.map((section, index) => (
            <Step key={section.key} completed={sectionCompletion[index]}>
              <StepButton onClick={() => setActiveSection(index)}>
                <Stack direction="row" gap={1} alignItems="center" flexWrap="wrap">
                  <Typography variant="subtitle2">{section.title}</Typography>
                  <Chip
                    size="small"
                    color={sectionCompletion[index] ? 'success' : 'default'}
                    label={sectionCompletion[index] ? 'Complete' : 'Needs details'}
                  />
                </Stack>
              </StepButton>
              <StepContent>
                {section.description ? (
                  <Typography variant="caption" color="text.secondary">
                    {section.description}
                  </Typography>
                ) : null}
                <Box
                  component="fieldset"
                  sx={{
                    border: 0,
                    p: 0,
                    m: 0,
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
                    gap: 1.25,
                    mt: 1,
                  }}
                >
                  {[...section.fields]
                    .sort((left, right) => left.displayOrder - right.displayOrder)
                    .map(renderField)}
                </Box>
                <Stack direction="row" gap={1} sx={{ mt: 1.25 }}>
                  {index > 0 ? (
                    <Button size="small" onClick={() => setActiveSection(index - 1)}>
                      Previous
                    </Button>
                  ) : null}
                  {index < visibleSections.length - 1 ? (
                    <Button size="small" variant="outlined" onClick={() => setActiveSection(index + 1)}>
                      Next section
                    </Button>
                  ) : null}
                </Stack>
              </StepContent>
            </Step>
          ))}
        </Stepper>

        <Stack direction="row" justifyContent="flex-end" gap={1} flexWrap="wrap">
          <LoadingButton
            variant="outlined"
            startIcon={<SaveOutlined />}
            loading={saveState.isLoading}
            disabled={!canEdit || !dirty}
            onClick={() =>
              run(
                () =>
                  saveResponses({
                    applicationId: registration.id,
                    body: { concurrencyStamp, responses },
                  }).unwrap(),
                'Registration draft saved.'
              )
            }
          >
            Save draft
          </LoadingButton>
          <LoadingButton
            variant="contained"
            startIcon={<TaskAltOutlined />}
            loading={submitState.isLoading}
            disabled={!canEdit}
            onClick={submitRegistration}
          >
            Submit registration
          </LoadingButton>
        </Stack>
      </Stack>
    </Paper>
  );
}
