import type { FormikProps } from 'formik';
import type { AdmissionForm } from 'src/redux/student/admissions/admission-forms-api';
import type {
  AdmissionWorkflowStage,
  AdmissionWorkflowStageTypeMetadata,
} from 'src/redux/student/admissions/admission-workflows-api';

import { Stack, Divider } from '@mui/material';

import { WorkflowStageForm } from './workflow-stage-form';
import { WorkflowStageBasics } from './workflow-stage-basics';
import { WorkflowFormSettings } from './workflow-form-settings';
import { WorkflowSeatSettings } from './workflow-seat-settings';
import { WorkflowStageBehavior } from './workflow-stage-behavior';
import { WorkflowOfferSettings } from './workflow-offer-settings';
import { WorkflowReviewSettings } from './workflow-review-settings';
import { WorkflowPaymentSettings } from './workflow-payment-settings';
import { WorkflowInquirySettings } from './workflow-inquiry-settings';
import { WorkflowDocumentSettings } from './workflow-document-settings';
import { WorkflowAssessmentSettings } from './workflow-assessment-settings';
import { WorkflowEligibilitySettings } from './workflow-eligibility-settings';

type Props = {
  formik: FormikProps<AdmissionWorkflowStage>;
  metadata?: AdmissionWorkflowStageTypeMetadata;
  stageTypes: AdmissionWorkflowStageTypeMetadata[];
  forms: AdmissionForm[];
  stages: AdmissionWorkflowStage[];
  formDefinitionId: string;
  readOnly: boolean;
};

export function WorkflowStageFields(props: Props) {
  const { formik, metadata, readOnly, forms, stages, formDefinitionId } = props;
  return (
    <Stack spacing={2} sx={{ p: 2, flex: 1, minHeight: 0, overflowY: 'auto' }}>
      <WorkflowStageBasics {...props} />
      {metadata?.supportsFormAttachment && <WorkflowStageForm {...props} />}
      {formik.values.stageType === 1 && (
        <WorkflowFormSettings
          formik={formik}
          forms={forms}
          formDefinitionId={formDefinitionId}
          readOnly={readOnly}
          available={metadata?.supportedConfiguration?.includes('form') === true}
        />
      )}
      {formik.values.stageType === 0 && (
        <WorkflowInquirySettings
          formik={formik}
          stages={stages}
          readOnly={readOnly}
          available={metadata?.supportedConfiguration?.includes('inquiry') === true}
        />
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
          readOnly={readOnly}
          available={metadata?.supportedConfiguration?.includes('documentVerification') === true}
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
      <Divider />
      <WorkflowStageBehavior formik={formik} metadata={metadata} readOnly={readOnly} />
    </Stack>
  );
}
