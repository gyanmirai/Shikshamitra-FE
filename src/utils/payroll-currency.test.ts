import { it, expect, describe } from 'vitest';

import { formatPayrollCurrency } from './payroll-currency';

describe('authoritative payroll money presentation', () => {
  it.each([
    [10000, '₹10,000'],
    [9428.45, '₹9,428.45'],
    [9473.45, '₹9,473.45'],
    [-129.55, '-₹129.55'],
    [0.01, '₹0.01'],
    [-0.01, '-₹0.01'],
    [0, '₹0'],
    [-0, '₹0'],
    [1234567.89, '₹12,34,567.89'],
  ])('preserves the recorded %s amount', (amount, expected) => {
    expect(formatPayrollCurrency(amount)).toBe(expected);
  });
});
