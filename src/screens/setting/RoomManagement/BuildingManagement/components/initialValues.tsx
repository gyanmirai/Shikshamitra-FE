import type { IBuilding } from '../types';

export const getBuildingInitialValues = (editData?: IBuilding | null) => ({
  id: editData?.id ?? 0,
  buildingName: editData?.buildingName ?? '',
  totalFloors: editData?.totalFloors ?? '1',
  description: editData?.description ?? '',
  floors: editData?.floors?.map((floor) => ({
    id: floor?.id ?? '',
    floorName: floor?.floorName ?? '',
    totalRoom: floor?.totalRoom ?? '',
  })) ?? [
    {
      id: 1,
      floorName: '',
      totalRoom: '',
    },
  ],
});
