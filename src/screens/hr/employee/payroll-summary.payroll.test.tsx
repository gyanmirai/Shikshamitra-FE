import dayjs from 'dayjs';
import { it, expect, describe } from 'vitest';

import { toSalarySlipMonthYear } from './payroll-summary-utils';

describe('staff payroll summary salary slip contract', () => {
  it('maps the selected month to the salary slip API monthYear format', () => {
    expect(toSalarySlipMonthYear(dayjs('2026-05-01'))).toBe('MAY-2026');
  });
});
