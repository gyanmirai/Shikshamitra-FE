import * as Yup from 'yup';

// Validation schema for MeetingTypeForm
export const meetingTypeValidationSchema = Yup.object().shape({
  meetingType: Yup.string().trim().required('Meeting Type is required'),
  description: Yup.string().nullable(),
});
