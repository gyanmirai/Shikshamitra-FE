import type { IFeeHead } from './type';

export const getFeeHeadInitialValues = (editData?: IFeeHead | null) => ({
  feeCategoryId: editData?.feeCategoryId || '',
  feeHeadName: editData?.feeHeadName || '',
  description: editData?.description || '',
});
