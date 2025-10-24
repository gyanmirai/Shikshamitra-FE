export interface IVehicleDocument {
  id: string;
  documentName: string;
  documentSize?: number;
  acceptedFormat: number[];
  description?: string;
  createdBy?: string;
  createdOn?: string;
  required: boolean;
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
