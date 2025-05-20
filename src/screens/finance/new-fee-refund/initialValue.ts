import type { IStudentRefundRequest } from './new-refund-request-interface';

export const getInitialStudentRefundRequest = (
  data: Partial<IStudentRefundRequest> | null = {}
): IStudentRefundRequest => ({
  studentName: data?.studentName ?? '',
  rollNo: data?.rollNo ?? null,
  class: data?.class ?? '',
  division: data?.division ?? '',
  requestedOn: data?.requestedOn ?? null, // default to now
  reason: data?.reason ?? '',
  askForRefund: data?.askForRefund ?? undefined,
  reasonForReject: data?.reasonForReject ?? '',
  approvedAmount: data?.approvedAmount ?? undefined,
  status: data?.status ?? 'pending',
  grNo: data?.grNo ?? null,
  feeType: data?.feeType ?? [],
  paidTerms: data?.paidTerms ?? [],
  amountApplicableForRefund: data?.amountApplicableForRefund ?? 0,
});
