import React, { useState } from 'react';
import { it, vi, expect } from 'vitest';
import userEvent from '@testing-library/user-event';
import { menu } from 'src/theme/core/components/menu';
import { extendTheme, ThemeProvider } from '@mui/material/styles';
import { render, screen, fireEvent } from '@testing-library/react';

import CustomSelect from './index';

const options = [
  { value: 'cbse', label: 'CBSE' },
  { value: 'gseb', label: 'GSEB' },
];

it('identifies the search by its field and exposes only real choices as options', () => {
  render(<CustomSelect label="Board" isSearch value="" onChange={vi.fn()} options={options} />);
  fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Board' }));
  expect(screen.getByRole('textbox', { name: 'Search Board' })).toHaveAttribute(
    'placeholder',
    'Search board'
  );
  expect(screen.getAllByRole('option')).toHaveLength(2);
});

it('supports a specific search hint without changing the field name', () => {
  render(
    <CustomSelect
      label="Board"
      isSearch
      searchPlaceholder="Search by board name"
      value=""
      onChange={vi.fn()}
      options={options}
    />
  );
  fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Board' }));
  expect(screen.getByRole('textbox', { name: 'Search Board' })).toHaveAttribute(
    'placeholder',
    'Search by board name'
  );
});

it('keeps an unmatched result non-selectable even with interactive empty-source guidance', () => {
  const change = vi.fn();
  render(
    <CustomSelect
      label="Board"
      isSearch
      value=""
      onChange={change}
      options={options}
      noOptionsMessage={<button type="button">Configure boards</button>}
    />
  );
  fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Board' }));
  fireEvent.change(screen.getByRole('textbox', { name: 'Search Board' }), {
    target: { value: 'unmatched' },
  });
  expect(screen.getByRole('option', { name: 'No results found' })).toHaveAttribute(
    'aria-disabled',
    'true'
  );
  expect(screen.queryByRole('button', { name: 'Configure boards' })).not.toBeInTheDocument();
  expect(change).not.toHaveBeenCalled();
});

it('returns to the complete list after keyboard selection and reopening', async () => {
  const user = userEvent.setup();
  function BoardPicker() {
    const [value, setValue] = useState<string | number>('');
    return (
      <CustomSelect
        label="Board"
        isSearch
        multiple={false}
        value={value}
        onChange={setValue}
        options={options}
      />
    );
  }
  render(
    <ThemeProvider theme={extendTheme({ components: menu })}>
      <BoardPicker />
    </ThemeProvider>
  );
  const trigger = screen.getByRole('combobox', { name: 'Board' });
  await user.click(trigger);
  await user.type(screen.getByRole('textbox', { name: 'Search Board' }), 'gse');
  await user.keyboard('{ArrowDown}{Enter}');
  expect(trigger).toHaveTextContent('GSEB');
  expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  await user.click(trigger);
  expect(screen.getByRole('textbox', { name: 'Search Board' })).toHaveValue('');
  expect(screen.getByRole('option', { name: 'CBSE' })).toBeInTheDocument();
});
