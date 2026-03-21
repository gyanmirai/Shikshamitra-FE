import type { UseBooleanReturn } from 'src/hooks/useBoolean';
import type { IDocument } from 'src/screens/academic/curriculum-management/subject-assignment/component/type';

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
  facilityQuantities: IFacilityQuantities[];
  status: string;
  images?: IDocument[];
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
