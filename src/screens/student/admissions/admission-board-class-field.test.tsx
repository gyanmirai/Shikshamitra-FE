import { useState } from 'react';
import { it, vi, expect } from 'vitest';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { render, screen, within } from '@testing-library/react';
import { defaultSettings } from 'src/components/settings/config-settings';

import AdmissionRuntimeField from './admission-runtime-field';

const options = [
  {
    value: 'cbse-6',
    label: 'Class 6 (English / Secondary)',
    boardId: 'cbse',
    boardLabel: 'CBSE',
    isActive: true,
  },
  {
    value: 'cbse-7',
    label: 'Class 7 (English / Secondary)',
    boardId: 'cbse',
    boardLabel: 'CBSE',
    isActive: true,
  },
  {
    value: 'gseb-6',
    label: 'Class 6 (English / Secondary)',
    boardId: 'gseb',
    boardLabel: 'GSEB',
    isActive: true,
  },
];
const field = {
  code: 'CLASS_INTERESTED',
  label: 'Class interested in',
  fieldType: 6,
  required: true,
  readOnly: false,
  optionsJson: JSON.stringify(options),
};

it('uses separate searchable Board and Class menus with the common scrollbar and clears a class across boards', async () => {
  const user = userEvent.setup();
  const changed = vi.fn();
  function Form() {
    const [value, setValue] = useState('');
    return (
      <AdmissionRuntimeField
        field={field}
        value={value}
        disabled={false}
        optionsResolved
        onChange={(next) => {
          changed(next);
          setValue(next);
        }}
      />
    );
  }
  render(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <Form />
    </ThemeProvider>
  );
  expect(screen.getByRole('combobox', { name: 'Class interested in' })).toHaveAttribute(
    'aria-disabled',
    'true'
  );
  await user.click(screen.getByRole('combobox', { name: 'Board' }));
  await user.click(screen.getByRole('option', { name: 'CBSE' }));
  await user.click(screen.getByRole('combobox', { name: 'Class interested in' }));
  const menu = screen.getByRole('listbox');
  expect(menu.closest('.MuiPaper-root')).toHaveStyle({ position: 'absolute' });
  expect(menu.closest('[data-simplebar]')).not.toBeNull();
  expect(
    within(menu).getAllByRole('option', { name: 'Class 6 (English / Secondary)' })
  ).toHaveLength(1);
  expect(within(menu).queryByRole('combobox', { name: 'Board' })).not.toBeInTheDocument();
  await user.type(screen.getByPlaceholderText('Search classes'), 'Class 7');
  expect(
    within(menu).queryByRole('option', { name: 'Class 6 (English / Secondary)' })
  ).not.toBeInTheDocument();
  await user.keyboard('{ArrowDown}{Enter}');
  expect(changed).toHaveBeenLastCalledWith('cbse-7');
  await user.click(screen.getByRole('combobox', { name: 'Board' }));
  await user.click(screen.getByRole('option', { name: 'GSEB' }));
  expect(changed).toHaveBeenLastCalledWith('');
  expect(screen.getByRole('combobox', { name: 'Class interested in' })).not.toHaveTextContent(
    'Class 7'
  );
  await user.click(screen.getByRole('combobox', { name: 'Class interested in' }));
  expect(
    screen.queryByRole('option', { name: 'Class 7 (English / Secondary)' })
  ).not.toBeInTheDocument();
  await user.click(screen.getByRole('option', { name: 'Class 6 (English / Secondary)' }));
  expect(changed).toHaveBeenLastCalledWith('gseb-6');
  await user.click(screen.getByRole('combobox', { name: 'Board' }));
  await user.keyboard('{Escape}');
  expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  expect(screen.getByRole('combobox', { name: 'Board' })).toHaveFocus();
  expect(changed).toHaveBeenLastCalledWith('gseb-6');
});

it('restores the Board for a saved inherited class without changing the answer on mount', () => {
  const onChange = vi.fn();
  const savedField = JSON.parse(JSON.stringify({ ...field, inheritedFrom: { locked: true } }));
  render(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <AdmissionRuntimeField
        field={savedField}
        value="gseb-6"
        disabled
        optionsResolved
        onChange={onChange}
      />
    </ThemeProvider>
  );
  expect(screen.getByRole('combobox', { name: 'Board' })).toHaveTextContent('GSEB');
  expect(screen.getByRole('combobox', { name: 'Board' })).toHaveAttribute('aria-disabled', 'true');
  expect(screen.getByRole('combobox', { name: 'Class interested in' })).toHaveTextContent(
    'Class 6'
  );
  expect(onChange).not.toHaveBeenCalled();
});
