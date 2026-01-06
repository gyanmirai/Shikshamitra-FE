import type { IVehicleType } from './type';

const parseApproxSittingRange = (range?: string): [number, number] => {
  if (!range) return [20, 60];
  const parts = range.split('-').map((part) => parseInt(part.trim(), 10));
  if (parts.length === 2 && !Number.isNaN(parts[0]) && !Number.isNaN(parts[1])) {
    return [parts[0], parts[1]];
  }
  return [20, 60];
};

export const getVehicleTypeInitialValues = (editData?: IVehicleType | null) => ({
  typeName: editData?.name || editData?.typeName || '',
  vehicleRange: editData?.approxSittingRange
    ? parseApproxSittingRange(editData.approxSittingRange)
    : [20, 60],
  description: editData?.description || '',
});
