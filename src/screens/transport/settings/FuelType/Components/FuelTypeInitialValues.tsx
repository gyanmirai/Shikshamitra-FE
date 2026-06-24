import type { IFuelType } from './type';

export const getFuelTypeInitialValues = (editData?: IFuelType | null) => ({
  typeName: editData?.name || editData?.typeName || '',
  description: editData?.description || '',
});
