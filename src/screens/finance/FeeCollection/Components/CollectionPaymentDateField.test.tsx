import type { Dayjs } from 'dayjs';

import dayjs from 'dayjs';
import { useState } from 'react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import CollectionPaymentDateField from './CollectionPaymentDateField';

function Fixture() {
  const [value, setValue] = useState<Dayjs | null>(dayjs().add(1, 'day').date(22).month(10));
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <CollectionPaymentDateField
        name="paymentDate"
        label="Payment date"
        required
        value={value}
        onChange={setValue}
        onBlur={() => undefined}
      />
      <output aria-label="Stored date">
        {value?.isValid() ? value.format('DD/MM/YYYY') : 'Invalid'}
      </output>
    </LocalizationProvider>
  );
}

describe('payment date field editing', () => {
  it('preserves day and month when editing the year', async () => {
    const user = userEvent.setup();
    render(<Fixture />);
    const year = screen.getByRole('spinbutton', { name: /year/i });
    await user.click(year);
    await user.keyboard(String(dayjs().year() + 1));
    await user.tab();
    expect(screen.getByLabelText('Stored date')).toHaveTextContent(`22/11/${dayjs().year() + 1}`);
    cleanup();
  });

  it('shows a field error for a manually entered past year', async () => {
    const user = userEvent.setup();
    render(<Fixture />);
    const year = screen.getByRole('spinbutton', { name: /year/i });
    await user.click(year);
    await user.keyboard('2020');
    await user.tab();
    expect(screen.getByText(/cannot be before/)).toBeVisible();
    cleanup();
  });
});
