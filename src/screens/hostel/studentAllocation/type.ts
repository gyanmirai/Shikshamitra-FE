import type { UseBooleanReturn } from 'src/hooks/use-boolean';

export interface IHostelAllocationRoom {
  roomName: string;
  roomType: string;
  floorNumber: number;
  roomCapacity: number;
  roomStatus: string | number;
  status: string;
  bed: string;
  currentOccupation: number;
}

export interface IRoomFormProps {
  open: UseBooleanReturn;
  onClose: () => void;
  editData?: IHostelAllocationRoom | null;
}
