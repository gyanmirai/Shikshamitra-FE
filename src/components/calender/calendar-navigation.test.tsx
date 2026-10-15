import store from 'src/redux/store';
import { Provider } from 'react-redux';
import { vi, it, expect, describe } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { render, screen, fireEvent } from '@testing-library/react';
import { defaultSettings } from 'src/components/settings/config-settings';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import CommonCalender from './index';

function renderCalendar(props: Partial<React.ComponentProps<typeof CommonCalender>> = {}) {
  return render(
    <Provider store={store}>
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <CommonCalender
            data={[]}
            initialDate="2026-10-15"
            initialView="dayGridMonth"
            editable={false}
            {...props}
          />
        </LocalizationProvider>
      </ThemeProvider>
    </Provider>
  );
}

describe('shared calendar navigation', () => {
  it('honors an explicit initial month and caller date format', async () => {
    const datesSet = vi.fn();
    renderCalendar({ initialDate: '2026-06-10', formate: 'MMM YYYY', datesSet });
    expect(await screen.findByRole('button', { name: 'Choose date, Jun 2026' })).toBeVisible();
    expect(datesSet.mock.lastCall?.[0].view.currentStart.getMonth()).toBe(5);
  });

  it('keeps the range heading in sync with month navigation and view changes', async () => {
    const datesSet = vi.fn();
    renderCalendar({ datesSet });
    expect(await screen.findByRole('button', { name: 'Choose date, October 2026' })).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: 'Next month' }));
    expect(await screen.findByRole('button', { name: 'Choose date, November 2026' })).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: 'Previous month' }));
    fireEvent.click(screen.getByRole('button', { name: 'Week' }));
    expect(await screen.findByRole('button', { name: 'Next week' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Week' })).toHaveAttribute('aria-pressed', 'true');
    expect(datesSet.mock.lastCall?.[0].view.type).toBe('timeGridWeek');
  });

  it('retains event selection and keyboard access to the date chooser', async () => {
    const onDateClick = vi.fn();
    renderCalendar({
      data: [{ id: 'exam', title: 'Science practical', start: '2026-10-15', allDay: true }],
      onDateClick,
    });
    fireEvent.click(await screen.findByText('Science practical'));
    expect(onDateClick.mock.lastCall?.[0].event.id).toBe('exam');
    const chooseDate = screen.getByRole('button', { name: 'Choose date, October 2026' });
    chooseDate.focus();
    expect(chooseDate).toHaveFocus();
    fireEvent.click(chooseDate);
    expect(await screen.findByRole('dialog', { name: 'Choose calendar date' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'OK' })).toBeEnabled();
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
  });
});
