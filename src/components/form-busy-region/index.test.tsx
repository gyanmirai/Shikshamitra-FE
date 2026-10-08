import { it, expect } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';

import { FormBusyRegion } from './index';

it('keeps entered values and blocks changes until the form is unlocked', async () => {
  const user = userEvent.setup();
  const form = (busy: boolean) => (
    <FormBusyRegion busy={busy} label="Saving request…">
      <label htmlFor="reason">
        Reason
        <input id="reason" defaultValue="Existing reason" />
      </label>
      <a href="#another-task">Another task</a>
    </FormBusyRegion>
  );
  const { rerender } = render(form(true));
  const input = screen.getByRole('textbox', { name: 'Reason' });
  expect(input).toBeDisabled();
  expect(screen.getByRole('status', { name: 'Saving request…' })).toBeVisible();
  expect(screen.getByRole('link', { name: 'Another task' }).closest('[inert]')).not.toBeNull();
  await user.type(input, ' accidental change');
  expect(input).toHaveValue('Existing reason');

  rerender(form(false));
  expect(input).toBeEnabled();
  expect(screen.queryByRole('status')).not.toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Another task' }).closest('[inert]')).toBeNull();
  await user.type(input, ' kept');
  expect(input).toHaveValue('Existing reason kept');
});
