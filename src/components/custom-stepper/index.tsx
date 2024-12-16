'use client';

import { useFormik } from 'formik';
import React, { useState } from 'react';

import { LoadingButton } from '@mui/lab';
import {
  Box,
  Step,
  Slide,
  styled,
  Button,
  Stepper,
  StepLabel,
  StepConnector,
  stepConnectorClasses,
} from '@mui/material';

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
  scrollbarHeight?: string;
  activeStep: number;
  initialValues: any;
  steps: string[];
  handleNext: (
    isLastStep: boolean,
    value: any,
    formik: any,
    setIsLoading: (val: boolean) => void
  ) => void;
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
  errors?: boolean[];
}

const CustomStepLabel = styled(StepLabel)(({ theme, error }) => ({
  '& .MuiStepLabel-iconContainer': {
    color: error ? theme.palette.error.main : theme.palette.primary.main,
  },
  '& .MuiStepLabel-label': {
    color: error ? theme.palette.error.main : theme.palette.text.primary,
    fontWeight: error ? 'bold' : 'normal',
  },
}));

const QontoConnector = styled(StepConnector)(({ theme }) => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: {
    top: 10,
    left: 'calc(-50% + 16px)',
    right: 'calc(50% + 16px)',
  },
  [`&.${stepConnectorClasses.active}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      borderColor: theme.palette.primary.main,
    },
  },
  [`&.${stepConnectorClasses.completed}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      borderColor: theme.palette.primary.main,
    },
  },
  [`& .${stepConnectorClasses.line}`]: {
    borderColor: '#eaeaf0',
    borderTopWidth: 3,
    borderRadius: 1,
    ...theme.applyStyles('dark', {
      borderColor: theme.palette.grey[800],
    }),
  },
}));

export const CustomStepperWithFormik: React.FC<CustomStepperWithFormikProps> = ({
  scrollbarHeight = '40vh',
  activeStep,
  initialValues,
  steps,
  handleNext,
  handleBack,
  validationSchema,
  renderItem,
  onStepClick = () => { },
  errors = [],
}) => {
  const [isBackClick, setIsBackClick] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const formik = useFormik({
    initialValues,
    validationSchema,
    enableReinitialize: true,
    validateOnMount: true,
    onSubmit: (values) => {
      setIsBackClick(false);
      handleNext(activeStep === steps.length - 1, values, formik, setIsLoading);
    },
  });

  return (
    <Box sx={{ width: '100%', p: 2, }}>
      <Stepper activeStep={activeStep} alternativeLabel connector={<QontoConnector />}>
        {steps.map((label: string, index: number) => (
          <Step
            key={label}
            sx={{ cursor: 'pointer' }}
            onClick={() => {
              onStepClick?.(index, label, formik);
            }}
          >
            <CustomStepLabel
              error={errors[index]}
              sx={{ '& span': { fontSize: '12px', mt: '2px !important' } }}
            >
              {label}
            </CustomStepLabel>
          </Step>
        ))}
      </Stepper>
      <Box
        component="form"
        sx={{
          '& input': { fontSize: '12px' },
          '& textarea': { fontSize: '12px' },
          '& label': { fontSize: '12px' },
          '& .MuiSelect-select': { fontSize: '12px' },
        }}
        onSubmit={formik.handleSubmit}
      >
        <Scrollbar sx={{ height: scrollbarHeight }}>
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
          <LoadingButton
            variant="contained"
            color="primary"
            type="submit"
            size="small"
            loading={isLoading}
          // onClick={activeStep === steps.length - 1 ? undefined : handleNext}
          >
            {activeStep === steps.length - 1 ? 'Submit' : 'Next'}
          </LoadingButton>
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
