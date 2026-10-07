import type { Theme, SxProps } from '@mui/material/styles';

// Only constrain the stepper's outer scroll content. Field libraries and the canvas
// keep their own natural-height scroll content inside the build and review steps.
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
    width: { sm: 'calc(100% - 16px)' },
    height: { sm: 'calc(100% - 16px)' },
    mx: { sm: 1 },
    my: { sm: 1 },
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
    pt: { md: 1 },
    pb: { md: 1 },
    flexShrink: 0,
    display: { xs: 'none', md: 'flex' },
    '& .MuiStepConnector-root.MuiStepConnector-alternativeLabel': {
      top: 21,
      right: 'calc(50% + 4px)',
    },
  },
  '& > div > form > div:last-child:not([data-simplebar])': {
    borderTop: 1,
    borderColor: 'divider',
    px: { xs: 1.5, sm: 3 },
    py: 1,
  },
  '& > div > form > [data-simplebar]': { overflowX: 'hidden', minWidth: 0 },
  [stepperScrollWrapper]: { overflowX: 'hidden !important' },
  [stepperHorizontalTrack]: { display: 'none' },
  [stepperContent]: { width: 1, minWidth: 0 },
  ...(activeStep !== 0 && {
    '& .MuiInputBase-root:not(.MuiInputBase-multiline)': { minHeight: 44 },
  }),
  ...(activeStep !== 0 && {
    pt: 0,
    '& > div > form > [data-simplebar]': { overflow: 'hidden', minWidth: 0 },
    '& > div > form > div:last-child:not([data-simplebar])': { py: 1 },
    [stepperContent]: {
      width: 1,
      height: 1,
      minWidth: 0,
      minHeight: 0,
      overflow: 'hidden',
    },
  }),
});
