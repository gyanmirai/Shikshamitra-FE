import type { Dayjs } from 'dayjs';

export interface TMeeting {
  id: number;
  title: string;
  status: string;
  audience: string[];
  organization: string[];
  className: string[];
  division: string[];
  students: string[];
  meetingDate: Dayjs | null;
  meetingTime: Dayjs | null;
  meetingAgenda: string;
  link: string;
  meetingType: string;
  classRoom: string;
  isRecurring: boolean;
  day?: string;
  repeatFrequency?: 'Daily' | 'Weekly' | 'Monthly' | 'Custom';
  repeatUntil?: Dayjs | number;
}
