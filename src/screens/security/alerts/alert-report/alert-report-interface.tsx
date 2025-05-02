import type { Dayjs } from 'dayjs';

export interface alertReportTable {
  studentName: string;
  time: Dayjs;
  acknowledgBy: string;
  resolved: string;
  status: string;
  slaMet: string;
}
