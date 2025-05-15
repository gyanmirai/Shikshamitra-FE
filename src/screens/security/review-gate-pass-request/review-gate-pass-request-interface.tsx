import type { Dayjs } from 'dayjs';

export interface IReviewRequestDetailViewDialogProps {
  status: string;
  data: IReviewEarlyPassRequestFormValues | null;
  onClose: () => void;
}

export interface IReviewEarlyPassRequestFormValues {
  childName: string;
  pickupTime: Dayjs | null;
  pickupDate: Dayjs | null;
  reasonForPickup: string;
  description?: string;
}
