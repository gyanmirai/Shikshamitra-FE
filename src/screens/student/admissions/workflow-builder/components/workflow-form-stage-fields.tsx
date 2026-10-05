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
import { WorkflowStageCompletionSummary } from './workflow-stage-completion-summary';

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
  activeStep: number;
  onGoToBasics: () => void;
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
    activeStep,
    onGoToBasics,
  } = props;

  return (
    <Stack spacing={2} sx={{ p: 2 }}>
      {activeStep === 0 ? (
        <FormSectionCard title="Basics" icon="mdi:file-document-outline">
          <WorkflowFormStageBasics {...props} />
        </FormSectionCard>
      ) : (
        <>
          <FormSectionCard title="Settings" icon="mdi:cog-outline">
            <WorkflowFormSettings
              formik={formik}
              forms={forms}
              formDefinitionId={formDefinitionId}
              formDetailsLoading={formDetailsLoading}
              formDetailsError={formDetailsError}
              onRetryFormDetails={onRetryFormDetails}
              readOnly={readOnly}
              available={metadata?.supportedConfiguration?.includes('form') === true}
              onGoToBasics={onGoToBasics}
            />
          </FormSectionCard>
          <WorkflowStageCompletionSummary stage={formik.values} />
          <WorkflowFormStageSettings {...props} />
          <FormSectionCard title="Next steps" icon="mdi:arrow-decision-outline">
            <WorkflowStageNextSteps
              stage={formik.values}
              stages={stages}
              transitions={transitions}
            />
          </FormSectionCard>
        </>
      )}
    </Stack>
  );
}
