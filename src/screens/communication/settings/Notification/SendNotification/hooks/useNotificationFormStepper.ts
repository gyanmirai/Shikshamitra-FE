'use client';

import type { Medium } from 'src/types/school';
import type { RootState } from 'src/redux/store';

import { useSelector } from 'react-redux';
import { useState, useCallback } from 'react';
import { shikshaMitraToast } from 'src/components/toast';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import {
  useGetNotificationStepOneQuery,
  useGetNotificationStepTwoQuery,
  useGetNotificationStepThreeQuery,
  useCreateNotificationDraftMutation,
  // useComposeMessageAndPublishMutation,
  useUpdateNotificationChannelsMutation,
} from 'src/redux/communication/notification/send-notification-api';

import type { INotificationSendSchema } from '../Components/type';

interface UseNotificationFormStepperProps {
  onBack?: (_e?: any, isSubmit?: boolean) => void;
}

/**
 * Hook: useNotificationFormStepper
 * Responsibilities:
 * - Managing active step and notification progress
 * - Orchestrating API queries and mutations for each step
 * - Handling save/publish logic
 */
export const useNotificationFormStepper = ({ onBack }: UseNotificationFormStepperProps) => {
  const [activeStep, setActiveStep] = useState(0);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [notificationId, setNotificationId] = useState<string | null>(null);
  const { currentMedium } = useSelector((state: RootState) => state.globalState);

  // Mutations
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [createNotificationDraft] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useCreateNotificationDraftMutation,
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [updateNotificationChannels] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateNotificationChannelsMutation,
  });

  // Queries
  const queryParams = { academicMediumId: (currentMedium as Medium)?.id, id: notificationId };
  const queryOptions = { skip: !notificationId || !currentMedium };

  const { data: stepOneData } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetNotificationStepOneQuery,
    params: queryParams,
    options: queryOptions,
  });

  const { data: stepTwoData } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetNotificationStepTwoQuery,
    params: queryParams,
    options: queryOptions,
  });

  const { data: stepThreeData } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetNotificationStepThreeQuery,
    params: queryParams,
    options: queryOptions,
  });

  /**
   * Memoization Justification:
   * This is a complex logic handler passed to the `CustomStepperWithFormik`.
   * Memoizing it prevents unnecessary re-renders of the stepper component tree.
   */
  const handleSave = useCallback(
    async (
      isLastStep: boolean,
      values: INotificationSendSchema,
      _formik: any,
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
            // const res = await createNotificationDraft({
            //   academicMediumId: mediumId,
            //   data: {
            //     role: values.audience?.role,
            //     classes: values.audience?.classes,
            //     divisions: values.audience?.divisions,
            //     memberIds: values.members?.filter((m) => m.isSelect).map((m) => m.id),
            //   },
            // }).unwrap();
            // setNotificationId(res?.id);
            shikshaMitraToast.success({ message: 'Audience saved successfully' });
          } else {
            shikshaMitraToast.success({ message: 'Audience saved successfully' });
          }
        } else if (activeStep === 1) {
          // STEP 2: Channels -> Update Channels
          // await updateNotificationChannels({
          //   academicMediumId: mediumId,
          //   id: notificationId,
          //   data: { channels: values.channels },
          // }).unwrap();
          shikshaMitraToast.success({ message: 'Channels chosen successfully' });
        } else if (activeStep === 2) {
          // STEP 3: Message -> Compose & Publish
          shikshaMitraToast.success({ message: 'Notification sent successfully' });
          onBack?.(null, true);
        }

        if (!isLastStep && !isSaveButton) {
          setActiveStep((prev) => prev + 1);
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

  const handleBack = useCallback(() => {
    if (activeStep === 0 && onBack) {
      onBack();
    } else {
      setActiveStep((prev) => prev - 1);
    }
  }, [activeStep, onBack]);

  return {
    activeStep,
    stepOneData,
    stepTwoData,
    stepThreeData,
    handleSave,
    handleBack,
  };
};
