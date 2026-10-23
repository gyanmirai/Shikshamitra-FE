import dayjs from 'dayjs';
import { describe, expect, it } from 'vitest';

import { paymentMethodsConfig } from './paymentConfigMethods';
import { parseCollectionPaymentDate, getCollectionPaymentDateError } from './collectionPaymentDate';

const today = dayjs('2026-10-22');

describe('collection payment dates', () => {
  it.each(
    Object.entries(paymentMethodsConfig).flatMap(([method, fields]) =>
      fields.filter((field) => field.type === 'date').map((field) => [method, field.label])
    )
  )('enforces the same typed date rule for %s / %s', (_, label) => {
    expect(getCollectionPaymentDateError('21/10/2026', label, true, today)).toContain(
      'cannot be before'
    );
    expect(getCollectionPaymentDateError('22/10/2026', label, true, today)).toBeUndefined();
    expect(getCollectionPaymentDateError('23/10/2026', label, true, today)).toBeUndefined();
  });

  it.each(['DD/MM/2026', '31/02/2027', '2027-02-31', '2026', '10/22/2026', '2026-10-22Tbad'])(
    'rejects incomplete or invalid %s',
    (value) => {
      expect(getCollectionPaymentDateError(value, 'Payment date', true, today)).toContain(
        'complete, valid'
      );
    }
  );

  it('preserves the picker object during invalid segment edits', () => {
    const incomplete = dayjs('');
    expect(parseCollectionPaymentDate(incomplete)).toBe(incomplete);
    const complete = dayjs('2026-10-22');
    expect(parseCollectionPaymentDate(complete)).toBe(complete);
  });

  it('allows an empty optional date, rejects empty required dates, and retains timestamp offsets', () => {
    expect(getCollectionPaymentDateError(null, 'Issue date', false, today)).toBeUndefined();
    expect(getCollectionPaymentDateError(null, 'Issue date', true, today)).toBe(
      'Issue date is required'
    );
    const value = '2026-10-23T00:00:00+05:30';
    expect(parseCollectionPaymentDate(value)?.toISOString()).toBe(dayjs(value).toISOString());
  });
});
