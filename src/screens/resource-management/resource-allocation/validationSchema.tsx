import * as Yup from 'yup';

export const resourceAllocateValidationSchema = Yup.object().shape({
  resourceName: Yup.string().required('Resource name is required'),

  quantity: Yup.number()
    .typeError('Quantity must be a number')
    .positive('Quantity must be greater than zero')
    .integer('Quantity must be an integer')
    .required('Quantity is required'),

  allocationTarget: Yup.string()
    .oneOf(['Department', 'Teacher', 'Room'], 'Invalid allocation target')
    .required('Allocation target is required'),

  assignedTo: Yup.string().required('Assigned to is required'),

  allocationDate: Yup.date().nullable().required('Allocation date is required'),

  expectedReturnDate: Yup.date()
    .nullable()
    .min(Yup.ref('allocationDate'), 'Return date must be after allocation date')
    .required('Expected return date is required'),
});

export const resourceTransferValidationSchema = Yup.object().shape({
  currentLocation: Yup.string().required('Current location is required'),

  allocationTarget: Yup.string()
    .oneOf(['Department', 'Teacher', 'Room'], 'Invalid allocation target')
    .required('Allocation target is required'),

  assignedTo: Yup.string().required('Assigned to is required'),

  transferDate: Yup.date().nullable().required('Transfer date is required'),

  reasonOfTransfer: Yup.string()
    .required('Reason for transfer is required')
    .min(10, 'Reason must be at least 10 characters long'),
});
