import type { Dayjs } from 'dayjs';

import dayjs from 'dayjs';
import * as Yup from 'yup';
import { paymentMethodsConfig } from 'src/screens/finance/FeeCollection/Components/paymentConfigMethods';

export const collectChargeValidationSchema = Yup.object({
  paymentDetails: Yup.object()
    .shape({
      paymentMethod: Yup.string().required('Payment method is required'),
      paymentAmount: Yup.number()
        .transform((value, originalValue) => {
          // Remove ₹, commas, spaces, etc.
          if (typeof originalValue === 'string') {
            const cleaned = originalValue.replace(/[₹,\s]/g, '');
            return cleaned === '' ? undefined : Number(cleaned);
          }
          return value;
        })
        .required('Payment amount is required')
        .min(1, 'Payment amount must be greater than 0')
        // eslint-disable-next-line func-names
        .test('max-amount', 'Payment cannot exceed assigned charge', function (value) {
          const { assignedAmount } = this.parent;
          // If assignedAmount is not a number, skip the test
          // eslint-disable-next-line no-restricted-globals
          if (typeof assignedAmount !== 'number' || isNaN(assignedAmount)) return true;
          return value == null || value <= assignedAmount;
        }),
      notes: Yup.string().nullable(),
    })
    .when('paymentMethod', (paymentMethod, schema) => {
      if (
        !paymentMethod ||
        !paymentMethodsConfig[paymentMethod as unknown as keyof typeof paymentMethodsConfig]
      ) {
        return schema;
      }

      return schema.shape({
        ...Object.fromEntries(
          paymentMethodsConfig[paymentMethod as unknown as keyof typeof paymentMethodsConfig].map(
            (field) => [
              field.name,
              field.required
                ? field.type === 'date'
                  ? Yup.mixed()
                      .required(`${field.label} is required`)
                      .test('is-valid-dayjs', `${field.label} must be a valid date`, (value) =>
                        value ? dayjs(value as Dayjs).isValid() : false
                      )
                  : Yup.string().required(`${field.label} is required`)
                : field.type === 'date'
                  ? Yup.mixed()
                      .nullable()
                      .test(
                        'is-valid-dayjs',
                        `${field.label} must be a valid date`,
                        (value) => !value || dayjs(value as Dayjs).isValid()
                      )
                  : Yup.string().nullable(),
            ]
          )
        ),
      });
    }),
});
