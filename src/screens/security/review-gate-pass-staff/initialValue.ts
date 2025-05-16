import type { IReviewStaffGatePassRequestFormValues } from './review-gate-pass-staff-interfcae';

export function getReviewStaffGatePassRequestInitialValues(
  data: Partial<IReviewStaffGatePassRequestFormValues> | null = null
): IReviewStaffGatePassRequestFormValues {
  return {
    name: data?.name || '',
    leaveTime: data?.leaveTime || null,
    leaveDate: data?.leaveDate || null,
    reasonForLeave: data?.reasonForLeave || '',
    description: data?.description || '',
  };
}
