import type { ButtonProps } from '@mui/material';

type ControlledButtonProps = Pick<ButtonProps, 'disabled' | 'loading' | 'onClick'>;

export const mergeStepperButtonProps = (
  defaults: ButtonProps,
  callerProps: ButtonProps,
  controlledProps: ControlledButtonProps
): ButtonProps => ({
  ...defaults,
  ...callerProps,
  ...controlledProps,
});
