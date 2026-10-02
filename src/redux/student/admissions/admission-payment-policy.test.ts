import { it, expect, describe } from 'vitest';

import {
  DEFAULT_PAYMENT_POLICY,
  readAdmissionPaymentPolicy,
  writeAdmissionPaymentPolicy,
  getAdmissionPaymentConfigurationError,
} from './admission-payment-policy';

describe('managed Payment stage policy', () => {
  it('keeps historical payment settings optional until explicitly configured', () => {
    const { requiresFeeStructureSelection, ...historical } = DEFAULT_PAYMENT_POLICY;
    expect(
      readAdmissionPaymentPolicy(JSON.stringify({ payment: historical }))
        ?.requiresFeeStructureSelection
    ).toBe(false);
    expect(
      readAdmissionPaymentPolicy(
        JSON.stringify({ payment: { ...historical, requiresFeeStructureSelection: true } })
      )?.requiresFeeStructureSelection
    ).toBe(true);
    expect(
      readAdmissionPaymentPolicy(
        JSON.stringify({ payment: { ...historical, requiresFeeStructureSelection: 'true' } })
      )
    ).toBeNull();
  });
  it('keeps the existing basic stage compatible', () => {
    expect(readAdmissionPaymentPolicy(undefined)).toBeNull();
    expect(getAdmissionPaymentConfigurationError(undefined)).toBeUndefined();
  });
  it('preserves unrelated stage configuration', () => {
    const json = writeAdmissionPaymentPolicy(
      JSON.stringify({ custom: { kept: true } }),
      DEFAULT_PAYMENT_POLICY
    );
    expect(JSON.parse(json)).toMatchObject({
      custom: { kept: true },
      payment: DEFAULT_PAYMENT_POLICY,
    });
  });
  it('accepts installments, deadlines, independent verification, and waivers', () => {
    const policy = {
      ...DEFAULT_PAYMENT_POLICY,
      dueInDays: 10,
      allowInstallments: true,
      minimumInstallmentAmount: 100,
      requireIndependentVerification: true,
      allowWaiver: true,
    };
    const json = JSON.stringify({ payment: policy });
    expect(readAdmissionPaymentPolicy(json)).toEqual(policy);
    expect(getAdmissionPaymentConfigurationError(json)).toBeUndefined();
  });
  it('rejects an installment greater than the required amount', () => {
    const json = JSON.stringify({
      payment: {
        ...DEFAULT_PAYMENT_POLICY,
        allowInstallments: true,
        minimumInstallmentAmount: 501,
      },
    });
    expect(getAdmissionPaymentConfigurationError(json)).toContain('minimum installment');
  });
  it('blocks online collection until a trusted gateway exists', () => {
    const json = JSON.stringify({
      payment: {
        ...DEFAULT_PAYMENT_POLICY,
        collectionMode: 'online',
        acceptedMethods: ['onlineGateway'],
      },
    });
    expect(getAdmissionPaymentConfigurationError(json)).toContain('gateway');
  });
});
