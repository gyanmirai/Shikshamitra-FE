export interface IZoneArea {
  id: string;
  zoneName: string;
  description?: string;
}

export interface IZoneAreaTableProps {
  onAddZoneArea: any;
  editData: IZoneArea | null;
  open: boolean;
  setOpenDialog: (value: boolean) => void;
  setEditData: (value: IZoneArea | null) => void;
  onDelete: (data: IZoneArea) => void;
  onEdit: (data: IZoneArea) => void;
}

export interface IZoneAreaFormProps {
  open: any;
  onClose: (e: any, isSubmit?: boolean) => void;
  editData: IZoneArea | null;
}
