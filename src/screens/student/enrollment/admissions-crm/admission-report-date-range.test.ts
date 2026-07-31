import { it, expect, describe } from 'vitest';

import { getAdmissionReportDateRangeError } from './admission-report-date-range';

describe('Admission report date range', () => {
  it('matches the backend ordering validation', () => {
    expect(getAdmissionReportDateRangeError('2026-07-31', '2026-07-01')).toBe('invalid-order');
  });

  it('allows the backend maximum 366-day span', () => {
    expect(getAdmissionReportDateRangeError('2025-01-01', '2026-01-02')).toBeUndefined();
  });

  it('blocks a span larger than the backend maximum before querying', () => {
    expect(getAdmissionReportDateRangeError('2025-01-01', '2026-01-03')).toBe('too-large');
  });

  it('rejects impossible calendar dates before querying', () => {
    expect(getAdmissionReportDateRangeError('2026-02-31', '2026-03-01')).toBe('invalid-date');
  });

  it('does not invent a range error while either bound is absent', () => {
    expect(getAdmissionReportDateRangeError('', '2026-01-03')).toBeUndefined();
    expect(getAdmissionReportDateRangeError('2025-01-01', '')).toBeUndefined();
  });
});
