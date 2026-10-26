import { it, vi, expect } from 'vitest';
import { Select, MenuItem, TextField } from '@mui/material';
import { render, screen, waitFor } from '@testing-library/react';

import { focusFirstFormikError } from './formik-validation';

it('focuses the first rendered invalid field, skipping hidden steps and disabled controls', async () => {
  const { container } = render(
    <form>
      <input name="hidden" hidden />
      <input name="disabled" disabled />
      <TextField label="First visible" name="rows[1].name" />
      <TextField label="Last visible" name="last" />
    </form>
  );
  focusFirstFormikError(
    {
      last: 'Required',
      disabled: 'Required',
      hidden: 'Required',
      rows: [undefined, { name: 'Required' }],
    },
    container
  );
  await waitFor(() => expect(screen.getByRole('textbox', { name: 'First visible' })).toHaveFocus());
});

it('focuses the visible MUI select rather than its hidden named input', async () => {
  const { container } = render(
    <form>
      <Select name="policy" value="" onChange={vi.fn()} inputProps={{ 'aria-label': 'Policy' }}>
        <MenuItem value="annual">Annual</MenuItem>
      </Select>
    </form>
  );
  focusFirstFormikError({ policy: 'Choose a policy' }, container);
  await waitFor(() => expect(screen.getByRole('combobox', { name: 'Policy' })).toHaveFocus());
});

it('keeps focus in the submitting form when another form has the same field name', async () => {
  render(
    <>
      <form>
        <TextField name="name" label="Other name" />
      </form>
      <form>
        <TextField name="name" label="Submitted name" />
        <button type="submit">Submit</button>
      </form>
    </>
  );
  screen.getByRole('button').focus();
  focusFirstFormikError({ name: 'Required' });
  await waitFor(() =>
    expect(screen.getByRole('textbox', { name: 'Submitted name' })).toHaveFocus()
  );
});
