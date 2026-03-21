export interface IFloor {
  floorNo: number;
  floorName: string;
  totalRoom: number | string;
}

export interface IBuilding {
  id: number;
  buildingName: string;
  totalFloors: number;
  description: string;
  floors: IFloor[];
}

export interface IBuildingTableProps {
  onAddBuilding: {
    onTrue: () => void;
    onFalse: () => void;
    value: boolean;
  };
  editData: IBuilding | null;
  open: boolean;
  setOpenDialog: (open: boolean) => void;
  setEditData: (data: IBuilding | null) => void;
  onDelete: (data: IBuilding) => void;
  onEdit: (data: IBuilding) => void;
}

export interface IBuildingFormProps {
  open: {
    value: boolean;
    onTrue: () => void;
    onFalse: () => void;
  };
  onClose: (e: any, isSubmit?: boolean) => void;
  editData: IBuilding | null;
}
