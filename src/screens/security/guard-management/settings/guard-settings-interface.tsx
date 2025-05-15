import type { Dayjs } from 'dayjs';

export interface IGuardShiftFormValues {
  id?: number;
  name: string;
  startTime: Dayjs | null;
  endTime: Dayjs | null;
  description?: string;
}

export interface IGuardShiftTableProps {
  onClick: (data: IGuardShiftFormValues, eventName: string) => void;
}

export interface IGuardShiftFormProps {
  isEdit: boolean;
  data: IGuardShiftFormValues | null;
  onClose: () => void;
}
