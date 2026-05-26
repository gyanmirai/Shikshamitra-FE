import type { HrPolicyVersion } from 'src/redux/hr/hr-policy-api';

import { it, expect, describe } from 'vitest';

import {
  attendanceNumericRules,
  clampNumericPolicyInput,
  cleanVersionDisplayValue,
  getNumericPolicyInputError,
  sanitizeNumericPolicyInput,
  versionMatchesHistorySearch,
  isAttendanceThresholdOrderValid,
} from './hr-policy-ui-utils';

const version: HrPolicyVersion = {
  id: 'version-1',
  policyType: 'payroll',
  policyId: 'policy-1',
  academicYearId: 'year-1',
  versionNumber: 1,
  name: 'Standard Payroll',
  status: 'active',
  changeAction: 'updated',
  changeReason: 'Changed basis',
  creationTime: '2026-05-25T10:19:04.4720646+00:00',
  snapshotJson: '{}',
};

describe('HR policy UI utilities', () => {
  it('sanitizes, caps, and clamps numeric policy input', () => {
    const graceRule = attendanceNumericRules.graceTime;

    expect(sanitizeNumericPolicyInput('3034344', graceRule)).toBe('303');
    expect(clampNumericPolicyInput('3034344', graceRule)).toBe('240');
    expect(getNumericPolicyInputError('303', graceRule)).toBe(
      'Late grace minutes must be between 0 and 240.'
    );
  });

  it('allows version history search by version id label and number', () => {
    expect(versionMatchesHistorySearch(version, 'v1')).toBe(true);
    expect(versionMatchesHistorySearch(version, '1')).toBe(true);
    expect(versionMatchesHistorySearch(version, 'changed basis')).toBe(true);
    expect(versionMatchesHistorySearch(version, 'v2')).toBe(false);
  });

  it('requires full day threshold to be strictly greater than half day threshold', () => {
    expect(isAttendanceThresholdOrderValid(75, 50, 0)).toBe(true);
    expect(isAttendanceThresholdOrderValid(50, 50, 0)).toBe(false);
    expect(isAttendanceThresholdOrderValid(75, 40, 50)).toBe(false);
  });

  it('formats raw ISO timestamp values for version comparison fallback display', () => {
    expect(cleanVersionDisplayValue('20260525T10:19:04.4720646+00:00')).toContain('25 May 2026');
    expect(cleanVersionDisplayValue('20260525T10:19:04.4720646+00:00')).not.toContain('T');
    expect(cleanVersionDisplayValue('2026-06-01T00:00:00')).toContain('01 Jun 2026');
    expect(cleanVersionDisplayValue('2026-06-01T00:00:00')).not.toContain('T');
  });
});
