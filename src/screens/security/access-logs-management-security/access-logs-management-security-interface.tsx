import type { Dayjs } from 'dayjs';

export interface IAccessLogsManagementSecurityInterface {
  name: string;
  role: string;
  passType: string;
  startTime: Dayjs | null;
  endTime: Dayjs | null;
  status: string;
}

export interface IAccessLogsManagementSecurityDenyFormValues {
  notes: string;
}

export interface IGateAcessDenyDialogProps {
  onClose: () => void;
  data: IAccessLogsManagementSecurityInterface;
}
