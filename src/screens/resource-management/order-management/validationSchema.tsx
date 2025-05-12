import * as Yup from 'yup';

export const resourceRequestOrderValidationSchema = Yup.object().shape({
  assignedVendor: Yup.string().required('Assigned vendor is required'),

  costing: Yup.string()
    .required('Costing is required')
    .matches(/^\d+(\.\d{1,2})?$/, 'Costing must be a valid amount'),

  orderQuantity: Yup.number()
    .required('Order quantity is required')
    .positive('Quantity must be greater than zero')
    .integer('Quantity must be an integer'),
});

export const resourceRequestOrderDeliveredValidationSchema = Yup.object().shape({
  orderBill: Yup.string().required('Order bill is required'),
});
