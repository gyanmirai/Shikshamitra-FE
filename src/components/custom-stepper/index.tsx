'use client';

import type { ButtonProps, StepIconProps } from '@mui/material';

import { useFormik } from 'formik';
import React, { useState } from 'react';
import { varAlpha } from 'src/theme/styles';
import { GlobalIcons } from 'src/utils/icons';
import { styled } from '@mui/material/styles';
import { useBoolean } from 'src/hooks/use-boolean';
import { useResponsive } from 'src/hooks/use-responsive';
import { stepConnectorClasses } from '@mui/material/StepConnector';
import {
  Box,
  Step,
  Button,
  Stepper,
  StepLabel,
  StepButton,
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
  orientation?: 'horizontal' | 'vertical';
  ariaLabel?: string;
  stepStates?: ('completed' | 'skipped' | 'error' | 'pending' | 'active')[];
  stepCaptions?: React.ReactNode[];
}

const CustomStepper: React.FC<CustomStepperProps> = ({
  steps,
  activeStep,
  orientation = 'horizontal',
  ariaLabel,
  stepStates,
  stepCaptions,
}) => (
  <Box sx={{ width: '100%' }}>
    <Stepper
      role="list"
      aria-label={ariaLabel}
      activeStep={activeStep}
      orientation={orientation}
      alternativeLabel={orientation === 'horizontal'}
      sx={{
        m: 0,
        p: 0,
        ...(orientation === 'vertical' && {
          '& .MuiStepConnector-line': { minHeight: 20 },
        }),
      }}
    >
      {steps.map((label, index) => (
        <Step
          role="listitem"
          key={`${index}-${label}`}
          completed={stepStates ? stepStates[index] === 'completed' : undefined}
          aria-current={index === activeStep ? 'step' : undefined}
          sx={{
            listStyle: 'none',
            '& svg': { height: 28, width: 28 },
            ...(stepStates?.[index] === 'skipped' && {
              '& .MuiStepIcon-root': { color: 'warning.main' },
            }),
            ...(stepStates?.[index] === 'error' && {
              '& .MuiStepIcon-root': { color: 'error.main' },
            }),
          }}
        >
          <StepLabel
            error={stepStates?.[index] === 'error'}
            optional={stepCaptions?.[index]}
            sx={{
              '& .MuiStepLabel-label': {
                typography: 'subtitle2',
                overflowWrap: 'anywhere',
              },
            }}
          >
            {label}
          </StepLabel>
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
  saveButtonLabel?: React.ReactNode;
  nextButtonLabel?: React.ReactNode;
  finalButtonLabel?: React.ReactNode;
  handleNext: (
    isLastStep: boolean,
    value: any,
    formik: any,
    setIsLoading: (val: boolean) => void
  ) => void;
  handleBack: () => void;
  onCancel?: () => void;
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
    top: 20.5,
    left: '-50%',
    right: '50%',
  },
  [`& .${stepConnectorClasses.line}`]: {
    borderColor: `var(--step-connector-color, ${theme.palette.grey[400]})`,
    borderTopWidth: 3,
    borderRadius: 1,
    ...theme.applyStyles('dark', {
      borderColor: `var(--step-connector-color, ${theme.palette.grey[600]})`,
    }),
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
        width: 28,
        height: 28,
        flexShrink: 0,
      }}
    >
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          bgcolor: (theme) => theme.palette.primary.main,
          opacity: active ? 0.15 : 0,
          transform: active ? 'scale(1)' : 'scale(0)',
          transition: 'opacity 300ms ease-out, transform 300ms ease-out',
          zIndex: 0,
          '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
        }}
      />

      <Box
        sx={{
          zIndex: 1,
          width: 28,
          height: 28,
          flexShrink: 0,
          boxSizing: 'border-box',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '50%',
          border: '2px solid',
          bgcolor: completed || active ? 'primary.main' : 'background.default',
          borderColor: completed || active ? 'primary.main' : 'grey.400',
          color: completed || active ? 'common.white' : 'text.primary',
          transition: 'background-color 300ms ease-out, border-color 300ms ease-out',
          '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
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
  onCancel,
  validationSchema,
  renderItem,
  onStepClick = () => {},
  completedSteps,
  isStepClickable,
  errors = [],
  validateOnChange = false,
  onSave = () => {},
  isDisabledLabel = false,
  showSaveButton = true,
  disableSubmit = false,
  saveButtonLabel = 'Save',
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
              pt: 1,
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
            sx={{
              cursor: isClickable ? 'pointer' : 'no-drop',
              ...(!isVertical && index > 0 && index <= activeStep && {
                '--step-connector-color': (theme) => theme.palette.primary.main,
              }),
            }}
          >
            <StepButton
              aria-label={`Step ${index + 1}: ${label}`}
              disabled={!isClickable}
              aria-current={index === activeStep ? 'step' : undefined}
              sx={{
                m: 0,
                p: 1,
                minHeight: 44,
                position: 'relative',
                zIndex: 1,
                '&.Mui-focusVisible': {
                  outline: '2px solid',
                  outlineColor: 'primary.main',
                  outlineOffset: -2,
                },
              }}
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
                  '& .MuiStepLabel-iconContainer': { display: 'block' },
                }}
                // @ts-ignore
                isdisabledlabel={`${isLabelDisabled}`}
                StepIconComponent={ModernStepIcon}
              >
                {label}
              </CustomStepLabel>
            </StepButton>
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
          disabled={(activeStep === 0 && !onCancel) || isBusy || Boolean(backButtonProps.disabled)}
          onClick={() => {
            setIsBackClick(true);
            if (activeStep === 0 && onCancel) onCancel();
            else handleBack();
          }}
        >
          {activeStep === 0 && onCancel ? 'Cancel' : 'Back'}
        </Button>
        <Box display="flex" gap={1}>
          {showSaveButton && <Button {...mergedSaveButtonProps}>{saveButtonLabel}</Button>}
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
