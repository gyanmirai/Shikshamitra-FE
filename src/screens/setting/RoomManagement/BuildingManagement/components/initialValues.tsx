import type { IBuilding } from '../types';

export const getBuildingInitialValues = (editData?: IBuilding | null) => ({
  id: editData?.id ?? 0,
  buildingName: editData?.buildingName ?? '',
  totalFloors: editData?.totalFloors ?? '',
  description: editData?.description ?? '',
  floors:
    editData?.floors?.map((floor) => ({
      floorNo: floor?.floorNo ?? '',
      floorName: floor?.floorName ?? '',
      totalRoom: floor?.totalRoom ?? '',
    })) ?? [],
});
