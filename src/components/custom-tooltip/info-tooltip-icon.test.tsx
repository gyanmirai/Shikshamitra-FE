import React from 'react';
import { it, vi, expect } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

import { InfoTooltipIcon } from './info-tooltip-icon';

vi.mock('src/components/iconify', () => ({ Iconify: () => <svg aria-hidden /> }));

it('exposes section help through a named keyboard-focusable control inside a detail panel', async () => {
  render(
    <div role="dialog" aria-label="Policy details">
      <InfoTooltipIcon
        title="Only settled payments are eligible."
        label="Refund scope information"
      />
    </div>
  );
  const trigger = screen.getByRole('button', { name: 'Refund scope information' });
  expect(trigger.tabIndex).toBe(0);
  await userEvent.tab();
  expect(trigger).toHaveFocus();
  expect(await screen.findByRole('tooltip')).toHaveTextContent(
    'Only settled payments are eligible.'
  );
  expect(trigger).toHaveAccessibleDescription('Only settled payments are eligible.');
  fireEvent.keyDown(document, { key: 'Escape' });
  await waitFor(() => expect(screen.queryByRole('tooltip')).not.toBeInTheDocument(), {
    timeout: 2000,
  });
});

it('makes the same information available after a touch hold', async () => {
  render(
    <InfoTooltipIcon title="Saved refund limits." label="Settlement constraints information" />
  );
  const trigger = screen.getByRole('button', { name: 'Settlement constraints information' });
  fireEvent.touchStart(trigger);
  expect(await screen.findByRole('tooltip', {}, { timeout: 2000 })).toHaveTextContent(
    'Saved refund limits.'
  );
  fireEvent.touchEnd(trigger);
});
