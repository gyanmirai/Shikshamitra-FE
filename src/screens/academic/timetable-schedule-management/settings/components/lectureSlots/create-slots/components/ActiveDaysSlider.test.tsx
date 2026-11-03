import { vi, it, expect, describe } from 'vitest';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { render, screen } from '@testing-library/react';
import { defaultSettings } from 'src/components/settings/config-settings';

import ActiveDaysSlider from './ActiveDaysSlider';

vi.mock('src/components/iconify', () => ({ Iconify: () => null }));

const renderSelector = (value: number[], onChange = vi.fn()) =>
  render(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <ActiveDaysSlider value={value} onChange={onChange} />
    </ThemeProvider>
  );

describe('ActiveDaysSlider', () => {
  it('associates a required day group with its validation error', () => {
    render(
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <ActiveDaysSlider value={[]} onChange={vi.fn()} error="Select at least one active day" />
      </ThemeProvider>
    );

    const group = screen.getByRole('group', { name: /Active Days/ });
    expect(group).toHaveAccessibleName('Active Days (required)');
    expect(group).toHaveAccessibleDescription('Select at least one active day');
    expect(screen.getByRole('combobox', { name: 'Schedule' })).toBeEnabled();
  });

  it('toggles an individual interior day without changing the other selected days', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderSelector([0, 1, 2, 3], onChange);

    await user.click(screen.getByRole('button', { name: 'Tue: active' }));

    expect(onChange).toHaveBeenCalledWith([0, 2, 3]);
  });

  it('supports a non-contiguous Mon, Wed, Sat selection', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderSelector([0, 2], onChange);

    await user.click(screen.getByRole('button', { name: 'Sat: inactive' }));

    expect(onChange).toHaveBeenCalledWith([0, 2, 5]);
  });

  it('applies the Monday to Saturday preset to a custom selection', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderSelector([0, 2, 5], onChange);

    expect(screen.getByRole('combobox', { name: 'Schedule' })).toHaveTextContent('Custom');
    await user.click(screen.getByRole('combobox', { name: 'Schedule' }));
    await user.click(screen.getByRole('option', { name: 'Mon–Sat' }));

    expect(onChange).toHaveBeenCalledWith([0, 1, 2, 3, 4, 5]);
  });

  it('identifies the weekday preset and applies it without including Saturday', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderSelector([0, 1, 2, 3, 4, 5], onChange);
    expect(screen.getByRole('combobox', { name: 'Schedule' })).toHaveTextContent('Mon–Sat');
    await user.click(screen.getByRole('combobox', { name: 'Schedule' }));
    await user.click(screen.getByRole('option', { name: 'Mon–Fri' }));
    expect(onChange).toHaveBeenCalledWith([0, 1, 2, 3, 4]);
  });
});
