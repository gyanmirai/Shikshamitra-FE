import type { IPaymentFieldConfig } from './FeeCollection/Components/type';

import { describe, expect, it } from 'vitest';

import { paymentMethodsConfig } from './FeeCollection/Components/paymentConfigMethods';
import { buildCollectionFieldValidation } from './FeeCollection/Components/PaymentDetailsForm';
import { buildFieldValidation } from './feeRefund/NewRefundForm/initialValuesAndValidation';
import { refundPaymentMethodsConfig } from './feeRefund/NewRefundForm/refundPaymentDetailsConfig';
import { isFinancePaymentNameField } from 'src/utils/finance-name';

const year = { startDate: '2026-04-01', endDate: '2027-03-31' };
const groups = [
  ['collection', paymentMethodsConfig, buildCollectionFieldValidation],
  [
    'refund',
    refundPaymentMethodsConfig,
    (field: Parameters<typeof buildFieldValidation>[0]) => buildFieldValidation(field, year, {}),
  ],
] as const;

describe.each(groups)('%s payment names', (_kind, config, build) => {
  Object.entries<IPaymentFieldConfig[]>(config).forEach(([method, fields]) => {
    fields.filter((item) => isFinancePaymentNameField(item.name)).forEach((field) => {
      it(`${method}: validates ${field.label} and preserves required/optional semantics`, async () => {
        const schema = build(field, year);
        await expect(schema.validate('School @ Bank')).rejects.toThrow(
          'can only contain letters, numbers, and spaces'
        );
        await expect(schema.validate('शिक्षा बैंक २')).resolves.toBe('शिक्षा बैंक २');
        if (field.required) {
          await expect(schema.validate('')).rejects.toThrow('is required');
        } else {
          await expect(schema.validate('')).resolves.toBe('');
        }
      });
    });
  });
});
