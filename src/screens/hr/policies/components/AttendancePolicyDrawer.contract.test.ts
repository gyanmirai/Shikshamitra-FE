import { it, expect, describe } from 'vitest';

import { ATTENDANCE_MISSING_PUNCH_OPTIONS } from './AttendancePolicyDrawer';

describe('AttendancePolicyDrawer contracts', () => {
  it('only exposes missing punch values supported by the backend', () => {
    expect(ATTENDANCE_MISSING_PUNCH_OPTIONS.map((option) => option.value)).toEqual([
      'requires_review',
      'mark_absent',
      'mark_half_day',
    ]);
    expect(ATTENDANCE_MISSING_PUNCH_OPTIONS.map((option) => option.value)).not.toContain('ignore');
  });
});
