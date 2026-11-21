import dayjs from 'dayjs';
import * as Yup from 'yup';

import type { FinanceRefundAction } from './finance-refund-action-types';

export function financeRefundActionSchema(action: FinanceRefundAction, method: string) {
  const routing = action === 'approve' || action === 'recordPayout';
  return Yup.object({
    expenseCategoryId: routing
      ? Yup.string().required('Expense category is required')
      : Yup.string(),
    bankAccountId:
      routing && method !== 'Cash'
        ? Yup.string().required('Paying school bank is required')
        : Yup.string(),
    externalReference:
      action === 'recordPayout' && method !== 'Cash'
        ? Yup.string().trim().required('Payment reference is required').max(200)
        : Yup.string().max(200),
    paymentDate:
      action === 'recordPayout'
        ? Yup.string()
            .required('Payment date is required')
            .test('instant', 'Select a valid payment date and time', (value) =>
              Boolean(value && dayjs(value).isValid())
            )
        : Yup.string(),
    reason:
      action === 'reject' || action === 'returnPayout'
        ? Yup.string().trim().required('Reason is required').max(1000)
        : Yup.string().max(1000),
    evidenceReference:
      action === 'returnPayout'
        ? Yup.string().trim().required('Evidence reference is required').max(1000)
        : Yup.string().max(1000),
  });
}
