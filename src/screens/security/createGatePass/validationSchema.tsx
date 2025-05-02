import * as Yup from 'yup';

export const emergencyGatePassValidationSchema = Yup.object().shape({
  personName: Yup.string().required('Person name is required'),
  time: Yup.date().nullable().required('Time is required'),
  reason: Yup.string().required('Reason is required'),
  emergencyFlag: Yup.string().required('Emergency flag is required'),
});
