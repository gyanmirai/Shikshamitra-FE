import type { UseBooleanReturn } from 'src/hooks/use-boolean';

import BuildingForm from '../../BuildingManagement/components/buildingForm';

import type { BuildingOption } from '../types/room-form';

interface Props {
  open: UseBooleanReturn;
  building: BuildingOption;
  onSaved: () => void;
}

export function RoomBuildingEditor({ open, building, onSaved }: Props) {
  return (
    <BuildingForm
      open={open}
      editData={{
        id: building.id,
        buildingName: building.buildingName,
        description: building.description ?? '',
        totalFloors: building.totalFloors ?? building.floors.length,
        floors: building.floors.map((floor, index) => ({
          id: floor.id,
          floorName: floor.floorName,
          floorNo: floor.floorNo ?? index + 1,
          totalRoom: floor.totalRoom ?? '',
        })),
      }}
      onClose={(_, saved) => {
        open.onFalse();
        if (saved) onSaved();
      }}
    />
  );
}
