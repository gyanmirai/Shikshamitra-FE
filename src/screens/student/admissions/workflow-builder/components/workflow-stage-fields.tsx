import type { FormikProps } from 'formik';
import type { AdmissionForm } from 'src/redux/student/admissions/admission-forms-api';
import type {
  AdmissionWorkflowStage,
  AdmissionWorkflowTransition,
  AdmissionWorkflowStageTypeMetadata,
} from 'src/redux/student/admissions/admission-workflows-api';

import { Stack, Alert } from '@mui/material';
import { FormSectionCard } from 'src/components/form-section-card';

import { WorkflowStageForm } from './workflow-stage-form';
import { WorkflowStageBasics } from './workflow-stage-basics';
import { WorkflowStageBehavior } from './workflow-stage-behavior';
import { WorkflowStageNextSteps } from './workflow-stage-next-steps';
import { WorkflowPaymentSettings } from './workflow-payment-settings';
import { WorkflowFormStageFields } from './workflow-form-stage-fields';
import { WorkflowDocumentSettings } from './workflow-document-settings';
import { isApplicationStageType } from '../workflow-stage-configuration';
import { WorkflowAssessmentSettings } from './workflow-assessment-settings';

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

export function WorkflowStageFields(props: Props) {
  const {
    formik,
    metadata,
    readOnly,
    stages,
    transitions,
    routeEditingDisabled,
    onAddPath,
    onEditPath,
  } = props;
  if (formik.values.stageType === 1) return <WorkflowFormStageFields {...props} />;
  const available = (key: string) => metadata?.supportedConfiguration?.includes(key) === true;
  const policy = () => {
    switch (formik.values.stageType) {
      case 2:
        return (
          <WorkflowAssessmentSettings
            formik={formik}
            readOnly={readOnly}
            available={available('assessment')}
          />
        );
      case 4:
        return <WorkflowPaymentSettings available={metadata?.isRuntimeReady === true} />;
      case 5:
        return (
          <WorkflowDocumentSettings
            formik={formik}
            readOnly={readOnly}
            available={available('documentVerification')}
          />
        );
      default:
        return null;
    }
  };
  return (
    <Stack spacing={2} sx={{ p: 2 }}>
      {!isApplicationStageType(formik.values.stageType) && (
        <Alert severity="warning">
          This saved stage type is no longer available. Replace it with Form, Assessment, Payment,
          Document verification or Admission Decision.
        </Alert>
      )}
      <>
        <FormSectionCard
          title="Stage details"
          icon="mdi:file-document-outline"
          descriptionTooltip={metadata?.description ?? 'Choose the stage type and name.'}
        >
          <WorkflowStageBasics {...props} />
          {metadata?.supportsFormAttachment && <WorkflowStageForm {...props} />}
        </FormSectionCard>

        {policy()}
        <WorkflowStageBehavior
          formik={formik}
          metadata={metadata}
          stages={stages}
          readOnly={readOnly}
        />
        <FormSectionCard title="Next step" icon="mdi:arrow-right">
          <WorkflowStageNextSteps
            stage={formik.values}
            stages={stages}
            transitions={transitions}
            readOnly={readOnly}
            routeEditingDisabled={routeEditingDisabled}
            onAddPath={onAddPath}
            onEditPath={onEditPath}
          />
        </FormSectionCard>
      </>
    </Stack>
  );
}
