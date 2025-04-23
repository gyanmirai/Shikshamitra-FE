import type { UseBooleanReturn } from 'src/hooks/use-boolean';

export interface IHostelData {
  hostelName: string;
  totalRoomCapacity: number;
  wardenDetails: string;
  currentOccupation: string; // e.g., "250/500"
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
  onRoomDetails: (data: IHostelData) => void;
}

export interface IHostelFormProps {
  open: UseBooleanReturn;
  onClose: () => void;
  editData?: IHostelData | null;
}

export interface IHostelRoom {
  roomName: string;
  roomType: string;
  floorNumber: number;
  roomCapacity: number;
  roomStatus: string;
  beds: string[];
}

export interface IRoomFormProps {
  open: UseBooleanReturn;
  onClose: () => void;
  editData?: IHostelRoom | null;
}

export interface IHostelRoomTableProps {
  open: UseBooleanReturn;
  onClose: () => void;
  roomData: IHostelRoom[];
}

export interface IHostelFormProps {
  open: UseBooleanReturn;
  onClose: () => void;
  editData?: IHostelData | null;
}
