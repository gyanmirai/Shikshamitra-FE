import type { IFeeHead } from './type';

export const getFeeHeadInitialValues = (editData?: IFeeHead | null) => ({
  feeCategoryId: editData?.feeCategoryId || '',
  name: editData?.name || '',
  description: editData?.description || '',
  module: (editData as any)?.module || '',
});
