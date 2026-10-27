import { useState } from 'react';
import { it, vi, expect } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, within, fireEvent } from '@testing-library/react';

import CustomSelect from './index';

const options = [
  { value: 'locked', label: 'Locked field' },
  { value: 'name', label: 'Name' },
  { value: 'notes', label: 'Notes' },
];

function Fixture({ submit = vi.fn(), numeric = false }) {
  const [value, setValue] = useState<string[] | number[]>(numeric ? [9] : ['name']);
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
    >
      <CustomSelect
        label="Fields"
        multiple
        allowSelectAll
        value={value}
        onChange={setValue}
        disabledValues={numeric ? [9] : ['locked']}
        options={
          numeric
            ? [
                { value: 9, label: 'Locked field' },
                { value: 1, label: 'Name' },
                { value: 2, label: 'Notes' },
              ]
            : options
        }
      />
      <output aria-label="Selected values">{JSON.stringify(value)}</output>
      <button type="submit">Submit</button>
    </form>
  );
}

it('selects and deselects enabled options without selecting locked fields or closing the menu', async () => {
  const user = userEvent.setup();
  const submit = vi.fn();
  render(<Fixture submit={submit} />);
  await user.click(screen.getByRole('combobox', { name: 'Fields' }));
  const selectAll = screen.getByRole('option', { name: 'Select All' });
  expect(within(selectAll).getByRole('checkbox', { hidden: true })).toHaveAttribute(
    'data-indeterminate',
    'true'
  );
  await user.click(selectAll);
  expect(screen.getByLabelText('Selected values')).toHaveTextContent('["name","notes"]');
  const deselectAll = screen.getByRole('option', { name: 'Deselect All' });
  expect(within(deselectAll).getByRole('checkbox', { hidden: true })).toBeChecked();
  await user.click(deselectAll);
  expect(screen.getByLabelText('Selected values')).toHaveTextContent('[]');
  expect(screen.getByRole('listbox')).toBeVisible();
  expect(submit).not.toHaveBeenCalled();
});

it('toggles numeric IDs by keyboard while retaining locked values without submitting', async () => {
  const user = userEvent.setup();
  const submit = vi.fn();
  render(<Fixture submit={submit} numeric />);
  await user.tab();
  await user.keyboard('{Enter}{Home}{Enter}');
  expect(screen.getByLabelText('Selected values')).toHaveTextContent('[9,1,2]');
  await user.keyboard('{Home}{Enter}');
  expect(screen.getByLabelText('Selected values')).toHaveTextContent('[9]');
  expect(screen.getByRole('listbox')).toBeVisible();
  expect(submit).not.toHaveBeenCalled();
});

it.each([{ choices: [] }, { choices: options }])(
  'disables the bulk action when no enabled options exist',
  ({ choices }) => {
    const change = vi.fn();
    render(
      <CustomSelect
        label="Fields"
        multiple
        allowSelectAll
        value={['locked']}
        onChange={change}
        options={choices}
        disabledValues={['locked', 'name', 'notes']}
      />
    );
    fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Fields' }));
    const action = screen.getByRole('option', { name: 'Select All' });
    expect(action).toHaveAttribute('aria-disabled', 'true');
    fireEvent.click(action);
    expect(change).not.toHaveBeenCalled();
  }
);

it('keeps the bulk action disabled when the entire field is locked', () => {
  const change = vi.fn();
  render(
    <CustomSelect
      label="Fields"
      multiple
      allowSelectAll
      disabled
      open
      value={[]}
      onChange={change}
      options={options}
    />
  );
  const action = screen.getByRole('option', { name: 'Select All' });
  expect(action).toHaveAttribute('aria-disabled', 'true');
  fireEvent.click(action);
  expect(change).not.toHaveBeenCalled();
});

it('preserves existing menus unless bulk selection is enabled in multiple mode', () => {
  const { rerender } = render(
    <CustomSelect label="Fields" multiple value={[]} onChange={vi.fn()} options={options} />
  );
  fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Fields' }));
  expect(screen.queryByRole('option', { name: 'Select All' })).not.toBeInTheDocument();
  expect(screen.getAllByRole('option')).toHaveLength(3);
  rerender(
    <CustomSelect
      label="Fields"
      allowSelectAll
      multiple={false}
      value="name"
      onChange={vi.fn()}
      options={options}
    />
  );
  expect(screen.queryByRole('option', { name: 'Select All' })).not.toBeInTheDocument();
});
