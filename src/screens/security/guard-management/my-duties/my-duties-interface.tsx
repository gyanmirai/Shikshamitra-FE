import type { Dayjs } from 'dayjs';

export interface IMyDuties {
  id?: number;
  startTime: Dayjs | null;
  endTime: Dayjs | null;
  status: string;
  checkInNotes?: string;
  checkOutNotes?: string;
  name?: string;
}
export interface ICheckInCheckOutDialogProps {
  isCheckIn: boolean | null;
  onClose: () => void;
  data: IMyDuties | null;
}
