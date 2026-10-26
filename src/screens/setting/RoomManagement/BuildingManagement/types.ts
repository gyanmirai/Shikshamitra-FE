export interface IFloor {
  id: string;
  floorNo: number;
  floorName: string;
  totalRoom: number | string;
}

export interface IBuildingFloorValue extends IFloor {
  rowKey: string;
}

export interface IBuildingFormValues {
  buildingName: string;
  description: string;
  floors: IBuildingFloorValue[];
}

export interface IBuilding {
  id: string | number;
  buildingName: string;
  totalFloors: number;
  description: string;
  floors: IFloor[];
}

export interface IBuildingTableProps {
  onAddBuilding: () => void;
  onDelete: (data: IBuilding) => void;
  onEdit: (data: IBuilding) => void;
}

export interface IBuildingFormProps {
  open: {
    value: boolean;
    onTrue: () => void;
    onFalse: () => void;
  };
  onClose: (e: unknown, isSubmit?: boolean) => void;
  onBusyChange?: (busy: boolean) => void;
  editData: IBuilding | null;
}
