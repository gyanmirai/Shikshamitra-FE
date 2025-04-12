import type { Dayjs } from 'dayjs';

export interface IMeeting {
  id: number;
  title: string;
  status: string;
  audience: string[];
  organization: string[];
  className: string[];
  division: string[];
  students: string[];
  meetingDate: string | Dayjs | null;
  meetingTime: string | Dayjs | null;
  meetingAgenda: string;
  link: string;
  meetingType: string;
  classRoom: string;
  isRecurring: boolean;
  day?: string;
  repeatFrequency?: string;
  repeatUntil?: string | Dayjs | number;
}

export interface IMeetingDetailsProps {
  meeting: IMeeting | null;
  onClose: () => void;
}

export interface IViewMeetingDialogProps {
  open: boolean;
  onClose: () => void;
  meeting: IMeeting | null;
}

/**
 * Props interface for AddNewMeeting component
 * @interface AddNewMeetingProps
 * @property {function} onSubmit - Callback function to handle form submission
 * @property {any} [initialValues] - Optional initial values for the form
 * @property {boolean} [isEdit] - Optional flag to indicate if form is in edit mode
 */
export interface AddNewMeetingProps {
  onSubmit: (values: any) => void;
  initialValues?: any | null;
  isEdit?: boolean;
  onClose: () => void;
}
