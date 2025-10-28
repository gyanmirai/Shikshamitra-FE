'use client';

import { Box, Card } from '@mui/material';
import { useState, useCallback } from 'react';
import { shikshaMitraToast } from 'src/components/toast';
import { CustomStepperWithFormik } from 'src/components/custom-stepper';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';

import AudienceStep from './Components/AudienceStep';
import ChooseChannelsStep from './Components/ChooseChannelsStep';
import ComposeMessageStep from './Components/ComposeMessageStep';
import { notificationValidationSchema } from './Components/getSendValidationSchema';
import { getInitialNotificationData } from './Components/sendNotificationInitialValues';

import type { INotificationSendSchema } from './Components/type';

interface NotificationFormStepperProps {
  onBack?: (_e?: any, isSubmit?: boolean) => void;
}

const NotificationFormStepper = ({ onBack }: NotificationFormStepperProps) => {
  const [activeStep, setActiveStep] = useState(0);

  const steps = ['Select Audience', 'Choose Channels', 'Compose Message'];
  const stepComponents = [AudienceStep, ChooseChannelsStep, ComposeMessageStep];

  const handleSave = useCallback(
    async (
      isLastStep: boolean,
      values: INotificationSendSchema,
      formik: any,
      setIsLoading: (val: boolean) => void,
      isSaveButton: boolean = false
    ) => {
      setIsLoading(true);
      try {
        if (activeStep === 0) {
          shikshaMitraToast.success({
            message: `Audience selected successfully`,
          });
        } else if (activeStep === 1) {
          shikshaMitraToast.success({
            message: `Channels chosen successfully`,
          });
        } else if (activeStep === 2) {
          shikshaMitraToast.success({
            message: `Notification send successfully`,
          });
          onBack?.(null, true);
        }

        if (!isLastStep) {
          if (!isSaveButton) {
            setActiveStep(activeStep + 1);
          }
        }
      } catch (error) {
        console.error(error);
        shikshaMitraToast.error({
          message: 'Something went wrong. Please try again.',
        });
      } finally {
        setIsLoading(false);
      }
    },
    [activeStep, onBack]
  );

  return (
    <Box height="100%" display="flex" flexDirection="column">
      <Card sx={{ height: '100%', boxShadow: 'var(--shadows-4)' }}>
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <CustomStepperWithFormik
            scrollbarHeight="400px"
            initialValues={getInitialNotificationData()}
            steps={steps}
            activeStep={activeStep}
            validateOnChange
            handleBack={() => {
              if (activeStep === 0 && onBack) {
                onBack();
              } else {
                setActiveStep(activeStep - 1);
              }
            }}
            validationSchema={
              notificationValidationSchema[activeStep as keyof typeof notificationValidationSchema]
            }
            handleNext={(isLastStep, value, formik, setIsLoading) =>
              handleSave(isLastStep, value, formik, setIsLoading)
            }
            onSave={(isLastStep, value, formik, setIsLoading) =>
              handleSave(isLastStep, value, formik, setIsLoading, true)
            }
            renderItem={({ formik, activeStep: step }) => {
              const StepComponent = stepComponents[step];
              return (
                <BackPopUpChecked
                  initialValues={formik.initialValues}
                  currentValues={formik.values}
                >
                  <Box p={2}>
                    <StepComponent formik={formik} />
                  </Box>
                </BackPopUpChecked>
              );
            }}
          />
        </Box>
      </Card>
    </Box>
  );
};

export default NotificationFormStepper;
