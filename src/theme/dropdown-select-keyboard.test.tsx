import { useState } from 'react';
import Select from '@mui/material/Select';
import { it, expect, describe } from 'vitest';
import MenuItem from '@mui/material/MenuItem';
import userEvent from '@testing-library/user-event';
import CustomSelect from 'src/components/custom-select';
import { render, screen, waitFor } from '@testing-library/react';
import { extendTheme, ThemeProvider } from '@mui/material/styles';

import { menu } from './core/components/menu';

const theme = extendTheme({ components: menu });
const options = [
  { label: 'Aspen', value: 'aspen' },
  { label: 'Maple', value: 'maple' },
  { label: 'Red Oak', value: 'oak' },
];

function DropdownFixture({ multiple = false, searchable = false, raw = false }) {
  const [value, setValue] = useState<string | string[]>(multiple ? [] : '');
  const [submitted, setSubmitted] = useState(false);
  return (
    <ThemeProvider theme={theme}>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          setSubmitted(true);
        }}
      >
        <button type="button">Previous field</button>
        {raw ? (
          <Select
            value={value}
            onChange={(event) => setValue(event.target.value)}
            inputProps={{ 'aria-label': 'Tree' }}
          >
            {options.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        ) : (
          <CustomSelect
            label="Tree"
            options={options}
            value={value}
            multiple={multiple}
            onChange={(next) => setValue(Array.isArray(next) ? next.map(String) : String(next))}
            isSearch={searchable}
            disabledValues={['aspen']}
          />
        )}
        <button type="button">Next field</button>
        <output aria-label="Selected tree">
          {Array.isArray(value) ? value.join(', ') : value || 'No selection'}
        </output>
        <output aria-label="Submitted">{submitted ? 'yes' : 'no'}</output>
      </form>
    </ThemeProvider>
  );
}

describe('themed select keyboard selection', () => {
  it('keeps a selected multi-select option when leaving with Tab', async () => {
    const user = userEvent.setup();
    render(<DropdownFixture multiple />);
    await user.click(screen.getByRole('combobox', { name: 'Tree' }));
    await user.keyboard(' ');
    await user.keyboard('{Tab}');
    expect(screen.getByLabelText('Selected tree')).toHaveTextContent('maple');
    await waitFor(() => expect(screen.getByRole('button', { name: 'Next field' })).toHaveFocus());
  });

  it.each([
    ['Spacebar', ' '],
    ['Enter', '{Enter}'],
    ['Tab', '{Tab}'],
  ])('selects the focused enabled option with %s', async (_label, key) => {
    const user = userEvent.setup();
    render(<DropdownFixture />);
    await user.click(screen.getByRole('combobox', { name: 'Tree' }));
    expect(screen.getByRole('option', { name: 'Maple' })).toHaveFocus();
    await user.keyboard(key);
    expect(screen.getByLabelText('Selected tree')).toHaveTextContent('maple');
    expect(screen.getByLabelText('Submitted')).toHaveTextContent('no');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    if (key === '{Tab}')
      await waitFor(() => expect(screen.getByRole('button', { name: 'Next field' })).toHaveFocus());
  });

  it('selects and leaves a raw MUI Select with Tab', async () => {
    const user = userEvent.setup();
    render(<DropdownFixture raw />);
    await user.click(screen.getByRole('combobox', { name: 'Tree' }));
    await user.keyboard('{ArrowDown}{Tab}');
    expect(screen.getByLabelText('Selected tree')).toHaveTextContent('maple');
    await waitFor(() => expect(screen.getByRole('button', { name: 'Next field' })).toHaveFocus());
  });

  it('selects the focused multi-select option and closes with Tab', async () => {
    const user = userEvent.setup();
    render(<DropdownFixture multiple />);
    await user.click(screen.getByRole('combobox', { name: 'Tree' }));
    await user.keyboard('{Tab}');
    expect(screen.getByLabelText('Selected tree')).toHaveTextContent('maple');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    await waitFor(() => expect(screen.getByRole('button', { name: 'Next field' })).toHaveFocus());
  });

  it('leaves backward without committing with Shift+Tab', async () => {
    const user = userEvent.setup();
    render(<DropdownFixture />);
    await user.click(screen.getByRole('combobox', { name: 'Tree' }));
    await user.keyboard('{Shift>}{Tab}{/Shift}');
    expect(screen.getByLabelText('Selected tree')).toHaveTextContent('No selection');
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Previous field' })).toHaveFocus()
    );
  });

  it('moves from search text into filtered options with arrows before selecting', async () => {
    const user = userEvent.setup();
    render(<DropdownFixture searchable />);
    await user.click(screen.getByRole('combobox', { name: 'Tree' }));
    const search = screen.getByRole('textbox', { name: 'Search Tree' });
    await user.type(search, 'Red O');
    expect(search).toHaveValue('Red O');
    await user.keyboard('{ArrowDown}{Tab}');
    expect(screen.getByLabelText('Selected tree')).toHaveTextContent('oak');
    await waitFor(() => expect(screen.getByRole('button', { name: 'Next field' })).toHaveFocus());
  });
});
