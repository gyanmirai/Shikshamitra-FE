import * as Yup from 'yup';

export const refundValidationSchema = Yup.object().shape({
  board: Yup.string().required('Board is required'),
  medium: Yup.string().required('Medium is required'),
  className: Yup.string().required('Class is required'),
  division: Yup.string().required('Division is required'),
  student: Yup.string().required('Student is required'),
  paidTerms: Yup.string().required('Paid Terms are required'),

  amountApplicable: Yup.number()
    .typeError('Amount Applicable must be a number')
    .required('Amount Applicable is required')
    .min(1, 'Amount Applicable must be greater than 0'),

  refundAmount: Yup.number()
    .typeError('Refund Amount must be a number')
    .required('Refund Amount is required')
    .min(1, 'Refund Amount must be greater than 0')
    .test(
      'refund-less-than-amountApplicable',
      'Refund Amount cannot exceed Amount Applicable',
      function (value) {
        const { amountApplicable } = this.parent;
        if (!value || !amountApplicable) return true;
        return value <= amountApplicable;
      }
    ),

  refundMethod: Yup.string().required('Refund Method is required'),

  reason: Yup.string()
    .trim()
    .required('Reason of Refund is required')
    .min(5, 'Reason must be at least 5 characters')
    .max(500, 'Reason cannot exceed 500 characters'),
});
