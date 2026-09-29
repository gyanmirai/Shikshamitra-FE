import { LoadingButton } from '@mui/lab';
import { useBoolean } from 'src/hooks/use-boolean';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { CustomStepperWithFormik } from 'src/components/custom-stepper';

import { ReviewStep } from './steps/review-step';
import { PublishStep } from './steps/publish-step';
import { ConfigureStep } from './steps/configure-step';
import { PlanSubjectsStep } from './steps/plan-subjects-step';
import { WorkflowPermissionAlert } from './workflow-permission-alert';
import {
  GUIDED_SEATING_STEPS,
  getWorkflowValidationSchema,
  shouldConfirmAutomaticReallocation,
} from './workflow-config';

import type { GuidedStepProps } from './types';

export function GuidedSeatingStepper(props: GuidedStepProps) {
  const { workflow } = props;
  const automaticReplacementDialog = useBoolean();
  const allocatedStudents = workflow.selectedPlan?.allocatedStudents ?? 0;

  const continueWithAutomaticPreview = async () => {
    automaticReplacementDialog.onFalse();
    await workflow.handleNext(() => undefined);
  };

  return (
    <>
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
          if (
            shouldConfirmAutomaticReallocation(
              workflow.activeStep,
              workflow.formik.values.allocationMode,
              allocatedStudents
            )
          ) {
            automaticReplacementDialog.onTrue();
            return;
          }
          workflow.handleNext(setLoading);
        }}
        renderItem={() => <GuidedStepContent {...props} />}
        nextButtonLabel={workflow.nextLabel}
        finalButtonLabel={workflow.nextLabel}
        showSaveButton={false}
        saveAndNextButtonProps={{
          disabled: workflow.nextDisabled,
          loading: workflow.isBusy,
          sx: { minHeight: 40, minWidth: 0, px: 1 },
        }}
        viewMode="vertical"
      />
      <ConfirmDialog
        open={automaticReplacementDialog.value}
        onClose={workflow.isBusy ? () => undefined : automaticReplacementDialog.onFalse}
        icon="warning"
        title="Generate a new automatic arrangement?"
        content={
          <>
            This plan already has <strong>{allocatedStudents}</strong> saved seat assignment
            {allocatedStudents === 1 ? '' : 's'}. Automatic mode will rebuild the complete
            arrangement for every student from the selected rules. Saved seats remain unchanged
            until you apply the proposal on Review.
          </>
        }
        action={
          <LoadingButton
            variant="contained"
            loading={workflow.isBusy}
            onClick={continueWithAutomaticPreview}
          >
            Generate new preview
          </LoadingButton>
        }
      />
    </>
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
