import type { Dayjs } from 'dayjs';

export interface IGatePassFormValues {
  studentName: string;
  studentId: string;
  reason: string;
  validFrom: Dayjs | null;
  validTo: Dayjs | null;
  status?: string;
  specailInstructions?: string;
}

export interface IGatePassRequestTableProps {
  onClick: (data: IGatePassFormValues, eventName: string) => void;
}

export interface IGateRequestFormProps {
  isEdit: boolean;
  data: IGatePassFormValues | null;
  onClose: () => void;
}
