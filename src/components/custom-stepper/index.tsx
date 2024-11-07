'use client';

import { useFormik } from 'formik';
import React, { useState } from 'react';

import { Box, Step, Slide, Button, Stepper, StepLabel } from '@mui/material';

import { Scrollbar } from '../scrollbar';

// const steps = ['Personal Information', 'Contact Information', 'Review'];

interface CustomStepperProps {
  steps: string[];
  activeStep: number;
}

const CustomStepper: React.FC<CustomStepperProps> = ({ steps, activeStep }) => (
  <Box sx={{ width: '100%' }}>
    <Stepper activeStep={activeStep} alternativeLabel>
      {steps.map((label, index) => (
        <Step key={label} sx={{ '& svg': { height: '28px', width: '28px' } }}>
          <StepLabel sx={{ '& span': { fontSize: '12px' } }}>{label}</StepLabel>
        </Step>
      ))}
    </Stepper>
  </Box>
);

export default CustomStepper;

interface CustomStepperWithFormikProps {
  activeStep: number;
  initialValues: any;
  steps: string[];
  handleNext: (isLastStep: boolean, value: any) => void;
  handleBack: () => void;
  validationSchema: any;
  renderItem: ({
    formik,
    activeStep,
    isBackClick,
  }: {
    formik: any;
    activeStep: number;
    isBackClick: boolean;
  }) => any;
  onStepClick?: (index: number, label: string, formik: any) => void;
}

export const CustomStepperWithFormik: React.FC<CustomStepperWithFormikProps> = ({
  activeStep,
  initialValues,
  steps,
  handleNext,
  handleBack,
  validationSchema,
  renderItem,
  onStepClick = () => {},
}) => {
  const [isBackClick, setIsBackClick] = useState(false);
  const formik = useFormik({
    initialValues,
    validationSchema,
    enableReinitialize: true,
    validateOnMount: true,
    onSubmit: (values) => {
      setIsBackClick(false);
      handleNext(activeStep === steps.length - 1, values);
    },
  });

  return (
    <Box sx={{ width: '100%', p: 2 }}>
      <Stepper activeStep={activeStep} alternativeLabel>
        {steps.map((label: string, index: number) => (
          <Step
            key={label}
            sx={{ cursor: 'pointer' }}
            onClick={() => {
              onStepClick?.(index, label, formik);
            }}
          >
            <StepLabel sx={{ '& span': { fontSize: '12px', mt: '2px !important' } }}>
              {label}
            </StepLabel>
          </Step>
        ))}
      </Stepper>
      <Box
        component="form"
        sx={{
          '& input': { fontSize: '14px' },
          '& label': { fontSize: '12px' },
        }}
        onSubmit={formik.handleSubmit}
      >
        <Scrollbar sx={{ height: '40vh' }}>
          {' '}
          {/* <FormSlider step={activeStep} steps={steps}> */}
          {formik && renderItem({ formik, activeStep, isBackClick })}
          {/* </FormSlider> */}
        </Scrollbar>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
          <Button
            size="small"
            variant="outlined"
            disabled={activeStep === 0}
            onClick={() => {
              setIsBackClick(true);
              handleBack();
            }}
          >
            Back
          </Button>
          <Button
            variant="contained"
            color="primary"
            type="submit"
            size="small"
            // onClick={activeStep === steps.length - 1 ? undefined : handleNext}
          >
            {activeStep === steps.length - 1 ? 'Submit' : 'Next'}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

const FormSlider = ({
  step,
  steps,
  children,
}: {
  children: any;
  step: number;
  steps: string[];
}) => {
  const containerRef = React.useRef<HTMLElement>(null);
  return (
    <Box ref={containerRef} sx={{ p: 2, height: '100%', overflow: 'hidden' }}>
      {steps.map(
        (_, index) =>
          index === step && (
            <Slide
              in={index === step}
              container={containerRef.current}
              direction="left"
              key={index}
            >
              {children}
            </Slide>
          )
      )}
    </Box>
  );
};
