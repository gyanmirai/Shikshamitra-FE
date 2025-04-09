import * as Yup from 'yup';

export const vehicleValidationSchema = Yup.object({
  vehicleName: Yup.string().required('Vehicle name is required'),
  registrationNumber: Yup.string().required('Registration number is required'),
  vehicleType: Yup.string().required('Vehicle type is required'),
  manufacturer: Yup.string().required('Manufacturer is required'),
  seatingCapacity: Yup.number()
    .required('Seating capacity is required')
    .min(1, 'Must be at least 1'),
  insurancePolicyNumber: Yup.string().required('Insurance policy number is required'),
  insuranceExpiryDate: Yup.date().required('Insurance expiry date is required'),
  dailyInspectionChecklist: Yup.string().required('Inspection checklist is required'),
  assignedRoute: Yup.string().required('Assigned route is required'),
  assignedDriver: Yup.string().required('Assigned driver is required'),
});
