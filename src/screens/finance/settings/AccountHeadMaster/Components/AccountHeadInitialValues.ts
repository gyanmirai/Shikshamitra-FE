import type { IAccountHead } from './type';

export const getAccountHeadInitialValues = (editData?: IAccountHead | null) => ({
  headName: editData?.headName || '',
  headType: editData?.headType || '',
  parentAccountHeadId: editData?.parentAccountHeadId || '',
  notes: editData?.notes || '',
  concurrencyStamp: editData?.concurrencyStamp || '',
});
