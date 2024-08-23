'use client';

import React from 'react';
import { useFormik } from 'formik';

import { Box, Step, Button, Stepper, StepLabel } from '@mui/material';

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
  renderItem: ({ formik, activeStep }: { formik: any; activeStep: number }) => React.ReactNode;
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
  const formik = useFormik({
    initialValues,
    validationSchema,
    enableReinitialize: true,
    validateOnMount: true,
    onSubmit: (values) => {
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
          '& input': { fontSize: '12px' },
          '& label': { fontSize: '12px' },
        }}
        onSubmit={formik.handleSubmit}
      >
        {formik && renderItem({ formik, activeStep })}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
          <Button size="small" variant="outlined" disabled={activeStep === 0} onClick={handleBack}>
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
