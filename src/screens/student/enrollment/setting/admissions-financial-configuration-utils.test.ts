import { it, expect, describe } from 'vitest';
import {
  AdmissionCrmPaymentGateType,
  AdmissionCrmPaymentGateMilestone,
} from 'src/redux/student/admissions-crm/admissions-crm-api';

import {
  calculateFeeTotal,
  feePolicyTemplates,
  validateFeePolicyDraft,
  calculateRequiredPayment,
} from './admissions-financial-configuration-utils';

describe('admissions financial configuration', () => {
  it('provides truthful quick-start templates supported by the finance contract', () => {
    const fullAdvance = feePolicyTemplates.find((item) => item.id === 'full-advance');
    const registrationOnly = feePolicyTemplates.find((item) => item.id === 'registration-only');

    expect(fullAdvance?.requiredPercentage).toBe(100);
    expect(fullAdvance?.gateMilestone).toBe(
      AdmissionCrmPaymentGateMilestone.StudentActivation
    );
    expect(registrationOnly?.components.map((item) => item.key)).toEqual([
      'REGISTRATION_FEE',
    ]);
    expect(feePolicyTemplates.some((item) => item.label.includes('Installment'))).toBe(false);
  });

  it('calculates the parent total and the higher configured payment threshold', () => {
    const total = calculateFeeTotal([
      {
        key: 'ADMISSION',
        name: 'Admission fee',
        amount: 10_000,
        ownerModule: 'Finance',
        isRefundable: false,
      },
      {
        key: 'TUITION',
        name: 'Tuition fee',
        amount: 40_000,
        ownerModule: 'Finance',
        isRefundable: false,
      },
    ]);

    expect(total).toBe(50_000);
    expect(calculateRequiredPayment(total, 5_000, 25)).toBe(12_500);
    expect(calculateRequiredPayment(total, 60_000, 25)).toBe(50_000);
  });

  it('validates the payment gate and effective period before saving', () => {
    const errors = validateFeePolicyDraft({
      code: 'ADVANCE',
      name: 'Advance policy',
      components: [
        {
          key: 'ADMISSION',
          name: 'Admission fee',
          amount: 10_000,
          ownerModule: 'Finance',
          isRefundable: false,
        },
      ],
      gateType: AdmissionCrmPaymentGateType.RequiredAmountConfirmed,
      requiredAmount: 0,
      requiredPercentage: 101,
      gracePeriodHours: -1,
      effectiveFrom: '2026-07-23',
      effectiveUntil: '2026-07-23',
    });

    expect(errors.requiredAmount).toContain('Enter an amount');
    expect(errors.requiredPercentage).toContain('between 0% and 100%');
    expect(errors.gracePeriodHours).toContain('negative');
    expect(errors.effectiveUntil).toContain('after the start');
  });
});
