import type { IWalkInVisitorFormValues } from '../visitor-check-in-out-interface';

export const getInitialWalkInVisitorApprovalValues = (
  data: Partial<IWalkInVisitorFormValues> | null = {}
): IWalkInVisitorFormValues => ({
  visitorName: data?.visitorName ?? '',
  visitorEmail: data?.visitorEmail ?? '',
  visitorPhone: data?.visitorPhone ?? '',
  visitingTime: data?.visitingTime ?? null,
  visitingDate: data?.visitingDate ?? null,
  visitingPurpose: data?.visitingPurpose ?? '',
  status: data?.status ?? '',
});
