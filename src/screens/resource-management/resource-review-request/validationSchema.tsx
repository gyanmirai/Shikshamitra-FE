import * as Yup from 'yup';

export const adminReviewValidationSchema = Yup.object().shape({
  approvedQuantity: Yup.number().required('Approved quantity is required'),
  reasonByAdmin: Yup.string().required('Description is required'),
  //   assignedVendor: Yup.string()
  //     .required('Assigned vendor is required'),

  //   assignedEngineer: Yup.string()
  //     .required('Assigned engineer is required'),

  //   costing: Yup.string()
  //     .required('Costing is required')
  //     .matches(/^\d+(\.\d{1,2})?$/, 'Costing must be a valid amount'),

  //   orderQuantity: Yup.number()
  //     .required('Order quantity is required')
  //     .positive('Quantity must be greater than zero')
  //     .integer('Quantity must be an integer'),
});
