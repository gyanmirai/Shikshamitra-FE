'use client';

import React, { useMemo } from 'react';
import { Box, Card } from '@mui/material';
import { CustomStepperWithFormik } from 'src/components/custom-stepper';

import AudienceStep from './Components/AudienceStep';
import ChooseChannelsStep from './Components/ChooseChannelsStep';
import ComposeMessageStep from './Components/ComposeMessageStep';
import NotificationStepContent from './Components/NotificationStepContent';
import { useNotificationFormStepper } from './hooks/useNotificationFormStepper';
import { notificationValidationSchema } from './Components/getSendValidationSchema';
import { getInitialNotificationData } from './Components/sendNotificationInitialValues';

interface NotificationFormStepperProps {
  onBack?: (_e?: any, isSubmit?: boolean) => void;
}

const STEPS = ['Select Audience', 'Choose Channels', 'Compose Message'];
const STEP_COMPONENTS = [AudienceStep, ChooseChannelsStep, ComposeMessageStep];

/**
 * Component: NotificationFormStepper
 * Responsibilities:
 * - Providing a high-level UI container for the multi-step notification form
 * - Orchestrating the stepper UI and connecting it to business logic
 */
const NotificationFormStepper = ({ onBack }: NotificationFormStepperProps) => {
  const { activeStep, stepOneData, stepTwoData, stepThreeData, handleSave, handleBack } =
    useNotificationFormStepper({ onBack });

  /**
   * Memoization Justification:
   * This render function is memoized to prevent re-creating the function
   * on every parent render, ensuring the `CustomStepperWithFormik`
   * receives a stable prop if its other dependencies don't change.
   */
  const renderStepItem = useMemo(
    () =>
      // eslint-disable-next-line react/no-unstable-nested-components
      ({ formik, activeStep: step }: any) => (
        <NotificationStepContent
          formik={formik}
          step={step}
          stepComponents={STEP_COMPONENTS}
          stepOneData={stepOneData}
          stepTwoData={stepTwoData}
          stepThreeData={stepThreeData}
        />
      ),
    [stepOneData, stepTwoData, stepThreeData]
  );

  return (
    <Box height="100%" display="flex" flexDirection="column">
      <Card sx={{ height: '100%', boxShadow: 'var(--shadows-4)' }}>
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <CustomStepperWithFormik
            scrollbarHeight="400px"
            initialValues={getInitialNotificationData()}
            steps={STEPS}
            activeStep={activeStep}
            validateOnChange
            handleBack={handleBack}
            validationSchema={
              notificationValidationSchema[activeStep as keyof typeof notificationValidationSchema]
            }
            handleNext={(isLastStep, value, formik, setIsLoading) =>
              handleSave(isLastStep, value, formik, setIsLoading)
            }
            onSave={(isLastStep, value, formik, setIsLoading) =>
              handleSave(isLastStep, value, formik, setIsLoading, true)
            }
            renderItem={renderStepItem}
          />
        </Box>
      </Card>
    </Box>
  );
};

export default NotificationFormStepper;
