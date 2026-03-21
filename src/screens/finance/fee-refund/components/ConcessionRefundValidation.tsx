import * as Yup from 'yup';

export const refundValidation = Yup.object().shape({
  paidTerm: Yup.string().required('Paid Term is required'),
  applicableAmount: Yup.number().required('Applicable amount is required'),
  refundAmount: Yup.number()
    .min(1, 'Refund amount must be greater than 0')
    .required('Refund amount is required'),
  refundMethod: Yup.string().required('Refund method is required'),
  reason: Yup.string().required('Reason is required'),
});
