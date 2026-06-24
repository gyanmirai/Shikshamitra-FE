export interface IFuelType {
  id: string;
  name?: string;
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
  data?: IFuelType[];
  isLoading?: boolean;
}

export interface IFuelTypeFormProps {
  open: any;
  onClose: (e: any, isSubmit?: boolean) => void;
  editData: IFuelType | null;
}
