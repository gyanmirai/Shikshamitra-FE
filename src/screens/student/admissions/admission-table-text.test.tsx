import userEvent from '@testing-library/user-event';
import { it, vi, expect, afterEach, beforeEach } from 'vitest';
import { act, render, screen, fireEvent } from '@testing-library/react';

import { AdmissionTableText } from './admission-table-text';

beforeEach(() => {
  vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(100);
  vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(20);
  vi.spyOn(HTMLElement.prototype, 'scrollWidth', 'get').mockReturnValue(100);
  vi.spyOn(HTMLElement.prototype, 'scrollHeight', 'get').mockReturnValue(20);
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

it('leaves fully visible text without a tooltip or extra keyboard stop', () => {
  vi.useFakeTimers();
  render(<AdmissionTableText text="Class 1" secondary="Registration" />);
  const text = screen.getByText('Class 1');

  expect(text.closest('[tabindex], [title]')).toBeNull();
  fireEvent.mouseOver(text);
  act(() => vi.advanceTimersByTime(200));
  expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
});

it('shows only the clipped secondary value with system tooltip styling', async () => {
  const user = userEvent.setup();
  const secondary = 'Long class and application track';
  vi.spyOn(HTMLElement.prototype, 'scrollWidth', 'get').mockImplementation(function (
    this: HTMLElement
  ) {
    return this.textContent === secondary ? 180 : 100;
  });
  render(<AdmissionTableText text="Class 1" secondary={secondary} />);
  const caption = screen.getByText(secondary);

  expect(screen.getByText('Class 1')).not.toHaveAttribute('tabindex');
  expect(caption).toHaveAttribute('tabindex', '0');
  expect(caption).not.toHaveAttribute('title');
  await user.hover(caption);
  expect(await screen.findByRole('tooltip')).toHaveTextContent(secondary);
  expect(screen.getByRole('tooltip')).not.toHaveTextContent('Class 1');
});

it('makes clamped multiline text available on keyboard focus and updates after resize', async () => {
  let observeResize = () => {};
  let contentHeight = 48;
  vi.stubGlobal(
    'ResizeObserver',
    class {
      constructor(update: () => void) {
        observeResize = update;
      }

      observe = vi.fn();

      disconnect = vi.fn();
    }
  );
  vi.spyOn(HTMLElement.prototype, 'scrollHeight', 'get').mockImplementation(() => contentHeight);
  const user = userEvent.setup();
  const name = 'A long workflow name clamped across multiple lines';
  render(<AdmissionTableText text={name} />);
  const anchor = screen.getByText(name);

  await user.tab();
  expect(anchor).toHaveFocus();
  expect(await screen.findByRole('tooltip')).toHaveTextContent(name);

  contentHeight = 20;
  act(observeResize);
  expect(anchor).not.toHaveAttribute('tabindex');
});
