import type { IHostelRule } from './type';

export const getRoomInitialValues = (editData?: IHostelRule | null) => ({
  ruleName: editData?.ruleName || '',
  ruleDescription: editData?.ruleDescription || '',
  document: editData?.document || null,
});
