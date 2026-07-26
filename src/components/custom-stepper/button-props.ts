import type { LoadingButtonProps } from '@mui/lab';

type ControlledLoadingButtonProps = Pick<LoadingButtonProps, 'disabled' | 'loading' | 'onClick'>;

export const mergeStepperButtonProps = (
  defaults: LoadingButtonProps,
  callerProps: LoadingButtonProps,
  controlledProps: ControlledLoadingButtonProps
): LoadingButtonProps => ({
  ...defaults,
  ...callerProps,
  ...controlledProps,
});
