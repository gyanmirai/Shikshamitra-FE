import dayjs from 'dayjs';
import { useState } from 'react';
import { it, expect, describe } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import { ClassTeacherEffectiveDateCell } from './ClassTeacherEffectiveDateCell';

function DateHarness() {
  const [value, setValue] = useState('2026-11-04');
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <ClassTeacherEffectiveDateCell
        value={value}
        identity="Class 1 A"
        disabled={false}
        onChange={setValue}
      />
      <button type="button" disabled={Boolean(value && !dayjs(value).isValid())}>
        Save
      </button>
    </LocalizationProvider>
  );
}

describe('effective date draft validation', () => {
  it('retains the other date segments and blocks saving a partially cleared date', async () => {
    const user = userEvent.setup();
    render(<DateHarness />);
    await user.click(screen.getByRole('spinbutton', { name: 'Month' }));
    await user.keyboard('{Delete}');
    expect(screen.getByRole('spinbutton', { name: 'Day' })).toHaveTextContent('04');
    expect(screen.getByText('Enter a valid date (DD/MM/YYYY).')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
    await user.keyboard('11');
    expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled();
  });

  it('allows an explicitly cleared optional date', async () => {
    const user = userEvent.setup();
    render(<DateHarness />);
    await user.click(screen.getByRole('button', { name: 'Clear' }));
    expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled();
    expect(screen.queryByText('Enter a valid date (DD/MM/YYYY).')).not.toBeInTheDocument();
  });
});
