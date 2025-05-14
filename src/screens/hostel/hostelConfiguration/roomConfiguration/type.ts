import type { UseBooleanReturn } from 'src/hooks/use-boolean';

export interface IFacilityQuantities {
  id: string; // e.g., 'wifi', 'gym'
  facility: string; // e.g., 'wifi', 'gym'
  quantity: number; // e.g., 2
}

export interface IHostelRoom {
  roomName: string;
  roomType: string;
  floorNumber: number;
  roomCapacity: number;
  facility: string[];
  facilityQuantities: IFacilityQuantities[];
  status: string;
}

export interface IRoomFormProps {
  open: UseBooleanReturn;
  onClose: () => void;
  editData: IHostelRoom | null;
}

export interface IHostelRoomTableProps {
  open: boolean;
  setOpen: (value: boolean) => void;
  onAddRoom: (data: IHostelRoom | null) => void;
  data: IHostelRoom[];
  onEdit: (data: IHostelRoom) => void;
  onDelete: (data: IHostelRoom) => void;
}
