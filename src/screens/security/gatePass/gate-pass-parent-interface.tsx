import type { Dayjs } from 'dayjs';

export interface IGetEarlyPassRequestFormValues {
  childName: string;
  pickupTime: Dayjs | null;
  pickupDate: Dayjs | null;
  reasonForPickup: string;
}

export interface IGetEarlyPassRequestTableProps {
  onClick: (data: IGetEarlyPassRequestFormValues, eventName: string) => void;
}

export interface IGetEarlyPassRequestFormProps {
  isEdit: boolean;
  data: IGetEarlyPassRequestFormValues | null;
  onClose: () => void;
}
