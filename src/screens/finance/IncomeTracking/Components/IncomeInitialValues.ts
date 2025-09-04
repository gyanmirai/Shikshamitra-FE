import type { IIncomeFormValues } from './type';

export const getInitialIncomeData = (
  editData: Partial<IIncomeFormValues> | null = null
): IIncomeFormValues => ({
  incomeCategory: editData?.incomeCategory ?? '',
  budget: editData?.budget ?? '',
  budgetSubCategory: editData?.budgetSubCategory ?? '',
  incomeName: editData?.incomeName ?? '',
  amount: editData?.amount ?? null,
  paymentMethod: editData?.paymentMethod ?? '',
  date: editData?.date ?? null, // default today
  notes: editData?.notes ?? '',
  paymentDetails: editData?.paymentDetails ?? {},
});
