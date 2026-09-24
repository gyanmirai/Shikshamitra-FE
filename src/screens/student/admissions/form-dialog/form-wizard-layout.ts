import type { Theme, SxProps } from '@mui/material/styles';

// Only constrain the stepper's outer scroll content. Field libraries and the canvas
// keep their own natural-height scroll content inside the build step.
const stepperContent =
  '& > div > form > [data-simplebar] > .simplebar-wrapper > .simplebar-mask > .simplebar-offset > .simplebar-content-wrapper > .simplebar-content';
const stepperScrollWrapper =
  '& > div > form > [data-simplebar] > .simplebar-wrapper > .simplebar-mask > .simplebar-offset > .simplebar-content-wrapper';
const stepperHorizontalTrack =
  '& > div > form > [data-simplebar] > .simplebar-track.simplebar-horizontal';

export const getFormWizardLayout = (activeStep: number): SxProps<Theme> => ({
  height: 1,
  minHeight: 0,
  minWidth: 0,
  overflow: 'hidden',
  pt: { xs: 0, md: 2 },
  '& > div > .MuiStepper-root': {
    px: 3,
    pb: 2,
    flexShrink: 0,
    display: { xs: 'none', md: 'flex' },
    '& .MuiStepConnector-completed .MuiStepConnector-line': { borderColor: 'success.main' },
    '& .MuiStepConnector-active .MuiStepConnector-line': { borderColor: 'text.primary' },
    '& .MuiStep-root.Mui-completed .MuiStepLabel-iconContainer > div > div:last-child': {
      bgcolor: 'success.main',
      borderColor: 'success.main',
    },
    '& .MuiStep-root.Mui-active .MuiStepLabel-iconContainer > div > div:last-child': {
      bgcolor: 'common.black',
      borderColor: 'common.black',
    },
    '& .MuiStepLabel-label.Mui-active': { color: 'text.primary', fontWeight: 600 },
  },
  '& > div > form > div:last-child': {
    minHeight: 76,
    borderTop: 1,
    borderColor: 'divider',
    px: { xs: 1.5, sm: 3 },
  },
  '& .MuiButton-root': { minHeight: 44 },
  '& .MuiInputBase-root:not(.MuiInputBase-multiline)': { minHeight: 44 },
  ...(activeStep === 1 && {
    pt: 0,
    '& > div > .MuiStepper-root': { pb: 1 },
    '& > div > form > div:last-child': { minHeight: { xs: 68, lg: 60 }, py: { lg: 1 } },
    '& .MuiButton-root': { minHeight: { xs: 44, lg: 36 }, py: { lg: 0.5 } },
    [stepperScrollWrapper]: { overflowX: 'hidden !important' },
    [stepperHorizontalTrack]: { display: 'none' },
    [stepperContent]: {
      width: 1,
      height: { lg: 1 },
      minWidth: 0,
      minHeight: { lg: 0 },
      overflow: { lg: 'hidden' },
    },
  }),
});
