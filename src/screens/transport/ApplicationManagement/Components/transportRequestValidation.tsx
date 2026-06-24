import * as Yup from 'yup';

export const transportValidationSchema = [
  // Step 1: Select Student
  Yup.object({
    sourceId: Yup.string().required('Please select a member'),
  }),
  // Step 2: Transport Application
  Yup.object({
    searchStop: Yup.string().required('Stop is required'),
    pickupType: Yup.string().required('Pickup type is required'),
  }),
];
