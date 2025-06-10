'use client';

import { useFormik } from 'formik';
import React, { useState } from 'react';

import { LoadingButton } from '@mui/lab';
import {
  Box,
  Step,
  styled,
  Button,
  Stepper,
  StepLabel,
  StepConnector,
  stepConnectorClasses,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { GlobalIcons } from 'src/utils/icons';

import { Iconify } from '../iconify';
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
  validateOnChange?: boolean;
  handleNext: (
    isLastStep: boolean,
    value: any,
    formik: any,
    setIsLoading: (val: boolean) => void
  ) => void;
  handleBack: () => void;
  onSave?: (
    isLastStep: boolean,
    value: any,
    formik: any,
    setIsLoading: (val: boolean) => void
  ) => void;
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
  scrollbarHeight = 'auto',
  activeStep,
  initialValues,
  steps,
  handleNext,
  handleBack,
  validationSchema,
  renderItem,
  onStepClick = () => {},
  errors = [],
  validateOnChange = false,
  onSave = () => {},
}) => {
  const [isBackClick, setIsBackClick] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const isSaveLoading = useBoolean();
  const formik = useFormik({
    initialValues,
    validationSchema,
    enableReinitialize: true,
    validateOnMount: true,
    onSubmit: (values) => {
      setIsBackClick(false);
      handleNext(activeStep === steps.length - 1, values, formik, setIsLoading);
    },
    validateOnChange,
  });

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        p: 2,
      }}
    >
      <Stepper activeStep={activeStep} alternativeLabel connector={<QontoConnector />}>
        {steps.map((label: string, index: number) => (
          <Step
            key={label}
            id={`step-label-${index}`}
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
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          minHeight: 0, // Important for proper flex behavior
          position: 'relative',
        }}
        onSubmit={formik.handleSubmit}
      >
        <Scrollbar
          sx={{
            flex: 1,
            height: scrollbarHeight,
            overflow: 'auto',
            '& .simplebar-content': {
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
            },
          }}
        >
          {formik && renderItem({ formik, activeStep, isBackClick })}
        </Scrollbar>

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            mt: 2,
            position: 'sticky',
            bottom: 0,
            backgroundColor: 'background.paper',
            p: 2,
            // borderTop: '1px solid',
            // borderColor: 'divider',
          }}
        >
          <Button
            size="small"
            variant="outlined"
            disabled={activeStep === 0}
            onClick={() => {
              setIsBackClick(true);
              handleBack();
            }}
            startIcon={<Iconify icon="ic:round-arrow-back" width={20} />}
          >
            Back
          </Button>
          <Box display="flex" gap={2}>
            <LoadingButton
              variant="outlined"
              size="small"
              loading={isSaveLoading.value}
              startIcon={<Iconify icon={GlobalIcons.submit} />}
              onClick={async () => {
                const error = await formik.validateForm();
                console.log('🚀 ~ onClick={ ~ error:', error);

                if (Object.keys(error).length <= 0) {
                  onSave?.(
                    activeStep === steps.length - 1,
                    formik.values,
                    formik,
                    isSaveLoading.setValue
                  );
                } else {
                  const allTouched: Record<string, any> = {};
                  Object.keys(error).forEach((field) => {
                    allTouched[field as keyof typeof allTouched] = true;
                  });
                  formik.setTouched(allTouched);
                }
              }}
            >
              Save
            </LoadingButton>
            <LoadingButton
              variant="contained"
              // color="primary"
              type="submit"
              size="small"
              loading={isLoading}
              endIcon={
                activeStep === steps.length - 1 ? undefined : (
                  <Iconify icon="ic:round-arrow-forward" width={20} />
                )
              }
            >
              {activeStep === steps.length - 1 ? 'Submit' : 'Save & Next'}
            </LoadingButton>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
