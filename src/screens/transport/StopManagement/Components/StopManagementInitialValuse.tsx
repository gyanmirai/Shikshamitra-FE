import type { IStopData, IStopPayload } from './type';

export const getStopManagementInitialValues = (editData?: IStopData | null): IStopPayload => ({
  stopName: editData?.stopName || '',
  landmark: editData?.landmark || '',
  buildingNo: editData?.buildingNo || null,
  flatHouseNo: editData?.flatHouseNo || null,
  areaLocalityRoadName: editData?.areaLocalityRoadName || '',
  zone: editData?.zone || '',
  status: editData?.status || 'Active',
  description: null,
  coordinates: {
    latitude: undefined,
    longitude: undefined,
  },
});

export const getStopStatusChangeInitialValues = (stopData?: IStopData | null) => ({
  status: stopData?.status || 'Active',
  date: null,
  reason: '',
});
