import dayjs from 'dayjs';
import * as Yup from 'yup';

export const getValidationSchemaByModel = (model: string, currentYear: any) => {
  // const baseDateValidation = Yup.date().required('Effective from date is required');

  switch (model) {
    case 'flat-rate':
      return Yup.object().shape({
        model: Yup.string().required(),
        feeAmount: Yup.string().required('Fee amount is required'),
        feeFrequency: Yup.string().required('Fee frequency is required'),
        effectiveFrom: Yup.mixed()
          .required('Effective from date is required')
          .test(
            'is-valid-dayjs',
            'Effective from date must be a valid date',
            (value) => value && dayjs(value as any).isValid()
          )
          .test(
            'min-date',
            (value) =>
              `Effective from date must be on or after ${dayjs(currentYear.startDate).format('DD/MM/YYYY')}`,
            (value) =>
              value && dayjs(value as any).isSameOrAfter(dayjs(currentYear.startDate), 'day')
          )
          .test(
            'max-date',
            (value) =>
              `Effective from date must be on or before ${dayjs(currentYear.endDate).format('DD/MM/YYYY')}`,
            (value) =>
              value && dayjs(value as any).isSameOrBefore(dayjs(currentYear.endDate), 'day')
          ),
      });

    case 'distance-based':
      return Yup.object().shape({
        model: Yup.string().required(),
        ratePerKm: Yup.string().required('Rate per km is required'),
        distanceCalculationType: Yup.string().required('Distance calculation type is required'),
        feeFrequency: Yup.string().required('Fee frequency is required'),
      });

    case 'stop-based':
      return Yup.object().shape({
        model: Yup.string().required(),
        feeFrequency: Yup.string().required('Fee frequency is required'),
      });

    case 'zone-based':
      return Yup.object().shape({
        model: Yup.string().required(),
        zones: Yup.array()
          .of(
            Yup.object().shape({
              zoneName: Yup.string().required('Zone name is required'),
              feeAmount: Yup.string().required('Fee amount is required'),
              frequency: Yup.string().required('Frequency is required'),
            })
          )
          .min(1, 'At least one zone is required')
          .required('Zones are required'),
        effectiveFrom: Yup.mixed()
          .required('Effective from date is required')
          .test(
            'is-valid-dayjs',
            'Effective from date must be a valid date',
            (value) => value && dayjs(value as any).isValid()
          )
          .test(
            'min-date',
            (value) =>
              `Effective from date must be on or after ${dayjs(currentYear.startDate).format('DD/MM/YYYY')}`,
            (value) =>
              value && dayjs(value as any).isSameOrAfter(dayjs(currentYear.startDate), 'day')
          )
          .test(
            'max-date',
            (value) =>
              `Effective from date must be on or before ${dayjs(currentYear.endDate).format('DD/MM/YYYY')}`,
            (value) =>
              value && dayjs(value as any).isSameOrBefore(dayjs(currentYear.endDate), 'day')
          ),
      });

    default:
      return Yup.object().shape({
        model: Yup.string().required(),
        effectiveFrom: Yup.mixed()
          .required('Effective from date is required')
          .test(
            'is-valid-dayjs',
            'Effective from date must be a valid date',
            (value) => value && dayjs(value as any).isValid()
          )
          .test(
            'min-date',
            (value) =>
              `Effective from date must be on or after ${dayjs(currentYear.startDate).format('DD/MM/YYYY')}`,
            (value) =>
              value && dayjs(value as any).isSameOrAfter(dayjs(currentYear.startDate), 'day')
          )
          .test(
            'max-date',
            (value) =>
              `Effective from date must be on or before ${dayjs(currentYear.endDate).format('DD/MM/YYYY')}`,
            (value) =>
              value && dayjs(value as any).isSameOrBefore(dayjs(currentYear.endDate), 'day')
          ),
      });
  }
};
