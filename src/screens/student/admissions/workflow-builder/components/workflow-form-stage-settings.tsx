import type { FormikProps } from 'formik';
import type {
  AdmissionWorkflowStage,
  AdmissionWorkflowStageTypeMetadata,
} from 'src/redux/student/admissions/admission-workflows-api';

import {
  readAdmissionFormStagePolicy,
  writeAdmissionFormStagePolicy,
} from 'src/redux/student/admissions/admission-form-stage-policy';

import { WorkflowStageBehavior } from './workflow-stage-behavior';
import { FormStageBehaviorSettings } from './form-stage-behavior-settings';

type Props = {
  formik: FormikProps<AdmissionWorkflowStage>;
  metadata?: AdmissionWorkflowStageTypeMetadata;
  stages?: AdmissionWorkflowStage[];
  readOnly: boolean;
};

export function WorkflowFormStageSettings(props: Props) {
  const { formik, metadata, readOnly } = props;
  const json = formik.values.configurationJson;
  const policy = readAdmissionFormStagePolicy(json);

  return (
    <WorkflowStageBehavior {...props}>
      {policy?.enabled && (
        <FormStageBehaviorSettings
          policy={policy}
          disabled={readOnly || metadata?.supportedConfiguration?.includes('form') !== true}
          onChange={(change) =>
            formik.setFieldValue(
              'configurationJson',
              writeAdmissionFormStagePolicy(json, { ...policy, ...change })
            )
          }
        />
      )}
    </WorkflowStageBehavior>
  );
}
