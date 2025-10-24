import type { IVehicleType } from './type';

export const getVehicleTypeInitialValues = (editData?: IVehicleType | null) => ({
  typeName: editData?.typeName || '',
  vehicleRange: [20, 60],
  description: editData?.description || '',
});
