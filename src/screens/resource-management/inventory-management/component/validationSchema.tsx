import dayjs from 'dayjs';
import * as Yup from 'yup';

export const addResourceValidationSchema = Yup.object().shape({
  itemName: Yup.string().required('Item name is required'),

  categoryName: Yup.string().required('Category is required'),

  quantity: Yup.string()
    .required('Quantity is required')
    .transform((value) => value.replace(/[^0-9.]/g, '')) // keep numeric input only
    .test('is-valid-quantity', 'Quantity must be a number greater than zero', (value) => {
      const numericValue = Number(value);
      return numericValue > 0;
    }),

  storageLocation: Yup.string().required('Storage location is required'),
});

export const issueResourceValidationSchema = Yup.object().shape({
  selectItem: Yup.string().required('Item selection is required'),

  issuedTo: Yup.string().required('Issued to field is required'),

  quantity: Yup.string()
    .required('Quantity is required')
    .transform((value) => value.replace(/[^0-9.]/g, '')) // Remove non-numeric characters
    .test('is-valid-quantity', 'Quantity must be a number greater than zero', (value) => {
      const numericValue = Number(value);
      return numericValue > 0;
    }),

  purpose: Yup.string().required('Purpose is required'),

  date: Yup.date()
    .required('Date is required')
    .typeError('Invalid date')
    .max(dayjs().add(1, 'day'), 'Date cannot be in the future'),
});

export const procurementValidationSchema = Yup.object().shape({
  selectItem: Yup.string().required('Item name is required'),

  category: Yup.string().required('Category is required'),

  quantity: Yup.string()
    .required('Quantity is required')
    .transform((value) => value.replace(/[^0-9.]/g, ''))
    .test('is-valid-quantity', 'Quantity must be a number greater than zero', (value) => {
      const numericValue = Number(value);
      return numericValue > 0;
    }),

  requestedBy: Yup.string().required('Requested by is required'),

  justification: Yup.string().required('Justification is required'),

  prefrerredVendor: Yup.string().required('Preferred vendor is required'),

  priority: Yup.string().required('Priority is required'),

  estimatedCost: Yup.string()
    .required('Estimated cost is required')
    .transform((value) => value.replace(/[^0-9.]/g, ''))
    .test('is-valid-cost', 'Estimated cost must be a valid number greater than zero', (value) => {
      const numericValue = Number(value);
      return numericValue > 0;
    }),
});
