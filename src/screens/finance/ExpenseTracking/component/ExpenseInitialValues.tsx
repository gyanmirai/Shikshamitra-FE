import type { IExpenseFormValues } from './type';

export const getInitialExpenseData = (
  editData: Partial<IExpenseFormValues> | null = null
): IExpenseFormValues => ({
  expenseCategory: editData?.expenseCategory ?? '',
  budget: editData?.budget ?? '',
  budgetSubCategory: editData?.budgetSubCategory ?? '',
  expenseName: editData?.expenseName ?? '',
  amount: editData?.amount ?? null,
  paymentMethod: editData?.paymentMethod ?? '',
  date: editData?.date ?? null, // default today
  notes: editData?.notes ?? '',
});
