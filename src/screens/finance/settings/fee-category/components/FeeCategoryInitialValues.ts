import type { IFeeCategory } from './type';

export const getFeeCategoryInitialValues = (editData?: IFeeCategory | null) => ({
  name: editData?.name || '',
  description: editData?.description || '',
});
