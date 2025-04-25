import type { IAddNewFacilityFormValues, IFacilityBookingFormValues } from './facilities-interface';

export function getInitialFacilityBookingValues(
  data: Partial<IFacilityBookingFormValues> = {},
  isEdit = false
): IFacilityBookingFormValues {
  return {
    facilityType: isEdit ? (data.facilityType ?? '') : '',
    attendees: isEdit ? (data.attendees ?? '') : '',
    bookingPurpose: isEdit ? (data.bookingPurpose ?? '') : '',
    date: isEdit ? (data.date ?? null) : null,
    startTime: isEdit ? (data.startTime ?? null) : null,
    endTime: isEdit ? (data.endTime ?? null) : null,
    contactPerson: isEdit ? (data.contactPerson ?? '') : '',
    justification: isEdit ? (data.justification ?? '') : '',
  };
}

export function getInitialAddFacilityValues(
  data: Partial<IAddNewFacilityFormValues> = {},
  isEdit = false
): IAddNewFacilityFormValues {
  return {
    facilityName: data.facilityName ?? '',
    facilityType: data.facilityType ?? '',
    capacity: data.capacity ?? 0,
    location: data.location ?? '',
    amenities: data.amenities ?? '',
    description: data.description ?? '',
  };
}
