import React from 'react';
import { it, vi, expect } from 'vitest';
import userEvent from '@testing-library/user-event';
import { MenuItem, TextField } from '@mui/material';
import { render, screen } from '@testing-library/react';

import { DrawerField, InfoTooltipIcon, DrawerSelectField } from './HRPolicySharedUI';

vi.mock('src/components/iconify', () => ({ Iconify: () => <span /> }));

it('associates field names, descriptions and validation without merging help into the name', () => {
  render(
    <>
      <DrawerField label="Policy name" help="Choose a distinct name.">
        <TextField error helperText="A name is required." />
      </DrawerField>
      <DrawerSelectField
        label="Status"
        help="Only active policies can be defaults."
        value="draft"
        onChange={vi.fn()}
      >
        <MenuItem value="draft">Draft</MenuItem>
      </DrawerSelectField>
      <DrawerSelectField label="Work Calendar" value="calendar" onChange={vi.fn()}>
        <MenuItem value="calendar">School calendar</MenuItem>
      </DrawerSelectField>
      <DrawerSelectField label="Target Type" value="employee" onChange={vi.fn()}>
        <MenuItem value="employee">Staff</MenuItem>
      </DrawerSelectField>
    </>
  );
  expect(screen.getByRole('textbox', { name: 'Policy name' })).toHaveAccessibleDescription(
    'Choose a distinct name. A name is required.'
  );
  expect(screen.getByRole('textbox', { name: 'Policy name' })).toHaveAttribute(
    'aria-invalid',
    'true'
  );
  expect(screen.getByRole('combobox', { name: 'Status' })).toHaveAccessibleDescription(
    'Only active policies can be defaults.'
  );
  expect(screen.getByRole('combobox', { name: 'Work Calendar' })).toBeInTheDocument();
  expect(screen.getByRole('combobox', { name: 'Target Type' })).toBeInTheDocument();
});

it('makes unlabeled help keyboard reachable and dismissible', async () => {
  const user = userEvent.setup();
  render(<InfoTooltipIcon title="Explain this rule." />);
  const help = screen.getByRole('button', { name: 'Help: Explain this rule.' });
  await user.tab();
  expect(help).toHaveFocus();
  expect(await screen.findByRole('tooltip')).toHaveTextContent('Explain this rule.');
  await user.keyboard('{Escape}');
  expect(help).toHaveFocus();
});
