import type { FormikProps } from 'formik';
import type { AdmissionForm } from 'src/redux/student/admissions/admission-forms-api';
import type { AdmissionWorkflowStage } from 'src/redux/student/admissions/admission-workflows-api';
import type { AdmissionFormStagePolicy } from 'src/redux/student/admissions/admission-form-stage-policy';

import { Iconify } from 'src/components/iconify';
import CustomTooltip from 'src/components/custom-tooltip';
import { Alert, Stack, Button, Switch, Typography } from '@mui/material';
import { readStageConfiguration } from 'src/redux/student/admissions/admission-assessment-policy';
import {
  DEFAULT_FORM_STAGE_POLICY,
  readAdmissionFormStagePolicy,
  writeAdmissionFormStagePolicy,
  getAdmissionFormStageConfigurationError,
} from 'src/redux/student/admissions/admission-form-stage-policy';

import { WorkflowProcessChoice } from './workflow-process-choice';
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
    title: 'Submission only',
    description: 'Use the existing simple submission process without managed verification rules.',
    icon: 'mdi:file-document-outline',
  },
  {
    value: 'managed',
    title: 'Submission with rules',
    description:
      'Configure responsibility, deadlines, optional verification, corrections and submission limits.',
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
      {!available && (
        <Alert severity="info">
          Managed Form settings are not available in this environment yet.
        </Alert>
      )}

      <WorkflowProcessChoice
        label="Form process"
        value={selectedProcess}
        options={PROCESS_OPTIONS.map((option) => ({
          ...option,
          disabled: option.value === 'managed' && !formDefinitionId,
        }))}
        disabled={disabled}
        onChange={(value) => update({ enabled: value === 'managed' })}
      />

      {policy?.enabled && (
        <>
          <FormStageBehaviorSettings
            policy={policy}
            disabled={disabled}
            onChange={update}
            expandAdvanced={Boolean(
              error && (formik.touched.configurationJson || formik.submitCount > 0)
            )}
          />
          <FormStageVerificationSettings
            policy={policy}
            form={selectedForm}
            sectionsLoading={formDetailsLoading}
            sectionsError={formDetailsError}
            onRetrySections={onRetryFormDetails}
            disabled={disabled}
            onChange={update}
          />
          <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
            <Typography component="div" variant="body2" sx={{ minWidth: 0 }}>
              Move to the next stage automatically
            </Typography>
            <CustomTooltip
              title={
                policy.requireSectionVerification
                  ? 'Automatic advancement is unavailable while staff verification is required.'
                  : 'Send applicants to the next stage after completion.'
              }
              arrow
            >
              <span>
                <Switch
                  size="small"
                  slotProps={{
                    input: {
                      'aria-label': 'Move to the next stage automatically',
                      'aria-description': policy.requireSectionVerification
                        ? 'Automatic advancement is unavailable while staff verification is required.'
                        : 'Send applicants to the next stage after completion.',
                    },
                  }}
                  checked={policy.autoAdvanceOnSubmit}
                  disabled={disabled || policy.requireSectionVerification}
                  onChange={(_, checked) => update({ autoAdvanceOnSubmit: checked })}
                />
              </span>
            </CustomTooltip>
          </Stack>
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
              Go to stage details
            </Button>
          }
        >
          Choose a published form in Stage details to finish setup.
        </Alert>
      ) : (
        error && <Alert severity="error">{error}</Alert>
      )}
    </Stack>
  );
}
