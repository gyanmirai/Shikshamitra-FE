import { it, expect, describe } from 'vitest';

import {
  readPaymentCompletionPolicy,
  writePaymentCompletionPolicy,
} from './admission-payment-completion-policy';

describe('Admission payment completion policy', () => {
  it('defaults existing workflows to partial payment and allowed audited deferral', () => {
    expect(readPaymentCompletionPolicy(undefined)).toEqual({
      version: 1,
      paymentRule: 'partial',
      allowCollectionLater: true,
    });
  });
  it.each([
    '{',
    '[]',
    '{"paymentCompletion":null}',
    '{"paymentCompletion":{"version":2}}',
    '{"paymentCompletion":{"paymentRule":"minimum"}}',
    '{"paymentCompletion":{"allowCollectionLater":"false"}}',
  ])('rejects malformed or unsupported settings: %s', (json) => {
    expect(readPaymentCompletionPolicy(json)).toBeNull();
    expect(() =>
      writePaymentCompletionPolicy(json, {
        version: 1,
        paymentRule: 'full',
        allowCollectionLater: false,
      })
    ).toThrow();
  });
  it('round trips full payment without losing extension settings', () => {
    const json = writePaymentCompletionPolicy(
      '{"extension":{"value":1},"paymentCompletion":{"extension":true}}',
      { version: 1, paymentRule: 'full', allowCollectionLater: false }
    );
    expect(readPaymentCompletionPolicy(json)).toEqual({
      version: 1,
      paymentRule: 'full',
      allowCollectionLater: false,
      extension: true,
    });
    expect(JSON.parse(json).extension).toEqual({ value: 1 });
  });
});
