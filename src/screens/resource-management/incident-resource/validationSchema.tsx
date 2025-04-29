import * as Yup from 'yup';

export const incidentResourceStatusValidationSchema = Yup.object().shape({
  status: Yup.string()
    .oneOf(['Under Review', 'Replaced', 'New', 'Resolved'], 'Invalid Status')
    .required('Status is required'),

  actionTaken: Yup.string().required('Action Taken is required'),
  adminNotes: Yup.string().required('Admin Notes are required'),
});
