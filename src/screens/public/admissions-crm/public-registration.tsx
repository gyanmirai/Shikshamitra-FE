'use client';

import { useState } from 'react';
import { Save, Send } from '@mui/icons-material';
import { shikshaMitraToast } from 'src/components/toast';
import { LoadingButton } from 'src/components/loading-button';
import {
  Box,
  Chip,
  Alert,
  Stack,
  Select,
  Divider,
  MenuItem,
  Checkbox,
  TextField,
  Typography,
  InputLabel,
  FormControl,
  LinearProgress,
  FormControlLabel,
} from '@mui/material';

import { publicAdmissionsActionCopy } from './public-admissions-copy';
import { readPublicAdmissionStatusProblem } from './public-status-utils';
import { getAccessibleStatusChipProps } from './public-admissions-styles';
import {
  getPublicRegistrationValue,
  isPublicRegistrationFieldVisible,
} from './public-registration-utils';

import type { PublicAdmissionsLanguage } from './public-admissions-copy';

type Field = {
  key: string;
  label: string;
  fieldType: number;
  systemField?: string | null;
  helpText?: string | null;
  required: boolean;
  parentEditable: boolean;
  visibleWhenFieldKey?: string | null;
  visibleWhenValue?: string | null;
  options: string[];
};

export type PublicRegistrationApplication = {
  id: string;
  formNumber: string;
  status: number;
  sections: Array<{
    key: string;
    title: string;
    description?: string | null;
    parentVisible: boolean;
    fields: Field[];
  }>;
  prefill: Record<string, unknown>;
  responses: Record<string, unknown>;
  correctionFieldKeys: string[];
  completionPercentage: number;
  linkExpiresAt: string;
  feeAmount: number;
  feeStatus: number;
};

type Props = {
  tenantId: string;
  token: string;
  accessSessionToken: string;
  application: PublicRegistrationApplication;
  onUpdated: (application: PublicRegistrationApplication) => void;
  language?: PublicAdmissionsLanguage;
};

const API_BASE = `${process.env.NEXT_PUBLIC_API_URL}/api`;
const editableStatuses = new Set([0, 1, 2, 3, 5]);

export default function PublicRegistration({
  tenantId,
  token,
  accessSessionToken,
  application,
  onUpdated,
  language = 'en',
}: Props) {
  const copy = publicAdmissionsActionCopy[language];
  const [responses, setResponses] = useState<Record<string, unknown>>(application.responses || {});
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fields = application.sections.flatMap((section) => section.fields);
  const isExpired = new Date(application.linkExpiresAt) <= new Date();
  const canEdit = editableStatuses.has(application.status) && !isExpired;

  const updateValue = (key: string, value: unknown) => {
    setResponses((current) => ({ ...current, [key]: value }));
  };

  const send = async (submit: boolean) => {
    const path = `${API_BASE}/public/student-enrollment/admissions-crm/${tenantId}/status/${token}/registration${submit ? '/submit' : ''}`;
    if (submit) setIsSubmitting(true);
    else setIsSaving(true);
    try {
      const response = await fetch(path, {
        method: submit ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessSessionToken, responses }),
      });
      if (!response.ok) {
        const problem = await readPublicAdmissionStatusProblem(
          response,
          submit ? 'Unable to submit registration.' : 'Unable to save registration.'
        );
        throw new Error(problem.message);
      }
      const updated = (await response.json()) as PublicRegistrationApplication;
      onUpdated(updated);
      shikshaMitraToast.success({
        message: submit ? 'Registration submitted.' : 'Progress saved.',
      });
    } catch (error) {
      shikshaMitraToast.error({
        message: error instanceof Error ? error.message : 'Registration action failed.',
      });
    } finally {
      if (submit) setIsSubmitting(false);
      else setIsSaving(false);
    }
  };

  return (
    <Stack spacing={1.5}>
      <Divider />
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" gap={1}>
        <Box>
          <Typography variant="subtitle1">{copy.registrationTitle}</Typography>
          <Typography variant="caption" color="text.secondary">
            Form {application.formNumber}
          </Typography>
        </Box>
        <Chip
          size="small"
          label={`${application.completionPercentage.toFixed(0)}% ${copy.complete}`}
          {...getAccessibleStatusChipProps(
            application.completionPercentage === 100 ? 'success' : 'default'
          )}
        />
      </Stack>
      <LinearProgress
        variant="determinate"
        value={Math.min(100, Math.max(0, application.completionPercentage))}
        aria-label={`${application.completionPercentage.toFixed(0)}% registration complete`}
      />
      <Alert severity={isExpired ? 'error' : 'info'} role={isExpired ? 'alert' : 'status'}>
        {isExpired ? copy.expired : copy.linkExpires}{' '}
        {new Date(application.linkExpiresAt).toLocaleString()}
      </Alert>
      {application.status === 5 ? <Alert severity="warning">{copy.correction}</Alert> : null}
      {application.feeAmount > 0 ? (
        <Alert severity={application.feeStatus === 1 ? 'warning' : 'success'}>
          Registration fee: {application.feeAmount}.{' '}
          {application.feeStatus === 1 ? 'Payment reference is pending.' : 'Fee status recorded.'}
        </Alert>
      ) : null}

      {application.sections
        .filter((section) => section.parentVisible)
        .map((section) => (
          <Stack key={section.key} spacing={1.25} sx={{ pt: 1 }}>
            <Box>
              <Typography variant="subtitle2">{section.title}</Typography>
              {section.description ? (
                <Typography variant="caption" color="text.secondary">
                  {section.description}
                </Typography>
              ) : null}
            </Box>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
                gap: 1.5,
              }}
            >
              {section.fields
                .filter((field) =>
                  isPublicRegistrationFieldVisible(field, fields, responses, application.prefill)
                )
                .map((field) => {
                  const value = getPublicRegistrationValue(field, responses, application.prefill);
                  const editable = canEdit && field.parentEditable;
                  const error = application.correctionFieldKeys.includes(field.key);
                  if (field.fieldType === 8) {
                    return (
                      <FormControlLabel
                        key={field.key}
                        control={
                          <Checkbox
                            checked={Boolean(value)}
                            disabled={!editable}
                            onChange={(event) => updateValue(field.key, event.target.checked)}
                          />
                        }
                        label={`${field.label}${field.required ? ' *' : ''}`}
                      />
                    );
                  }
                  if (field.fieldType === 6 || field.fieldType === 7) {
                    return (
                      <FormControl key={field.key} size="small" error={error}>
                        <InputLabel>{field.label}</InputLabel>
                        <Select
                          label={field.label}
                          multiple={field.fieldType === 7}
                          value={
                            field.fieldType === 7
                              ? Array.isArray(value)
                                ? value
                                : []
                              : String(value ?? '')
                          }
                          disabled={!editable}
                          onChange={(event) => updateValue(field.key, event.target.value)}
                        >
                          {field.options.map((option) => (
                            <MenuItem key={option} value={option}>
                              {option}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    );
                  }
                  return (
                    <TextField
                      key={field.key}
                      size="small"
                      type={
                        field.fieldType === 2
                          ? 'number'
                          : field.fieldType === 3
                            ? 'date'
                            : field.fieldType === 4
                              ? 'email'
                              : field.fieldType === 5
                                ? 'tel'
                                : 'text'
                      }
                      multiline={field.fieldType === 1}
                      minRows={field.fieldType === 1 ? 3 : undefined}
                      label={field.label}
                      required={field.required}
                      value={String(value ?? '')}
                      disabled={!editable}
                      error={error}
                      helperText={error ? 'Correction requested' : field.helpText}
                      InputLabelProps={field.fieldType === 3 ? { shrink: true } : undefined}
                      onChange={(event) => updateValue(field.key, event.target.value)}
                    />
                  );
                })}
            </Box>
          </Stack>
        ))}

      {canEdit ? (
        <Stack direction={{ xs: 'column', sm: 'row' }} gap={1}>
          <LoadingButton
            variant="outlined"
            startIcon={<Save />}
            loading={isSaving}
            disabled={isSubmitting}
            onClick={() => send(false)}
          >
            {copy.save}
          </LoadingButton>
          <LoadingButton
            variant="contained"
            startIcon={<Send />}
            loading={isSubmitting}
            disabled={isSaving}
            onClick={() => send(true)}
          >
            {copy.submit}
          </LoadingButton>
        </Stack>
      ) : (
        <Alert severity="success">Registration has been submitted and is under review.</Alert>
      )}
    </Stack>
  );
}
