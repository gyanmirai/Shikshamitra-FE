import type { IResourceBookingFormValues } from './resource-booking-interface';

export function getInitialBookingValues(
  data: Partial<IResourceBookingFormValues> = {},
  isEdit = false
): IResourceBookingFormValues {
  return {
    resourceName: isEdit ? (data.resourceName ?? '') : '',
    date: isEdit ? (data.date ?? null) : null,
    time: isEdit ? (data.time ?? null) : null,
    status: isEdit ? (data.status ?? '') : '',
    purpose: isEdit ? (data.purpose ?? '') : '',
    requestedBy: isEdit ? (data.requestedBy ?? '') : '',
  };
}
