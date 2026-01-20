export interface IZoneArea {
  id: string;
  name?: string;
  zoneName: string;
  description?: string;
  isActive?: boolean;
}

export interface IZoneAreaTableProps {
  onAddZoneArea: any;
  editData: IZoneArea | null;
  open: boolean;
  setOpenDialog: (value: boolean) => void;
  setEditData: (value: IZoneArea | null) => void;
  onDelete: (data: IZoneArea) => void;
  onEdit: (data: IZoneArea) => void;
  data: any;
  isLoading: boolean;
}

export interface IZoneAreaFormProps {
  open: any;
  onClose: (e: any, isSubmit?: boolean) => void;
  editData: IZoneArea | null;
}
