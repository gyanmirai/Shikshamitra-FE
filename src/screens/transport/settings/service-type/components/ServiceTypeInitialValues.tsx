import type { IServiceType } from './type';

export const getServiceTypeInitialValues = (editData?: IServiceType | null) => ({
  typeName: editData?.name || editData?.typeName || '',
  description: editData?.description || '',
});
