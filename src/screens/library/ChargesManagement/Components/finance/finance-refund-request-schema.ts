import type { FinanceExternalRefundForm } from 'src/redux/library/charges-management/finance-corrections.types';

import * as Yup from 'yup';

import { financeAmountInputSchema } from './finance-money-input';

export type FinanceRefundRequestValues = {
  lines: { allocationId: string; amount: string }[];
  method: string;
  reason: string;
};

export function financeRefundRequestSchema(data: FinanceExternalRefundForm) {
  return Yup.object({
    lines: Yup.array()
      .of(
        Yup.object({
          allocationId: Yup.string().required('Paid receipt is required'),
          amount: Yup.string().when('allocationId', ([id]) =>
            financeAmountInputSchema(
              data.sources.find((source) => source.sourceAllocationId === id)?.availableAmount,
              'Refund amount'
            )
          ),
        })
      )
      .min(1)
      .max(100)
      .test(
        'unique',
        'Select each paid receipt allocation only once.',
        (lines) => !lines || new Set(lines.map((line) => line.allocationId)).size === lines.length
      ),
    method: Yup.string()
      .oneOf(data.allowedPayoutMethods, 'Choose a method allowed by the recorded refund policy.')
      .required('Payout method is required'),
    reason: Yup.string()
      .trim()
      .required('Refund reason is required')
      .max(1000, 'Use at most 1000 characters'),
  });
}
