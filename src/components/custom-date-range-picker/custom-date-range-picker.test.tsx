import dayjs from 'dayjs';
import { useState } from 'react';
import { vi, it, expect, describe } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { render, screen, fireEvent } from '@testing-library/react';
import { createTheme } from 'src/theme/create-theme';
import { defaultSettings } from 'src/components/settings/config-settings';

import { CustomDateRangePicker } from './custom-date-range-picker';

import type { DateRange, DateRangePickerProps } from './types';

vi.mock('src/components/iconify', () => ({ Iconify: () => null }));

function renderPicker(props: Partial<DateRangePickerProps> = {}) {
  function ControlledPicker() {
    const [value, setValue] = useState<DateRange>(props.value ?? [null, null]);
    return (
      <>
        <CustomDateRangePicker
          mode="mobile"
          label="Installment dates"
          allowManualInput
          dateFormat="DD/MM/YYYY"
          minDate={dayjs('2026-06-01')}
          maxDate={dayjs('2027-05-31')}
          referenceDate={dayjs('2026-06-01')}
          {...props}
          value={value}
          onChange={(range) => {
            setValue(range);
            props.onChange?.(range);
          }}
        />
        <output data-testid="stored-range">
          {JSON.stringify(value.map((date) => date?.format('YYYY-MM-DD') ?? null))}
        </output>
      </>
    );
  }
  return render(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <ControlledPicker />
      </LocalizationProvider>
    </ThemeProvider>
  );
}

describe('manual date range entry', () => {
  it('accepts a typed range across academic years without opening the calendar', () => {
    renderPicker();
    const input = screen.getByRole('textbox', { name: 'Installment dates' });
    fireEvent.click(input);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    fireEvent.change(input, { target: { value: '01/06/2026 - 31/05/2027' } });
    fireEvent.blur(input);
    expect(input).toHaveValue('01/06/2026 - 31/05/2027');
    expect(screen.getByTestId('stored-range')).toHaveTextContent('["2026-06-01","2027-05-31"]');
    expect(input).toHaveAttribute('aria-invalid', 'false');
  });

  it.each([
    ['31/02/2027 - 31/05/2027', 'Enter dates as DD/MM/YYYY - DD/MM/YYYY'],
    ['01/06/26 - 31/05/27', 'Enter dates as DD/MM/YYYY - DD/MM/YYYY'],
    ['06/01/2026', 'Enter dates as DD/MM/YYYY - DD/MM/YYYY'],
    ['31/05/2027 - 01/06/2026', 'End date must be on or after start date'],
    ['31/05/2026 - 30/06/2026', 'Date is earlier than minimum allowed date'],
    ['01/06/2026 - 01/06/2027', 'Date is later than maximum allowed date'],
  ])('rejects %s and clears an earlier valid form value', (text, error) => {
    renderPicker({ value: [dayjs('2026-06-01'), dayjs('2026-06-30')] });
    const input = screen.getByRole('textbox', { name: 'Installment dates' });
    fireEvent.change(input, { target: { value: text } });
    fireEvent.blur(input);
    expect(input).toHaveValue(text);
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByText(error)).toBeVisible();
    expect(screen.getByTestId('stored-range')).toHaveTextContent('[null,null]');
  });

  it('preserves partial text while typing, accepts leap days and same-day ranges, and clears', () => {
    renderPicker({ minDate: dayjs('2028-02-01'), maxDate: dayjs('2028-03-31') });
    const input = screen.getByRole('textbox', { name: 'Installment dates' });
    fireEvent.change(input, { target: { value: '29/02/2028 - ' } });
    expect(input).toHaveValue('29/02/2028 - ');
    fireEvent.change(input, { target: { value: '29/02/2028 - 29/02/2028' } });
    expect(screen.getByTestId('stored-range')).toHaveTextContent('["2028-02-29","2028-02-29"]');
    expect(input).toHaveAttribute('aria-invalid', 'false');
    fireEvent.change(input, { target: { value: '' } });
    expect(screen.getByTestId('stored-range')).toHaveTextContent('[null,null]');
    expect(input).toHaveValue('');
  });

  it('opens at the academic start and allows calendar recovery from an invalid draft', async () => {
    renderPicker();
    const input = screen.getByRole('textbox', { name: 'Installment dates' });
    fireEvent.change(input, { target: { value: 'invalid draft' } });
    fireEvent.click(screen.getByRole('button', { name: 'Open calendar for Installment dates' }));
    expect(await screen.findByRole('heading', { name: 'June 2026' })).toBeVisible();
    fireEvent.click(screen.getByRole('gridcell', { name: '1' }));
    fireEvent.click(screen.getByRole('gridcell', { name: '15' }));
    fireEvent.click(screen.getByRole('button', { name: 'Apply' }));
    expect(input).toHaveValue('01/06/2026 - 15/06/2026');
    expect(input).toHaveAttribute('aria-invalid', 'false');
    expect(screen.getByTestId('stored-range')).toHaveTextContent('["2026-06-01","2026-06-15"]');
  });

  it('opens at the typed selection and Cancel preserves it', async () => {
    renderPicker();
    const input = screen.getByRole('textbox', { name: 'Installment dates' });
    fireEvent.change(input, { target: { value: '01/01/2027 - 31/01/2027' } });
    fireEvent.click(screen.getByRole('button', { name: 'Open calendar for Installment dates' }));
    expect(await screen.findByRole('heading', { name: 'January 2027' })).toBeVisible();
    fireEvent.click(screen.getByRole('gridcell', { name: '10' }));
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(input).toHaveValue('01/01/2027 - 31/01/2027');
  });

  it('retains picker-only entry for consumers that do not opt in', () => {
    renderPicker({ allowManualInput: false });
    expect(screen.getByRole('textbox', { name: 'Installment dates' })).toHaveAttribute('readonly');
  });

  it('honors read-only and disabled modes', () => {
    const rendered = renderPicker({ readOnly: true });
    const input = screen.getByRole('textbox', { name: 'Installment dates' });
    expect(input).toHaveAttribute('readonly');
    fireEvent.click(input);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    rendered.unmount();
    renderPicker({ disabled: true });
    expect(screen.getByRole('textbox', { name: 'Installment dates' })).toBeDisabled();
    expect(
      screen.getByRole('button', { name: 'Open calendar for Installment dates' })
    ).toBeDisabled();
  });
});
