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
  pt: 0,
  bgcolor: 'background.neutral',
  '& > div': {
    width: { sm: 'calc(100% - 32px)' },
    height: { sm: 'calc(100% - 32px)' },
    mx: { sm: 2 },
    my: { sm: 2 },
    minWidth: 0,
    minHeight: 0,
    overflow: 'hidden',
    bgcolor: 'background.paper',
    borderRadius: { sm: 2 },
    boxShadow: { sm: 'var(--shadows-4)' },
  },
  '& > div > .MuiStepper-root': {
    width: 1,
    px: { md: 2 },
    pt: { md: 2 },
    pb: { md: 1.5 },
    flexShrink: 0,
    display: { xs: 'none', md: 'flex' },
    '& .MuiStepConnector-root.MuiStepConnector-alternativeLabel': {
      top: 21,
      right: 'calc(50% + 4px)',
    },
  },
  '& > div > form > div:last-child': {
    borderTop: 1,
    borderColor: 'divider',
    px: { xs: 1.5, sm: 3 },
    py: 1,
  },
  ...(activeStep !== 0 && {
    '& .MuiInputBase-root:not(.MuiInputBase-multiline)': { minHeight: 44 },
  }),
  ...(activeStep === 1 && {
    pt: 0,
    '& > div > form > div:last-child': { py: 1 },
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
