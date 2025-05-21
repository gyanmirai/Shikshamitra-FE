import * as Yup from 'yup';

export const studentRefundRequestValidationSchema = Yup.object().shape({
  studentName: Yup.string().required('Student name is required'),
  rollNo: Yup.string().required('Roll number is required'),
  class: Yup.string().required('Class is required'),
  division: Yup.string().required('Division is required'),

  reason: Yup.string().required('Refund reason is required'),
  askForRefund: Yup.number().required('Amount is required'),
  reasonForReject: Yup.string().optional(),
  approvedAmount: Yup.number().min(0, 'Amount must be positive').optional(),
  feeType: Yup.string().required('Fee type is required'),
  paidTerms: Yup.string().required('Paid terms is required'),
  grNo: Yup.number().required('GR No is required'),
});
