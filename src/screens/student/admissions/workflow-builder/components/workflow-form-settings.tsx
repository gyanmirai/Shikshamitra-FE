import type { FormikProps } from 'formik';
import type { AdmissionForm } from 'src/redux/student/admissions/admission-forms-api';
import type { AdmissionWorkflowStage } from 'src/redux/student/admissions/admission-workflows-api';
import type { AdmissionFormStagePolicy } from 'src/redux/student/admissions/admission-form-stage-policy';

import { varAlpha } from 'src/theme/styles';
import { Iconify } from 'src/components/iconify';
import { Box, Grid, Alert, Paper, Stack, Button, ButtonBase, Typography } from '@mui/material';
import { readStageConfiguration } from 'src/redux/student/admissions/admission-assessment-policy';
import {
  DEFAULT_FORM_STAGE_POLICY,
  readAdmissionFormStagePolicy,
  writeAdmissionFormStagePolicy,
  getAdmissionFormStageConfigurationError,
} from 'src/redux/student/admissions/admission-form-stage-policy';

import { FormStageBehaviorSettings } from './form-stage-behavior-settings';
import { FormStageVerificationSettings } from './form-stage-verification-settings';

type Props = {
  formik: FormikProps<AdmissionWorkflowStage>;
  forms: AdmissionForm[];
  formDefinitionId: string;
  formDetailsLoading?: boolean;
  formDetailsError?: boolean;
  onRetryFormDetails?: () => void;
  readOnly: boolean;
  available: boolean;
  onGoToBasics: () => void;
};

const PROCESS_OPTIONS = [
  {
    value: 'basic',
    title: 'Basic submission',
    description: 'A simple submission process with no verification.',
    icon: 'mdi:file-document-outline',
  },
  {
    value: 'managed',
    title: 'Managed submission',
    description: 'Collect, submit, verify, and correct a published dynamic form.',
    icon: 'mdi:account-group-outline',
  },
] as const;

export function WorkflowFormSettings({
  formik,
  forms,
  formDefinitionId,
  formDetailsLoading = false,
  formDetailsError = false,
  onRetryFormDetails,
  readOnly,
  available,
  onGoToBasics,
}: Props) {
  const json = formik.values.configurationJson;
  const policy = readAdmissionFormStagePolicy(json);
  const error =
    formDetailsLoading || formDetailsError
      ? undefined
      : getAdmissionFormStageConfigurationError(json, forms);
  const unreadable = Boolean(readStageConfiguration(json)?.form !== undefined && !policy);
  const disabled = readOnly || !available || unreadable;
  const selectedForm = forms.find((form) => form.id === formDefinitionId);
  const selectedProcess = policy?.enabled ? 'managed' : 'basic';
  const update = (change: Partial<AdmissionFormStagePolicy>) =>
    formik.setFieldValue(
      'configurationJson',
      writeAdmissionFormStagePolicy(json, { ...(policy ?? DEFAULT_FORM_STAGE_POLICY), ...change })
    );

  return (
    <Stack spacing={2}>
      <Box>
        <Typography variant="h6">Form process</Typography>
        <Typography variant="body2" color="text.secondary">
          Choose how the form is completed, its deadline, resubmissions, and verification.
        </Typography>
      </Box>

      {!available && (
        <Alert severity="info">
          Managed Form settings are not available in this environment yet.
        </Alert>
      )}

      <Grid container spacing={1} role="radiogroup" aria-label="Form process">
        {PROCESS_OPTIONS.map((option) => {
          const selected = selectedProcess === option.value;
          const optionDisabled = disabled || (option.value === 'managed' && !formDefinitionId);
          return (
            <Grid key={option.value} size={{ xs: 12, sm: 6 }}>
              <ButtonBase
                type="button"
                role="radio"
                aria-checked={selected}
                disabled={optionDisabled}
                onClick={() => update({ enabled: option.value === 'managed' })}
                sx={{ width: 1, borderRadius: 1.5, textAlign: 'left' }}
              >
                <Paper
                  variant="outlined"
                  sx={(theme) => ({
                    width: 1,
                    minHeight: 96,
                    p: 2,
                    borderRadius: 1.5,
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 1.5,
                    borderColor: selected ? 'success.main' : 'divider',
                    bgcolor: selected
                      ? varAlpha(theme.vars.palette.success.mainChannel, 0.08)
                      : 'background.paper',
                  })}
                >
                  <Iconify
                    icon={option.icon}
                    width={24}
                    sx={{ color: selected ? 'success.main' : 'text.secondary', mt: 0.25 }}
                  />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="subtitle2">{option.title}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {option.description}
                    </Typography>
                  </Box>
                  {selected && (
                    <Iconify
                      icon="mdi:check-circle"
                      width={22}
                      sx={{ color: 'success.main', flexShrink: 0 }}
                    />
                  )}
                </Paper>
              </ButtonBase>
            </Grid>
          );
        })}
      </Grid>

      {policy?.enabled && (
        <>
          <FormStageBehaviorSettings policy={policy} disabled={disabled} onChange={update} />
          <FormStageVerificationSettings
            policy={policy}
            form={selectedForm}
            sectionsLoading={formDetailsLoading}
            sectionsError={formDetailsError}
            onRetrySections={onRetryFormDetails}
            disabled={disabled}
            onChange={update}
          />
        </>
      )}

      {!formDefinitionId ? (
        <Alert
          severity="warning"
          action={
            <Button
              type="button"
              color="warning"
              size="small"
              endIcon={<Iconify icon="mdi:arrow-right" />}
              onClick={onGoToBasics}
            >
              Go to Basics
            </Button>
          }
        >
          Choose a published form in Basics to finish setup.
        </Alert>
      ) : (
        error && <Alert severity="error">{error}</Alert>
      )}
    </Stack>
  );
}
