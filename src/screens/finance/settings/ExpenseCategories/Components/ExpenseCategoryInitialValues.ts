import type { IExpenseCategory } from './type';

export const getExpenseCategoryInitialValues = (editData?: IExpenseCategory | null) => ({
  name: editData?.name || '',
  description: editData?.description || '',
  tags: editData?.tags || [],
  expenseHeadId: editData?.expenseHeadId || '',
});
