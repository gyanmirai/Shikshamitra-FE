import type { Dayjs } from 'dayjs';

export interface IFacilityBookingFormValues {
  facilityType: string; // Select dropdown
  attendees: string; // Number of Attendees
  bookingPurpose: string; // Purpose Of Booking
  date: Dayjs | null; // DatePicker
  startTime: Dayjs | null; // TimePicker
  endTime: Dayjs | null; // TimePicker
  contactPerson: string; // Contact Person
  justification: string; // Justification
}

export interface IBookFacilitySectionProps {
  isEdit?: boolean;
  data?: IFacilityBookingFormValues;
}

export interface IFacility {
  id: string;
  name: string;
  type: string;
  capacity: number;
  location: string;
  status: number;
}

export interface IAddNewFacilityFormValues {
  facilityName: string;
  facilityType: string;
  capacity: number;
  location: string;
  amenities: string;
  description: string;
}

export interface IAddFacilityDialogProps {
  isEdit?: boolean;
  data?: IAddNewFacilityFormValues;
}
