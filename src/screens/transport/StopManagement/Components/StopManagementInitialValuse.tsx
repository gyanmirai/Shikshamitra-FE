import type { IStopData, IStopPayload } from './type';

export const getStopManagementInitialValues = (
  stopName?: string,
  editData?: IStopData | null
): IStopPayload => ({
  stopName: editData?.stopName || stopName || '',
  landmark: editData?.landmark || '',
  addressLine2: editData?.addressLine2 ?? null,
  addressLine1: editData?.addressLine1 ?? null,
  areaLocalityRoadName: editData?.areaLocalityRoadName || '',
  amount: editData?.amount || '',
  pincode: editData ? editData?.pincode : null,
  zone: editData?.zone || '',
  status: editData?.status || 0,
  description: null,
  coordinates: {
    latitude: undefined,
    longitude: undefined,
  },
  approxKmFromSchool: editData?.approxKmFromSchool || null,
});

export const getStopStatusChangeInitialValues = (stopData?: IStopData | null) => ({
  status: stopData?.status || 'Active',
  date: null,
  reason: '',
});
