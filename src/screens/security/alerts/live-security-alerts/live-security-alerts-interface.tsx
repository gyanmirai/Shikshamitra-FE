import type { Dayjs } from 'dayjs';

export interface ILiveSecurityAlertsFormValues {
  studentName: string;
  location: string;
  time: Dayjs | null;
}
