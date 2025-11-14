import dayjs from 'dayjs';

import type { IExpenseFormValues } from './type';

export const getInitialExpenseData = (
  editData: Partial<IExpenseFormValues> | null = null
): IExpenseFormValues => ({
  expenseCategory: editData?.expenseCategory ?? '',
  expenseCategoryTags: editData?.expenseCategoryTags ?? [],
  expenseName: editData?.expenseName ?? '',
  amount: editData?.amount ?? null,
  paymentMethod: editData?.paymentMethod ?? '',
  date: editData?.date ? dayjs(editData?.date) : null, // default today
  notes: editData?.notes ?? '',
  paymentDetails: editData?.paymentDetails ?? {},
});
