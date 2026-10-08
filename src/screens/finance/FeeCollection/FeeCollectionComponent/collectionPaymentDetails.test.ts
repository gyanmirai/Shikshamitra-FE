import { describe, expect, it } from 'vitest';

import { collectionPaymentDetails } from './collectionPaymentDetails';

describe('collectionPaymentDetails', () => {
  it('removes a previously selected school bank from cash while preserving other details', () => {
    const details = { bankAccount: 'school-bank', reference: 'counter-note' };
    expect(collectionPaymentDetails('Cash', details)).toEqual({ reference: 'counter-note' });
    expect(details.bankAccount).toBe('school-bank');
  });

  it.each(['Cheque', 'UPI', 'Demand Draft (DD)', 'Credit Card', 'Bank Transfer (NEFT/RTGS/IMPS)'])(
    'preserves the selected school bank for %s',
    (method) => {
      expect(collectionPaymentDetails(method, { bankAccount: 'school-bank' })).toEqual({
        bankAccount: 'school-bank',
      });
    }
  );
});
