import type { IFeeCategory } from './type';

export const getFeeCategoryInitialValues = (editData?: IFeeCategory | null) => ({
  feeCategoryName: editData?.feeCategoryName || '',
  description: editData?.description || '',
});
