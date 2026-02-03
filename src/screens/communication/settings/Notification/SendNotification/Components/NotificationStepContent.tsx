'use client';

import { Box } from '@mui/material';
import React, { memo, useRef, useEffect } from 'react';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';

interface NotificationStepContentProps {
  formik: any;
  step: number;
  stepComponents: any[];
  stepOneData: any;
  stepTwoData: any;
  stepThreeData: any;
}

/**
 * Component: NotificationStepContent
 * Responsibilities:
 * - Rendering the appropriate component for the current step
 * - Initializing Formik values when API data becomes available
 * - Wrapping content with `BackPopUpChecked` for navigation safety
 *
 * Memoization Justification:
 * Memoizing this component prevents unnecessary re-renders when parent states
 * (that aren't passed as props) change. It ensures that the heavy step
 * components are only updated when their direct dependencies change.
 */
const NotificationStepContent = memo(
  ({
    formik,
    step,
    stepComponents,
    stepOneData,
    stepTwoData,
    stepThreeData,
  }: NotificationStepContentProps) => {
    const initializedStepsRef = useRef<Record<number, boolean>>({});

    useEffect(() => {
      // Prevent re-initialization if already done for this step
      if (initializedStepsRef.current[step]) return;

      if (stepOneData && step === 0) {
        // Logic for mapping step one data to formik values
        // formik.setValues((prev: any) => ({ ...prev }));
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

    if (!StepComponent) return null;

    return (
      <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
        <Box p={2}>
          <StepComponent formik={formik} />
        </Box>
      </BackPopUpChecked>
    );
  }
);

NotificationStepContent.displayName = 'NotificationStepContent';

export default NotificationStepContent;
