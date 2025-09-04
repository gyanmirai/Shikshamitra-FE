import type { IRefund } from '../type';

export const getInitialRefundFormData = (editData?: Partial<IRefund> | null): IRefund => ({
  board: editData?.board || '',
  medium: editData?.medium || '',
  className: editData?.className || '',
  division: editData?.division || '',
  student: editData?.student || '',
  paidTerms: editData?.paidTerms || '',
  amountApplicable: editData?.amountApplicable || '',
  refundAmount: editData?.refundAmount || '',
  refundMethod: editData?.refundMethod || '',
  reason: editData?.reason || '',
});
