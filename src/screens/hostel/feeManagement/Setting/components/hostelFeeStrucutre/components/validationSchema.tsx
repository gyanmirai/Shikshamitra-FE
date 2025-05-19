import * as Yup from 'yup';

export const hostelFeeStrctureValidationSchema = Yup.object().shape({
  id: Yup.number().required('ID is required').typeError('ID must be a number'),

  roomType: Yup.string().required('Room type is required'),

  hostelFeeHead: Yup.string().required('Hostel fee head is required'),

  grossFee: Yup.string()
    .required('Gross fee is required')
    .matches(/^\d+(\.\d{1,2})?$/, 'Gross fee must be a valid amount'),

  discountAmount: Yup.string()
    .required('Discount amount is required')
    .matches(/^\d+(\.\d{1,2})?$/, 'Discount amount must be a valid amount'),

  discountRemark: Yup.string().required('Discount remark is required'),

  payableFee: Yup.string()
    .required('Payable fee is required')
    .matches(/^\d+(\.\d{1,2})?$/, 'Payable fee must be a valid amount'),

  paymentMethod: Yup.array()
    .of(Yup.string().required())
    .min(1, 'At least one payment method is required'),

  chargesType: Yup.string().required('Charges type is required'),

  lateFeeChargesType: Yup.string().required('Late fee charges type is required'),

  lateFeeChargesAmount: Yup.string()
    .required('Late fee charges amount is required')
    .matches(/^\d+(\.\d{1,2})?$/, 'Late fee charges must be a valid amount'),
});
