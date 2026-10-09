import type { FormikProps } from 'formik';
import type {
  AdmissionWorkflowStage,
  AdmissionWorkflowStageTypeMetadata,
} from 'src/redux/student/admissions/admission-workflows-api';

import { WorkflowStageBehavior } from './workflow-stage-behavior';

type Props = {
  formik: FormikProps<AdmissionWorkflowStage>;
  metadata?: AdmissionWorkflowStageTypeMetadata;
  stages?: AdmissionWorkflowStage[];
  readOnly: boolean;
};

export function WorkflowFormStageSettings(props: Props) {
  return <WorkflowStageBehavior {...props} />;
}
