import type { Dayjs } from 'dayjs';
import type { UseBooleanReturn } from 'src/hooks/useBoolean';

export interface IHostelPackageType {
  name: string;
  description: string;
  amount: number;
  facilityGroup: string;
  otherFacilities: string;
  depositAmount: number;
  scheduleDate: string | Dayjs | null;
  status: string;
}

export interface IHostelPackageFormProps {
  dialog: UseBooleanReturn;
  onClose?: (e: any, isSubmit: boolean) => void;
  editData?: IHostelPackageType | null;
}
