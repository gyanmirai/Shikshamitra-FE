import type { IVehicleType } from './type';

export const getVehicleTypeInitialValues = (editData?: IVehicleType | null) => ({
  typeName: editData?.typeName || '',
  description: editData?.description || '',
});
