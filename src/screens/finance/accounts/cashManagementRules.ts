import dayjs from 'dayjs';
import * as Yup from 'yup';

export type CashAction = 'approve' | 'deposit' | 'confirm';
export function cashActionAllowed(
  action: 'Approve' | 'Deposit' | 'Reconcile',
  permissions: string[],
  eligible: boolean
) {
  return eligible && permissions.includes(`Finance.Accounts.CashManagement.${action}`);
}
export function cashCommandSchema(action: CashAction, maximum: number, dispatchDate?: string) {
  return Yup.object({
    amount: Yup.string()
      .required('Enter an amount.')
      .matches(/^\d+(\.\d{1,2})?$/, 'Enter at most two decimals.')
      .test(
        'amount',
        action === 'approve'
          ? 'Count must match the remaining cash to deposit.'
          : 'Amount must be positive and within the available balance.',
        (value) =>
          action === 'approve'
            ? Number(value) >= 0 && Math.round(Number(value) * 100) === Math.round(maximum * 100)
            : Number(value) > 0 && Math.round(Number(value) * 100) <= Math.round(maximum * 100)
      ),
    bankAccountId:
      action === 'approve'
        ? Yup.string().required('Select an active school bank account.')
        : Yup.string(),
    reference:
      action === 'approve'
        ? Yup.string()
        : Yup.string().trim().required('Enter the bank evidence reference.').max(100),
    date:
      action === 'approve'
        ? Yup.string()
        : Yup.string()
            .required('Select the actual date.')
            .test(
              'date',
              'Select a valid time no later than now and no earlier than dispatch.',
              (value) =>
                Boolean(
                  value &&
                  dayjs(value).isValid() &&
                  !dayjs(value).isAfter(dayjs()) &&
                  (!dispatchDate || !dayjs(value).isBefore(dayjs(dispatchDate)))
                )
            ),
    notes: Yup.string().max(2000),
  });
}
