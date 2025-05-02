import type { IGetEarlyPassRequestFormValues } from './gate-pass-parent-interface';

export function getEarlyPassRequestInitialValues(
  data: Partial<IGetEarlyPassRequestFormValues> | null = null
): IGetEarlyPassRequestFormValues {
  return {
    childName: data?.childName || '',
    pickupTime: data?.pickupTime || null,
    pickupDate: data?.pickupDate || null,
    reasonForPickup: data?.reasonForPickup || '',
  };
}
