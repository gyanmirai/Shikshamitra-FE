import type { IFuelType } from './type';

export const getFuelTypeInitialValues = (editData?: IFuelType | null) => ({
  typeName: editData?.typeName || '',
  description: editData?.description || '',
});
