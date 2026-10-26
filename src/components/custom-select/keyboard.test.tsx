import { useState } from 'react';
import { it, vi, expect } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';

import CustomSelect from './index';

function Fixture({ submit = vi.fn() }) {
  const [value, setValue] = useState('');
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
    >
      <CustomSelect
        label="Policy"
        name="policy"
        isSearch
        value={value}
        onChange={(next) => setValue(String(next))}
        helperText="Choose a policy"
        disabledValues={['unavailable']}
        options={[
          { value: 'unavailable', label: 'Unavailable' },
          { value: 'annual', label: 'Annual leave' },
          { value: 'sick', label: 'Sick leave' },
        ]}
      />
      <button type="submit">Continue</button>
    </form>
  );
}

it('opens by keyboard, moves from search to enabled choices, selects once, and restores focus', async () => {
  const user = userEvent.setup();
  const submit = vi.fn();
  render(<Fixture submit={submit} />);
  await user.tab();
  const trigger = screen.getByRole('combobox', { name: 'Policy' });
  expect(trigger).toHaveFocus();
  expect(trigger).toHaveAccessibleDescription('Choose a policy');
  await user.keyboard('{Enter}');
  const search = screen.getByRole('textbox', { name: 'Search Policy' });
  expect(search).toHaveFocus();
  await user.keyboard('leave{Home}{ArrowRight}{End}{Enter}');
  expect(search).toHaveValue('leave');
  expect(submit).not.toHaveBeenCalled();
  await user.keyboard('{ArrowDown}');
  expect(screen.getByRole('option', { name: 'Annual leave' })).toHaveFocus();
  await user.keyboard('{ArrowDown}{Enter}');
  expect(trigger).toHaveTextContent('Sick leave');
  expect(trigger).toHaveFocus();
  await user.tab();
  expect(screen.getByRole('button', { name: 'Continue' })).toHaveFocus();
  expect(submit).not.toHaveBeenCalled();
});

it('can cancel and reopen search, and Tab never gets trapped in the search field', async () => {
  const user = userEvent.setup();
  render(<Fixture />);
  await user.tab();
  await user.keyboard(' ');
  const search = screen.getByRole('textbox', { name: 'Search Policy' });
  expect(search).toHaveFocus();
  await user.type(search, 'annual');
  await user.keyboard('{Escape}');
  expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  expect(screen.getByRole('combobox')).toHaveFocus();
  await user.keyboard('{Enter}');
  const reopened = screen.getByRole('textbox', { name: 'Search Policy' });
  expect(reopened).toHaveValue('');
  expect(reopened).toHaveFocus();
  await user.tab();
  expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  await user.tab();
  expect(screen.getByRole('button', { name: 'Continue' })).toHaveFocus();
});

it('exposes the add-option action as a native button and disables it with the field', async () => {
  const user = userEvent.setup();
  const add = vi.fn();
  const { rerender } = render(
    <CustomSelect
      label="Policy"
      value=""
      onChange={vi.fn()}
      options={[]}
      addOtherItemText="Add policy"
      addOtherItemOnClick={add}
    />
  );
  const button = screen.getByRole('button', { name: 'Add policy' });
  button.focus();
  await user.keyboard(' ');
  expect(add).toHaveBeenCalledOnce();
  rerender(
    <CustomSelect
      label="Policy"
      disabled
      value=""
      onChange={vi.fn()}
      options={[]}
      addOtherItemText="Add policy"
      addOtherItemOnClick={add}
    />
  );
  expect(button).toBeDisabled();
});
