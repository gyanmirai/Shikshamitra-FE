import type { RecordRefundPayoutInput } from 'src/redux/finance/RefundManagement/feeRefundManage';

import type { IStudentFeeData } from '../type';
import type { RefundPaymentValues } from './RefundPaymentDialog';

export function buildRefundPayoutPayload(
  refund: IStudentFeeData,
  values: RefundPaymentValues,
  idempotencyKey: string,
  paymentDate: string
): RecordRefundPayoutInput {
  return {
    idempotencyKey,
    method: values.method,
    amount: refund._approvedAmount ?? 0,
    paymentDate,
    bankAccountId: values.bankAccountId,
    expenseCategoryId: values.expenseCategoryId,
    // A pending reference is display-only; the server owns the saved payment identity.
    ...(!refund._payoutPending && values.method !== 'Cash'
      ? { externalReference: values.externalReference.trim() }
      : {}),
  };
}
