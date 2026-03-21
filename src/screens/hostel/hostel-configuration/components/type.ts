import type { UseBooleanReturn } from 'src/hooks/useBoolean';

export interface IHostelData {
  hostelName: string;
  totalFloors: number;
  assignedWarden: string;
  hostelType: string;
  location: string;
}

export interface IHostelDataTableProps {
  openDialog: boolean;
  setOpenDialog: (value: boolean) => void;
  editData?: IHostelData | null;
  setEditData: (value: IHostelData | null) => void;
  data: IHostelData[];
  onDelete: (data: IHostelData) => void;
  onEdit: (data: IHostelData) => void;
  onAddRoom: (data: IHostelData) => void;
  onAddRoomDialog: UseBooleanReturn;
}

export interface IHostelFormProps {
  open: UseBooleanReturn;
  onClose: () => void;
  editData?: IHostelData | null;
}
