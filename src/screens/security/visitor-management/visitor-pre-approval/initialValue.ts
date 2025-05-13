import type { IVisitorPreApprovalFormValues } from './visitor-pre-approval-interface';

export const getInitialVisitorPreApprovalValues = (
  data: Partial<IVisitorPreApprovalFormValues> | null = {}
): IVisitorPreApprovalFormValues => ({
  visitorName: data?.visitorName ?? '',
  visitorEmail: data?.visitorEmail ?? '',
  visitorPhone: data?.visitorPhone ?? '',
  visitingTime: data?.visitingTime ?? null,
  visitingDate: data?.visitingDate ?? null,
  visitingPurpose: data?.visitingPurpose ?? '',
  status: data?.status ?? '',
});
