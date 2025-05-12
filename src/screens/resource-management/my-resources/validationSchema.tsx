import * as Yup from 'yup';

export const requestResourceValidationSchema = Yup.object({
  name: Yup.string().required('Resource name is required'),
  category: Yup.string().required('Category is required'),
  subCategory: Yup.string().required('Sub-category is required'),
  quantity: Yup.number()
    .typeError('Quantity must be a number')
    .positive('Quantity must be greater than 0')
    .required('Quantity is required'),
  measurementUnit: Yup.string().required('Measurement unit is required'),
  description: Yup.string().required('Description is required'),
  priority: Yup.string().required('Priority is required'),
  requiredByDate: Yup.date().nullable().required('Required By Date is required'),
});

export const raisedConcernValidationSchema = Yup.object().shape({
  name: Yup.string().required('Resource Name is required'),
  category: Yup.string().required('Category is required'),
  subCategory: Yup.string().required('Sub-Category is required'),
  vendor: Yup.string().required('Vendor is required'),
  condition: Yup.string().required('Condition is required'),
  status: Yup.string().required('Status is required'),
  quantity: Yup.number().required('Quantity is required').min(1, 'Quantity must be at least 1'),
  measurementUnit: Yup.string().required('Measurement Unit is required'),
  description: Yup.string().required('Description is required'),
  image: Yup.string().nullable(), // You can add URL validation if needed
  assignedDate: Yup.date().nullable(), // Optional
  priority: Yup.string().required('Priority is required'),
  issueDescription: Yup.string().nullable(),
  issueSupportingDocument: Yup.string().nullable(),
});
