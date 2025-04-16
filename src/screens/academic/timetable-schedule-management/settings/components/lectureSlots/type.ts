import type { Dayjs } from 'dayjs';

export interface ITimeSlot {
  id: number;
  startTime: Dayjs | null;
  endTime: Dayjs | null;
  slotType: string;
  breakType?: string; // Optional field for break type
}

export interface ICreateSlotsFormProps {
  open?: boolean;
  onClose?: () => void;
}
