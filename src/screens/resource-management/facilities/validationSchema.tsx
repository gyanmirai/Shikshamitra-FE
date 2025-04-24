import dayjs from 'dayjs';
import * as Yup from 'yup';

export const facilityBookingValidationSchema = Yup.object({
  facilityType: Yup.string().required('Facility Type is required'),

  attendees: Yup.string()
    .required('Number of Attendees is required')
    .matches(/^\d+$/, 'Attendees must be a valid number'),

  bookingPurpose: Yup.string().required('Purpose of Booking is required'),

  date: Yup.date().nullable().required('Date is required'),

  startTime: Yup.date().nullable().required('Start Time is required'),

  endTime: Yup.date()
    .test('endtime', 'End time must be after start time', (value, context) => {
      if (dayjs(context.parent.startTime).isAfter(dayjs(value))) {
        return false;
      }
      return true;
    })
    .required('End Time is required'),
  contactPerson: Yup.string().required('Contact Person is required'),

  justification: Yup.string().required('Justification is required'),
});

export const AddNewFacilityValidationSchema = Yup.object().shape({
  facilityName: Yup.string().required('Facility name is required'),
  facilityType: Yup.string().required('Facility type is required'),
  capacity: Yup.number()
    .typeError('Capacity must be a number')
    .min(1, 'Capacity must be at least 1')
    .required('Capacity is required'),
  location: Yup.string().required('Location is required'),
  amenities: Yup.string().required('Amenities are required'),
  description: Yup.string().required('Description is required'),
});
