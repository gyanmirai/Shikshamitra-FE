import * as Yup from 'yup';

export const resourceMeasurementUnitValidationSchema = Yup.object().shape({
  resourceMeasurementUnit: Yup.string().required('Measurement unit is required'),
  resourceMeasurementUnitDescription: Yup.string().required('Description is required'),
});
