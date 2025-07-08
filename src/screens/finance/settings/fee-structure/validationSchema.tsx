import * as Yup from 'yup';

export const feeStructurevalidationSchema = Yup.object({
  bookRecipt: Yup.string().required('Receipt Book is required'),
  applicableGrade: Yup.string().required('Class is required'),
  feeHead: Yup.string().required('Fee Head is required'),
  grossFee: Yup.string().required('Gross Fee is required'),
  discountAmount: Yup.string()
    .transform((value) => value.replace(/[^0-9.]/g, ''))
    .test('is-number', 'Amount must be a valid number greater than zero', (value) => {
      if (!value) return true; // Allow empty values (optional)
      const numericValue = Number(value);
      return numericValue > 0;
    }),

  // discountRemark: Yup.string().required('Discount Remark is required'),
  // payableFee: Yup.string().required('Payable Fee is required'),
  paymentMethod: Yup.array().min(1, 'At least one Payment Method is required'),
  paymentDueDate: Yup.date().required('Payment Due Date is required'),

  // lateFeeChargesType: Yup.string().required('Late Fee Charges Type is required'),
  lateFeeChargesAmount: Yup.string()
    .transform((value) => value.replace(/[^0-9.]/g, '')) // Remove non-numeric characters
    .test('is-number', 'Amount must be a valid number greater than zero', (value) => {
      if (!value) return true; // Allow empty values when not required
      return Number(value) > 0;
    })
    .when('lateFeeChargesType', {
      is: 'perDay',
      then: (schema) => schema.required('Late Fee Charges Amount is required when type is per day'),
    }),
});

export const editFeeStructureValidationSchema = Yup.object({
  fees: Yup.array().of(
    Yup.object().shape({
      feeHead: Yup.string().required('Fee Head is required'),
      grossFee: Yup.string()
        .required('Income amount is required')
        .transform((value) => value.replace(/[^0-9.]/g, '')) // Remove non-numeric characters
        .test('is-number', 'Amount must be a valid number greater than zero', (value) => {
          const numericValue = Number(value);
          return numericValue > 0;
        }),
      generalDiscount: Yup.string()
        .required('Income amount is required')
        .transform((value) => value.replace(/[^0-9.]/g, '')) // Remove non-numeric characters
        .test('is-number', 'Amount must be a valid number greater than zero', (value) => {
          const numericValue = Number(value);
          return numericValue > -1;
        }),
      payableFee: Yup.number().required('Payable Fee is required'),
      paymentMethod: Yup.array().min(1, 'At least one payment method is required'),
      lateFeeChargesType: Yup.string().required('Late Fee Charges Type is required'),
      lateFeeChargesAmount: Yup.string()
        .required('Income amount is required')
        .transform((value) => value.replace(/[^0-9.]/g, '')) // Remove non-numeric characters
        .test('is-number', 'Amount must be a valid number greater than zero', (value) => {
          const numericValue = Number(value);
          return numericValue > 0;
        }),
      active: Yup.boolean().required('Status is required'),
    })
  ),
});
