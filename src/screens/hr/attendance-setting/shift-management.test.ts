import dayjs from 'dayjs';
import { it, expect, describe } from 'vitest';

import { isValidShiftTimeRange } from './shift-management-utils';

describe('HR attendance shift management', () => {
  it('allows normal same-day shifts', () => {
    expect(isValidShiftTimeRange(dayjs('2024-01-01T09:00:00'), dayjs('2024-01-01T17:00:00'))).toBe(
      true
    );
  });

  it('rejects equal start and end times', () => {
    expect(isValidShiftTimeRange(dayjs('2024-01-01T09:00:00'), dayjs('2024-01-01T09:00:00'))).toBe(
      false
    );
  });

  it('rejects overnight shift ranges', () => {
    expect(isValidShiftTimeRange(dayjs('2024-01-01T22:00:00'), dayjs('2024-01-01T06:00:00'))).toBe(
      false
    );
  });
});
