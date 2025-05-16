import type { Dayjs } from 'dayjs';

export interface IGatePassStaffFormValues {
  leaveTime: Dayjs | null;
  leaveDate: Dayjs | null;
  reasonForLeave: string;
}

export interface IGatePassStaffTableProps {
  onClick: (data: IGatePassStaffFormValues, eventName: string) => void;
}

export interface IGatePassStaffRequestFormProps {
  isEdit: boolean;
  data: IGatePassStaffFormValues | null;
  onClose: () => void;
}
