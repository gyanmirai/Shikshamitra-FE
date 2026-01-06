export interface IVehicleDocument {
  id: string;
  name?: string;
  documentName: string;
  maxSizeMb?: number;
  documentSize?: number;
  acceptedFormats?: number[];
  acceptedFormat: number[];
  description?: string;
  createdBy?: string;
  createdOn?: string;
  isRequired?: boolean;
  required: boolean;
  isActive?: boolean;
}

export interface IVehicleDocumentTableProps {
  onAddVehicleDocument: any;
  editData: IVehicleDocument | null;
  open: boolean;
  setOpenDialog: (value: boolean) => void;
  setEditData: (value: IVehicleDocument | null) => void;
  onDelete: (data: IVehicleDocument) => void;
  onEdit: (data: IVehicleDocument) => void;
}

export interface IVehicleDocumentFormProps {
  open: any;
  onClose: (e: any, isSubmit?: boolean) => void;
  editData: IVehicleDocument | null;
}
