import { fNumber } from './format-number';

import type { InputNumberValue } from './format-number';

// Payroll displays the recorded monetary amount, including paid-correction paise.
// Statutory rounding belongs to the server calculation, not the display formatter.
export function formatPayrollCurrency(value: InputNumberValue): string {
  return fNumber(Object.is(value, -0) ? 0 : value, {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}
