import type { FormikProps } from 'formik';
import type { AdmissionForm } from 'src/redux/student/admissions/admission-forms-api';
import type {
  AdmissionWorkflowStage,
  AdmissionWorkflowStageTypeMetadata,
} from 'src/redux/student/admissions/admission-workflows-api';

import { Stack } from '@mui/material';
import { FormSectionCard } from 'src/components/form-section-card';

import { WorkflowFormSettings } from './workflow-form-settings';
import { WorkflowFormStageBasics } from './workflow-form-stage-basics';
import { WorkflowFormStageSettings } from './workflow-form-stage-settings';

type Props = {
  formik: FormikProps<AdmissionWorkflowStage>;
  metadata?: AdmissionWorkflowStageTypeMetadata;
  stageTypes: AdmissionWorkflowStageTypeMetadata[];
  forms: AdmissionForm[];
  stages: AdmissionWorkflowStage[];
  formDefinitionId: string;
  readOnly: boolean;
  isNewStage?: boolean;
};

export function WorkflowFormStageFields(props: Props) {
  const { formik, metadata, forms, formDefinitionId, readOnly } = props;

  return (
    <Stack spacing={2} sx={{ p: 2 }}>
      <>
        <FormSectionCard
          title="Stage Details"
          icon="mdi:file-document-outline"
          descriptionTooltip="Choose the Stage Type, Its Name and the Published Form Version Applicants Will Complete. The Selected Form Version Is Frozen with the Workflow."
        >
          <WorkflowFormStageBasics {...props} />
        </FormSectionCard>

        <FormSectionCard title="Form Completion" icon="mdi:file-check-outline">
          <WorkflowFormSettings
            formik={formik}
            forms={forms}
            formDefinitionId={formDefinitionId}
            readOnly={readOnly}
            available={metadata?.supportedConfiguration?.includes('form') === true}
          />
        </FormSectionCard>
        <WorkflowFormStageSettings {...props} />
      </>
    </Stack>
  );
}
