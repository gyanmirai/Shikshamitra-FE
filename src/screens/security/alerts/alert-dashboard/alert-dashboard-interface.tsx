import type { Dayjs } from 'dayjs';

export interface ILiveSecurityAlertsFormValues {
  studentName: string;
  time: Dayjs | null;
  aknowledgementBy: string | null;
  resolvedBy: string | null;
  status: string;
}
