import type { IReviewEarlyPassRequestFormValues } from './review-gate-pass-request-interface';

export function getReviewEarlyPassRequestInitialValues(
  data: Partial<IReviewEarlyPassRequestFormValues> | null = null
): IReviewEarlyPassRequestFormValues {
  return {
    childName: data?.childName || '',
    pickupTime: data?.pickupTime || null,
    pickupDate: data?.pickupDate || null,
    reasonForPickup: data?.reasonForPickup || '',
    description: data?.description || '',
  };
}
