import type { FormikProps } from 'formik';
import type { AdmissionForm } from 'src/redux/student/admissions/admission-forms-api';
import type {
  AdmissionWorkflowStage,
  AdmissionWorkflowTransition,
  AdmissionWorkflowStageTypeMetadata,
} from 'src/redux/student/admissions/admission-workflows-api';

import { useRef, useEffect } from 'react';
import { useTabs } from 'src/hooks/use-tabs';
import { Scrollbar } from 'src/components/scrollbar';
import { Box, Tab, Stack, Alert } from '@mui/material';
import { CustomTabs } from 'src/components/custom-tabs';

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
};

export function WorkflowStageFields(props: Props) {
  const { formik } = props;
  if (formik.values.stageType === 0) {
    return (
      <Scrollbar sx={{ flex: 1, minHeight: 0 }}>
        <Stack spacing={2} sx={{ p: 2 }}>
          <Alert severity="info">
            This saved Inquiry stage is retained for existing applications. To update this draft,
            choose an application stage type below or remove the stage from the process.
          </Alert>
          <WorkflowStageBasics {...props} />
        </Stack>
      </Scrollbar>
    );
  }
  if (formik.values.stageType === 1) {
    return <WorkflowFormStageFields {...props} />;
  }

  return <WorkflowOtherStageFields {...props} />;
}

function WorkflowOtherStageFields(props: Props) {
  const { formik, metadata, readOnly, forms, stages, transitions } = props;
  const tabs = useTabs('basics');
  const lastSubmit = useRef(formik.submitCount);
  useEffect(() => {
    if (formik.isValidating || formik.isSubmitting) return;
    if (lastSubmit.current === formik.submitCount) return;
    lastSubmit.current = formik.submitCount;
    if (formik.errors.name || formik.errors.code || formik.errors.description)
      tabs.setValue('basics');
    else if (formik.errors.configurationJson) tabs.setValue('process');
  }, [formik.submitCount, formik.errors, formik.isValidating, formik.isSubmitting, tabs]);
  return (
    <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
      <CustomTabs
        value={tabs.value}
        onChange={tabs.onChange}
        variant="fullWidth"
        guardUnsavedChanges={false}
        aria-label="Stage configuration"
        sx={{ borderBottom: 1, borderColor: 'divider' }}
        slotProps={{ tab: { minHeight: 44 } }}
      >
        {['basics', 'process', 'settings'].map((value) => (
          <Tab
            key={value}
            value={value}
            id={`stage-${value}-tab`}
            aria-controls={`stage-${value}-panel`}
            label={value[0].toUpperCase() + value.slice(1)}
          />
        ))}
      </CustomTabs>
      <Scrollbar
        role="tabpanel"
        id={`stage-${tabs.value}-panel`}
        aria-labelledby={`stage-${tabs.value}-tab`}
        sx={{ flex: 1, minHeight: 0 }}
      >
        <Stack spacing={2} sx={{ p: 2 }}>
          {tabs.value === 'basics' && (
            <>
              <WorkflowStageBasics {...props} />
              {metadata?.supportsFormAttachment && <WorkflowStageForm {...props} />}
            </>
          )}
          {tabs.value === 'process' && (
            <>
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
                  An authorized admission approver records Approve, Waitlist, or Reject. Use a
                  Review stage before this step to configure reviewer assignment, evidence
                  prerequisites, and a separate final approver.
                </Alert>
              )}
              {![0, 2, 3, 4, 5, 6, 7, 8, 9].includes(formik.values.stageType) && (
                <Alert severity="info">
                  {metadata?.nextRequiredAction ||
                    'Authorized staff complete this stage using the application actions.'}
                </Alert>
              )}
            </>
          )}
          {tabs.value === 'settings' && (
            <>
              <WorkflowStageCompletionSummary
                stage={formik.values}
                error={formik.errors.configurationJson}
              />
              <WorkflowStageBehavior formik={formik} metadata={metadata} readOnly={readOnly} />
              <WorkflowStageNextSteps
                stage={formik.values}
                stages={stages}
                transitions={transitions}
              />
            </>
          )}
        </Stack>
      </Scrollbar>
    </Box>
  );
}
