import type { FinanceOperatorOption } from 'src/redux/library/charges-management/finance-operator.types';

import * as Yup from 'yup';

export const financeApprovalSchema = Yup.object({
  reason: Yup.string()
    .trim()
    .required('Approval reason is required')
    .max(1000, 'Use at most 1000 characters'),
});

const option = () =>
  Yup.mixed<FinanceOperatorOption>()
    .nullable()
    .test(
      'selectable',
      'Choose an available recorded policy version',
      (value) => !value || value.isSelectable
    );
export const financeBindingSchema = Yup.object({
  collection: option().required('Collection policy is required'),
  refund: option(),
  reason: Yup.string()
    .trim()
    .required('Policy reason is required')
    .max(1000, 'Use at most 1000 characters'),
});
