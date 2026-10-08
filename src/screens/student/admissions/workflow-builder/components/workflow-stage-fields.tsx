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
import { WorkflowSeatSettings } from './workflow-seat-settings';
import { WorkflowStageBehavior } from './workflow-stage-behavior';
import { WorkflowOfferSettings } from './workflow-offer-settings';
import { WorkflowReviewSettings } from './workflow-review-settings';
import { WorkflowStageNextSteps } from './workflow-stage-next-steps';
import { WorkflowPaymentSettings } from './workflow-payment-settings';
import { WorkflowFormStageFields } from './workflow-form-stage-fields';
import { WorkflowDocumentSettings } from './workflow-document-settings';
import { WorkflowAssessmentSettings } from './workflow-assessment-settings';
import { WorkflowEligibilitySettings } from './workflow-eligibility-settings';

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
  onAddPath?: (stage: AdmissionWorkflowStage) => void;
  onEditPath?: (transition: AdmissionWorkflowTransition) => void;
  routeEditingDisabled?: boolean;
};

export function WorkflowStageFields(props: Props) {
  const {
    formik,
    metadata,
    readOnly,
    activeStep,
    forms,
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
      case 3:
        return (
          <WorkflowEligibilitySettings
            formik={formik}
            forms={forms}
            stages={stages}
            readOnly={readOnly}
            available={available('eligibility')}
          />
        );
      case 4:
        return (
          <WorkflowPaymentSettings
            formik={formik}
            readOnly={readOnly}
            available={available('payment')}
          />
        );
      case 5:
        return (
          <WorkflowDocumentSettings
            formik={formik}
            forms={forms}
            stages={stages}
            readOnly={readOnly}
            available={available('documentVerification')}
          />
        );
      case 6:
        return (
          <WorkflowReviewSettings
            formik={formik}
            stages={stages}
            readOnly={readOnly}
            available={available('review')}
          />
        );
      case 8:
        return (
          <WorkflowOfferSettings
            formik={formik}
            readOnly={readOnly}
            available={available('offer')}
          />
        );
      case 9:
        return (
          <WorkflowSeatSettings formik={formik} readOnly={readOnly} available={available('seat')} />
        );
      default:
        return null;
    }
  };
  return (
    <Stack spacing={2} sx={{ p: 2 }}>
      {formik.values.stageType === 0 && (
        <Alert severity="warning">
          This saved Inquiry stage is retained for existing applications. Replace it with an
          application stage type before saving a new workflow draft.
        </Alert>
      )}
      {activeStep === 0 ? (
        <FormSectionCard
          title="Stage details"
          icon="mdi:file-document-outline"
          descriptionTooltip={`${metadata?.description ?? 'Choose the stage type and name.'} Any selected form version is frozen with the workflow.`}
        >
          <WorkflowStageBasics {...props} />
          {metadata?.supportsFormAttachment && <WorkflowStageForm {...props} />}
        </FormSectionCard>
      ) : (
        <>
          {policy()}
          <WorkflowStageBehavior formik={formik} metadata={metadata} readOnly={readOnly} />
          <FormSectionCard title="Next step" icon="mdi:arrow-decision-outline">
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
          <WorkflowStageBehavior formik={formik} metadata={metadata} readOnly={readOnly} advanced />
        </>
      )}
    </Stack>
  );
}
