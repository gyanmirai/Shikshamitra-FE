import dayjs from 'dayjs';
import { describe, expect, it } from 'vitest';

import { toPaymentTermApiDate } from './paymentTermApiDate';

describe('toPaymentTermApiDate', () => {
  it('keeps the selected board-boundary date in the API payload', () => {
    expect(toPaymentTermApiDate(dayjs('2026-06-01'))).toBe('2026-06-01T00:00:00.000Z');
    expect(toPaymentTermApiDate('2027-05-31T00:00:00+05:30')).toBe(
      '2027-05-31T00:00:00.000Z'
    );
  });

  it('keeps missing dates empty for form validation', () => {
    expect(toPaymentTermApiDate(null)).toBe('');
  });
});
