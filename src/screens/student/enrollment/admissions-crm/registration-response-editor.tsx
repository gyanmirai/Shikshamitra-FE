'use client';

import type { RootState } from 'src/redux/store';
import type {
  AdmissionCrmRegistrationFieldDto,
  AdmissionCrmRegistrationApplicationDto,
} from 'src/redux/student/admissions-crm/admissions-crm-api';

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
  Checkbox,
  MenuItem,
  TextField,
  Typography,
  FormControlLabel,
} from '@mui/material';
import {
  AdmissionCrmFormFieldType,
  AdmissionCrmRegistrationStatus,
  useSaveAdmissionCrmStaffRegistrationResponsesMutation,
  useSubmitAdmissionCrmStaffRegistrationResponsesMutation,
} from 'src/redux/student/admissions-crm/admissions-crm-api';

import { useApplicantWorkspaceDirtyState } from './applicant-workspace-dirty-context';

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
  }, [registration.id, registration.lastSavedAt, registration.responses]);

  useApplicantWorkspaceDirtyState(`registration-responses-${registration.id}`, dirty);

  const visibleSections = useMemo(
    () =>
      [...registration.sections]
        .filter((section) => section.parentVisible)
        .sort((left, right) => left.displayOrder - right.displayOrder),
    [registration.sections]
  );

  const getEffectiveValue = (field: AdmissionCrmRegistrationFieldDto) => {
    if (Object.prototype.hasOwnProperty.call(responses, field.key)) return responses[field.key];
    if (
      field.systemField &&
      Object.prototype.hasOwnProperty.call(registration.prefill, field.systemField)
    ) {
      return registration.prefill[field.systemField];
    }
    return '';
  };

  const isVisible = (field: AdmissionCrmRegistrationFieldDto) => {
    if (!field.visibleWhenFieldKey) return true;
    const controllingField = visibleSections
      .flatMap((section) => section.fields)
      .find((candidate) => candidate.key === field.visibleWhenFieldKey);
    if (!controllingField) return false;
    const value = getEffectiveValue(controllingField);
    return String(value).toLowerCase() === String(field.visibleWhenValue ?? 'true').toLowerCase();
  };

  const updateResponse = (field: AdmissionCrmRegistrationFieldDto, value: unknown) => {
    setResponses((current) => ({ ...current, [field.key]: value }));
  };

  const run = async (
    action: () => Promise<AdmissionCrmRegistrationApplicationDto>,
    success: string
  ) => {
    try {
      const updated = await action();
      setResponses(updated.responses || {});
      setSavedResponses(updated.responses || {});
      shikshaMitraToast.success({ message: success });
    } catch (error) {
      shikshaMitraToast.error({
        message: readError(error, 'Registration details could not be saved.'),
      });
    }
  };

  const renderField = (field: AdmissionCrmRegistrationFieldDto) => {
    if (!isVisible(field)) return null;
    const value = getEffectiveValue(field);
    const systemManaged = Boolean(field.systemField && !field.parentEditable);
    const disabled = !canEdit || systemManaged || saveState.isLoading || submitState.isLoading;
    const helperText = systemManaged
      ? 'Copied from the applicant record. Update it from Overview.'
      : field.helpText || (!field.parentEditable ? 'Staff-only field' : undefined);

    if (field.fieldType === AdmissionCrmFormFieldType.Checkbox) {
      return (
        <FormControlLabel
          key={field.key}
          control={
            <Checkbox
              checked={Boolean(value)}
              disabled={disabled}
              onChange={(event) => updateResponse(field, event.target.checked)}
            />
          }
          label={`${field.label}${field.required ? ' *' : ''}`}
        />
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
        helperText={helperText}
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
            <Typography variant="subtitle2">Paper / staff-entered registration</Typography>
            <Typography variant="caption" color="text.secondary">
              Enter a returned paper form here. The same template validation is used as the online
              form.
            </Typography>
          </Box>
          <Chip size="small" label={`${registration.completionPercentage.toFixed(0)}% complete`} />
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

        {visibleSections.map((section) => (
          <Box component="fieldset" key={section.key} sx={{ border: 0, p: 0, m: 0 }}>
            <Typography component="legend" variant="subtitle2" sx={{ mb: 0.25 }}>
              {section.title}
            </Typography>
            {section.description ? (
              <Typography variant="caption" color="text.secondary">
                {section.description}
              </Typography>
            ) : null}
            <Box
              sx={{
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
          </Box>
        ))}

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
                    body: { responses },
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
            onClick={() =>
              run(
                () =>
                  submitResponses({
                    applicationId: registration.id,
                    body: { responses },
                  }).unwrap(),
                'Registration submitted for verification.'
              )
            }
          >
            Submit registration
          </LoadingButton>
        </Stack>
      </Stack>
    </Paper>
  );
}
