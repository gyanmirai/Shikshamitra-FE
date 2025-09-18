import * as Yup from 'yup';

export const holidayTypeValidationSchema = Yup.object().shape({
  holidayType: Yup.string().trim().required('Holiday Type is required'),
  description: Yup.string().nullable(),
});
