import dayjs from 'dayjs';
import * as yup from 'yup';

export const maintenanceValidationSchema = yup.object().shape({
  serviceDate: yup
    .mixed()
    .required('Service Date is required')
    .test(
      'is-valid-dayjs',
      'Service Date must be a valid date',
      (value) => value && dayjs(value as dayjs.Dayjs).isValid()
    ),
});
