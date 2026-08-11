'use client';

import { Save, Send } from '@mui/icons-material';
import { useMemo, useState, useEffect } from 'react';
import { shikshaMitraToast } from 'src/components/toast';
import { LoadingButton } from 'src/components/loading-button';
import {
  Box,
  Chip,
  Step,
  Alert,
  Stack,
  Button,
  Select,
  Stepper,
  Divider,
  MenuItem,
  Checkbox,
  TextField,
  StepLabel,
  Typography,
  InputLabel,
  FormControl,
  LinearProgress,
  FormControlLabel,
} from '@mui/material';

import { publicAdmissionsActionCopy } from './public-admissions-copy';
import { getAccessibleStatusChipProps } from './public-admissions-styles';
import { formatPublicNumber, formatPublicDateTime } from './public-admissions-format';
import { resolveRegistrationText, resolveRegistrationOptions } from './registration-localization';
import {
  getPublicRegistrationValue,
  isPublicRegistrationFieldVisible,
} from './public-registration-utils';
import {
  createPublicAdmissionSafeError,
  readPublicAdmissionStatusProblem,
  getPublicAdmissionRequestErrorMessage,
} from './public-status-utils';

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
  localizedLabels?: Record<string, string>;
  localizedHelpTexts?: Record<string, string>;
  localizedOptions?: Record<string, string[]>;
};

export type PublicRegistrationApplication = {
  id: string;
  concurrencyStamp: string;
  formNumber: string;
  status: number;
  sections: Array<{
    key: string;
    title: string;
    description?: string | null;
    parentVisible: boolean;
    fields: Field[];
    localizedTitles?: Record<string, string>;
    localizedDescriptions?: Record<string, string>;
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
  const [activeStep, setActiveStep] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fields = application.sections.flatMap((section) => section.fields);
  const visibleSections = useMemo(
    () => application.sections.filter((section) => section.parentVisible),
    [application.sections]
  );
  const activeSection =
    visibleSections[Math.min(activeStep, Math.max(visibleSections.length - 1, 0))];
  const isExpired = new Date(application.linkExpiresAt) <= new Date();
  const canEdit = editableStatuses.has(application.status) && !isExpired;

  useEffect(() => {
    setResponses(application.responses || {});
    setActiveStep(0);
  }, [application.id, application.responses]);

  useEffect(() => {
    if (activeStep >= visibleSections.length) {
      setActiveStep(Math.max(visibleSections.length - 1, 0));
    }
  }, [activeStep, visibleSections.length]);

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
        headers: {
          'Content-Type': 'application/json',
          'X-Admission-Access-Session': accessSessionToken,
        },
        body: JSON.stringify({
          concurrencyStamp: application.concurrencyStamp,
          responses,
        }),
      });
      if (!response.ok) {
        const problem = await readPublicAdmissionStatusProblem(
          response,
          submit ? copy.registrationSubmitFailed : copy.registrationSaveFailed,
          language
        );
        throw createPublicAdmissionSafeError(problem.message);
      }
      const updated = (await response.json()) as PublicRegistrationApplication;
      onUpdated(updated);
      shikshaMitraToast.success({
        message: submit ? copy.registrationSubmitted : copy.progressSaved,
      });
    } catch (error) {
      shikshaMitraToast.error({
        message: getPublicAdmissionRequestErrorMessage(
          error,
          copy.registrationActionFailed,
          language
        ),
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
            {copy.formLabel} {application.formNumber}
          </Typography>
        </Box>
        <Chip
          size="small"
          label={`${formatPublicNumber(application.completionPercentage, language, { maximumFractionDigits: 0 })}% ${copy.complete}`}
          {...getAccessibleStatusChipProps(
            application.completionPercentage === 100 ? 'success' : 'default'
          )}
        />
      </Stack>
      <LinearProgress
        variant="determinate"
        value={Math.min(100, Math.max(0, application.completionPercentage))}
        aria-label={`${formatPublicNumber(application.completionPercentage, language, { maximumFractionDigits: 0 })}% ${copy.registrationComplete}`}
      />
      <Alert severity={isExpired ? 'error' : 'info'} role={isExpired ? 'alert' : 'status'}>
        {isExpired ? copy.expired : copy.linkExpires}{' '}
        {formatPublicDateTime(application.linkExpiresAt, language)}
      </Alert>
      {application.status === 5 ? <Alert severity="warning">{copy.correction}</Alert> : null}
      {application.feeAmount > 0 ? (
        <Alert severity={application.feeStatus === 1 ? 'warning' : 'success'}>
          {copy.registrationFee}: {formatPublicNumber(application.feeAmount, language)}.{' '}
          {application.feeStatus === 1 ? copy.paymentReferencePending : copy.feeStatusRecorded}
        </Alert>
      ) : null}

      {visibleSections.length > 1 ? (
        <Stepper activeStep={activeStep} alternativeLabel sx={{ overflowX: 'auto', pb: 1 }}>
          {visibleSections.map((section) => (
            <Step key={section.key}>
              <StepLabel>
                {resolveRegistrationText(section.title, section.localizedTitles, language)}
              </StepLabel>
            </Step>
          ))}
        </Stepper>
      ) : null}

      {activeSection ? (
        <Stack key={activeSection.key} spacing={1.25} sx={{ pt: 1 }}>
          <Box>
            <Typography variant="subtitle2">
              {resolveRegistrationText(
                activeSection.title,
                activeSection.localizedTitles,
                language
              )}
            </Typography>
            {resolveRegistrationText(
              activeSection.description,
              activeSection.localizedDescriptions,
              language
            ) ? (
              <Typography variant="caption" color="text.secondary">
                {resolveRegistrationText(
                  activeSection.description,
                  activeSection.localizedDescriptions,
                  language
                )}
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
            {activeSection.fields
              .filter((field) =>
                isPublicRegistrationFieldVisible(field, fields, responses, application.prefill)
              )
              .map((field) => {
                const value = getPublicRegistrationValue(field, responses, application.prefill);
                const editable = canEdit && field.parentEditable;
                const error = application.correctionFieldKeys.includes(field.key);
                const label = resolveRegistrationText(field.label, field.localizedLabels, language);
                const helpText = resolveRegistrationText(
                  field.helpText,
                  field.localizedHelpTexts,
                  language
                );
                const options = resolveRegistrationOptions(
                  field.options,
                  field.localizedOptions,
                  language
                );
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
                      label={`${label}${field.required ? ' *' : ''}`}
                    />
                  );
                }
                if (field.fieldType === 6 || field.fieldType === 7) {
                  return (
                    <FormControl key={field.key} size="small" error={error}>
                      <InputLabel>{label}</InputLabel>
                      <Select
                        label={label}
                        name={field.key}
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
                        {field.options.map((option, optionIndex) => (
                          <MenuItem key={option} value={option}>
                            {options[optionIndex] || option}
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
                    name={field.key}
                    autoComplete={field.systemField || 'off'}
                    spellCheck={field.fieldType === 4 ? false : undefined}
                    label={label}
                    required={field.required}
                    value={String(value ?? '')}
                    disabled={!editable}
                    error={error}
                    helperText={error ? copy.correctionRequested : helpText}
                    InputLabelProps={field.fieldType === 3 ? { shrink: true } : undefined}
                    onChange={(event) => updateValue(field.key, event.target.value)}
                  />
                );
              })}
          </Box>
        </Stack>
      ) : null}

      {canEdit ? (
        <Stack direction={{ xs: 'column', sm: 'row' }} gap={1} flexWrap="wrap">
          {visibleSections.length > 1 ? (
            <>
              <Button
                variant="text"
                disabled={activeStep === 0}
                onClick={() => setActiveStep((current) => Math.max(current - 1, 0))}
              >
                {copy.back}
              </Button>
              <Button
                variant="text"
                disabled={activeStep >= visibleSections.length - 1}
                onClick={() =>
                  setActiveStep((current) => Math.min(current + 1, visibleSections.length - 1))
                }
              >
                {copy.next}
              </Button>
            </>
          ) : null}
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
        <Alert severity="success">{copy.registrationUnderReview}</Alert>
      )}
    </Stack>
  );
}
