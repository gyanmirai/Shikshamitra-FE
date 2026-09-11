import type { FormikProps } from 'formik';
import type { AdmissionForm } from 'src/redux/student/admissions/admission-forms-api';
import type { AdmissionWorkflowStage } from 'src/redux/student/admissions/admission-workflows-api';
import type { AdmissionFormStagePolicy } from 'src/redux/student/admissions/admission-form-stage-policy';

import { readStageConfiguration } from 'src/redux/student/admissions/admission-assessment-policy';
import {
  Alert,
  Paper,
  Radio,
  Stack,
  RadioGroup,
  Typography,
  FormControlLabel,
} from '@mui/material';
import {
  DEFAULT_FORM_STAGE_POLICY,
  readAdmissionFormStagePolicy,
  writeAdmissionFormStagePolicy,
  getAdmissionFormStageConfigurationError,
} from 'src/redux/student/admissions/admission-form-stage-policy';

import { FormStageBehaviorSettings } from './form-stage-behavior-settings';
import { FormStageVerificationSettings } from './form-stage-verification-settings';

export function WorkflowFormSettings({
  formik,
  forms,
  formDefinitionId,
  readOnly,
  available,
}: {
  formik: FormikProps<AdmissionWorkflowStage>;
  forms: AdmissionForm[];
  formDefinitionId: string;
  readOnly: boolean;
  available: boolean;
}) {
  const json = formik.values.configurationJson;
  const policy = readAdmissionFormStagePolicy(json);
  const error = getAdmissionFormStageConfigurationError(json, forms);
  const unreadable = Boolean(readStageConfiguration(json)?.form !== undefined && !policy);
  const disabled = readOnly || !available || unreadable;
  const selectedForm = forms.find((form) => form.id === formDefinitionId);
  const update = (change: Partial<AdmissionFormStagePolicy>) =>
    formik.setFieldValue(
      'configurationJson',
      writeAdmissionFormStagePolicy(json, { ...(policy ?? DEFAULT_FORM_STAGE_POLICY), ...change })
    );
  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
      <Stack spacing={2}>
        <Typography variant="subtitle1">Form process</Typography>
        <Typography variant="body2" color="text.secondary">
          Choose who completes the form, its deadline, resubmissions, and staff verification.
        </Typography>
        {!available && (
          <Alert severity="info">
            Managed Form settings are not available in this environment yet.
          </Alert>
        )}
        <RadioGroup
          aria-label="Form process"
          value={policy?.enabled ? 'managed' : 'basic'}
          onChange={(_, value) => update({ enabled: value === 'managed' })}
        >
          <FormControlLabel
            value="basic"
            disabled={disabled}
            control={<Radio size="small" />}
            label="Basic submission (existing process)"
          />
          <FormControlLabel
            value="managed"
            disabled={disabled}
            control={<Radio size="small" />}
            label="Managed submission and verification"
          />
        </RadioGroup>
        {policy?.enabled && (
          <>
            <FormStageBehaviorSettings policy={policy} disabled={disabled} onChange={update} />
            <FormStageVerificationSettings
              policy={policy}
              form={selectedForm}
              disabled={disabled}
              onChange={update}
            />
            <Alert severity="info">
              The published form version is frozen per application. Every save, submission,
              verification, correction, and resubmission remains in its audit history.
            </Alert>
          </>
        )}
        {error && <Alert severity="error">{error}</Alert>}
      </Stack>
    </Paper>
  );
}
