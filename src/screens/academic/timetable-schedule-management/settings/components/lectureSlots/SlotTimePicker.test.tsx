import dayjs from 'dayjs';
import { vi, it, expect } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { render, screen, waitFor } from '@testing-library/react';
import { defaultSettings } from 'src/components/settings/config-settings';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { focusFirstFormikError } from 'src/components/custom-stepper/formik-validation';

import SlotTimePicker from './SlotTimePicker';

it('focuses the editable time section after an invalid slot submission', async () => {
  const { container } = render(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <SlotTimePicker
          label="Start time"
          name="slots[0].startTime"
          value={dayjs('2026-11-03T12:00:00')}
          error="Start time is required"
          onChange={vi.fn()}
          onBlur={vi.fn()}
        />
      </LocalizationProvider>
    </ThemeProvider>
  );
  focusFirstFormikError({ slots: [{ startTime: 'Start time is required' }] }, container);
  await waitFor(() => expect(screen.getByRole('spinbutton', { name: 'Hours' })).toHaveFocus());
});
