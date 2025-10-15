import * as yup from 'yup';

// Stop Management Form Validation Schema
export const stopManagementValidationSchema = yup.object().shape({
  stopName: yup
    .string()
    .required('Stop Name is required')
    .min(2, 'Stop Name must be at least 2 characters')
    .max(100, 'Stop Name must not exceed 100 characters'),

  landmark: yup
    .string()
    .required('Landmark is required')
    .min(2, 'Landmark must be at least 2 characters')
    .max(100, 'Landmark must not exceed 100 characters'),

  buildingNo: yup.string().nullable().max(50, 'Building No must not exceed 50 characters'),

  flatHouseNo: yup.string().nullable().max(50, 'Flat/House No must not exceed 50 characters'),

  status: yup
    .string()
    .required('Status is required')
    .oneOf(['Active', 'Inactive'], 'Status must be either Active or Inactive'),

  description: yup.string().nullable().max(500, 'Description must not exceed 500 characters'),

  coordinates: yup.object().shape({
    latitude: yup
      .number()
      .nullable()
      .min(-90, 'Latitude must be between -90 and 90')
      .max(90, 'Latitude must be between -90 and 90'),
    longitude: yup
      .number()
      .nullable()
      .min(-180, 'Longitude must be between -180 and 180')
      .max(180, 'Longitude must be between -180 and 180'),
  }),
});

// Stop Status Change Validation Schema
export const stopStatusChangeValidationSchema = yup.object().shape({
  status: yup
    .string()
    .required('Status is required')
    .oneOf(['Active', 'Inactive'], 'Status must be either Active or Inactive'),
});
