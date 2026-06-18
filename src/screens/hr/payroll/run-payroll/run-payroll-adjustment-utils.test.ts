import { it, expect, describe } from 'vitest';

import {
  getPayrollAdjustmentSourceLabel,
  isSystemGeneratedPayrollAdjustment,
} from './run-payroll-adjustment-utils';

describe('run payroll adjustment utils', () => {
  it('marks system-generated leave encashment adjustments as read-only source rows', () => {
    const adjustment = {
      isSystemGenerated: true,
      sourceType: 'leave_year_end_encashment',
    };

    expect(isSystemGeneratedPayrollAdjustment(adjustment)).toBe(true);
    expect(getPayrollAdjustmentSourceLabel(adjustment)).toBe('Leave encashment');
  });

  it('keeps manual adjustments editable', () => {
    expect(isSystemGeneratedPayrollAdjustment({ isSystemGenerated: false })).toBe(false);
    expect(isSystemGeneratedPayrollAdjustment(null)).toBe(false);
    expect(getPayrollAdjustmentSourceLabel({ sourceType: 'other_system_source' })).toBe('System');
  });
});
