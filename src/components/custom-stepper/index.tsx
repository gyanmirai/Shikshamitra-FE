'use client';

import type { ButtonProps, StepIconProps } from '@mui/material';

import { useFormik } from 'formik';
import { varAlpha } from 'src/theme/styles';
import { GlobalIcons } from 'src/utils/icons';
import React, { useId, useState } from 'react';
import { useBoolean } from 'src/hooks/use-boolean';
import { alpha, styled } from '@mui/material/styles';
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
import CustomTooltip from '../custom-tooltip';
import { mergeStepperButtonProps } from './button-props';
import {
  focusFirstFormikError,
  shouldValidateCurrentStep,
  shouldValidateForwardStepClick,
} from './formik-validation';

interface CustomStepperProps {
  steps: string[];
  activeStep: number;
  orientation?: 'horizontal' | 'vertical';
  ariaLabel?: string;
  stepStates?: ('completed' | 'skipped' | 'error' | 'pending' | 'active')[];
  stepCaptions?: React.ReactNode[];
  onStepClick?: (index: number) => void;
  isStepClickable?: (index: number) => boolean;
  getStepAriaLabel?: (label: string, index: number) => string;
  disabled?: boolean;
  iconOnly?: boolean;
  density?: 'standard' | 'compact';
  continuousVerticalTrack?: boolean;
}

const CustomStepper: React.FC<CustomStepperProps> = ({
  steps,
  activeStep,
  orientation = 'horizontal',
  ariaLabel,
  stepStates,
  stepCaptions,
  onStepClick,
  isStepClickable,
  getStepAriaLabel,
  disabled = false,
  iconOnly = false,
  density = 'standard',
  continuousVerticalTrack = false,
}) => {
  const captionId = useId();
  const alternativeLabel = orientation === 'horizontal' && density === 'standard';
  const markerSize = density === 'compact' && !iconOnly ? 20 : 28;
  const connectMarkers = orientation === 'vertical' && continuousVerticalTrack;
  const connectorColor = (from: number) => {
    const next = stepStates?.[from + 1];
    return stepStates?.[from] === 'completed' && (next === 'completed' || next === 'active')
      ? 'primary.main'
      : 'divider';
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Stepper
        role="list"
        aria-label={ariaLabel}
        activeStep={activeStep}
        orientation={orientation}
        alternativeLabel={alternativeLabel}
        nonLinear={Boolean(onStepClick)}
        connector={connectMarkers ? null : undefined}
        sx={(theme) => ({
          m: 0,
          p: 0,
          '--step-marker-size': `${markerSize}px`,
          '--step-button-padding': theme.spacing(1),
          ...(alternativeLabel && {
            '--step-connector-width': '2px',
            '--step-connector-inset': `calc(var(--step-marker-size) / 2 + ${theme.spacing(0.75)})`,
            '& .MuiStep-root': { minWidth: 0 },
            '& .MuiStepConnector-alternativeLabel': {
              top: `calc((var(--step-marker-size) - var(--step-connector-width)) / 2${
                onStepClick ? ' + var(--step-button-padding)' : ''
              })`,
              left: 'calc(-50% + var(--step-connector-inset))',
              right: 'calc(50% + var(--step-connector-inset))',
            },
            '& .MuiStepConnector-line': {
              borderTopWidth: 'var(--step-connector-width)',
              borderTopStyle: 'dashed',
            },
            '& .MuiStepConnector-root.Mui-completed .MuiStepConnector-line, & .MuiStep-root.Mui-completed + .MuiStep-root .MuiStepConnector-root.Mui-active .MuiStepConnector-line':
              {
                borderColor: 'primary.main',
                borderTopStyle: 'solid',
              },
            '& .MuiStepLabel-label.MuiStepLabel-alternativeLabel': { mt: 1 },
            '& .MuiStepIcon-root.Mui-active': {
              outline: '2px solid',
              outlineColor: 'primary.light',
              outlineOffset: 1,
              borderRadius: '50%',
            },
          }),
          ...(density === 'compact' && {
            '& .MuiStepConnector-root': { mx: 0.5 },
            '& .MuiStepLabel-iconContainer': { pr: 0.5 },
          }),
          ...(orientation === 'vertical' && {
            '& .MuiStepConnector-line': { minHeight: 20 },
            ...(iconOnly && { '& .MuiStepConnector-root': { ml: 2.75 } }),
          }),
          ...(connectMarkers && {
            '--step-track-gap': theme.spacing(2.5),
            '--step-track-width': '2px',
            '--step-track-offset': `calc((var(--step-marker-size) - var(--step-track-width)) / 2 + ${
              onStepClick ? 'var(--step-button-padding)' : '0px'
            } + ${density === 'compact' ? theme.spacing(0.5) : '0px'})`,
            rowGap: 'var(--step-track-gap)',
            '& .MuiStep-root': {
              position: 'relative',
              minWidth: 0,
              ...(iconOnly && { '& > span': { display: 'block' } }),
            },
            '& .MuiStepButton-root': { display: 'flex' },
            '& .MuiStepLabel-root': { minWidth: 0 },
            '& .MuiStep-root::before, & .MuiStep-root::after': {
              position: 'absolute',
              insetInlineStart: 'var(--step-track-offset)',
              width: 'var(--step-track-width)',
              pointerEvents: 'none',
            },
          }),
        })}
      >
        {steps.map((label, index) => {
          const state = stepStates?.[index] ?? (index === activeStep ? 'active' : 'pending');
          // MUI's completed circle is inset by 2 units in its 24-unit SVG viewBox.
          const markerInset =
            state === 'completed' && !iconOnly ? 'var(--step-marker-size) / 12' : '0px';
          const markerEdge = `calc(50% + var(--step-marker-size) / 2 - ${markerInset})`;
          const caption = stepCaptions?.[index];
          const stepCaptionId =
            onStepClick && caption != null && !iconOnly ? `${captionId}-${index}` : undefined;
          const captionContent = stepCaptionId ? (
            <Box
              component="span"
              id={stepCaptionId}
              sx={alternativeLabel ? { display: 'block', mt: 0.5 } : undefined}
            >
              {caption}
            </Box>
          ) : (
            caption
          );
          const numberIcon = iconOnly ? (
            <Box
              component="span"
              aria-hidden
              sx={{
                width: 'var(--step-marker-size)',
                height: 'var(--step-marker-size)',
                display: 'grid',
                placeItems: 'center',
                borderRadius: '50%',
                typography: 'subtitle2',
                bgcolor:
                  state === 'error'
                    ? 'error.main'
                    : state === 'skipped'
                      ? 'warning.main'
                      : index === activeStep || state === 'completed'
                        ? 'primary.main'
                        : 'text.disabled',
                color: 'common.white',
              }}
            >
              {index + 1}
            </Box>
          ) : undefined;
          const stepLabel = (
            <StepLabel
              icon={numberIcon}
              error={state === 'error'}
              optional={captionContent}
              sx={{
                '& .MuiStepLabel-label': {
                  typography: density === 'compact' ? 'caption' : 'subtitle2',
                  overflowWrap: 'anywhere',
                },
                ...(iconOnly && {
                  '& .MuiStepLabel-labelContainer': { display: 'none' },
                  '& .MuiStepLabel-iconContainer': { pr: 0 },
                }),
              }}
            >
              {label}
            </StepLabel>
          );
          const content = onStepClick ? (
            <StepButton
              type="button"
              aria-label={getStepAriaLabel?.(label, index) ?? label}
              aria-description={iconOnly ? state : undefined}
              aria-describedby={stepCaptionId}
              disabled={disabled || isStepClickable?.(index) === false}
              icon={numberIcon}
              optional={captionContent}
              aria-current={index === activeStep ? 'step' : undefined}
              onClick={() => onStepClick(index)}
              sx={{
                m: 0,
                p: 'var(--step-button-padding)',
                width: '100%',
                boxSizing: 'border-box',
                textAlign: alternativeLabel ? 'center' : 'left',
                ...(iconOnly && {
                  minHeight: 44,
                  borderRadius: 1,
                  ...(index === activeStep && { bgcolor: 'action.selected' }),
                }),
                '&.Mui-focusVisible': {
                  outline: '2px solid',
                  outlineColor: 'primary.main',
                  outlineOffset: -2,
                },
              }}
            >
              {stepLabel}
            </StepButton>
          ) : (
            stepLabel
          );
          return (
            <Step
              role="listitem"
              key={`${index}-${label}`}
              completed={stepStates ? state === 'completed' : undefined}
              aria-current={index === activeStep ? 'step' : undefined}
              sx={{
                listStyle: 'none',
                ...(density === 'compact' && { px: 0.5 }),
                '& .MuiStepIcon-root': {
                  height: 'var(--step-marker-size)',
                  width: 'var(--step-marker-size)',
                },
                ...(state === 'skipped' && { '& .MuiStepIcon-root': { color: 'warning.main' } }),
                ...(state === 'error' && { '& .MuiStepIcon-root': { color: 'error.main' } }),
                ...(connectMarkers &&
                  index > 0 && {
                    '&::before': {
                      content: '""',
                      insetBlockStart: 0,
                      insetBlockEnd: markerEdge,
                      bgcolor: connectorColor(index - 1),
                    },
                  }),
                ...(connectMarkers &&
                  index < steps.length - 1 && {
                    '&::after': {
                      content: '""',
                      insetBlockStart: markerEdge,
                      insetBlockEnd: 'calc(-1 * var(--step-track-gap))',
                      bgcolor: connectorColor(index),
                    },
                  }),
              }}
            >
              {iconOnly ? (
                <CustomTooltip title={`${label} — ${state}`} placement="right" arrow>
                  <span>{content}</span>
                </CustomTooltip>
              ) : (
                content
              )}
            </Step>
          );
        })}
      </Stepper>
    </Box>
  );
};
export default CustomStepper;

interface CustomStepperWithFormikProps {
  scrollbarHeight?: string;
  /** Use regions when the active step supplies independently scrolling workspace panels. */
  contentScrollMode?: 'step' | 'regions';
  activeStep: number;
  initialValues: any;
  steps: string[];
  formikInstance?: any;
  validateOnChange?: boolean;
  saveButtonLabel?: React.ReactNode;
  nextButtonLabel?: React.ReactNode;
  finalButtonLabel?: React.ReactNode;
  loadingLabel?: string;
  footerPlacement?: 'outside' | 'content';
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
  onSaveValidationError?: () => void;
  validationSchema: any;
  renderItem: ({
    formik,
    activeStep,
    isBackClick,
    footer,
  }: {
    formik: any;
    activeStep: number;
    isBackClick: boolean;
    footer?: React.ReactNode;
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
  renderProgress?: (state: { busy: boolean; submitCurrentStep: () => void }) => React.ReactNode;
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
  const { active, completed, error, icon } = props;

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
          bgcolor: error
            ? 'error.main'
            : completed || active
              ? 'primary.main'
              : 'background.default',
          borderColor: error ? 'error.main' : completed || active ? 'primary.main' : 'grey.400',
          color: error || completed || active ? 'common.white' : 'text.primary',
          transition: 'background-color 300ms ease-out, border-color 300ms ease-out',
          '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
        }}
      >
        {error ? (
          <Box component="span" aria-label="Needs attention">
            !
          </Box>
        ) : completed ? (
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
  contentScrollMode = 'step',
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
  onSaveValidationError,
  isDisabledLabel = false,
  showSaveButton = true,
  disableSubmit = false,
  saveButtonLabel = 'Save',
  nextButtonLabel = 'Save & Next',
  finalButtonLabel = 'Submit',
  loadingLabel = 'Saving...',
  saveButtonProps = {},
  backButtonProps = {},
  saveAndNextButtonProps = {},
  validateFinalStep = true,
  validateForwardStepClick = false,
  renderProgress,
  viewMode = 'horizontal', // Default to horizontal
  footerPlacement = 'outside',
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
    if (saveAndNextButtonProps.disabled || (isLastStep && disableSubmit)) return;
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
      onSaveValidationError?.();
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
                  bgcolor: (theme) =>
                    theme.vars
                      ? varAlpha(theme.vars.palette.primary.mainChannel, 0.08)
                      : alpha(theme.palette.primary.main, 0.08),
                  '&:hover': {
                    bgcolor: (theme) =>
                      theme.vars
                        ? varAlpha(theme.vars.palette.primary.mainChannel, 0.12)
                        : alpha(theme.palette.primary.main, 0.12),
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
              minWidth: 0,
              flexShrink: 0,
              p: isMobile ? 1 : 0,
              pt: 1,
              '& .MuiStep-root': { flex: '1 1 0', minWidth: 0 },
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
                minWidth: 0,
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
              ...(!isVertical &&
                index > 0 &&
                index <= activeStep && {
                  '--step-connector-color': (theme) => theme.palette.primary.main,
                }),
            }}
          >
            <StepButton
              aria-label={`Step ${index + 1}: ${label}`}
              aria-invalid={errors[index] || undefined}
              disabled={!isClickable}
              aria-current={index === activeStep ? 'step' : undefined}
              sx={{
                m: 0,
                p: 1,
                width: '100%',
                boxSizing: 'border-box',
                minWidth: 0,
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

  const renderFooter = () => (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 1,
        position: 'sticky',
        bottom: 0,
        flexShrink: footerPlacement === 'content' ? 0 : undefined,
        backgroundColor: 'background.paper',
        p: footerPlacement === 'content' ? 1.5 : 2,
        borderTop: isVertical || footerPlacement === 'content' ? '1px solid' : 'none',
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
      <Box display="flex" flexWrap="wrap" justifyContent="flex-end" gap={1} sx={{ ml: 'auto' }}>
        {showSaveButton && <Button {...mergedSaveButtonProps}>{saveButtonLabel}</Button>}
        <Button {...mergedSaveAndNextButtonProps}>
          {activeStep === steps.length - 1 ? finalButtonLabel : nextButtonLabel}
        </Button>
      </Box>
    </Box>
  );
  const renderFormContent = () => (
    <Box
      component="form"
      noValidate
      inert={isBusy}
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
      {contentScrollMode === 'regions' ? (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            minHeight: 0,
            overflow: 'hidden',
          }}
        >
          {formik &&
            renderItem({
              formik,
              activeStep,
              isBackClick,
              footer: footerPlacement === 'content' ? renderFooter() : undefined,
            })}
        </Box>
      ) : (
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
          {formik &&
            renderItem({
              formik,
              activeStep,
              isBackClick,
              footer: footerPlacement === 'content' ? renderFooter() : undefined,
            })}
        </Scrollbar>
      )}

      {footerPlacement === 'outside' && renderFooter()}
    </Box>
  );

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        minWidth: 0,
        minHeight: 0,
        display: 'flex',
        flexDirection: isVertical ? 'row' : 'column',
        position: 'relative',
      }}
      aria-busy={isBusy}
    >
      {renderProgress ? renderProgress({ busy: isBusy, submitCurrentStep }) : renderStepper()}
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
            bgcolor: (theme) =>
              theme.vars
                ? varAlpha(theme.vars.palette.background.paperChannel, 0.9)
                : alpha(theme.palette.background.paper, 0.9),
            backdropFilter: 'blur(4px)',
            cursor: 'wait',
          }}
        >
          <CircularProgress size={40} color="primary" aria-label={loadingLabel} />
          <Box component="span" sx={{ typography: 'body2', fontWeight: 600 }}>
            {loadingLabel}
          </Box>
        </Box>
      )}
    </Box>
  );
};
