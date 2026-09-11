import type { Theme, SxProps } from '@mui/material/styles';

// Only constrain the stepper's outer scroll content. Field libraries and the canvas
// keep their own natural-height scroll content inside the build step.
const stepperContent =
  '& > div > form > [data-simplebar] > .simplebar-wrapper > .simplebar-mask > .simplebar-offset > .simplebar-content-wrapper > .simplebar-content';

export const getFormWizardLayout = (activeStep: number): SxProps<Theme> => ({
  height: 1,
  minHeight: 0,
  pt: { xs: 1, sm: 2 },
  '& > div > .MuiStepper-root': { px: { xs: 1, sm: 3 }, pb: { xs: 1, sm: 2 }, flexShrink: 0 },
  ...(activeStep === 1 && {
    [stepperContent]: { height: { lg: 1 }, minHeight: { lg: 0 }, overflow: { lg: 'hidden' } },
  }),
});
