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
    )
    .test(
      'not-future',
      'Service Date cannot be in the future',
      (value) => value && dayjs(value as dayjs.Dayjs).isSameOrBefore(dayjs(), 'day')
    ),
  nextServiceDate: yup
    .mixed()
    .nullable()
    .test(
      'is-valid-dayjs-or-null',
      'Next Service Date must be a valid date',
      (value) => !value || dayjs(value as dayjs.Dayjs).isValid()
    )
    .test(
      'not-past-if-set',
      'Next Service Date cannot be in the past',
      (value) => !value || dayjs(value as dayjs.Dayjs).isSameOrAfter(dayjs(), 'day')
    ),
});
