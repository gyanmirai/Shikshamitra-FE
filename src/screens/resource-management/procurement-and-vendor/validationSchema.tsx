import * as Yup from 'yup';

export const procurementAndVendorValidationSchema = Yup.object().shape({
  resourceCategory: Yup.string().required('Resource category is required'),
  resourceName: Yup.string().required('Resource name is required'),
  purpose: Yup.string().required('Purpose is required'),
  quantity: Yup.number()
    .required('Quantity is required')
    .positive('Quantity must be greater than zero')
    .integer('Quantity must be an integer'),
  expectedDeliveryDate: Yup.date().nullable().required('Expected delivery date is required'),
  status: Yup.string(),
  requestedBy: Yup.string(),
});

export const assignedToPurchaseValidationSchema = Yup.object().shape({
  assignedTo: Yup.string().required('Assigned To is required'),
  priority: Yup.string().required('Priority is required'),
  description: Yup.string().required('Description is required'),
});
