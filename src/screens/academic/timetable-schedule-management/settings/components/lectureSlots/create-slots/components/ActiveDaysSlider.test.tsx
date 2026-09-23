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

  it('retains quick selection for the Monday to Saturday range', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderSelector([0, 2, 5], onChange);

    await user.click(screen.getByRole('button', { name: 'Mon–Sat' }));

    expect(onChange).toHaveBeenCalledWith([0, 1, 2, 3, 4, 5]);
  });
});
