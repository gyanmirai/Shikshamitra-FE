import type { FormikProps } from 'formik';
import type { AdmissionForm } from 'src/redux/student/admissions/admission-forms-api';
import type { AdmissionWorkflowStage } from 'src/redux/student/admissions/admission-workflows-api';
import type { AdmissionFormStagePolicy } from 'src/redux/student/admissions/admission-form-stage-policy';

import { Stack } from '@mui/material';
import { StudentFeedback } from 'src/components/student-feedback';
import { readStageConfiguration } from 'src/redux/student/admissions/admission-assessment-policy';
import {
  DEFAULT_FORM_STAGE_POLICY,
  readAdmissionFormStagePolicy,
  writeAdmissionFormStagePolicy,
  getAdmissionFormStageConfigurationError,
} from 'src/redux/student/admissions/admission-form-stage-policy';

import { FormStageBehaviorSettings } from './form-stage-behavior-settings';

type Props = {
  formik: FormikProps<AdmissionWorkflowStage>;
  forms: AdmissionForm[];
  formDefinitionId: string;
  readOnly: boolean;
  available: boolean;
};

export function WorkflowFormSettings({
  formik,
  forms,
  formDefinitionId,
  readOnly,
  available,
}: Props) {
  const json = formik.values.configurationJson;
  const policy = readAdmissionFormStagePolicy(json);
  const error = getAdmissionFormStageConfigurationError(json, forms);
  const unreadable = Boolean(readStageConfiguration(json)?.form !== undefined && !policy);
  const disabled = readOnly || !available || unreadable;
  const update = (change: Partial<AdmissionFormStagePolicy>) =>
    formik.setFieldValue(
      'configurationJson',
      writeAdmissionFormStagePolicy(json, { ...(policy ?? DEFAULT_FORM_STAGE_POLICY), ...change })
    );

  return (
    <Stack spacing={2}>
      {!available && (
        <StudentFeedback notificationKey="STU-0553" presentation="inline" severity="info">
          Managed Form settings are not available in this environment yet.
        </StudentFeedback>
      )}

      {policy?.enabled && (
        <FormStageBehaviorSettings policy={policy} disabled={disabled} onChange={update} />
      )}

      {!formDefinitionId ? (
        <StudentFeedback notificationKey="STU-0554" presentation="inline" severity="warning">
          Choose a published form in Stage details to finish setup.
        </StudentFeedback>
      ) : (
        error && (
          <StudentFeedback notificationKey="STU-0555" presentation="persistent" severity="error">
            {error}
          </StudentFeedback>
        )
      )}
    </Stack>
  );
}
