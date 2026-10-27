import { useState } from 'react';
import { it, vi, expect, afterEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { render, screen, cleanup } from '@testing-library/react';
import { defaultSettings } from 'src/components/settings/config-settings';

import { AcademicPermissionCard } from './academic-permission-card';

afterEach(cleanup);

function Card({ disabled = false, changed = vi.fn() }) {
  const [checked, setChecked] = useState(false);
  return (
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <AcademicPermissionCard
        name="Primary school"
        detail="English · State board"
        checked={checked}
        disabled={disabled}
        onChange={(next) => {
          changed(next);
          setChecked(next);
        }}
      />
    </ThemeProvider>
  );
}

it('toggles exactly once from card padding, its text, and its checkbox', async () => {
  const user = userEvent.setup();
  const changed = vi.fn();
  render(<Card changed={changed} />);
  const checkbox = screen.getByRole('checkbox', { name: /Primary school/ });
  await user.click(checkbox.closest('label')!);
  expect(checkbox).toBeChecked();
  await user.click(screen.getByText('Primary school'));
  expect(checkbox).not.toBeChecked();
  await user.click(screen.getByText('English · State board'));
  expect(checkbox).toBeChecked();
  await user.click(checkbox);
  expect(checkbox).not.toBeChecked();
  expect(changed.mock.calls.map(([value]) => value)).toEqual([true, false, true, false]);
});

it('has one tab stop and supports Space and Enter without submitting or double toggling', async () => {
  const user = userEvent.setup();
  const changed = vi.fn();
  const submit = vi.fn((event) => event.preventDefault());
  render(
    <form onSubmit={submit}>
      <Card changed={changed} />
      <button type="submit">Next</button>
    </form>
  );
  const checkbox = screen.getByRole('checkbox');
  await user.tab();
  expect(checkbox).toHaveFocus();
  await user.keyboard(' ');
  expect(checkbox).toBeChecked();
  await user.keyboard('{Enter}');
  expect(checkbox).not.toBeChecked();
  expect(changed).toHaveBeenCalledTimes(2);
  expect(submit).not.toHaveBeenCalled();
  await user.tab();
  expect(screen.getByRole('button', { name: 'Next' })).toHaveFocus();
});

it('keeps a disabled card inert and out of the tab order', async () => {
  const user = userEvent.setup();
  const changed = vi.fn();
  render(
    <>
      <Card disabled changed={changed} />
      <button type="button">Next</button>
    </>
  );
  const checkbox = screen.getByRole('checkbox');
  expect(checkbox).toBeDisabled();
  await user.click(checkbox.closest('label')!);
  await user.click(screen.getByText('Primary school'));
  await user.tab();
  expect(screen.getByRole('button')).toHaveFocus();
  expect(changed).not.toHaveBeenCalled();
});
