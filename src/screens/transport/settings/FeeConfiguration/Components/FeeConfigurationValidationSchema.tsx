import dayjs from 'dayjs';
import * as Yup from 'yup';

const baseFeeConfigurationSchema = {
  model: Yup.string().required(),
  chargeCategoryId: Yup.string().required('Charge category is required'),
  feeFrequency: Yup.string().required('Fee frequency is required'),
  effectiveFrom: Yup.mixed()
    .required('Effective from date is required')
    .test(
      'is-valid-dayjs',
      'Effective from date must be a valid date',
      (value) => !!value && dayjs(value as any).isValid()
    ),
};

export const getValidationSchemaByModel = (model: string, _currentYear: any) => {
  switch (model) {
    case 'distance-based':
      return Yup.object().shape({
        ...baseFeeConfigurationSchema,
        ratePerKm: Yup.number()
          .typeError('Rate per km is required')
          .positive('Rate per km must be greater than zero')
          .required('Rate per km is required'),
      });

    case 'stop-based':
      return Yup.object().shape(baseFeeConfigurationSchema);

    default:
      return Yup.object().shape(baseFeeConfigurationSchema);
  }
};
