import type { IIncomeCategory } from './type';

export const getIncomeCategoryInitialValues = (editData?: IIncomeCategory | null) => ({
  name: editData?.name || '',
  description: editData?.description || '',
  tags: editData?.tags || [],
});
