import { CustomStepperWithFormik } from 'src/components/custom-stepper';

import { ReviewStep } from './steps/review-step';
import { PublishStep } from './steps/publish-step';
import { ConfigureStep } from './steps/configure-step';
import { PlanSubjectsStep } from './steps/plan-subjects-step';
import { WorkflowPermissionAlert } from './workflow-permission-alert';
import { GUIDED_SEATING_STEPS, getWorkflowValidationSchema } from './workflow-config';

import type { GuidedStepProps } from './types';

export function GuidedSeatingStepper(props: GuidedStepProps) {
  const { workflow } = props;

  return (
    <CustomStepperWithFormik
      activeStep={workflow.activeStep}
      steps={GUIDED_SEATING_STEPS}
      initialValues={workflow.formik.initialValues}
      formikInstance={workflow.formik}
      validationSchema={getWorkflowValidationSchema(workflow.activeStep)}
      completedSteps={Array.from({ length: workflow.activeStep }, (_, index) => index)}
      isStepClickable={(index) => index <= workflow.activeStep}
      onStepClick={(index) => workflow.openStep(index)}
      handleBack={workflow.handleBack}
      handleNext={(_isLast, _values, _formik, setLoading) => {
        workflow.handleNext(setLoading);
      }}
      renderItem={() => <GuidedStepContent {...props} />}
      nextButtonLabel={workflow.nextLabel}
      finalButtonLabel={workflow.nextLabel}
      showSaveButton={false}
      saveAndNextButtonProps={{
        disabled: workflow.nextDisabled,
        loading: workflow.isBusy,
        sx: { minHeight: 44, px: 2.5 },
      }}
      viewMode="vertical"
    />
  );
}

function GuidedStepContent(props: GuidedStepProps) {
  const { workflow } = props;
  const { activeStep } = workflow;
  let content = <PublishStep {...props} />;
  if (activeStep === 0) content = <PlanSubjectsStep {...props} />;
  if (activeStep === 1) content = <ConfigureStep {...props} />;
  if (activeStep === 2) content = <ReviewStep {...props} />;
  return (
    <>
      <WorkflowPermissionAlert workflow={workflow} />
      {content}
    </>
  );
}
