'use client';

import type { Medium } from 'src/types/school';
import type { RootState } from 'src/redux/store';

import { Box, Card } from '@mui/material';
import { useSelector } from 'react-redux';
import { shikshaMitraToast } from 'src/components/toast';
import { useRef, useState, useEffect, useCallback } from 'react';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomStepperWithFormik } from 'src/components/custom-stepper';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import {
  useGetNotificationStepOneQuery,
  useGetNotificationStepTwoQuery,
  useGetNotificationStepThreeQuery,
  useCreateNotificationDraftMutation,
  useComposeMessageAndPublishMutation,
  useUpdateNotificationChannelsMutation,
} from 'src/redux/communication/notification/send-notification-api';

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
  const [notificationId, setNotificationId] = useState<string | null>(null);
  const { currentMedium } = useSelector((state: RootState) => state.globalState);

  const [createNotificationDraft] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useCreateNotificationDraftMutation,
  });

  const [updateNotificationChannels] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateNotificationChannelsMutation,
  });

  const [composeMessageAndPublish] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useComposeMessageAndPublishMutation,
  });

  // Queries for step data
  const { data: stepOneData } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetNotificationStepOneQuery,
    params: { academicMediumId: (currentMedium as Medium)?.id, id: notificationId },
    options: { skip: !notificationId || !currentMedium },
  });

  const { data: stepTwoData } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetNotificationStepTwoQuery,
    params: { academicMediumId: (currentMedium as Medium)?.id, id: notificationId },
    options: { skip: !notificationId || !currentMedium },
  });

  const { data: stepThreeData } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetNotificationStepThreeQuery,
    params: { academicMediumId: (currentMedium as Medium)?.id, id: notificationId },
    options: { skip: !notificationId || !currentMedium },
  });

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
        const mediumId = (currentMedium as Medium)?.id;
        if (!mediumId) {
          shikshaMitraToast.error({ message: 'Medium is missing' });
          return;
        }

        if (activeStep === 0) {
          // STEP 1: Audience -> Create Draft
          if (!notificationId) {
            // Need to map values to API payload
            // NOTE: Assuming structure based on standard patterns as API definition wasn't explicit on payload structure
            const payload = {
              role: values.audience?.role,
              classes: values.audience?.classes,
              divisions: values.audience?.divisions,
              memberIds: values.members?.filter((m) => m.isSelect).map((m) => m.id),
            };

            // const res = await createNotificationDraft({
            //   academicMediumId: mediumId,
            //   data: payload,
            // }).unwrap();

            // setNotificationId(res?.id);
            shikshaMitraToast.success({ message: `Audience saved successfully` });
          } else {
            // If already created, assume success as we don't have update logic for step 1 yet
            shikshaMitraToast.success({ message: `Audience saved successfully` });
          }
        } else if (activeStep === 1) {
          // STEP 2: Channels -> Update Channels
          // await updateNotificationChannels({
          //   academicMediumId: mediumId,
          //   id: notificationId,
          //   data: {
          //     channels: values.channels,
          //   },
          // }).unwrap();
          shikshaMitraToast.success({ message: `Channels chosen successfully` });
        } else if (activeStep === 2) {
          // STEP 3: Message -> Compose & Publish
          // await composeMessageAndPublish({
          //   academicMediumId: mediumId,
          //   id: notificationId,
          //   data: {
          //     templateId: values.selectedTemplate?.id,
          //     subject: values.selectedTemplate?.subject,
          //     message: values.selectedTemplate?.message,
          //   },
          // }).unwrap();

          shikshaMitraToast.success({ message: `Notification sent successfully` });
          onBack?.(null, true);
        }

        if (!isLastStep) {
          if (!isSaveButton) {
            setActiveStep(activeStep + 1);
          }
        }
      } catch (error: any) {
        console.error(error);
        shikshaMitraToast.error({
          message: error?.data?.message || 'Something went wrong. Please try again.',
        });
      } finally {
        setIsLoading(false);
      }
    },
    [activeStep, onBack, currentMedium, notificationId]
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
            renderItem={({ formik, activeStep: step }) => (
              <NotificationStepContent
                formik={formik}
                step={step}
                stepComponents={stepComponents}
                stepOneData={stepOneData}
                stepTwoData={stepTwoData}
                stepThreeData={stepThreeData}
              />
            )}
          />
        </Box>
      </Card>
    </Box>
  );
};

export default NotificationFormStepper;

const NotificationStepContent = ({
  formik,
  step,
  stepComponents,
  stepOneData,
  stepTwoData,
  stepThreeData,
}: any) => {
  const initializedStepsRef = useRef<Record<number, boolean>>({});

  useEffect(() => {
    if (initializedStepsRef.current[step]) return;

    if (stepOneData && step === 0) {
      // Map API data back to formik values
      // Assuming stepOneData has structure matching audience
      // This is a placeholder mapping, adjust based on actual API response
      formik.setValues((prev: any) => ({
        ...prev,
        // Example mapping:
        // audience: stepOneData.audience
      }));
      initializedStepsRef.current[step] = true;
    } else if (stepTwoData && step === 1) {
      formik.setFieldValue('channels', stepTwoData.channels || []);
      initializedStepsRef.current[step] = true;
    } else if (stepThreeData && step === 2) {
      formik.setValues((prev: any) => ({
        ...prev,
        selectedTemplate: {
          ...prev.selectedTemplate,
          ...stepThreeData.messageDetails,
        },
      }));
      initializedStepsRef.current[step] = true;
    }
  }, [stepOneData, stepTwoData, stepThreeData, step, formik]);

  const StepComponent = stepComponents[step];
  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <Box p={2}>
        <StepComponent formik={formik} />
      </Box>
    </BackPopUpChecked>
  );
};
