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

export function WorkflowStageFields(props: Props) {
  const { formik, activeStep } = props;
  if (formik.values.stageType === 0 && activeStep === 0) {
    return (
      <Stack spacing={2} sx={{ p: 2 }}>
        <Alert severity="info">
          This saved Inquiry stage is retained for existing applications. To update this draft,
          choose an application stage type below or remove the stage from the process.
        </Alert>
        <FormSectionCard title="Basics" icon="mdi:file-document-outline">
          <WorkflowStageBasics {...props} />
        </FormSectionCard>
      </Stack>
    );
  }
  if (formik.values.stageType === 1) {
    return <WorkflowFormStageFields {...props} />;
  }

  return <WorkflowOtherStageFields {...props} />;
}

function WorkflowOtherStageFields(props: Props) {
  const { formik, metadata, readOnly, forms, stages, transitions, activeStep } = props;
  return (
    <Stack spacing={2} sx={{ p: 2 }}>
      {activeStep === 0 && (
        <FormSectionCard title="Basics" icon="mdi:file-document-outline">
          <WorkflowStageBasics {...props} />
          {metadata?.supportsFormAttachment && <WorkflowStageForm {...props} />}
        </FormSectionCard>
      )}
      {activeStep === 1 && (
        <>
          <FormSectionCard title="Settings" icon="mdi:cog-outline">
            {formik.values.stageType === 0 && (
              <Alert severity="info">
                This saved Inquiry stage is retained for existing applications. Replace it with an
                application stage type before saving a new workflow draft.
              </Alert>
            )}
            {formik.values.stageType === 2 && (
              <WorkflowAssessmentSettings
                formik={formik}
                readOnly={readOnly}
                available={metadata?.supportedConfiguration?.includes('assessment') === true}
              />
            )}
            {formik.values.stageType === 5 && (
              <WorkflowDocumentSettings
                formik={formik}
                forms={forms}
                stages={stages}
                readOnly={readOnly}
                available={
                  metadata?.supportedConfiguration?.includes('documentVerification') === true
                }
              />
            )}
            {formik.values.stageType === 3 && (
              <WorkflowEligibilitySettings
                formik={formik}
                forms={forms}
                stages={stages}
                readOnly={readOnly}
                available={metadata?.supportedConfiguration?.includes('eligibility') === true}
              />
            )}
            {formik.values.stageType === 4 && (
              <WorkflowPaymentSettings
                formik={formik}
                readOnly={readOnly}
                available={metadata?.supportedConfiguration?.includes('payment') === true}
              />
            )}
            {formik.values.stageType === 8 && (
              <WorkflowOfferSettings
                formik={formik}
                readOnly={readOnly}
                available={metadata?.supportedConfiguration?.includes('offer') === true}
              />
            )}
            {formik.values.stageType === 9 && (
              <WorkflowSeatSettings
                formik={formik}
                readOnly={readOnly}
                available={metadata?.supportedConfiguration?.includes('seat') === true}
              />
            )}
            {formik.values.stageType === 6 && (
              <WorkflowReviewSettings
                formik={formik}
                stages={stages}
                readOnly={readOnly}
                available={metadata?.supportedConfiguration?.includes('review') === true}
              />
            )}
            {formik.values.stageType === 7 && (
              <Alert severity="info">
                An authorized admission approver records Approve, Waitlist, or Reject. Use a Review
                stage before this step to configure reviewer assignment, evidence prerequisites, and
                a separate final approver.
              </Alert>
            )}
            {![0, 2, 3, 4, 5, 6, 7, 8, 9].includes(formik.values.stageType) && (
              <Alert severity="info">
                {metadata?.nextRequiredAction ||
                  'Authorized staff complete this stage using the application actions.'}
              </Alert>
            )}
          </FormSectionCard>
          <FormSectionCard title="Stage behavior & completion" icon="mdi:check-circle-outline">
            <WorkflowStageCompletionSummary
              stage={formik.values}
              error={formik.errors.configurationJson}
            />
            <WorkflowStageBehavior formik={formik} metadata={metadata} readOnly={readOnly} />
          </FormSectionCard>
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
