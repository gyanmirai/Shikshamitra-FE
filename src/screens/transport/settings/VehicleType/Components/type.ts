export interface IVehicleType {
  id: string;
  typeName: string;
  description?: string;
  vehicleRange: [number, number];
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
