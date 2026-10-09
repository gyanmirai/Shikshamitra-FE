import type { FormikProps } from 'formik';
import type { AdmissionForm } from 'src/redux/student/admissions/admission-forms-api';
import type { AdmissionWorkflowStage } from 'src/redux/student/admissions/admission-workflows-api';
import type { AdmissionFormStagePolicy } from 'src/redux/student/admissions/admission-form-stage-policy';

import { Alert, Stack } from '@mui/material';
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
};

export function WorkflowFormSettings({
  formik,
  forms,
  formDefinitionId,
  formDetailsLoading = false,
  formDetailsError = false,
  onRetryFormDetails,
  readOnly,
  available,
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
        <Alert severity="warning">Choose a published form in Stage details to finish setup.</Alert>
      ) : (
        error && <Alert severity="error">{error}</Alert>
      )}
    </Stack>
  );
}
