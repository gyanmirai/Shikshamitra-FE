import React from 'react';
import { afterEach, it, vi, expect } from 'vitest';
import { act, render, screen, fireEvent } from '@testing-library/react';

import CustomTooltip from './index';

afterEach(() => {
  vi.useRealTimers();
});

it('stays open while the pointer crosses from the trigger to the tooltip', () => {
  vi.useFakeTimers();
  const onClose = vi.fn();
  render(
    <CustomTooltip title="The payment deadline for this installment." onClose={onClose}>
      <button type="button" aria-label="About due dates">
        About due dates
      </button>
    </CustomTooltip>
  );
  const trigger = screen.getByRole('button', { name: 'About due dates' });
  vi.spyOn(trigger, 'getBoundingClientRect').mockReturnValue({
    x: 100,
    y: 100,
    width: 24,
    height: 24,
    top: 100,
    right: 124,
    bottom: 124,
    left: 100,
    toJSON: () => ({}),
  });
  fireEvent.mouseOver(trigger);
  act(() => vi.advanceTimersByTime(100));
  const tooltip = screen.getByRole('tooltip');

  fireEvent.mouseLeave(trigger);
  // Crossing the visual gap must not start closing the still-hoverable tooltip.
  act(() => vi.advanceTimersByTime(50));
  fireEvent.mouseOver(tooltip);
  act(() => vi.advanceTimersByTime(1000));

  expect(onClose).not.toHaveBeenCalled();
  expect(tooltip).toBeVisible();

  fireEvent.mouseLeave(tooltip);
  act(() => vi.advanceTimersByTime(200));
  expect(onClose).toHaveBeenCalledTimes(1);
  // Let React commit the close before advancing the separate exit transition.
  act(() => vi.advanceTimersByTime(1000));
  expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
});
