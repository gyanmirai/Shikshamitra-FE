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
  handleClose?: (e: any, isSubmit: boolean) => void;
  disabled?: boolean;
  isEdit?: boolean;
  data?: any;
}
