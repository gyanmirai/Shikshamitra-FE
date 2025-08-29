import type { IIncomeCategory } from './type';

export const getIncomeCategoryInitialValues = (editData?: IIncomeCategory | null) => ({
  incomeCategoryName: editData?.incomeCategoryName || '',
  budget: editData?.budget || '',
  description: editData?.description || '',
});
