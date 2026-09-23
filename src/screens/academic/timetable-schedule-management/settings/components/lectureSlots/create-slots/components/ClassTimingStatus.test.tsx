import dayjs from 'dayjs';
import { vi, it, expect, describe } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { render, screen } from '@testing-library/react';
import { defaultSettings } from 'src/components/settings/config-settings';

import ClassTimingStatus from './ClassTimingStatus';

vi.mock('src/components/iconify', () => ({ Iconify: () => null }));

const shift = {
  label: 'Full Day Shift (07:00 AM - 05:30 PM)',
  start: dayjs('2024-01-01T07:00:00'),
  end: dayjs('2024-01-01T17:30:00'),
};

const renderStatus = (isLoading: boolean) =>
  render(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <ClassTimingStatus
        isLoading={isLoading}
        message={
          isLoading
            ? 'Please assign the school shift to this class before configuring lecture slots.'
            : shift.label
        }
        shift={isLoading ? null : shift}
      />
    </ThemeProvider>
  );

describe('ClassTimingStatus', () => {
  it('replaces a stale warning with a refresh indicator while class data is fetching', () => {
    renderStatus(true);

    expect(screen.getByRole('status')).toHaveTextContent('Refreshing class timing');
    expect(screen.queryByText(/Please assign the school shift/i)).not.toBeInTheDocument();
  });

  it('shows the refreshed shift timing after loading completes', () => {
    renderStatus(false);

    expect(screen.getByText(shift.label)).toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });
});
