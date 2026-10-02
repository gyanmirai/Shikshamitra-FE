import { it, expect, describe } from 'vitest';

import {
  attendanceCompletionLabel,
  attendancePercentageColor,
  attendancePercentageLabel,
} from './attendance-dashboard-metrics';

describe('attendance dashboard metrics', () => {
  it('distinguishes no recorded denominator from recorded absence', () => {
    expect(attendancePercentageLabel(null)).toBe('—');
    expect(attendancePercentageColor(null)).toBe('default');
    expect(attendancePercentageLabel(0)).toBe('0%');
    expect(attendancePercentageColor(0)).toBe('error');
  });

  it('exposes incomplete marking alongside policy-weighted attendance', () => {
    expect(attendancePercentageLabel(87.5)).toBe('87.5%');
    expect(
      attendanceCompletionLabel({
        expectedDays: 40,
        recordedDays: 32,
        missingDays: 8,
        presentCredit: 28,
        denominatorDays: 32,
        completionPercentage: 80,
        isProvisional: true,
      })
    ).toBe('32/40 expected student-days marked · Provisional');
  });
});
