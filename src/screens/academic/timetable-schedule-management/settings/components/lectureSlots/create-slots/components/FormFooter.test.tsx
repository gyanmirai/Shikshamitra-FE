import { vi, it, expect } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { render, screen } from '@testing-library/react';
import { defaultSettings } from 'src/components/settings/config-settings';

import FormFooter from './FormFooter';

vi.mock('src/components/iconify', () => ({ Iconify: () => null }));

it('prevents cancellation and duplicate submission while saving', () => {
  render(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <FormFooter loading onCancel={vi.fn()} onSubmit={vi.fn()} />
    </ThemeProvider>
  );

  expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Submit lecture slots' })).toBeDisabled();
});
