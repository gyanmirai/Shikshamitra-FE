'use client';

import type { ButtonProps, StepIconProps } from '@mui/material';

import { useFormik } from 'formik';
import React, { useState } from 'react';
import { varAlpha } from 'src/theme/styles';
import { GlobalIcons } from 'src/utils/icons';
import { styled } from '@mui/material/styles';
import { useBoolean } from 'src/hooks/use-boolean';
import { motion, AnimatePresence } from 'framer-motion';
import { useResponsive } from 'src/hooks/use-responsive';
import { stepConnectorClasses } from '@mui/material/StepConnector';
import {
  Box,
  Step,
  Button,
  Stepper,
  StepLabel,
  StepConnector,
  CircularProgress,
} from '@mui/material';

import { Iconify } from '../iconify';
import { Scrollbar } from '../scrollbar';
import { mergeStepperButtonProps } from './button-props';
import {
  focusFirstFormikError,
  shouldValidateCurrentStep,
  shouldValidateForwardStepClick,
} from './formik-validation';

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
  formikInstance?: any;
  validateOnChange?: boolean;
  nextButtonLabel?: React.ReactNode;
  finalButtonLabel?: React.ReactNode;
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
  completedSteps?: number[];
  isStepClickable?: (index: number) => boolean;
  errors?: boolean[];
  isDisabledLabel?: boolean;
  showSaveButton?: boolean;
  disableSubmit?: boolean;
  saveButtonProps?: ButtonProps;
  backButtonProps?: ButtonProps;
  saveAndNextButtonProps?: ButtonProps;
  validateFinalStep?: boolean;
  validateForwardStepClick?: boolean;
  viewMode?: 'horizontal' | 'vertical'; // Add this line
}

const CustomStepLabel = styled(StepLabel)(({ theme, error, isdisabledlabel }: any) => {
  isdisabledlabel = isdisabledlabel === 'true';
  return {
    '& .MuiStepLabel-root': {
      padding: '0px !important',
    },
    '&.Mui-disabled': { cursor: 'default !important' },
    '& .MuiStepLabel-iconContainer': {
      color: error ? theme.palette.error.main : theme.palette.primary.main,
    },
    '& .MuiStepLabel-label': {
      color: error ? theme.palette.error.main : theme.vars.palette.text.primary,
      fontWeight: error ? 'bold' : 'normal',
    },
    '& .MuiStepLabel-iconContainer.Mui-disabled': {
      cursor: isdisabledlabel ? 'no-drop' : 'pointer !important',
      transition: 'all 0.3s ease-in-out',
      '& svg:hover': { opacity: isdisabledlabel ? 1 : 0.72 },
    },
  };
});

const QontoConnector = styled(StepConnector)(({ theme }) => ({
  '&.Mui-disabled': { cursor: 'pointer !important' },
  [`&.${stepConnectorClasses.alternativeLabel}`]: {
    top: 10,
    left: 'calc(-50% + 16px)',
    right: 'calc(50% + 16px)',
  },
  [`&.${stepConnectorClasses.active}`]: {
    [`& .${stepConnectorClasses.line}`]: { borderColor: theme.palette.primary.main },
  },
  [`&.${stepConnectorClasses.completed}`]: {
    [`& .${stepConnectorClasses.line}`]: { borderColor: theme.palette.primary.main },
  },
  [`& .${stepConnectorClasses.line}`]: {
    borderColor: '#eaeaf0',
    borderTopWidth: 3,
    borderRadius: 1,
    ...theme.applyStyles('dark', { borderColor: theme.vars.palette.grey[800] }),
  },
}));

const ModernStepIcon = (props: StepIconProps) => {
  const { active, completed, icon } = props;

  return (
    <Box
      sx={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 24,
        height: 24,
      }}
    >
      <AnimatePresence>
        {active && (
          <Box
            component={motion.div}
            layoutId="active-step-indicator"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            sx={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              bgcolor: (theme) => theme.palette.primary.main,
              opacity: 0.15,
              zIndex: 0,
            }}
          />
        )}
      </AnimatePresence>

      <Box
        component={motion.div}
        animate={{
          scale: active ? 1.1 : 1,
          backgroundColor: completed || active ? 'var(--palette-primary-main)' : 'rgba(0, 0, 0, 0)',
          borderColor:
            completed || active ? 'var(--palette-primary-main)' : 'var(--palette-grey-400)',
        }}
        sx={{
          zIndex: 1,
          width: 24,
          height: 24,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '50%',
          border: '2px solid',
          bgcolor: (theme) =>
            completed || active ? theme.palette.primary.main : 'rgba(0, 0, 0, 0)',
          color: (theme) => (completed || active ? '#fff' : theme.palette.text.secondary),
        }}
      >
        {completed ? (
          <Iconify icon="eva:checkmark-fill" width={16} />
        ) : (
          <Box
            component="span"
            sx={{
              fontSize: '0.75rem',
              fontWeight: 700,
            }}
          >
            {icon}
          </Box>
        )}
      </Box>
    </Box>
  );
};

const ModernConnector = styled(StepConnector)(({ theme }) => ({
  [`&.${stepConnectorClasses.vertical}`]: {
    marginLeft: 14, // EXACT center of 32px icon
  },

  [`& .${stepConnectorClasses.line}`]: {
    borderColor: theme.palette.grey[300],
    transition: 'all 0.3s ease-in-out',
  },

  [`& .${stepConnectorClasses.lineVertical}`]: {
    borderLeftWidth: 2,
    minHeight: '100%',
    marginLeft: '6px',
    borderColor: theme.palette.grey[300],
  },

  [`&.${stepConnectorClasses.active} .${stepConnectorClasses.lineVertical}`]: {
    borderColor: theme.palette.primary.main,
  },

  [`&.${stepConnectorClasses.completed} .${stepConnectorClasses.lineVertical}`]: {
    borderColor: theme.palette.primary.main,
  },
}));

const markTouchedFromErrors = (errors: any): any => {
  if (Array.isArray(errors)) {
    return errors.map(markTouchedFromErrors);
  }

  if (errors && typeof errors === 'object') {
    return Object.keys(errors).reduce(
      (acc, key) => ({
        ...acc,
        [key]: markTouchedFromErrors(errors[key]),
      }),
      {}
    );
  }

  return true;
};

export const CustomStepperWithFormik: React.FC<CustomStepperWithFormikProps> = ({
  scrollbarHeight = 'auto',
  activeStep,
  initialValues,
  steps,
  formikInstance,
  handleNext,
  handleBack,
  validationSchema,
  renderItem,
  onStepClick = () => { },
  completedSteps,
  isStepClickable,
  errors = [],
  validateOnChange = false,
  onSave = () => { },
  isDisabledLabel = false,
  showSaveButton = true,
  disableSubmit = false,
  nextButtonLabel = 'Save & Next',
  finalButtonLabel = 'Submit',
  saveButtonProps = {},
  backButtonProps = {},
  saveAndNextButtonProps = {},
  validateFinalStep = true,
  validateForwardStepClick = false,
  viewMode = 'horizontal', // Default to horizontal
}) => {
  const isMobile = useResponsive('down', 'lg');
  const [isBackClick, setIsBackClick] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const isSaveLoading = useBoolean();
  const internalFormik = useFormik({
    initialValues,
    validationSchema,
    validateOnMount: true,
    onSubmit: (values) => {
      setIsBackClick(false);
      handleNext(activeStep === steps.length - 1, values, internalFormik, setIsLoading);
    },
    validateOnChange,
  });
  const formik = formikInstance ?? internalFormik;
  const isBusy =
    isSaveLoading.value ||
    isLoading ||
    Boolean(saveButtonProps.loading) ||
    Boolean(saveAndNextButtonProps.loading);

  React.useEffect(() => {
    formik.setTouched({});
    formik.setErrors({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeStep]);

  const isVertical = viewMode === 'vertical' && !isMobile;
  const hasExplicitCompletedSteps = Array.isArray(completedSteps);
  const submitCurrentStep = async () => {
    if (isBusy) return;

    setIsBackClick(false);

    const isLastStep = activeStep === steps.length - 1;
    if (shouldValidateCurrentStep(isLastStep, validateFinalStep)) {
      const validationErrors = await formik.validateForm();
      const hasValidationErrors = Object.keys(validationErrors).length > 0;

      if (hasValidationErrors) {
        formik.setTouched(markTouchedFromErrors(validationErrors), true);
        focusFirstFormikError(validationErrors);
        return;
      }
    }

    handleNext(isLastStep, formik.values, formik, setIsLoading);
  };
  const saveCurrentStep = async () => {
    if (isBusy) return;

    const validationErrors = await formik.validateForm();
    if (Object.keys(validationErrors).length <= 0) {
      onSave?.(activeStep === steps.length - 1, formik.values, formik, isSaveLoading.setValue);
    } else {
      formik.setTouched(markTouchedFromErrors(validationErrors), true);
      focusFirstFormikError(validationErrors);
    }
  };
  const mergedSaveButtonProps = mergeStepperButtonProps(
    {
      variant: 'outlined',
      size: 'small',
      startIcon: <Iconify icon={GlobalIcons.submit} />,
    },
    saveButtonProps,
    {
      loading: isSaveLoading.value || Boolean(saveButtonProps.loading),
      disabled: isBusy || Boolean(saveButtonProps.disabled),
      onClick: saveCurrentStep,
    }
  );
  const mergedSaveAndNextButtonProps = mergeStepperButtonProps(
    {
      variant: 'contained',
      type: 'button',
      size: 'small',
      startIcon: activeStep === steps.length - 1 ? <Iconify icon={GlobalIcons.submit} /> : null,
      endIcon:
        activeStep !== steps.length - 1 ? (
          <Iconify icon="ic:round-arrow-forward" width={20} />
        ) : null,
    },
    saveAndNextButtonProps,
    {
      loading: isLoading || Boolean(saveAndNextButtonProps.loading),
      disabled:
        isBusy ||
        Boolean(saveAndNextButtonProps.disabled) ||
        (activeStep === steps.length - 1 && disableSubmit),
      onClick: submitCurrentStep,
    }
  );

  const renderStepper = () => (
    <Stepper
      activeStep={activeStep}
      alternativeLabel={isVertical ? undefined : true}
      orientation={isVertical ? 'vertical' : 'horizontal'}
      connector={isVertical ? <ModernConnector /> : <QontoConnector />}
      sx={
        isVertical
          ? {
              minWidth: '250px', // Slightly wider for modern look
              p: 1,
              overflowY: 'auto',
              overflowX: 'hidden',
              borderRight: (theme) => `1px dashed ${theme.palette.divider}`,
              height: '100%',
              // '& .MuiStep-root': {
              //   mb: 2, // Spacing between steps
              // },
              '& .MuiStep-root': {
                padding: 0,
              },

              // '& .MuiStepLabel-root': {
              //   px: 1,
              //   py: 1,
              //   borderRadius: 1.5,
              //   transition: 'background-color 0.2s',
              // },

              // '& .MuiStepLabel-label': {
              //   ml: 1.5,
              //   typography: 'subtitle2',
              // },
              '& .MuiStepLabel-root': {
                px: 1,
                borderRadius: 1.5,
                transition: 'background-color 0.2s',
                '&:hover': {
                  bgcolor: (theme) => theme.palette.action.hover,
                },
                '&.Mui-active': {
                  bgcolor: (theme) => varAlpha(theme.palette.primary.mainChannel, 0.08),
                  '&:hover': {
                    bgcolor: (theme) => varAlpha(theme.palette.primary.mainChannel, 0.12),
                  },
                },
              },
              '& .MuiStepLabel-label': {
                typography: 'subtitle2',
                ml: 1.5,
                '&.Mui-active': {
                  color: 'primary.main',
                  fontWeight: 'bold',
                },
                '&.Mui-completed': {
                  color: 'text.primary',
                },
              },
            }
          : {
              p: isMobile ? 1 : 0,
              '& .MuiStepLabel-label': {
                display: 'block',
                fontSize: isMobile ? '10px' : '12px',
                mt: '4px !important',
                textAlign: 'center',
                lineHeight: 1.2,
                wordBreak: 'break-word',
              },
              '& .MuiStepLabel-labelContainer': {
                width: '100%',
              },
            }
      }
    >
      {/* <Scrollbar
        sx={{
          height: '100%',
          overflowY: 'auto',
        }}
      > */}
      {steps.map((label: string, index: number) => {
        const isClickable = !isBusy && (isStepClickable ? isStepClickable(index) : true);
        const isLabelDisabled = isStepClickable ? !isClickable : isDisabledLabel;

        return (
          <Step
            key={label}
            id={`step-label-${index}`}
            completed={hasExplicitCompletedSteps ? completedSteps.includes(index) : undefined}
            sx={{ cursor: isClickable ? 'pointer' : 'no-drop' }}
            onClick={async () => {
              if (!isClickable) return;

              if (shouldValidateForwardStepClick(activeStep, index, validateForwardStepClick)) {
                const validationErrors = await formik.validateForm();
                if (Object.keys(validationErrors).length > 0) {
                  formik.setTouched(markTouchedFromErrors(validationErrors), true);
                  focusFirstFormikError(validationErrors);
                  return;
                }
              }

              onStepClick?.(index, label, formik);
            }}
          >
            <CustomStepLabel
              error={errors[index]}
              sx={{
                '& span': { fontSize: '12px', mt: '2px !important' },
                '& .MuiStepLabel-iconContainer': { display: 'block' },
              }}
              // @ts-ignore
              isdisabledlabel={`${isLabelDisabled}`}
              StepIconComponent={ModernStepIcon}
            >
              {label}
            </CustomStepLabel>
          </Step>
        );
      })}
      {/* </Scrollbar> */}
    </Stepper>
  );

  const renderFormContent = () => (
    <Box
      component="form"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        minWidth: 0,
        minHeight: 0,
        position: 'relative',
        height: '100%',
      }}
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        submitCurrentStep();
      }}
    >
      <Scrollbar
        sx={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          position: 'relative',
          ...(scrollbarHeight !== 'auto' && scrollbarHeight
            ? { flex: 'none', height: scrollbarHeight }
            : {}),
          '& .simplebar-content': {
            display: 'flex',
            flexDirection: 'column',
            minHeight: '100%',
          },
        }}
      >
        {formik && renderItem({ formik, activeStep, isBackClick })}
      </Scrollbar>

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          position: 'sticky',
          bottom: 0,
          backgroundColor: 'background.paper',
          p: 2,
          borderTop: isVertical ? '1px solid' : 'none',
          borderColor: 'divider',
          zIndex: 10,
        }}
      >
        <Button
          size="small"
          variant="outlined"
          startIcon={<Iconify icon="mdi:arrow-left" width={20} />}
          {...backButtonProps}
          disabled={activeStep === 0 || isBusy || Boolean(backButtonProps.disabled)}
          onClick={() => {
            setIsBackClick(true);
            handleBack();
          }}
        >
          Back
        </Button>
        <Box display="flex" gap={1}>
          {showSaveButton && <Button {...mergedSaveButtonProps}>Save</Button>}
          <Button {...mergedSaveAndNextButtonProps}>
            {activeStep === steps.length - 1 ? finalButtonLabel : nextButtonLabel}
          </Button>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: isVertical ? 'row' : 'column',
        position: 'relative',
      }}
      aria-busy={isBusy}
    >
      {renderStepper()}
      {renderFormContent()}
      {isBusy && (
        <Box
          className="loading-overlay"
          role="status"
          aria-live="polite"
          sx={{
            position: 'absolute',
            inset: 0,
            zIndex: (theme) => theme.zIndex.modal + 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1.5,
            color: 'text.primary',
            bgcolor: (theme) => varAlpha(theme.vars.palette.background.paperChannel, 0.9),
            backdropFilter: 'blur(4px)',
            cursor: 'wait',
          }}
        >
          <CircularProgress size={40} color="primary" />
          <Box component="span" sx={{ typography: 'body2', fontWeight: 600 }}>
            Saving...
          </Box>
        </Box>
      )}
    </Box>
  );
};
