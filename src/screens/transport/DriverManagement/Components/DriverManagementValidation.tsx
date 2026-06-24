import * as Yup from 'yup';

export const driverConductorValidationSchema = Yup.object().shape({
  employeeId: Yup.string().required('Employee is required'),
  role: Yup.number().required('Role is required'),
  licenceNo: Yup.string().when('role', {
    is: 0,
    then: (schema) => schema.trim().required('Licence no. is required for drivers'),
    otherwise: (schema) => schema.nullable(),
  }),
  licenceExpiry: Yup.mixed().when('role', {
    is: 0,
    then: (schema) => schema.required('Licence expiry is required for drivers'),
    otherwise: (schema) => schema.nullable(),
  }),
  experienceYears: Yup.number()
    .typeError('Experience must be a number')
    .min(0, 'Experience cannot be negative')
    .nullable(),
});

export const assignRouteValidationSchema = Yup.object().shape({
  selectedRoute: Yup.string().required('Route selection is required'),
  selectedVehicle: Yup.string().required('Vehicle selection is required'),
  selectedConductor: Yup.string().nullable(),
});
