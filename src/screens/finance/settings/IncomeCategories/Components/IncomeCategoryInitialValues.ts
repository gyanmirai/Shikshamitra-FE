import type { IIncomeCategory } from './type';

export const getIncomeCategoryInitialValues = (editData?: IIncomeCategory | null) => ({
  incomeCategoryName: editData?.incomeCategoryName || '',
  description: editData?.description || '',
  tags: editData?.tags || [],
});
