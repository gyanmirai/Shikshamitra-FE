export interface IServiceType {
  id: string;
  name?: string;
  typeName: string;
  description?: string;
  createdBy?: string;
  createdOn?: string;
  isActive?: boolean;
}

export interface IServiceTypeTableProps {
  onAddServiceType: any;
  editData: IServiceType | null;
  open: boolean;
  setOpenDialog: (value: boolean) => void;
  setEditData: (value: IServiceType | null) => void;
  onDelete: (data: IServiceType) => void;
  onEdit: (data: IServiceType) => void;
}

export interface IServiceTypeFormProps {
  open: any;
  onClose: (e: any, isSubmit?: boolean) => void;
  editData: IServiceType | null;
}
