import type { FormikProps } from 'formik';
import type { AdmissionForm } from 'src/redux/student/admissions/admission-forms-api';
import type {
  AdmissionWorkflowStage,
  AdmissionWorkflowTransition,
  AdmissionWorkflowStageTypeMetadata,
} from 'src/redux/student/admissions/admission-workflows-api';

import { Stack } from '@mui/material';
import { FormSectionCard } from 'src/components/form-section-card';

import { WorkflowFormSettings } from './workflow-form-settings';
import { WorkflowStageNextSteps } from './workflow-stage-next-steps';
import { WorkflowFormStageBasics } from './workflow-form-stage-basics';
import { WorkflowFormStageSettings } from './workflow-form-stage-settings';

type Props = {
  formik: FormikProps<AdmissionWorkflowStage>;
  metadata?: AdmissionWorkflowStageTypeMetadata;
  stageTypes: AdmissionWorkflowStageTypeMetadata[];
  forms: AdmissionForm[];
  stages: AdmissionWorkflowStage[];
  transitions?: AdmissionWorkflowTransition[];
  formDefinitionId: string;
  formDetailsLoading?: boolean;
  formDetailsError?: boolean;
  onRetryFormDetails?: () => void;
  readOnly: boolean;
  onAddPath?: (stage: AdmissionWorkflowStage) => void;
  onEditPath?: (transition: AdmissionWorkflowTransition) => void;
  routeEditingDisabled?: boolean;
};

export function WorkflowFormStageFields(props: Props) {
  const {
    formik,
    metadata,
    forms,
    formDefinitionId,
    formDetailsLoading,
    formDetailsError,
    onRetryFormDetails,
    readOnly,
    stages,
    transitions,
    onAddPath,
    onEditPath,
    routeEditingDisabled,
  } = props;

  return (
    <Stack spacing={2} sx={{ p: 2 }}>
      <>
        <FormSectionCard
          title="Stage details"
          icon="mdi:file-document-outline"
          descriptionTooltip="Choose the stage type, its name and the published form version applicants will complete. The selected form version is frozen with the workflow."
        >
          <WorkflowFormStageBasics {...props} />
        </FormSectionCard>

        <FormSectionCard title="Form completion" icon="mdi:file-check-outline">
          <WorkflowFormSettings
            formik={formik}
            forms={forms}
            formDefinitionId={formDefinitionId}
            formDetailsLoading={formDetailsLoading}
            formDetailsError={formDetailsError}
            onRetryFormDetails={onRetryFormDetails}
            readOnly={readOnly}
            available={metadata?.supportedConfiguration?.includes('form') === true}
          />
        </FormSectionCard>
        <WorkflowFormStageSettings {...props} />
        <FormSectionCard title="Next step" icon="mdi:arrow-decision-outline">
          <WorkflowStageNextSteps
            stage={formik.values}
            stages={stages}
            transitions={transitions}
            readOnly={readOnly}
            onAddPath={onAddPath}
            onEditPath={onEditPath}
            routeEditingDisabled={routeEditingDisabled}
          />
        </FormSectionCard>
        <WorkflowFormStageSettings {...props} advanced />
      </>
    </Stack>
  );
}
