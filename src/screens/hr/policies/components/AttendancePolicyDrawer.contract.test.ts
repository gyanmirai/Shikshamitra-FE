import { it, expect, describe } from 'vitest';

import {
  ATTENDANCE_CAPTURE_MODE_OPTIONS,
  ATTENDANCE_MISSING_PUNCH_OPTIONS,
  ATTENDANCE_PENALTY_ACTION_OPTIONS,
  ATTENDANCE_HOLIDAY_COMPENSATION_OPTIONS,
  ATTENDANCE_OVERTIME_CALCULATION_OPTIONS,
} from './AttendancePolicyDrawer';

describe('AttendancePolicyDrawer contracts', () => {
  it('only exposes missing punch values supported by the backend', () => {
    expect(ATTENDANCE_MISSING_PUNCH_OPTIONS.map((option) => option.value)).toEqual([
      'requires_review',
      'mark_absent',
      'mark_half_day',
    ]);
    expect(ATTENDANCE_MISSING_PUNCH_OPTIONS.map((option) => option.value)).not.toContain('ignore');
  });

  it('only exposes capture modes supported by the backend', () => {
    expect(ATTENDANCE_CAPTURE_MODE_OPTIONS.map((option) => option.value)).toEqual([
      'manual_status',
      'manual_with_time',
      'integrated',
    ]);
  });

  it('only exposes penalty actions supported by the backend', () => {
    expect(ATTENDANCE_PENALTY_ACTION_OPTIONS.map((option) => option.value)).toEqual([
      'none',
      'warning',
      'salary_deduction',
      'deduct_half_day',
      'deduct_full_day',
    ]);
    expect(ATTENDANCE_PENALTY_ACTION_OPTIONS.map((option) => option.value)).not.toContain(
      'deduct_quarter_day'
    );
  });

  it('only exposes holiday compensation values supported by the backend', () => {
    expect(ATTENDANCE_HOLIDAY_COMPENSATION_OPTIONS.map((option) => option.value)).toEqual([
      'no_benefit',
      'comp_off',
      'ot_payout',
      'both',
      'paid',
    ]);
    expect(ATTENDANCE_HOLIDAY_COMPENSATION_OPTIONS.map((option) => option.value)).not.toContain(
      'ignore'
    );
  });

  it('uses existing overtime values for calculation method choices', () => {
    expect(ATTENDANCE_OVERTIME_CALCULATION_OPTIONS.map((option) => option.value)).toEqual([
      'flat',
      '1.5x',
      '2.0x',
    ]);
  });
});
