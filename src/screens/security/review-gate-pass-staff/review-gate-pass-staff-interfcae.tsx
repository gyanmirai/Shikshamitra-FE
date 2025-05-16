import type { Dayjs } from 'dayjs';

export interface IReviewStaffGatePassRequestDetailViewDialogProps {
  status: string;
  data: IReviewStaffGatePassRequestFormValues | null;
  onClose: () => void;
}

export interface IReviewStaffGatePassRequestFormValues {
  name: string;
  leaveTime: Dayjs | null;
  leaveDate: Dayjs | null;
  reasonForLeave: string;
  description?: string;
}
