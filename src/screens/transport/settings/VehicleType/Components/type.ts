export interface IVehicleType {
  id: string;
  name?: string;
  typeName: string;
  approxSittingRange?: string;
  description?: string;
  vehicleRange: [number, number];
  isActive?: boolean;
}

export interface IVehicleTypeTableProps {
  onAddVehicleType: any;
  editData: IVehicleType | null;
  open: boolean;
  setOpenDialog: (value: boolean) => void;
  setEditData: (value: IVehicleType | null) => void;
  onDelete: (data: IVehicleType) => void;
  onEdit: (data: IVehicleType) => void;
}

export interface IVehicleTypeFormProps {
  open: any;
  onClose: (e: any, isSubmit?: boolean) => void;
  editData: IVehicleType | null;
}
