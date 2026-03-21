import * as yup from 'yup';

export const assignedToMaintenanceWardenValidationSchema = yup.object().shape({
  wardenName: yup.string().required('Warden name is required'),
  assignedDeadline: yup.date().nullable().required('Assigned deadline is required'),
  updateStatus: yup
    .string()

    .required('Status is required'),
  notes: yup.string().required('Notes are required'),
});
export const maintenanceResolvedValidationSchema = yup.object().shape({
  notes: yup.string().required('Notes are required'),
});
