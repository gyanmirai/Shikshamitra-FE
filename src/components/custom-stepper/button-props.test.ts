import { vi, it, expect, describe } from 'vitest';

import { mergeStepperButtonProps } from './button-props';

describe('custom stepper button props', () => {
  it('preserves caller visual props while enforcing merged action state', () => {
    const callerClick = vi.fn();
    const guardedClick = vi.fn();
    const callerSx = { minWidth: 180 };

    const props = mergeStepperButtonProps(
      {
        variant: 'outlined',
        size: 'small',
        startIcon: 'default-start',
        endIcon: 'default-end',
      },
      {
        variant: 'text',
        size: 'large',
        startIcon: 'caller-start',
        endIcon: 'caller-end',
        sx: callerSx,
        loading: false,
        disabled: false,
        onClick: callerClick,
      },
      {
        loading: true,
        disabled: true,
        onClick: guardedClick,
      }
    );

    expect(props).toMatchObject({
      variant: 'text',
      size: 'large',
      startIcon: 'caller-start',
      endIcon: 'caller-end',
      loading: true,
      disabled: true,
    });
    expect(props.sx).toBe(callerSx);
    expect(props.onClick).toBe(guardedClick);
  });
});
