export interface ILicenceType {
  id: string;
  typeName: string;
  description?: string;
  createdBy?: string;
  createdOn?: string;
}

export interface ILicenceTypeTableProps {
  onAddLicenceType: any;
  editData: ILicenceType | null;
  open: boolean;
  setOpenDialog: (value: boolean) => void;
  setEditData: (value: ILicenceType | null) => void;
  onDelete: (data: ILicenceType) => void;
  onEdit: (data: ILicenceType) => void;
}

export interface ILicenceTypeFormProps {
  open: any;
  onClose: (e: any, isSubmit?: boolean) => void;
  editData: ILicenceType | null;
}
