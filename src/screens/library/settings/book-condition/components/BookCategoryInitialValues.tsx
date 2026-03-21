import type { IConditionType } from './type';

export const getBookConditionInitialValues = (editData?: IConditionType | null) => ({
  conditionType: editData?.conditionType || '',
  code: editData?.code || '',
  description: editData?.description || '',
});
