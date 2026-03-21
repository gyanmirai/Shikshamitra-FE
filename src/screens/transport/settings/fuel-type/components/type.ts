export interface IFuelType {
  id: string;
  typeName: string;
  description?: string;
}

export interface IFuelTypeTableProps {
  onAddFuelType: any;
  editData: IFuelType | null;
  open: boolean;
  setOpenDialog: (value: boolean) => void;
  setEditData: (value: IFuelType | null) => void;
  onDelete: (data: IFuelType) => void;
  onEdit: (data: IFuelType) => void;
}

export interface IFuelTypeFormProps {
  open: any;
  onClose: (e: any, isSubmit?: boolean) => void;
  editData: IFuelType | null;
}
