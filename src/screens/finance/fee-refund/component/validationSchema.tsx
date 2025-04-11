import * as Yup from 'yup';

export const feeRefundValidationSchema = Yup.object({
  class: Yup.string().required('Class is required'),
  division: Yup.string().required('Division is required'),
  studentName: Yup.string().required('Student Name is required'),
  grNo: Yup.string().required('GR No is required'),
  feeType: Yup.array().min(1, 'Select at least one Fee Type'),
  paidTerms: Yup.array().min(1, 'Select at least one Paid Term'),
  amountApplicableForRefund: Yup.string().required('Refund Amount is required'),
  askForRefund: Yup.number()
    .typeError('Must be a valid number')
    .required('This field is required')
    .moreThan(0, 'Must be greater than 0'),
  reason: Yup.string().required('Reason is required'),
});
